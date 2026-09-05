require("dotenv").config();
const bootstrap = require("./bootstrap");
const connectDB = require("./DB/connection");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    const app = bootstrap();
    app.listen(PORT, () => {
      console.log(`[server] Masar API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err.message);
    process.exit(1);
  }
}

start();
