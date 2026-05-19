require("dotenv").config();
const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const compression = require("compression");
const getDB      = require("./config/db");

const patientRoutes      = require("./routes/patientRoutes");
const intakeRoutes       = require("./routes/intakeRoutes");
const aiRoutes           = require("./routes/aiRoutes");
const medicationRoutes   = require("./routes/medicationRoutes");
const doctorRoutes       = require("./routes/doctorRoutes");
const mapRoutes          = require("./routes/mapRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(compression());

// ── Supabase connection check — initialise client once per request ─────────────
app.use((req, res, next) => {
  try {
    getDB();   // throws if env vars missing — otherwise returns cached client
    next();
  } catch (err) {
    console.error("Supabase init error:", err.message);
    res.status(503).json({ error: err.message });
  }
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/patients",      patientRoutes);
app.use("/api/intake",        intakeRoutes);
app.use("/api/ai",            aiRoutes);
app.use("/api/medications",   medicationRoutes);
app.use("/api/doctors",       doctorRoutes);
app.use("/api/maps",          mapRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/prescription",  prescriptionRoutes);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", message: "MediCare API running (Supabase)" }));
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// ── Local dev only ────────────────────────────────────────────────────────────
if (process.env.VERCEL !== "1") {
  try {
    const { startReminderScheduler } = require("./scheduler/reminderScheduler");
    startReminderScheduler();
  } catch (e) {
    console.log("Scheduler skipped:", e.message);
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
