import { createLogEntry } from '../config/logger.js';
import fs from 'fs';
import path from 'path';

const ALERTS_FILE = path.join(process.cwd(), 'backend', 'logs', 'alerts.log');

export const AlertSeverity = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

export const AlertType = {
  BRUTE_FORCE: 'BRUTE_FORCE',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  MULTIPLE_FAILED_LOGINS: 'MULTIPLE_FAILED_LOGINS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  CONFIG_CHANGE: 'CONFIG_CHANGE',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  ANOMALY_DETECTED: 'ANOMALY_DETECTED',
};

class AlertingService {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      failedLoginAttempts: 5,
      suspiciousAccessAttempts: 10,
      anomalyThreshold: 0.8,
    };
  }

  createAlert(type, severity, message, details = {}, userId = null, username = null) {
    const alert = {
      _id: 'alert_' + Math.random().toString(36).substr(2, 9),
      type,
      severity,
      message,
      details,
      userId,
      username,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.alerts.unshift(alert);

    try {
      const alertLine = JSON.stringify(alert) + '\n';
      fs.appendFileSync(ALERTS_FILE, alertLine);
    } catch (e) {
      // Best effort
    }

    // Note: createLogEntry is async but we don't await it here to avoid blocking alert creation
    createLogEntry(
      userId || 'SYSTEM',
      username || 'SYSTEM',
      'ALERT',
      `${severity}: ${message}`,
      severity,
      details.ip || '127.0.0.1'
    ).catch(() => {}); // Silently handle errors

    return alert;
  }

  detectBruteForce(logs, timeWindowMinutes = 15) {
    const now = Date.now();
    const windowStart = now - timeWindowMinutes * 60 * 1000;

    const attempts = {};
    logs
      .filter(log => 
        log.action === 'LOGIN_FAILED' && 
        new Date(log.timestamp).getTime() >= windowStart
      )
      .forEach(log => {
        const key = `${log.ip || 'unknown'}_${log.username}`;
        if (!attempts[key]) {
          attempts[key] = { count: 0, ip: log.ip, username: log.username, userId: log.userId };
        }
        attempts[key].count++;
      });

    Object.values(attempts).forEach(attempt => {
      if (attempt.count >= this.thresholds.failedLoginAttempts) {
        this.createAlert(
          AlertType.BRUTE_FORCE,
          AlertSeverity.CRITICAL,
          `Brute force attack detected: ${attempt.count} failed login attempts from ${attempt.ip}`,
          {
            ip: attempt.ip,
            username: attempt.username,
            attemptCount: attempt.count,
            timeWindow: timeWindowMinutes,
          },
          attempt.userId,
          attempt.username
        );
      }
    });
  }

  detectSuspiciousAccess(logs, timeWindowMinutes = 30) {
    const now = Date.now();
    const windowStart = now - timeWindowMinutes * 60 * 1000;

    const accessAttempts = {};
    logs
      .filter(log => 
        log.action === 'FILE_ACCESS' && 
        log.status === 'DENIED' &&
        new Date(log.timestamp).getTime() >= windowStart
      )
      .forEach(log => {
        const key = log.userId || log.username;
        if (!accessAttempts[key]) {
          accessAttempts[key] = { count: 0, userId: log.userId, username: log.username };
        }
        accessAttempts[key].count++;
      });

    Object.values(accessAttempts).forEach(attempt => {
      if (attempt.count >= this.thresholds.suspiciousAccessAttempts) {
        this.createAlert(
          AlertType.SUSPICIOUS_ACTIVITY,
          AlertSeverity.HIGH,
          `Suspicious access pattern: ${attempt.count} denied access attempts`,
          {
            userId: attempt.userId,
            username: attempt.username,
            attemptCount: attempt.count,
            timeWindow: timeWindowMinutes,
          },
          attempt.userId,
          attempt.username
        );
      }
    });
  }

  detectAnomalies(logs) {
    const recentLogs = logs.slice(0, 100);
    
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 6 || currentHour > 22) {
      const afterHoursAccess = recentLogs.filter(log => {
        const logHour = new Date(log.timestamp).getHours();
        return logHour < 6 || logHour > 22;
      });
      
      if (afterHoursAccess.length > 5) {
        this.createAlert(
          AlertType.ANOMALY_DETECTED,
          AlertSeverity.MEDIUM,
          'Unusual after-hours access pattern detected',
          { afterHoursCount: afterHoursAccess.length }
        );
      }
    }

    const roleChanges = recentLogs.filter(log => 
      log.action === 'ROLE_ASSIGN' || log.action === 'ROLE_REQUEST_APPROVE'
    );
    if (roleChanges.length > 3) {
      this.createAlert(
        AlertType.ANOMALY_DETECTED,
        AlertSeverity.HIGH,
        'Unusual number of role changes detected',
        { roleChangeCount: roleChanges.length }
      );
    }
  }

  alertAccountLocked(userId, username, reason) {
    this.createAlert(
      AlertType.ACCOUNT_LOCKED,
      AlertSeverity.HIGH,
      `Account locked: ${username}`,
      { reason },
      userId,
      username
    );
  }

  alertConfigChange(userId, username, changeType, details) {
    this.createAlert(
      AlertType.CONFIG_CHANGE,
      AlertSeverity.MEDIUM,
      `Configuration change: ${changeType}`,
      details,
      userId,
      username
    );
  }

  getAlerts(limit = 50) {
    return this.alerts.slice(0, limit);
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a._id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
    }
    return alert;
  }

  runPeriodicChecks(logs) {
    this.detectBruteForce(logs);
    this.detectSuspiciousAccess(logs);
    this.detectAnomalies(logs);
  }
}

export const alertingService = new AlertingService();
export default alertingService;

