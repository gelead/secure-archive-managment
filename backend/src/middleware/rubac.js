import { Role } from '../utils/constants.js';

/**
 * Rule-Based Access Control (RuBAC) Middleware
 * Access control based on rules (time, location, device, business rules)
 */
export const checkRuBAC = (user, resource, action, context = {}) => {
  const rules = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Rule 1: Working hours restriction (9 AM - 5 PM, Monday-Friday)
  if (currentHour < 9 || currentHour >= 17 || currentDay === 0 || currentDay === 6) {
    if (user.role === Role.ADMIN) {
      rules.push({ passed: true, reason: 'RuBAC: Admin override for working hours' });
    } else if (context.preapproved) {
      rules.push({ passed: true, reason: 'RuBAC: Preapproved access outside working hours' });
    } else {
      rules.push({ passed: false, reason: 'RuBAC: Access denied outside working hours (09:00 - 17:00, Mon-Fri)' });
    }
  } else {
    rules.push({ passed: true, reason: 'RuBAC: Within working hours' });
  }

  // Rule 2: Location-based restriction
  if (context.location) {
    const allowedLocations = context.allowedLocations || ['office', 'remote-vpn'];
    if (!allowedLocations.includes(context.location)) {
      if (user.role !== Role.ADMIN) {
        rules.push({ passed: false, reason: `RuBAC: Access denied from location: ${context.location}` });
      } else {
        rules.push({ passed: true, reason: 'RuBAC: Admin override for location' });
      }
    } else {
      rules.push({ passed: true, reason: `RuBAC: Allowed location: ${context.location}` });
    }
  }

  // Rule 3: Device-based restriction
  if (context.device) {
    const allowedDevices = context.allowedDevices || ['company-laptop', 'company-mobile'];
    if (!allowedDevices.includes(context.device)) {
      if (user.role !== Role.ADMIN) {
        rules.push({ passed: false, reason: `RuBAC: Access denied from device: ${context.device}` });
      } else {
        rules.push({ passed: true, reason: 'RuBAC: Admin override for device' });
      }
    } else {
      rules.push({ passed: true, reason: `RuBAC: Allowed device: ${context.device}` });
    }
  }

  // Rule 4: Conditional business rules
  // Example: Only HR Managers can approve leave requests exceeding 10 days
  if (action === 'APPROVE_LEAVE' && context.leaveDays && context.leaveDays > 10) {
    // Check if user is HR Manager (HR role with manager privileges or department head)
    const isHRManager = (user.role === Role.HR && user.department === 'HR') || 
                        (user.role === Role.MANAGER && user.department === 'HR');
    if (isHRManager || user.role === Role.ADMIN) {
      rules.push({ passed: true, reason: 'RuBAC: HR Manager can approve leave > 10 days' });
    } else {
      rules.push({ passed: false, reason: 'RuBAC: Only HR Managers can approve leave requests exceeding 10 days' });
    }
  }

  // All rules must pass
  const failedRules = rules.filter(r => !r.passed);
  if (failedRules.length > 0) {
    return { allowed: false, reason: failedRules[0].reason, failedRules };
  }

  return { allowed: true, reason: 'RuBAC: All rules passed' };
};

export default checkRuBAC;

