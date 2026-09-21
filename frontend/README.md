# Masar — E-Learning System UI

A React front end for **Masar**, an e-learning platform made of three connected
portals:

- **Student app** — sign up, log in, QR attendance check-in, recorded lectures,
  saved files (PDF / Word / PowerPoint)
- **Teacher app** — attendance review with a live QR check-in session, student
  lookup, quizzes, and a parent-report builder
- **Quiz system** — quiz dashboard, quiz builder, the student quiz-taking
  screen, and results & analytics

Every screen reads and writes through the Masar REST API (Node.js + Express +
MongoDB) in `../masar-backend`. There is no placeholder data left in the app.

## Running the whole stack

Two terminals, starting with the API:

```bash
cd ../masar-backend
npm install
npm run seed     # creates the demo teacher, students, lectures and a quiz
npm run dev      # http://localhost:5000
```

Then the UI:

```bash
npm install
npm run dev      # http://localhost:5173
```

Open `http://localhost:5173`. Vite proxies `/api` and `/uploads` to
`http://localhost:5000`, so the browser stays on one origin and there is no CORS
preflight in development.

### Demo accounts

`npm run seed` in the backend prints these:

| Role    | Sign in with                               | Password      |
| ------- | ------------------------------------------ | ------------- |
| Teacher | `s.hassan@school.edu`                      | `Teacher123!` |
| Student | `nour.ahmed@school.edu` or ID `22-10453`   | `Student123!` |

Students can also register themselves from the sign-up screen. Teacher accounts
have no public signup route — they come from the seed script or are created by
the school.

### Trying the lecture unlock flow

Recorded lectures are prepaid: a student pays at the centre, gets a code on
their receipt, and redeems it to unlock that lecture.

1. Log in as the student → **Recorded lectures**. Every lecture starts locked,
   showing a padlock instead of a play button.
2. Type one of the seeded codes — for example `CDNA-2345` — into **Unlock a
   lecture** and press **Submit code**. The field auto-uppercases and inserts
   the dash, and lowercase or dash-less input is accepted too.
3. The lecture unlocks and plays. Each code works once, so the next student
   needs their own.

`npm run seed` prints all twelve demo codes (three per lecture). Note that
re-running the seed does **not** free up a code that has already been redeemed —
see the backend README for how to reset them.

### Trying the attendance loop

1. Log in as the teacher → **Attendance review** → **Start check-in session**.
   A QR code and its text code appear, counting down from 15 minutes.
2. Log in as the student (a second browser or a private window) → **Attendance**.
   Either scan the QR with the camera, or paste the text code and press
   **Check in**.
3. The student is recorded `present`, or `late` past the 10-minute mark. The
   teacher's roster and stat cards show it on reload.

## Configuration

| Variable         | Where           | Meaning                                                                 |
| ---------------- | --------------- | ----------------------------------------------------------------------- |
| `VITE_API_URL`   | `.env`          | API origin for builds not served behind the proxy. Empty in development. |
| `VITE_API_PROXY` | `.env`          | Where the dev server forwards `/api`. Defaults to `http://localhost:5000`. |
| `CLIENT_ORIGIN`  | backend `.env`  | Comma-separated list of browser origins allowed by CORS.                  |

Copy `.env.example` to `.env` to override either value.

## How the wiring works

```
src/
  lib/
    api.js               # fetch wrapper + one function per API endpoint
    AuthContext.jsx      # token storage, login/signup/logout, current user
    useApi.jsx           # loading / error / retry hook and its state components
```

- **`api.js`** attaches the bearer token, unwraps the API's
  `{ success, message, data }` envelope, and throws an `ApiError` carrying the
  server's message so screens can show it verbatim. A 401 clears the token.
- **`AuthContext`** keeps the JWT in `localStorage` and re-fetches
  `GET /api/auth/me` on boot, so a refresh keeps you signed in and the user
  record is never stale.
- **`useApi`** runs a loader, tracks loading/error, and exposes `reload()`.
  Screens render `<Loading />`, `<ErrorMsg />` or `<Empty />` from the same
  module, so every screen fails the same way.

Authentication also drives navigation: `App.jsx` lands you on the right portal
for the account you signed in with, and each portal falls back to its login
screen when there is no session.

## Screen → endpoint map

| Screen                    | Endpoints                                                                 |
| ------------------------- | ------------------------------------------------------------------------- |
| Student sign-up / log in  | `POST /auth/student/signup`, `POST /auth/student/login`                    |
| Student home              | `/students/me/dashboard`, `/lectures/continue-watching`, `/files`, `/quizzes`, `/attendance/me/history` |
| Attendance check-in       | `POST /attendance/check-in`, `/attendance/me/stats`                        |
| Recorded lectures         | `/lectures`, `POST /lectures/redeem`, `PATCH /lectures/:id/progress`       |
| Saved files               | `/files`, `/files/:id/download`                                            |
| Teacher log in            | `POST /auth/teacher/login`                                                 |
| Attendance review         | `POST /attendance/session`, `/attendance/roster`, `PATCH /attendance/:id`, `/teachers/me/attendance-overview` |
| Student lookup            | `/students?q=`, `/students/:id`                                            |
| Parent reports            | `/students`, `/students/:id`, `POST /reports`                              |
| Quiz dashboard            | `/quizzes`, `POST /quizzes`, `DELETE /quizzes/:id`                         |
| Quiz builder              | `/quizzes/:id`, `PATCH /quizzes/:id`, `POST /quizzes/:id/publish`          |
| Taking a quiz             | `/quizzes/:id`, `POST /quizzes/:id/attempts`, `POST /quizzes/attempts/:id/submit` |
| Results & analytics       | `/quizzes/:id/results`                                                     |

### A few details worth knowing

- **Downloads** go through `fetch` and a blob URL rather than a plain `<a href>`,
  because `/files/:id/download` requires the `Authorization` header.
- **Locked lectures have no `videoUrl` to hide.** The server strips it from the
  response, so the padlock in the UI reflects the real state rather than
  creating it.
- **YouTube links play in an iframe**, since a `<video>` tag can't load them.
  An iframe can't report playback position either, so those lectures get a
  **Mark as watched** button instead of automatic progress tracking; uploaded
  mp4s still report progress on `timeupdate`.
- **The quiz builder saves twice.** The API identifies a question's correct
  answer by the option's `_id`, which only exists after Mongo has stored it. So
  the editor tracks the correct answer by index, saves the options to mint their
  ids, then saves again to point `correctOptionId` at the right one.

### QR scanning support

The student check-in screen uses the browser's native `BarcodeDetector`, which
is available in Chrome and Edge. Everywhere else the camera button is replaced
by a note, and the student types the short code shown under the teacher's QR —
which is the same check-in token, so the flow works in every browser.

## Design system

Colors, type, and spacing live as CSS custom properties at the top of
`src/styles/masar.css` (`--primary`, `--accent`, `--success`, etc.). Change a
value there to re-theme every screen at once.

- **Type**: Space Grotesk for headings, Inter for body/UI text (loaded from
  Google Fonts in `index.html`)
- **Primary**: `#2952E3` — buttons, links, active states
- **Accent**: `#FF7A45` — the QR check-in button and a few key highlights
- **Success / warning / danger**: used for attendance and quiz-score states

## Folder structure

```
src/
  App.jsx                     # portal + screen routing, driven by the session
  main.jsx                    # React entry point, mounts <AuthProvider>
  lib/                        # api client, auth context, data-loading hook
  styles/masar.css            # design tokens and shared styles
  components/
    shared/                   # TopBar, ProtoNav, Icons
    student/                  # sign-up, log in, home, check-in, lectures, files
    teacher/                  # log in, attendance, lookup, quizzes, reports
    quiz/                     # dashboard, builder, taking, results
```
