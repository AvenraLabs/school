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

const writeLog = (level, event, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    level,
    event,
    message,
    meta,
  };

  // Structured console log
  const formattedConsole = `[${timestamp}] [${level}] [${event}] ${message}`;
  if (level === "ERROR") {
    console.error(formattedConsole, Object.keys(meta).length ? JSON.stringify(meta) : "");
  } else if (level === "WARN") {
    console.warn(formattedConsole, Object.keys(meta).length ? JSON.stringify(meta) : "");
  } else {
    console.log(formattedConsole, Object.keys(meta).length ? JSON.stringify(meta) : "");
  }

  // Persistent JSON line file append
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
};

export default logger;
