const ApiError = require("../utils/apiError");

// Simple required-fields guard used across the auth/quiz/report modules
// so controllers stay focused on business logic rather than input checks.
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const value = req.body[f];
      return value === undefined || value === null || value === "";
    });
    if (missing.length) {
      throw new ApiError(400, `Missing required field(s): ${missing.join(", ")}`);
    }
    next();
  };
}

module.exports = { requireFields };
