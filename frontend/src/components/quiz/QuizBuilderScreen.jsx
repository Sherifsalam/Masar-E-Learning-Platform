import { useEffect, useState } from "react";
import { quizApi } from "../../lib/api.js";
import { Loading, ErrorMsg } from "../../lib/useApi.jsx";

const TYPE_LABEL = { mcq: "MCQ", true_false: "T/F", short_answer: "Short" };

function blankQuestion() {
  return {
    text: "New question",
    type: "mcq",
    options: [{ text: "Option 1" }, { text: "Option 2" }],
    correctIndex: 0,
    correctShortAnswer: "",
    points: 10,
  };
}

// The API identifies the correct option by its _id, but freshly added options
// have no _id yet — so the editor works in indexes and converts on save.
function toEditable(quiz) {
  return {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      ...q,
      correctIndex: q.options.findIndex((o) => String(o._id) === String(q.correctOptionId)),
    })),
  };
}

function isoLocal(date) {
  if (!date) return "";
  const d = new Date(date);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export default function QuizBuilderScreen({ quizId, go }) {
  const [quiz, setQuiz] = useState(null);
  const [active, setActive] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!quizId) {
      setLoadError("No quiz selected — open one from the dashboard.");
      return;
    }
    let cancelled = false;
    setLoadError(null);
    quizApi
      .getOne(quizId)
      .then((q) => !cancelled && setQuiz(toEditable(q)))
      .catch((err) => !cancelled && setLoadError(err.message));
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const patchQuiz = (updates) => setQuiz((q) => ({ ...q, ...updates }));

  const patchQuestion = (index, updates) =>
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((qq, i) => (i === index ? { ...qq, ...updates } : qq)),
    }));

  function addQuestion() {
    setQuiz((q) => ({ ...q, questions: [...q.questions, blankQuestion()] }));
    setActive(quiz.questions.length);
  }

  function removeQuestion(index) {
    setQuiz((q) => ({ ...q, questions: q.questions.filter((_, i) => i !== index) }));
    setActive((a) => Math.max(0, a >= index ? a - 1 : a));
  }

  function addOption(index) {
    const q = quiz.questions[index];
    patchQuestion(index, { options: [...q.options, { text: `Option ${q.options.length + 1}` }] });
  }

  function setType(index, type) {
    const updates = { type };
    if (type === "true_false") {
      updates.options = [{ text: "True" }, { text: "False" }];
      updates.correctIndex = 0;
    }
    if (type === "short_answer") updates.options = [];
    if (type === "mcq" && !quiz.questions[index].options.length) {
      updates.options = [{ text: "Option 1" }, { text: "Option 2" }];
      updates.correctIndex = 0;
    }
    patchQuestion(index, updates);
  }

  // Saving is two passes: the first creates any new option subdocuments, the
  // second points correctOptionId at the ids Mongo just assigned.
  async function save() {
    setBusy(true);
    setSaveError(null);
    setStatus(null);
    try {
      const base = {
        title: quiz.title,
        subject: quiz.subject,
        grade: quiz.grade,
        section: quiz.section,
        durationMinutes: Number(quiz.durationMinutes) || 20,
        dueDate: quiz.dueDate || null,
        settings: quiz.settings,
        questions: quiz.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options.map((o) => ({ text: o.text })),
          correctShortAnswer: q.correctShortAnswer || "",
          points: Number(q.points) || 10,
        })),
      };

      const saved = await quizApi.update(quiz._id, base);

      const withCorrect = {
        questions: saved.questions.map((q, i) => ({
          ...q,
          correctOptionId:
            quiz.questions[i] && quiz.questions[i].correctIndex >= 0 && q.options[quiz.questions[i].correctIndex]
              ? q.options[quiz.questions[i].correctIndex]._id
              : null,
        })),
      };

      const final = await quizApi.update(quiz._id, withCorrect);
      setQuiz(toEditable(final));
      setStatus("Saved.");
      return final;
    } catch (err) {
      setSaveError(err.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    const saved = await save();
    if (!saved) return;
    setBusy(true);
    try {
      const published = await quizApi.publish(quiz._id);
      setQuiz(toEditable(published));
      setStatus(`Quiz is now ${published.status}.`);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loadError) return <ErrorMsg error={loadError} />;
  if (!quiz) return <Loading label="Loading quiz…" />;

  const current = quiz.questions[active];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
      <div className="main-head">
        <div style={{ flex: 1 }}>
          <input
            className="title-input"
            value={quiz.title}
            onChange={(e) => patchQuiz({ title: e.target.value })}
          />
          <div className="main-sub">
            {quiz.status} · {quiz.subject}
            {status ? ` · ${status}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => go("q-dashboard")}>
            Back
          </button>
          <button className="btn btn-ghost" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save draft"}
          </button>
          <button className="btn btn-primary" onClick={publish} disabled={busy || !quiz.questions.length}>
            Publish quiz
          </button>
        </div>
      </div>

      <ErrorMsg error={saveError} />

      <div className="builder-layout">
        <div className="builder-col">
          <div className="section-label">Questions ({quiz.questions.length})</div>
          {quiz.questions.map((q, i) => (
            <div
              key={i}
              className={"qlist-item" + (i === active ? " active" : "")}
              onClick={() => setActive(i)}
            >
              Q{i + 1}: {q.text.slice(0, 26)}
              {q.text.length > 26 ? "…" : ""} <span className="qtype-badge">{TYPE_LABEL[q.type]}</span>
            </div>
          ))}
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 10 }} onClick={addQuestion}>
            + Add question
          </button>
        </div>

        <div className="builder-col">
          {!current ? (
            <div className="state-msg">Add a question to get started.</div>
          ) : (
            <>
              <label className="section-label">Question {active + 1}</label>
              <input
                value={current.text}
                onChange={(e) => patchQuestion(active, { text: e.target.value })}
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

              {current.type === "short_answer" ? (
                <div className="field">
                  <label>Accepted answer (case-insensitive)</label>
                  <input
                    value={current.correctShortAnswer || ""}
                    onChange={(e) => patchQuestion(active, { correctShortAnswer: e.target.value })}
                    placeholder="e.g. metaphase"
                  />
                </div>
              ) : (
                <>
                  {current.options.map((o, i) => (
                    <div
                      key={i}
                      className={"opt-row" + (current.correctIndex === i ? " correct" : "")}
                      onClick={() => patchQuestion(active, { correctIndex: i })}
                    >
                      <div className={"radio-dot" + (current.correctIndex === i ? " on" : "")} />
                      <input
                        className="opt-input"
                        value={o.text}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          patchQuestion(active, {
                            options: current.options.map((oo, oi) =>
                              oi === i ? { ...oo, text: e.target.value } : oo
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                  {current.type === "mcq" && (
                    <button className="btn btn-ghost btn-sm" onClick={() => addOption(active)}>
                      + Add option
                    </button>
                  )}
                </>
              )}

              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 14 }}
                onClick={() => removeQuestion(active)}
              >
                Delete question
              </button>
            </>
          )}
        </div>

        <div className="builder-col">
          {current && (
            <>
              <div className="settings-row">
                <label>Question type</label>
                <select value={current.type} onChange={(e) => setType(active, e.target.value)}>
                  <option value="mcq">Multiple choice</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short answer</option>
                </select>
              </div>
              <div className="settings-row">
                <label>Points</label>
                <input
                  type="number"
                  min="1"
                  value={current.points}
                  onChange={(e) => patchQuestion(active, { points: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="settings-row">
            <label>Time limit (minutes)</label>
            <input
              type="number"
              min="1"
              value={quiz.durationMinutes}
              onChange={(e) => patchQuiz({ durationMinutes: e.target.value })}
            />
          </div>
          <div className="settings-row">
            <label>Due date</label>
            <input
              type="datetime-local"
              value={isoLocal(quiz.dueDate)}
              onChange={(e) => patchQuiz({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
            />
          </div>
          <div className="check-row">
            <input
              type="checkbox"
              checked={quiz.settings.shuffleQuestions}
              onChange={(e) => patchQuiz({ settings: { ...quiz.settings, shuffleQuestions: e.target.checked } })}
            />{" "}
            Shuffle question order
          </div>
          <div className="check-row">
            <input
              type="checkbox"
              checked={quiz.settings.showScoreImmediately}
              onChange={(e) =>
                patchQuiz({ settings: { ...quiz.settings, showScoreImmediately: e.target.checked } })
              }
            />{" "}
            Show score immediately
          </div>
          <div className="check-row">
            <input
              type="checkbox"
              checked={quiz.settings.allowRetake}
              onChange={(e) => patchQuiz({ settings: { ...quiz.settings, allowRetake: e.target.checked } })}
            />{" "}
            Allow one retake
          </div>
        </div>
      </div>
    </div>
  );
}
