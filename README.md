# Masar — Backend API

Node.js + Express + MongoDB backend for the Masar e-learning UI (student app,
teacher app, and quiz system) shown in `masar-elearning-uiux.html`.

## Folder structure

```
src/
  DB/
    connection.js          # Mongoose connection
    models/                # one file per collection
  middleware/
    auth.middleware.js      # JWT auth + role guard
    error.middleware.js     # 404 + central error handler
    upload.middleware.js    # multer disk storage for file uploads
    validate.middleware.js  # simple required-fields guard
  modules/                  # one folder per feature, each with
                             # *.routes.js / *.controller.js / *.service.js
    auth/
    student/
    teacher/
    attendance/
    lecture/
    file/
    quiz/
    report/
  utils/
    apiError.js / apiResponse.js / asyncHandler.js
    tokenUtils.js            # sign/verify JWT
    qrService.js             # generates QR check-in sessions
    emailService.js          # nodemailer wrapper (logs to console if unset)
  bootstrap.js               # builds & configures the Express app
  index.js                   # connects DB + starts the HTTP server
uploads/                     # uploaded lecture files land here
```

## Setup

```bash
cd masar-backend
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm run dev              # or: npm start
```

Requires a running MongoDB instance (local or Atlas) at the `MONGO_URI` you set.

## Auth model

- Two separate collections: `Student` and `Teacher`. There is no single
  "User" table — each has different signup/login fields, matching the two
  distinct auth screens in the UI.
- Every protected route expects `Authorization: Bearer <token>`.
- The JWT payload carries `{ id, role }`, where `role` is `student` or
  `teacher`; `authorize("teacher")` / `authorize("student")` middleware
  restricts routes accordingly.

## API reference

All responses share the shape `{ success, message, data }`. Base path: `/api`.

### Auth (`/api/auth`)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/student/signup` | public | fullName, studentId, email, grade, section, password |
| POST | `/auth/student/login` | public | identifier (email or studentId), password |
| POST | `/auth/teacher/login` | public | email, password |
| GET | `/auth/me` | any | returns the logged-in student/teacher |

### Students (`/api/students`)
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/students/me/dashboard` | student | attendance rate + lectures watched (home stat cards) |
| GET | `/students?q=&grade=&section=` | teacher | search/lookup roster |
| GET | `/students/:id` | teacher | full profile: attendance bars, recent quiz scores, parent info |

### Teachers (`/api/teachers`)
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/teachers/me/attendance-overview?subject=&date=` | teacher | total/present/absent/late stat cards |

### Attendance (`/api/attendance`)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/attendance/session` | teacher | opens a QR check-in window for a subject, returns `qrDataUrl` |
| POST | `/attendance/check-in` | student | submit scanned `sessionToken`; marks present/late |
| GET | `/attendance/me/history?subject=&from=&to=` | student | attendance history |
| GET | `/attendance/me/stats` | student | rate, streak — used on the home screen |
| GET | `/attendance/roster?subject=&date=` | teacher | class roster table |
| PATCH | `/attendance/:id` | teacher | manually override a student's status |

### Lectures (`/api/lectures`)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/lectures` | teacher | create a recorded lecture entry |
| GET | `/lectures?subject=` | any | list, with the student's own watch progress attached |
| GET | `/lectures/continue-watching` | student | in-progress lectures for the home screen |
| GET | `/lectures/:id` | any | single lecture |
| PATCH | `/lectures/:id/progress` | student | update `watchedPercent` |

### Files (`/api/files`)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/files` | teacher | multipart upload (`file` field) + title/subject |
| GET | `/files?subject=&fileType=` | any | list saved files |
| GET | `/files/:id/download` | any | streams the file |
| DELETE | `/files/:id` | teacher | removes file + disk copy |

### Quizzes (`/api/quizzes`)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/quizzes` | teacher | create a draft (title, subject, ...) |
| PATCH | `/quizzes/:id` | teacher | edit questions/settings/due date |
| POST | `/quizzes/:id/publish` | teacher | draft → published/scheduled |
| DELETE | `/quizzes/:id` | teacher | remove quiz + its attempts |
| GET | `/quizzes` | any | teacher: own quizzes w/ stats · student: assigned quizzes |
| GET | `/quizzes/:id` | any | teacher: full quiz · student: quiz with answers stripped |
| POST | `/quizzes/:id/attempts` | student | start/resume an attempt |
| GET | `/quizzes/:id/my-attempt` | student | current/last attempt |
| POST | `/quizzes/attempts/:attemptId/submit` | student | submit answers, auto-graded |
| GET | `/quizzes/:id/results` | teacher | score distribution, weakest questions, per-student scores |

### Reports (`/api/reports`)
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/reports` | teacher | builds a snapshot report and sends it (email now; sms/whatsapp are stubbed for a provider like Twilio) |
| GET | `/reports/:studentId` | teacher | report history for a student |

## Notes for wiring up the frontend

- Store the JWT from signup/login and send it as `Authorization: Bearer <token>`
  on every subsequent request.
- The QR check-in flow: teacher calls `POST /attendance/session` to get
  `qrDataUrl` to render on the classroom screen; the student's scanner reads
  the embedded `sessionToken` and posts it to `POST /attendance/check-in`.
- Quiz questions returned to students never include `correctOptionId` or
  `correctShortAnswer` — grading happens server-side on submit.
