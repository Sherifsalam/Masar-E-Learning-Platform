# Masar — Backend API

Express + MongoDB REST API for the Masar e-learning system. It backs the React
front end in `../frontend`.

## Running it

```bash
npm install
cp .env.example .env    # then edit MONGO_URI and JWT_SECRET
npm run seed            # demo teacher, students, lectures and a published quiz
npm run dev             # http://localhost:5000 (nodemon)
```

`npm start` runs it without nodemon. `GET /api/health` answers
`{ "success": true }` when the server is up.

### Demo accounts

`npm run seed` is safe to re-run — every record is upserted by its natural key.
It prints:

| Role    | Sign in with                             | Password      |
| ------- | ---------------------------------------- | ------------- |
| Teacher | `s.hassan@school.edu`                    | `Teacher123!` |
| Student | `nour.ahmed@school.edu` or ID `22-10453` | `Student123!` |

Seeding matters for the teacher side in particular: there is no public teacher
signup route, so without it nobody can log into the teacher portal.

It also prints twelve fixed lecture access codes — three per seeded lecture —
for testing the unlock flow by hand:

| Lecture                            | Codes                                 |
| ---------------------------------- | ------------------------------------- |
| Cell division — mitosis vs meiosis | `CDNA-2345`, `CDNA-2346`, `CDNA-2347` |
| Photosynthesis in depth            | `PHTS-2345`, `PHTS-2346`, `PHTS-2347` |
| Newton's laws — worked examples    | `NEWT-2345`, `NEWT-2346`, `NEWT-2347` |
| Quadratic equations — full review  | `QDRT-2345`, `QDRT-2346`, `QDRT-2347` |

These are deliberately readable; codes issued through the API are random.

## Configuration

`.env` keys, all read at boot:

| Key                      | Notes                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| `PORT`                   | Defaults to `5000`.                                                       |
| `MONGO_URI`              | Required.                                                                 |
| `JWT_SECRET`             | Required. Use a long random string.                                       |
| `JWT_EXPIRES_IN`         | Token lifetime, e.g. `7d`.                                                |
| `CLIENT_ORIGIN`          | Comma-separated browser origins allowed by CORS. Unset means allow any.   |
| `QR_SESSION_TTL_SECONDS` | How long a check-in QR code stays valid. Defaults to 900.                 |
| `SMTP_*`                 | Optional. Parent reports are stored either way; email only sends if set.  |

In development `CLIENT_ORIGIN` is `http://localhost:5173` (the Vite dev server).
The front end proxies `/api` there, so requests are same-origin and CORS never
actually comes into play — the setting matters once the two are deployed apart.

## Responses

Every route answers with the same envelope:

```json
{ "success": true, "message": "Logged in", "data": { } }
```

Errors use the same shape with `success: false` and a human-readable `message`,
which the front end shows verbatim. Authentication is a bearer JWT:
`Authorization: Bearer <token>`.

## Routes

| Area       | Routes                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth       | `POST /api/auth/student/signup`, `POST /api/auth/student/login`, `POST /api/auth/teacher/login`, `GET /api/auth/me`                            |
| Students   | `GET /api/students/me/dashboard`, `GET /api/students`, `GET /api/students/:id`                                                                 |
| Teachers   | `GET /api/teachers/me/attendance-overview`                                                                                                     |
| Attendance | `POST /api/attendance/session`, `POST /api/attendance/check-in`, `GET /api/attendance/me/history`, `GET /api/attendance/me/stats`, `GET /api/attendance/roster`, `PATCH /api/attendance/:id` |
| Lectures   | `POST /api/lectures`, `GET /api/lectures`, `GET /api/lectures/continue-watching`, `GET /api/lectures/:id`, `PATCH /api/lectures/:id/progress`, `POST /api/lectures/redeem`, `POST /api/lectures/:id/codes`, `GET /api/lectures/:id/codes` |
| Files      | `POST /api/files`, `GET /api/files`, `GET /api/files/:id/download`, `DELETE /api/files/:id`                                                     |
| Quizzes    | `POST /api/quizzes`, `GET /api/quizzes`, `GET /api/quizzes/:id`, `PATCH /api/quizzes/:id`, `POST /api/quizzes/:id/publish`, `DELETE /api/quizzes/:id`, `GET /api/quizzes/:id/results`, `POST /api/quizzes/:id/attempts`, `GET /api/quizzes/:id/my-attempt`, `POST /api/quizzes/attempts/:attemptId/submit` |
| Reports    | `POST /api/reports`, `GET /api/reports/:studentId`                                                                                              |

`GET /api/quizzes` and `GET /api/quizzes/:id` change shape by role: teachers get
their own quizzes with attempt counts and correct answers; students get the
published ones with answers stripped out and their own attempt status attached.

## How lecture access codes work

Recorded lectures are prepaid. A student pays at the centre desk, receives a
code on their receipt, and redeems it in the app to unlock that one lecture.

1. A teacher calls `POST /api/lectures/:id/codes` with a `count` (1–100) and an
   optional `note` such as a receipt number. Codes look like `7K3Q-M9DP`, drawn
   from an alphabet with `I`, `L`, `O`, `U`, `0` and `1` removed so they can't
   be misread off a printed receipt.
2. The student posts the code to `POST /api/lectures/redeem`. Input is
   normalised first, so `cdna2345`, `CDNA-2345` and ` CDNA 2345 ` all match.
3. A code is single-use. A second account gets a 409; the original owner
   re-entering their own code gets a success with `alreadyOwned: true`, because
   that is a student checking, not an error.
4. `GET /api/lectures/:id/codes` lets the issuing teacher audit which codes have
   been sold and who redeemed them.

**`videoUrl` is stripped from any lecture the caller has not unlocked** — in the
list, in the single-lecture route, and in continue-watching. The paywall is
enforced server-side rather than hidden in the UI, so it cannot be bypassed by
reading the network tab. `GET /api/lectures/:id` and
`PATCH /api/lectures/:id/progress` both return 403 for a locked lecture.
Teachers own the material, so nothing is locked for them.

Note that **re-running `npm run seed` does not reset redemptions.** Codes are
upserted by their code string, but `redeemedBy` is left alone so re-seeding
never wipes what a student already paid for. To hand the demo codes back out,
clear the field directly:

```js
db.lectureaccesscodes.updateMany({}, { $set: { redeemedBy: null, redeemedAt: null } })
```

## How attendance check-in works

1. A teacher calls `POST /api/attendance/session` with a subject. The server
   mints a UUID, renders it as a QR data URL, and stores it with an expiry.
2. A student posts that token to `POST /api/attendance/check-in`. The server
   records `present`, or `late` if more than 10 minutes have passed since the
   session opened, upserted per student + subject + day.
3. The teacher can override any record with `PATCH /api/attendance/:id`.

## Layout

```
src/
  index.js            # loads env, connects to Mongo, starts listening
  bootstrap.js        # express app: CORS, JSON, static, routes, error handling
  DB/
    connection.js
    models/           # Student, Teacher, Attendance, CheckinSession, Lecture,
                      # LectureProgress, Quiz, QuizAttempt, FileResource, Report
  middleware/         # authenticate/authorize, required fields, uploads, errors
  modules/<area>/     # routes -> controller -> service, one folder per area
  utils/              # ApiError, sendResponse, asyncHandler, JWT, QR, email
scripts/seed.js       # demo data
uploads/              # multer destination for teacher file uploads
```

Controllers stay thin: they read `req`, call a service, and hand the result to
`sendResponse`. Business logic and all database access live in the services.
