import fs from "fs";
import path from "path";

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SECURITY = "SECURITY",
  AUDIT = "AUDIT",
}

export enum SecurityEvent {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  LOGOUT = "LOGOUT",
  REGISTER = "REGISTER",
  PASSWORD_CHANGE = "PASSWORD_CHANGE",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  FILE_UPLOAD = "FILE_UPLOAD",
  DATA_MODIFICATION = "DATA_MODIFICATION",
  API_KEY_USAGE = "API_KEY_USAGE",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  event?: SecurityEvent;
  message: string;
  userId?: number;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  data?: Record<string, unknown>;
  error?: unknown;
}

class SecurityLogger {
  private logsDir: string;
  private isDevelopment: boolean;

  constructor() {
    this.logsDir = path.join(process.cwd(), "logs");
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFileName(level: LogLevel): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.logsDir, `${level.toLowerCase()}-${date}.log`);
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry) + "\n";
  }

  private writeToFile(level: LogLevel, entry: LogEntry) {
    if (this.isDevelopment) return;

    try {
      const filename = this.getLogFileName(level);
      fs.appendFileSync(filename, this.formatLogEntry(entry));
    } catch (error) {
      console.error("Error escribiendo log:", error);
    }
  }

  private log(level: LogLevel, entry: Omit<LogEntry, "timestamp" | "level">) {
    const logEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
      level,
    };

    const consoleColor = {
      [LogLevel.INFO]: "\x1b[36m",
      [LogLevel.WARN]: "\x1b[33m",
      [LogLevel.ERROR]: "\x1b[31m",
      [LogLevel.SECURITY]: "\x1b[35m",
      [LogLevel.AUDIT]: "\x1b[32m",
    };

    const color = consoleColor[level];
    const reset = "\x1b[0m";
    const emoji = {
      [LogLevel.INFO]: "ℹ️",
      [LogLevel.WARN]: "⚠️",
      [LogLevel.ERROR]: "❌",
      [LogLevel.SECURITY]: "🔒",
      [LogLevel.AUDIT]: "📋",
    };

    console.log(
      `${color}${emoji[level]} [${level}]${reset} ${logEntry.message}`,
      logEntry.data || ""
    );

    this.writeToFile(level, logEntry);
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.INFO, { message, data });
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log(LogLevel.WARN, { message, data });
  }

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, { message, error, data });
  }

  security(
    event: SecurityEvent,
    message: string,
    context: {
      userId?: number;
      userEmail?: string;
      ip?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
      data?: Record<string, unknown>;
    }
  ) {
    this.log(LogLevel.SECURITY, {
      event,
      message,
      ...context,
    });
  }

  audit(
    event: SecurityEvent,
    message: string,
    context: {
      userId: number;
      userEmail: string;
      ip?: string;
      endpoint?: string;
      method?: string;
      data?: Record<string, unknown>;
    }
  ) {
    this.log(LogLevel.AUDIT, {
      event,
      message,
      ...context,
    });
  }

  loginSuccess(userId: number, email: string, ip: string, userAgent?: string) {
    this.security(SecurityEvent.LOGIN_SUCCESS, `Login exitoso: ${email}`, {
      userId,
      userEmail: email,
      ip,
      userAgent,
    });
  }

  loginFailure(email: string, ip: string, reason: string, userAgent?: string) {
    this.security(
      SecurityEvent.LOGIN_FAILURE,
      `Login fallido: ${email} - ${reason}`,
      {
        userEmail: email,
        ip,
        userAgent,
        data: { reason },
      }
    );
  }

  logout(userId: number, email: string, ip: string) {
    this.security(SecurityEvent.LOGOUT, `Logout: ${email}`, {
      userId,
      userEmail: email,
      ip,
    });
  }

  register(userId: number, email: string, ip: string) {
    this.security(SecurityEvent.REGISTER, `Nuevo registro: ${email}`, {
      userId,
      userEmail: email,
      ip,
    });
  }

  rateLimitExceeded(ip: string, endpoint: string, userAgent?: string) {
    this.security(
      SecurityEvent.RATE_LIMIT_EXCEEDED,
      `Rate limit excedido: ${endpoint}`,
      {
        ip,
        endpoint,
        userAgent,
      }
    );
  }

  suspiciousActivity(
    type: string,
    ip: string,
    endpoint: string,
    data?: Record<string, unknown>
  ) {
    this.security(
      SecurityEvent.SUSPICIOUS_ACTIVITY,
      `Actividad sospechosa: ${type}`,
      {
        ip,
        endpoint,
        data,
      }
    );
  }

  sqlInjectionAttempt(ip: string, input: string, endpoint: string) {
    this.security(
      SecurityEvent.SQL_INJECTION_ATTEMPT,
      `Intento de SQL Injection detectado`,
      {
        ip,
        endpoint,
        data: { input: input.substring(0, 100) },
      }
    );
  }

  xssAttempt(ip: string, input: string, endpoint: string) {
    this.security(SecurityEvent.XSS_ATTEMPT, `Intento de XSS detectado`, {
      ip,
      endpoint,
      data: { input: input.substring(0, 100) },
    });
  }

  unauthorizedAccess(
    endpoint: string,
    ip: string,
    userId?: number,
    userEmail?: string
  ) {
    this.security(
      SecurityEvent.UNAUTHORIZED_ACCESS,
      `Acceso no autorizado: ${endpoint}`,
      {
        userId,
        userEmail,
        ip,
        endpoint,
      }
    );
  }

  fileUpload(
    userId: number,
    email: string,
    filename: string,
    size: number,
    ip: string
  ) {
    this.audit(SecurityEvent.FILE_UPLOAD, `Archivo subido: ${filename}`, {
      userId,
      userEmail: email,
      ip,
      data: { filename, size },
    });
  }

  dataModification(
    userId: number,
    email: string,
    entity: string,
    action: string,
    entityId: number,
    ip: string
  ) {
    this.audit(
      SecurityEvent.DATA_MODIFICATION,
      `${action} en ${entity} #${entityId}`,
      {
        userId,
        userEmail: email,
        ip,
        data: { entity, action, entityId },
      }
    );
  }

  cleanupOldLogs(daysToKeep: number = 30) {
    try {
      const files = fs.readdirSync(this.logsDir);
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        const filePath = path.join(this.logsDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtime.getTime();

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Log antiguo eliminado: ${file}`);
        }
      });
    } catch (error) {
      console.error("Error limpiando logs antiguos:", error);
    }
  }
}

export const securityLogger = new SecurityLogger();

export default securityLogger;
