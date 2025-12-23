import { Role, SecurityLevel } from '../utils/constants.js';

/**
 * Attribute-Based Access Control (ABAC) Middleware
 * Policy Decision Point for fine-grained access control
 * Works like MAC, DAC, and RBAC with (user, resource) signature
 */
export class PolicyDecisionPoint {
  static evaluate(user, resource) {
    // ABAC: Access determined by evaluating policies based on attributes of user, resource, and environment
    // First matching policy wins (policy order matters)
    
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
      },
      
      // Policy 7: Resource owner has access (similar to DAC but attribute-based)
      {
        condition: () => resource.ownerId && resource.ownerId === user._id,
        allow: true,
        reason: 'ABAC: User is resource owner attribute'
      },
      
      // Policy 8: Role-based access (similar to RBAC but attribute-based)
      {
        condition: () => user.role === Role.MANAGER,
        allow: () => {
          if (resource.department === 'IT' && resource.classification === SecurityLevel.CONFIDENTIAL) {
            return false;
          }
          return true;
        },
        reason: 'ABAC: Manager role attribute'
      },
      
      // Policy 9: Clearance level check (similar to MAC but attribute-based)
      {
        condition: () => resource.classification && user.clearanceLevel,
        allow: () => {
          const userClearance = user.clearanceLevel || 1;
          const resourceClassification = resource.classification || SecurityLevel.PUBLIC;
          return userClearance >= resourceClassification;
        },
        reason: 'ABAC: User clearance level attribute sufficient for resource classification'
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

export const checkABAC = (user, resource) => {
  return PolicyDecisionPoint.evaluate(user, resource);
};

export default checkABAC;

