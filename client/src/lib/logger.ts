type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class BrowserLogger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs in memory

  /**
   * Format timestamp as ISO string
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Get console color based on log level
   */
  private getConsoleStyle(level: LogLevel): string {
    const styles: Record<LogLevel, string> = {
      debug: "color: #888; font-weight: normal;",
      info: "color: #0066cc; font-weight: bold;",
      warn: "color: #ff9900; font-weight: bold;",
      error: "color: #cc0000; font-weight: bold;",
    };
    return styles[level];
  }

  /**
   * Get emoji for log level
   */
  private getEmoji(level: LogLevel): string {
    const emojis: Record<LogLevel, string> = {
      debug: "🔍",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌",
    };
    return emojis[level];
  }

  /**
   * Store log entry in memory
   */
  private storeLog(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    // Keep only the last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Format log output
   */
  private formatLog(level: LogLevel, message: string, data?: any): string {
    const timestamp = this.getTimestamp();
    const emoji = this.getEmoji(level);
    const levelUpper = level.toUpperCase().padEnd(5);

    if (data) {
      return `${emoji} [${timestamp}] ${levelUpper} ${message}`;
    }
    return `${emoji} [${timestamp}] ${levelUpper} ${message}`;
  }

  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    this.storeLog("debug", message, data);

    if (this.isDevelopment) {
      console.log(
        `%c${this.formatLog("debug", message, data)}`,
        this.getConsoleStyle("debug"),
        data || ""
      );
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.storeLog("info", message, data);

    console.log(
      `%c${this.formatLog("info", message, data)}`,
      this.getConsoleStyle("info"),
      data || ""
    );
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    this.storeLog("warn", message, data);

    console.warn(
      `%c${this.formatLog("warn", message, data)}`,
      this.getConsoleStyle("warn"),
      data || ""
    );
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any): void {
    const errorData = error instanceof Error ? error.message : String(error);
    this.storeLog("error", message, errorData);

    console.error(
      `%c${this.formatLog("error", message)}`,
      this.getConsoleStyle("error"),
      error || ""
    );
  }

  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs as CSV
   */
  exportLogsAsCSV(): string {
    const headers = ["Timestamp", "Level", "Message", "Data"];
    const rows = this.logs.map((log) => [
      log.timestamp,
      log.level.toUpperCase(),
      log.message,
      JSON.stringify(log.data || ""),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    return csv;
  }

  /**
   * Download logs as file
   */
  downloadLogs(format: "json" | "csv" = "json"): void {
    const content = format === "json" ? this.exportLogs() : this.exportLogsAsCSV();
    const mimeType = format === "json" ? "application/json" : "text/csv";
    const filename = `logs-${new Date().toISOString().split("T")[0]}.${format}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Print all logs to console
   */
  printAllLogs(): void {
    console.group("📋 All Logs");
    this.logs.forEach((log) => {
      const style = this.getConsoleStyle(log.level);
      console.log(`%c[${log.timestamp}] ${log.level.toUpperCase()} ${log.message}`, style, log.data || "");
    });
    console.groupEnd();
  }
}

// ── Create singleton instance ──────────────────────────────────────────────
export const logger = new BrowserLogger();

// ── Expose logger to window for debugging ──────────────────────────────────
if (import.meta.env.DEV) {
  (window as any).logger = logger;
  console.log("✅ Logger available as window.logger in development mode");
  console.log("📝 Commands: logger.getLogs(), logger.printAllLogs(), logger.downloadLogs()");
}

export default logger;
