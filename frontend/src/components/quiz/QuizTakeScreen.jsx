import { useCallback, useEffect, useRef, useState } from "react";
import { quizApi } from "../../lib/api.js";
import { Loading, ErrorMsg } from "../../lib/useApi.jsx";

function formatClock(seconds) {
  const s = Math.max(0, seconds);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function QuizTakeScreen({ quizId, go }) {
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> { selectedOptionId | shortAnswerText }
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  const submittedRef = useRef(false);

  // Load the quiz and open (or resume) this student's attempt.
  useEffect(() => {
    if (!quizId) {
      setError("No quiz selected — pick one from the dashboard.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [q, a] = await Promise.all([quizApi.getOne(quizId), quizApi.startAttempt(quizId)]);
        if (cancelled) return;
        setQuiz(q);
        setAttempt(a);
        if (a.status === "completed") setResult(a);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  const submit = useCallback(
    async (auto = false) => {
      if (!attempt || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      setError(null);
      try {
        const payload = quiz.questions.map((q) => ({
          questionId: q._id,
          selectedOptionId: answers[q._id] ? answers[q._id].selectedOptionId || null : null,
          shortAnswerText: answers[q._id] ? answers[q._id].shortAnswerText || "" : "",
        }));
        setResult(await quizApi.submitAttempt(attempt._id, payload));
      } catch (err) {
        setError(auto ? `Time is up, but submitting failed: ${err.message}` : err.message);
        submittedRef.current = false;
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, answers, quiz]
  );

  // Countdown from the attempt's start time, so a refresh doesn't reset it.
  useEffect(() => {
    if (!quiz || !attempt || result) return;
    const deadline = new Date(attempt.startedAt).getTime() + quiz.durationMinutes * 60000;

    const tick = () => {
      const left = Math.round((deadline - Date.now()) / 1000);
      setSecondsLeft(left);
      if (left <= 0) submit(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [quiz, attempt, result, submit]);

  if (error && !quiz) return <ErrorMsg error={error} />;
  if (!quiz || !attempt) return <Loading label="Opening quiz…" />;

  if (result) {
    return (
      <div style={{ padding: "40px 20px", background: "var(--canvas)", minHeight: 600 }}>
        <div className="quiz-take-wrap">
          <div className="card" style={{ textAlign: "center" }}>
            <div className="section-label">{quiz.title}</div>
            <h2 style={{ fontSize: 34, margin: "12px 0" }}>{result.scorePercent}%</h2>
            <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
              {result.answers.filter((a) => a.isCorrect).length} of {result.answers.length} correct
            </p>
            <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => go("q-dashboard")}>
              Back to quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[index];
  const answered = Object.keys(answers).length;
  const setAnswer = (value) => setAnswers((a) => ({ ...a, [question._id]: value }));
  const currentAnswer = answers[question._id] || {};

  return (
    <div style={{ padding: "40px 20px", background: "var(--canvas)", minHeight: 600 }}>
      <div className="quiz-take-wrap">
        <div className="quiz-progress-top">
          <div style={{ flex: 1 }}>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: (answered / quiz.questions.length) * 100 + "%" }}
              />
            </div>
          </div>
          <span style={{ fontSize: 12.5, color: "var(--ink-faint)", fontWeight: 600 }}>
            Question {index + 1} of {quiz.questions.length}
          </span>
          {secondsLeft !== null && <span className="timer-pill">⏱ {formatClock(secondsLeft)}</span>}
        </div>

        <div className="card">
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
            {quiz.title.toUpperCase()}
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 20, lineHeight: 1.4 }}>{question.text}</h3>

          {question.type === "short_answer" ? (
            <input
              className="short-answer-input"
              value={currentAnswer.shortAnswerText || ""}
              onChange={(e) => setAnswer({ shortAnswerText: e.target.value })}
              placeholder="Type your answer"
            />
          ) : (
            question.options.map((o) => (
              <div
                key={o._id}
                className={"qopt" + (currentAnswer.selectedOptionId === o._id ? " sel" : "")}
                onClick={() => setAnswer({ selectedOptionId: o._id })}
              >
                {o.text}
              </div>
            ))
          )}

          <ErrorMsg error={error} />

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
            <button
              className="btn btn-ghost"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              ← Previous
            </button>
            {index === quiz.questions.length - 1 ? (
              <button className="btn btn-primary" onClick={() => submit(false)} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit quiz"}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setIndex((i) => i + 1)}>
                Next question →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
