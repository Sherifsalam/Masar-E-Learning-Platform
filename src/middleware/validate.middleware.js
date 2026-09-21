const ApiError = require("../utils/apiError");

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
