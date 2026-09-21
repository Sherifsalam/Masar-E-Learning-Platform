import { useMemo, useRef, useState } from "react";
import StudentSidebar from "./StudentSidebar.jsx";
import { lectureApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

function gradient(color) {
  return `linear-gradient(135deg, ${color}, ${color}cc)`;
}

/**
 * YouTube links can't play in a <video> tag, so they are rendered in an
 * iframe. Anything else (an mp4 the centre uploads) uses the native player.
 */
function youTubeEmbedUrl(url) {
  if (!url) return null;
  const match =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/(?:watch\?v=|embed\/|shorts\/)([\w-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// Mirrors the server's format so the field can hint before submitting.
function formatCodeInput(raw) {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return cleaned.length > 4 ? `${cleaned.slice(0, 4)}-${cleaned.slice(4)}` : cleaned;
}

export default function LecturesScreen({ go }) {
  const [subject, setSubject] = useState("");
  const [playing, setPlaying] = useState(null);

  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState(null);
  const [redeemed, setRedeemed] = useState(null);

  const codeInputRef = useRef(null);

  const { data: lectures, error, loading, reload, setData } = useApi(
    () => lectureApi.list(subject),
    [subject]
  );

  const subjects = useMemo(() => {
    if (!lectures) return [];
    return [...new Set(lectures.map((l) => l.subject))];
  }, [lectures]);

  async function redeem(e) {
    e.preventDefault();
    if (!code.trim() || redeeming) return;
    setRedeeming(true);
    setRedeemError(null);
    setRedeemed(null);
    try {
      const result = await lectureApi.redeem(code.trim());
      setRedeemed(result);
      setCode("");
      reload();
    } catch (err) {
      setRedeemError(err.message);
    } finally {
      setRedeeming(false);
    }
  }

  function focusCodeBox() {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
      codeInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Watch progress only applies to lectures the student has unlocked.
  async function saveProgress(lecture, percent) {
    if (percent <= (lecture.watchedPercent || 0)) return;
    try {
      await lectureApi.updateProgress(lecture._id, percent);
      setData((prev) =>
        prev.map((l) => (l._id === lecture._id ? { ...l, watchedPercent: percent } : l))
      );
    } catch {
      // Progress is best-effort; a failed ping shouldn't interrupt playback.
    }
  }

  const lockedCount = (lectures || []).filter((l) => !l.unlocked).length;

  return (
    <div className="app-shell">
      <StudentSidebar active="s-lectures" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Recorded lectures</div>
            <div className="main-sub">
              Pay for a lecture at the centre, then enter the code on your receipt to unlock it
            </div>
          </div>
        </div>

        <form className="unlock-card" onSubmit={redeem}>
          <div className="unlock-text">
            <h3>Unlock a lecture</h3>
            <p>
              Enter the access code you received at the centre. Each code unlocks one lecture and can
              only be used once.
            </p>
          </div>
          <div className="unlock-controls">
            <input
              ref={codeInputRef}
              className="code-input"
              value={code}
              onChange={(e) => setCode(formatCodeInput(e.target.value))}
              placeholder="XXXX-XXXX"
              spellCheck="false"
              autoComplete="off"
              aria-label="Lecture access code"
            />
            <button className="btn btn-accent" disabled={redeeming || !code.trim()}>
              {redeeming ? "Checking…" : "Submit code"}
            </button>
          </div>
        </form>

        {redeemError && <div className="form-error">{redeemError}</div>}
        {redeemed && (
          <div className="form-success">
            {redeemed.alreadyOwned
              ? `You already have access to “${redeemed.lecture.title}”.`
              : `Unlocked “${redeemed.lecture.title}” — it's ready to watch below.`}
          </div>
        )}

        <div className="file-filters">
          <button
            type="button"
            className={"chip" + (subject === "" ? " active" : "")}
            onClick={() => setSubject("")}
          >
            All subjects
          </button>
          {subjects.map((s) => (
            <button
              type="button"
              key={s}
              className={"chip" + (subject === s ? " active" : "")}
              onClick={() => setSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {loading && <Loading />}
        <ErrorMsg error={error} onRetry={reload} />
        {lectures && !lectures.length && <Empty label="No lectures have been published yet." />}

        {!!lockedCount && (
          <div className="state-msg">
            {lockedCount} {lockedCount === 1 ? "lecture is" : "lectures are"} locked. Ask at the centre
            desk for a code.
          </div>
        )}

        <div className="lecture-grid">
          {(lectures || []).map((l) => (
            <LectureCard
              key={l._id}
              lecture={l}
              playing={playing === l._id}
              onPlay={() => setPlaying(l._id)}
              onProgress={saveProgress}
              onWantCode={focusCodeBox}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function LectureCard({ lecture, playing, onPlay, onProgress, onWantCode }) {
  const embedUrl = youTubeEmbedUrl(lecture.videoUrl);
  const [marking, setMarking] = useState(false);

  async function markWatched() {
    setMarking(true);
    await onProgress(lecture, 100);
    setMarking(false);
  }

  return (
    <div className={"lecture-card" + (lecture.unlocked ? "" : " locked")}>
      {playing && lecture.unlocked ? (
        embedUrl ? (
          <iframe
            className="lecture-video"
            src={embedUrl + "?autoplay=1"}
            title={lecture.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="lecture-video"
            src={lecture.videoUrl}
            controls
            autoPlay
            onTimeUpdate={(e) =>
              e.currentTarget.duration &&
              onProgress(
                lecture,
                Math.min(100, Math.round((e.currentTarget.currentTime / e.currentTarget.duration) * 100))
              )
            }
          />
        )
      ) : (
        <div
          className="lecture-thumb"
          style={{
            background: gradient(lecture.thumbnailColor || "#2952E3"),
            cursor: lecture.unlocked ? "pointer" : "default",
          }}
          onClick={lecture.unlocked ? onPlay : undefined}
        >
          <div className="playdot">{lecture.unlocked ? "▶" : "🔒"}</div>
        </div>
      )}

      <div className="lecture-body">
        <div className="lecture-subject">{(lecture.subject || "").toUpperCase()}</div>
        <div className="lecture-name">{lecture.title}</div>

        {lecture.unlocked ? (
          <>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: (lecture.watchedPercent || 0) + "%" }} />
            </div>
            <div className="lecture-meta">
              <span>{lecture.durationMinutes} min</span>
              <span>
                {lecture.watchedPercent >= 100
                  ? "Completed"
                  : lecture.watchedPercent
                  ? `${lecture.watchedPercent}% watched`
                  : "Not started"}
              </span>
            </div>
            {/* A YouTube iframe can't report playback position, so completion
                is marked by hand for those. */}
            {playing && embedUrl && lecture.watchedPercent < 100 && (
              <button className="btn btn-ghost btn-sm btn-block" onClick={markWatched} disabled={marking}>
                {marking ? "Saving…" : "Mark as watched"}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="lecture-meta">
              <span>{lecture.durationMinutes} min</span>
              <span className="pill pill-neutral">Locked</span>
            </div>
            <button className="btn btn-primary btn-sm btn-block" onClick={onWantCode}>
              Enter access code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
