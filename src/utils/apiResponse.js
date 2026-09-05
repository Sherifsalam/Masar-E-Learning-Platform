// Small helper to keep every success response in the same shape:
// { success, message, data }
function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
}

module.exports = sendResponse;
