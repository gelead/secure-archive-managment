import { Role } from '../utils/constants.js';

/**
 * Rule-Based Access Control (RuBAC) Middleware
 * Access control based on rules (time, location, device, business rules)
 * Works like MAC, DAC, and RBAC with (user, resource) signature
 */
export const checkRuBAC = (user, resource) => {
  // RuBAC: Access determined by evaluating multiple rules
  // All rules must pass for access to be granted
  
  const rules = [];
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Extract context from resource if available, otherwise use defaults
  const resourceContext = resource.context || {};
  const location = resourceContext.location || resource.location || 'office';
  const device = resourceContext.device || resource.device || 'company-laptop';
  const action = resourceContext.action || resource.action || 'ACCESS';
  const preapproved = resourceContext.preapproved || resource.preapproved || false;
  const allowedLocations = resourceContext.allowedLocations || resource.allowedLocations || ['office', 'remote-vpn'];
  const allowedDevices = resourceContext.allowedDevices || resource.allowedDevices || ['company-laptop', 'company-mobile'];

  // Rule 1: Working hours restriction (9 AM - 5 PM, Monday-Friday)
  if (currentHour < 9 || currentHour >= 17 || currentDay === 0 || currentDay === 6) {
    if (user.role === Role.ADMIN) {
      rules.push({ passed: true, reason: 'RuBAC: Admin override for working hours' });
    } else if (preapproved) {
      rules.push({ passed: true, reason: 'RuBAC: Preapproved access outside working hours' });
    } else {
      rules.push({ passed: false, reason: 'RuBAC: Access denied outside working hours (09:00 - 17:00, Mon-Fri)' });
    }
  } else {
    rules.push({ passed: true, reason: 'RuBAC: Within working hours' });
  }

  // Rule 2: Location-based restriction
  if (location) {
    if (!allowedLocations.includes(location)) {
      if (user.role !== Role.ADMIN) {
        rules.push({ passed: false, reason: `RuBAC: Access denied from location: ${location}` });
      } else {
        rules.push({ passed: true, reason: 'RuBAC: Admin override for location' });
      }
    } else {
      rules.push({ passed: true, reason: `RuBAC: Allowed location: ${location}` });
    }
  }

  // Rule 3: Device-based restriction
  if (device) {
    if (!allowedDevices.includes(device)) {
      if (user.role !== Role.ADMIN) {
        rules.push({ passed: false, reason: `RuBAC: Access denied from device: ${device}` });
      } else {
        rules.push({ passed: true, reason: 'RuBAC: Admin override for device' });
      }
    } else {
      rules.push({ passed: true, reason: `RuBAC: Allowed device: ${device}` });
    }
  }

  // Rule 4: Resource-specific access rules (if resource has rules defined)
  if (resource.rubacRules && Array.isArray(resource.rubacRules)) {
    for (const rule of resource.rubacRules) {
      const ruleResult = evaluateRule(rule, user, resource);
      rules.push(ruleResult);
    }
  }

  // All rules must pass
  const failedRules = rules.filter(r => !r.passed);
  if (failedRules.length > 0) {
    return { allowed: false, reason: failedRules[0].reason, failedRules };
  }

  return { allowed: true, reason: 'RuBAC: All rules passed' };
};

/**
 * Helper function to evaluate a rule
 */
function evaluateRule(rule, user, resource) {
  // Simple rule evaluation - can be extended
  if (rule.type === 'role') {
    const hasRole = user.role === rule.value || (Array.isArray(rule.value) && rule.value.includes(user.role));
    return { 
      passed: hasRole, 
      reason: hasRole ? `RuBAC: User has required role ${rule.value}` : `RuBAC: User lacks required role ${rule.value}`
    };
  }
  if (rule.type === 'department') {
    const matchesDept = user.department === rule.value;
    return { 
      passed: matchesDept, 
      reason: matchesDept ? `RuBAC: User department matches ${rule.value}` : `RuBAC: User department does not match ${rule.value}`
    };
  }
  return { passed: true, reason: 'RuBAC: Rule evaluated' };
}

export default checkRuBAC;

