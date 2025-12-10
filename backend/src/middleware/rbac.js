import { Role, SecurityLevel } from '../utils/constants.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Access control based on user roles and permissions
 */
export const checkRBAC = (user, resource) => {
  // Admins see all
  if (user.role === Role.ADMIN) {
    return { 
      allowed: true, 
      reason: 'RBAC: Admin role has full access.' 
    };
  }

  // Managers see everything except Confidential IT files (unless they are IT)
  if (user.role === Role.MANAGER) {
    if (resource.department === 'IT' && resource.classification === SecurityLevel.CONFIDENTIAL) {
      return { 
        allowed: false, 
        reason: 'RBAC: Manager cannot access Confidential IT resources.' 
      };
    }
    return { 
      allowed: true, 
      reason: 'RBAC: Manager role has access.' 
    };
  }

  // Staff only Public
  if (user.role === Role.STAFF) {
    if (resource.classification === SecurityLevel.PUBLIC) {
      return { 
        allowed: true, 
        reason: 'RBAC: Staff role has access to Public resources.' 
      };
    }
    return { 
      allowed: false, 
      reason: 'RBAC: Staff role restricted to Public resources only.' 
    };
  }

  // HR Role specific
  if (user.role === Role.HR) {
    if (resource.department === 'HR') {
      return { 
        allowed: true, 
        reason: 'RBAC: HR role has access to HR department resources.' 
      };
    }
    if (resource.classification === SecurityLevel.PUBLIC) {
      return { 
        allowed: true, 
        reason: 'RBAC: HR role has access to Public resources.' 
      };
    }
    return { 
      allowed: false, 
      reason: 'RBAC: HR role restricted to HR department and Public resources.' 
    };
  }

  // IT Role specific
  if (user.role === Role.IT) {
    if (resource.department === 'IT' || resource.classification === SecurityLevel.PUBLIC) {
      return { 
        allowed: true, 
        reason: 'RBAC: IT role has access to IT department and Public resources.' 
      };
    }
    return { 
      allowed: false, 
      reason: 'RBAC: IT role restricted to IT department and Public resources.' 
    };
  }

  return { 
    allowed: false, 
    reason: 'RBAC: No matching role permissions.' 
  };
};

export default checkRBAC;

