export default function QuizBuilderScreen() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
      <div className="main-head">
        <div>
          <div className="main-title">Genetics — mid-unit test</div>
          <div className="main-sub">Draft · autosaved 2 minutes ago</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost">Preview</button>
          <button className="btn btn-primary">Publish quiz</button>
        </div>
      </div>
      <div className="builder-layout">
        <div className="builder-col">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--ink-faint)",
              textTransform: "uppercase",
              letterSpacing: ".04em",
              marginBottom: 10,
            }}
          >
            Questions (12)
          </div>
          <div className="qlist-item active">
            Q1: Dominant genes <span className="qtype-badge">MCQ</span>
          </div>
          <div className="qlist-item">
            Q2: Punnett squares <span className="qtype-badge">MCQ</span>
          </div>
          <div className="qlist-item">
            Q3: Genotype vs phenotype <span className="qtype-badge">T/F</span>
          </div>
          <div className="qlist-item">
            Q4: Recessive traits <span className="qtype-badge">MCQ</span>
          </div>
          <div className="qlist-item">
            Q5: Define mutation <span className="qtype-badge">Short</span>
          </div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 10 }}>
            + Add question
          </button>
        </div>
        <div className="builder-col">
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>
            Question 1
          </label>
          <input
            defaultValue="A dominant gene is one that:"
            style={{
              width: "100%",
              padding: "11px 13px",
              borderRadius: 10,
              border: "1px solid var(--border-strong)",
              fontSize: 14.5,
              fontWeight: 600,
              marginBottom: 16,
            }}
          />
          <div className="opt-row correct">
            <div className="radio-dot on" />
            Is expressed even when only one copy is present
          </div>
          <div className="opt-row">
            <div className="radio-dot" />
            Is only expressed when two copies are present
          </div>
          <div className="opt-row">
            <div className="radio-dot" />
            Skips a generation
          </div>
          <div className="opt-row">
            <div className="radio-dot" />
            Comes only from the mother
          </div>
          <button className="btn btn-ghost btn-sm">+ Add option</button>
        </div>
        <div className="builder-col">
          <div className="settings-row">
            <label>Question type</label>
            <select style={{ width: "100%", padding: 9, borderRadius: 8, border: "1px solid var(--border-strong)" }}>
              <option>Multiple choice</option>
              <option>True / False</option>
              <option>Short answer</option>
            </select>
          </div>
          <div className="settings-row">
            <label>Points</label>
            <input defaultValue="10" style={{ width: "100%", padding: 9, borderRadius: 8, border: "1px solid var(--border-strong)" }} />
          </div>
          <div className="settings-row">
            <label>Time limit (whole quiz)</label>
            <input
              defaultValue="20 minutes"
              style={{ width: "100%", padding: 9, borderRadius: 8, border: "1px solid var(--border-strong)" }}
            />
          </div>
          <div className="settings-row">
            <label>Due date</label>
            <input
              defaultValue="Sept 10, 11:59 PM"
              style={{ width: "100%", padding: 9, borderRadius: 8, border: "1px solid var(--border-strong)" }}
            />
          </div>
          <div className="check-row">
            <input type="checkbox" defaultChecked /> Shuffle question order
          </div>
          <div className="check-row">
            <input type="checkbox" defaultChecked /> Show score immediately
          </div>
          <div className="check-row">
            <input type="checkbox" /> Allow one retake
          </div>
        </div>
      </div>
    </div>
  );
}
