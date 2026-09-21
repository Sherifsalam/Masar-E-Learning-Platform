const bcrypt = require("bcryptjs");
const Student = require("../../DB/models/student.model");
const Teacher = require("../../DB/models/teacher.model");
const ApiError = require("../../utils/apiError");
const { signToken } = require("../../utils/tokenUtils");

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

async function signupStudent(payload) {
  const { fullName, studentId, email, grade, section, password } = payload;

  const existing = await Student.findOne({ $or: [{ email }, { studentId }] });
  if (existing) throw new ApiError(409, "A student with this email or ID already exists");

  const hashed = await bcrypt.hash(password, 10);
  const student = await Student.create({
    fullName, studentId, email, grade, section,
    password: hashed,
    avatarInitials: initials(fullName),
  });

  const token = signToken({ id: student._id, role: "student" });
  return { token, user: sanitizeStudent(student) };
}

async function loginStudent({ identifier, password }) {
  const student = await Student.findOne({
    $or: [{ email: identifier }, { studentId: identifier }],
  }).select("+password");

  if (!student) throw new ApiError(401, "Invalid credentials");
  const match = await bcrypt.compare(password, student.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const token = signToken({ id: student._id, role: "student" });
  return { token, user: sanitizeStudent(student) };
}

async function loginTeacher({ email, password }) {
  const teacher = await Teacher.findOne({ email }).select("+password");
  if (!teacher) throw new ApiError(401, "Invalid credentials");
  const match = await bcrypt.compare(password, teacher.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const token = signToken({ id: teacher._id, role: "teacher" });
  return { token, user: sanitizeTeacher(teacher) };
}

function sanitizeStudent(student) {
  const obj = student.toObject();
  delete obj.password;
  return { ...obj, role: "student" };
}

function sanitizeTeacher(teacher) {
  const obj = teacher.toObject();
  delete obj.password;
  return { ...obj, role: "teacher" };
}

module.exports = { signupStudent, loginStudent, loginTeacher, sanitizeStudent, sanitizeTeacher };
