import { useEffect, useRef, useState } from "react";
import StudentSidebar from "./StudentSidebar.jsx";
import { CheckIcon } from "../shared/Icons.jsx";
import { attendanceApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg } from "../../lib/useApi.jsx";

// Chromium exposes BarcodeDetector natively; elsewhere the student types the
// code printed under the QR on the classroom screen.
const canScan = typeof window !== "undefined" && "BarcodeDetector" in window;

export default function AttendanceScanScreen({ go }) {
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stats = useApi(() => attendanceApi.myStats(), []);

  async function checkIn(token) {
    if (!token || busy) return;
    setBusy(true);
    setError(null);
    try {
      const record = await attendanceApi.checkIn(token.trim());
      setResult(record);
      setManualToken("");
      stopCamera();
      stats.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function stopCamera() {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  useEffect(() => stopCamera, []);

  // Drive the camera + detector loop while scanning is on.
  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let timer;

    async function run() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) {
              await checkIn(codes[0].rawValue);
              return;
            }
          } catch {
            // A transient decode failure just means "try the next frame".
          }
          timer = setTimeout(tick, 400);
        };
        tick();
      } catch (err) {
        if (!cancelled) {
          setError("Could not open the camera — enter the code manually instead.");
          setScanning(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <div className="app-shell">
      <StudentSidebar active="s-scan" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Check in to class</div>
            <div className="main-sub">Scan the QR code your teacher is showing, or type the code under it</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="scan-wrap">
              <div className="scan-frame">
                {scanning ? (
                  <video ref={videoRef} className="scan-video" muted playsInline />
                ) : (
                  <>
                    <div className="scan-corner c1" />
                    <div className="scan-corner c2" />
                    <div className="scan-corner c3" />
                    <div className="scan-corner c4" />
                    <div className="scan-line" />
                  </>
                )}
              </div>

              {canScan ? (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 14 }}
                  onClick={() => (scanning ? stopCamera() : setScanning(true))}
                >
                  {scanning ? "Stop camera" : "Start camera"}
                </button>
              ) : (
                <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--ink-faint)" }}>
                  This browser can't scan QR codes — use the code field below.
                </p>
              )}
            </div>

            <div className="field" style={{ marginTop: 18 }}>
              <label>Check-in code</label>
              <input
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="Paste or type the session code"
                onKeyDown={(e) => e.key === "Enter" && checkIn(manualToken)}
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              disabled={busy || !manualToken.trim()}
              onClick={() => checkIn(manualToken)}
            >
              {busy ? "Checking in…" : "Check in"}
            </button>
            <ErrorMsg error={error} />
          </div>

          <div className="card">
            <div className="card-title">{result ? "Checked in ✓" : "Your attendance"}</div>

            {result && (
              <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
                <div className="success-check">
                  <CheckIcon />
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 4 }}>
                  You're marked {result.status}
                </h3>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
                  {result.subject} ·{" "}
                  {result.checkInTime
                    ? new Date(result.checkInTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                    : "—"}
                </p>
              </div>
            )}

            {stats.loading && <Loading />}
            <ErrorMsg error={stats.error} onRetry={stats.reload} />

            {stats.data && (
              <div className="kv-grid" style={{ marginTop: result ? 16 : 0 }}>
                <div>
                  <div className="k">Attendance rate</div>
                  <div className="v">{stats.data.attendanceRate}%</div>
                </div>
                <div>
                  <div className="k">Days present</div>
                  <div className="v">
                    {stats.data.presentDays}/{stats.data.totalDays}
                  </div>
                </div>
                <div>
                  <div className="k">Current streak</div>
                  <div className="v">{stats.data.streak} days 🔥</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
