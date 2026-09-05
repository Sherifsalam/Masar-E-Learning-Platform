const { verifyToken } = require("../utils/tokenUtils");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const Student = require("../DB/models/student.model");
const Teacher = require("../DB/models/teacher.model");

// Verifies the JWT on the Authorization header and attaches the acting
// user + role to req.user. Every protected route uses this first.
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) throw new ApiError(401, "Not authenticated — missing token");

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const Model = payload.role === "teacher" ? Teacher : Student;
  const user = await Model.findById(payload.id);
  if (!user) throw new ApiError(401, "User for this token no longer exists");

  req.user = user;
  req.userRole = payload.role;
  next();
});

// Restricts a route to one or more roles, e.g. authorize("teacher")
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { authenticate, authorize };
