import { useState } from "react";
import StudentSidebar from "./StudentSidebar.jsx";
import { api } from "../../lib/api.js";
import { fileApi } from "../../lib/api.js";
import { useApi, Loading, ErrorMsg, Empty } from "../../lib/useApi.jsx";

const TYPES = [
  { id: "", label: "All files" },
  { id: "pdf", label: "PDF" },
  { id: "doc", label: "Word" },
  { id: "ppt", label: "PowerPoint" },
];

const ICON_COLOR = { pdf: "#E3492F", doc: "#2952E3", ppt: "#FF7A45", other: "#6B7280" };

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
  return Math.round(bytes / 1024) + " KB";
}

export default function FilesScreen({ go }) {
  const [fileType, setFileType] = useState("");
  const [downloadError, setDownloadError] = useState(null);

  const { data: files, error, loading, reload } = useApi(() => fileApi.list({ fileType }), [fileType]);

  // Downloads need the bearer token, so fetch the bytes and hand the browser a
  // blob rather than pointing an <a> at the endpoint.
  async function download(file) {
    setDownloadError(null);
    try {
      const res = await api.raw(`/files/${file._id}/download`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.message || "Download failed");
    }
  }

  return (
    <div className="app-shell">
      <StudentSidebar active="s-files" go={go} />
      <main className="main">
        <div className="main-head">
          <div>
            <div className="main-title">Saved files</div>
            <div className="main-sub">PDFs, slides and documents shared by your teachers</div>
          </div>
        </div>

        <div className="file-filters">
          {TYPES.map((t) => (
            <button
              key={t.id}
              className={"chip" + (fileType === t.id ? " active" : "")}
              onClick={() => setFileType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <Loading />}
        <ErrorMsg error={error} onRetry={reload} />
        <ErrorMsg error={downloadError} />

        <div className="card">
          {files && !files.length && <Empty label="No files shared yet." />}
          {(files || []).map((f) => (
            <div className="file-row" key={f._id}>
              <div className="file-icon" style={{ background: ICON_COLOR[f.fileType] || ICON_COLOR.other }}>
                {f.fileType.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="file-name">{f.title}</div>
                <div className="file-meta">
                  {f.subject} · {formatSize(f.sizeBytes)} · added{" "}
                  {new Date(f.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => download(f)}>
                Download
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
