const path = require("path");
const fs = require("fs");
const os = require("os");
const util = require("util");

/**
 *
 * @param {import("../aura/types/main/core").WindowName} windowName
 */
const initLogger = (windowName) => {
  const logDir = path.join(global.__HUGO_AURA__.auraDir, "logs");

  global.__HUGO_AURA__.logDir = logDir;

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  cleanupOldLogs(logDir);
  const logFile = getLogFileName(logDir);
  const logStream = fs.createWriteStream(logFile, { flags: "a" });

  const timestamp = new Date().toISOString();
  const startupMsg = `\n=== [${timestamp}] HugoAura 窗口启动: ${windowName} ===\n\n`;
  logStream.write(startupMsg);

  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug,
  };

  console.log = function (...args) {
    const msg = util.format(`[LOG] <${windowName}>`, ...args) + "\n";
    logStream.write(msg);
    originalConsole.log.apply(console, args);
  };

  console.error = function (...args) {
    const msg = util.format(`[ERROR] <${windowName}>`, ...args) + "\n";
    logStream.write(msg);
    originalConsole.error.apply(console, args);
  };

  console.warn = function (...args) {
    const msg = util.format(`[WARN] <${windowName}>`, ...args) + "\n";
    logStream.write(msg);
    originalConsole.warn.apply(console, args);
  };

  console.info = function (...args) {
    const msg = util.format(`[INFO] <${windowName}>`, ...args) + "\n";
    logStream.write(msg);
    originalConsole.info.apply(console, args);
  };

  console.debug = function (...args) {
    if (!process.argv.includes("--aura-debug")) return;
    const msg = util.format(`[DEBUG] <${windowName}>`, ...args) + "\n";
    logStream.write(msg);
    originalConsole.debug.apply(console, args);
  };

  process.on("uncaughtException", (err) => {
    console.error("[CRITICAL] UNCAUGHT EXCEPTION:", err);
  });

  console.log("[HugoAura / Logger] Logger initialized. Log file:", logFile);
};

const cleanupOldLogs = (logDir) => {
  try {
    const files = fs.readdirSync(logDir);
    const now = new Date();
    const daysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    files.forEach((file) => {
      if (file.endsWith(".log")) {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);

        // 如果文件创建时间超过两周, 则删除
        if (stats.birthtime < daysAgo) {
          fs.unlinkSync(filePath);
          console.log(
            `[HugoAura / Logger / Cleanup] Cleaned log file: ${file}`
          );
        }
      }
    });
  } catch (error) {
    console.error(
      "[HugoAura / Logger / Cleanup] Unexpected error occurred cleaning log file:",
      error
    );
  }
};

/**
 * 生成每日 Log 文件路径
 * @param {string} logDir 日志目录路径
 * @param {string} _windowName 窗口名称 (暂时无用)
 * @returns {string} 日志文件路径
 */
const getLogFileName = (logDir, _windowName) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD 格式
  const logFileName = `HugoAura-SSA-${dateStr}.log`;
  return path.join(logDir, logFileName);
};

module.exports = { initLogger };
