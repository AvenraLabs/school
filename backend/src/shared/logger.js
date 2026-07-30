import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "../../storage/logs");

// Ensure log storage directory exists
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.error("Failed to create log directory:", err.message);
}

const getLogFilePath = () => {
  const dateStr = new Date().toISOString().split("T")[0];
  return path.join(logDir, `app-${dateStr}.log`);
};

const getIntegrationLogFilePath = () => {
  const dateStr = new Date().toISOString().split("T")[0];
  return path.join(logDir, `integrations-${dateStr}.log`);
};

const writeLog = (level, event, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    event,
    message,
    meta,
  };

  const formattedConsole = `[${timestamp}] [${level}] [${event}] ${message}`;
  if (level === "ERROR") {
    console.error(formattedConsole, Object.keys(meta).length ? JSON.stringify(meta) : "");
  } else if (level === "WARN") {
    console.warn(formattedConsole, Object.keys(meta).length ? JSON.stringify(meta) : "");
  } else {
    console.log(formattedConsole, Object.keys(meta).length ? JSON.stringify(meta) : "");
  }

  try {
    fs.appendFileSync(getLogFilePath(), JSON.stringify(entry) + "\n");
  } catch (err) {
    // Fail-safe to console if file write fails
  }
};

export const logger = {
  info: (event, message, meta = {}) => writeLog("INFO", event, message, meta),
  warn: (event, message, meta = {}) => writeLog("WARN", event, message, meta),
  error: (event, message, meta = {}) => writeLog("ERROR", event, message, meta),

  /**
   * Uniform Integration Call Logger across external services (Gemini, Kling, WhatsApp, Maps)
   * Log Shape: { timestamp, level, type, integration, action, status, duration_ms, error, meta }
   */
  integration: ({ integration, action, status, duration_ms = 0, error = null, meta = {} }) => {
    const timestamp = new Date().toISOString();
    const isError = status === "failure" || status === "failed";
    const entry = {
      timestamp,
      level: isError ? "ERROR" : "INFO",
      type: "integration_call",
      integration, // gemini | kling | whatsapp | maps
      action,      // send_template | submit_video_task | rag_answer | geocode
      status,      // success | failure | skipped | limit_exceeded
      duration_ms,
      error: error ? (typeof error === "object" ? JSON.stringify(error) : String(error)) : null,
      meta,
    };

    const formattedConsole = `[${timestamp}] [INTEGRATION:${integration.toUpperCase()}] [${action}] status=${status} duration=${duration_ms}ms${error ? ` error=${entry.error}` : ""}`;
    if (isError) {
      console.error(formattedConsole);
    } else {
      console.log(formattedConsole);
    }

    try {
      fs.appendFileSync(getIntegrationLogFilePath(), JSON.stringify(entry) + "\n");
      fs.appendFileSync(getLogFilePath(), JSON.stringify(entry) + "\n");
    } catch (err) {
      // Fail-safe
    }
  },
};

export default logger;
