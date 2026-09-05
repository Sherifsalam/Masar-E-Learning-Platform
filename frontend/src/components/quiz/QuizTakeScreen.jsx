import { useState } from "react";

const OPTIONS = [
  "Only appears when two copies of the gene are present",
  "Always appears in every generation",
  "Is stronger than a dominant trait",
  "Cannot be inherited from parents",
];

export default function QuizTakeScreen() {
  const [answer, setAnswer] = useState(0);

  return (
    <div style={{ padding: "40px 20px", background: "var(--canvas)", minHeight: 600 }}>
      <div className="quiz-take-wrap">
        <div className="quiz-progress-top">
          <div style={{ flex: 1 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: "40%" }} />
            </div>
          </div>
          <span style={{ fontSize: 12.5, color: "var(--ink-faint)", fontWeight: 600 }}>Question 4 of 10</span>
          <span className="timer-pill">⏱ 08:42</span>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>GENETICS — MID-UNIT TEST</div>
          <h3 style={{ fontSize: 18, marginBottom: 20, lineHeight: 1.4 }}>Which of the following best describes a recessive trait?</h3>
          {OPTIONS.map((opt, i) => (
            <div key={i} className={"qopt" + (answer === i ? " sel" : "")} onClick={() => setAnswer(i)}>
              {opt}
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
            <button className="btn btn-ghost">← Previous</button>
            <button className="btn btn-primary">Next question →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
