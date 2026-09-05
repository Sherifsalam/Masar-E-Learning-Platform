# Masar — E-Learning System UI/UX

A clickable React prototype for **Masar**, an e-learning platform made of three
connected portals:

- **Student app** — sign up, log in, QR attendance check-in, recorded lectures,
  saved files (PDF / Word / PowerPoint)
- **Teacher app** — attendance review, student lookup, a link out to the quiz
  system, and a parent-report builder
- **Quiz system** — quiz dashboard, quiz builder, the student quiz-taking
  screen, and results & analytics

This is a design-stage prototype: screens use realistic placeholder data and
in-memory state, not a real backend. See the [Masar backend repo] (Node.js +
Express + MongoDB) for the API this is meant to plug into.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Folder structure

```
src/
  App.jsx                     # top-level state: which portal + which screen is active
  main.jsx                    # React entry point
  styles/
    masar.css                 # design tokens (colors, spacing) and shared styles
  components/
    shared/
      TopBar.jsx               # Student app / Teacher app / Quiz system switcher
      ProtoNav.jsx              # secondary "screen" switcher used inside each portal
      Icons.jsx                 # small inline SVG icons
    student/
      StudentApp.jsx            # wires up all student screens
      StudentSidebar.jsx
      SignUpScreen.jsx
      LoginScreen.jsx
      HomeScreen.jsx             # dashboard with the QR check-in button
      AttendanceScanScreen.jsx   # QR scan + "you're marked present" state
      LecturesScreen.jsx         # recorded lectures grid
      FilesScreen.jsx            # saved PDFs / Word / PowerPoint files
      lectures.data.js
      files.data.js
    teacher/
      TeacherApp.jsx             # wires up all teacher screens
      TeacherSidebar.jsx
      TeacherLoginScreen.jsx
      AttendanceReviewScreen.jsx # per-student attendance table
      StudentLookupScreen.jsx    # search + full student record
      QuizzesScreen.jsx          # links out to the quiz system
      ParentReportScreen.jsx     # build + send a report to a parent
      roster.data.js
    quiz/
      QuizSystem.jsx             # wires up all quiz-system screens
      QuizDashboardScreen.jsx
      QuizBuilderScreen.jsx      # question list + editor + settings
      QuizTakeScreen.jsx         # student-facing quiz taking flow
      QuizResultsScreen.jsx      # score distribution + per-student results
      quizzes.data.js
```

## Design system

Colors, type, and spacing live as CSS custom properties at the top of
`src/styles/masar.css` (`--primary`, `--accent`, `--success`, etc.). Change a
value there to re-theme every screen at once.

- **Type**: Space Grotesk for headings, Inter for body/UI text (loaded from
  Google Fonts in `index.html`)
- **Primary**: `#2952E3` — buttons, links, active states
- **Accent**: `#FF7A45` — the QR check-in button and a few key highlights
- **Success / warning / danger**: used for attendance and quiz-score states

## Notes on the data

Every screen currently reads from small hardcoded arrays (`*.data.js` files
next to the screens that use them, or inline in the component when there's
just one record). Swapping in real data means replacing those arrays/values
with API calls — the JSX and layout don't need to change.

[Masar backend repo]: #
