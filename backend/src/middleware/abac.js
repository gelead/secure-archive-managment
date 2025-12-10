import { Role, SecurityLevel } from '../utils/constants.js';

/**
 * Attribute-Based Access Control (ABAC) Middleware
 * Policy Decision Point for fine-grained access control
 */
export class PolicyDecisionPoint {
  static evaluate(user, resource, action, context = {}) {
    const policies = [
      // Policy 1: Admin always allowed
      { 
        condition: () => user.role === Role.ADMIN, 
        allow: true, 
        reason: 'ABAC: Admin role attribute' 
      },
      
      // Policy 2: Department match with role requirements
      { 
        condition: () => user.department === resource.department,
        allow: () => {
          if (resource.classification === SecurityLevel.CONFIDENTIAL) {
            return ['MANAGER', 'HR', 'IT'].includes(user.role);
          }
          return true;
        },
        reason: 'ABAC: Department match with role requirements'
      },
      
      // Policy 3: Public resources accessible to all
      { 
        condition: () => resource.classification === SecurityLevel.PUBLIC,
        allow: true,
        reason: 'ABAC: Public resource attribute'
      },
      
      // Policy 4: Time-based access for Finance department
      {
        condition: () => resource.department === 'Finance' && user.department === 'Finance',
        allow: () => {
          const hour = new Date().getHours();
          if (resource.classification === SecurityLevel.CONFIDENTIAL) {
            return hour >= 9 && hour < 17; // Working hours only
          }
          return true;
        },
        reason: 'ABAC: Finance department time-based access'
      },
      
      // Policy 5: Payroll department can access salary data
      {
        condition: () => resource.name && resource.name.toLowerCase().includes('salary') && user.department === 'Payroll',
        allow: true,
        reason: 'ABAC: Payroll department salary access'
      },
      
      // Policy 6: IT department cannot access salary data
      {
        condition: () => resource.name && resource.name.toLowerCase().includes('salary') && user.department === 'IT',
        allow: false,
        reason: 'ABAC: IT department denied salary access'
      }
    ];

    for (const policy of policies) {
      if (policy.condition()) {
        const allowResult = typeof policy.allow === 'function' ? policy.allow() : policy.allow;
        return { allowed: allowResult, reason: policy.reason };
      }
    }

    return { allowed: false, reason: 'ABAC: No matching policy' };
  }
}

export const checkABAC = (user, resource, action, context = {}) => {
  return PolicyDecisionPoint.evaluate(user, resource, action, context);
};

export default checkABAC;

