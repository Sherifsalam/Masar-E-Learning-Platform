import StudentSidebar from "./StudentSidebar.jsx";
import { FILES } from "./files.data.js";

export default function FilesScreen({ go }) {
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
          <button className="chip active">All files</button>
          <button className="chip">PDF</button>
          <button className="chip">Word</button>
          <button className="chip">PowerPoint</button>
        </div>
        <div className="card">
          {FILES.map((f, i) => (
            <div className="file-row" key={i}>
              <div className="file-icon" style={{ background: f.color }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="file-name">{f.name}</div>
                <div className="file-meta">{f.meta}</div>
              </div>
              <button className="btn btn-ghost btn-sm">Download</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
