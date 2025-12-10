import { SecurityLevel } from '../utils/constants.js';

/**
 * Mandatory Access Control (MAC) Middleware
 * System-enforced access control based on security labels and clearance levels
 */
export const checkMAC = (user, resource) => {
  // MAC: Access determined solely by system policy (clearance level)
  // Users cannot grant access; only system administrators can modify access policies
  
  const userClearance = user.clearanceLevel || 1;
  const resourceClassification = resource.classification || SecurityLevel.PUBLIC;

  if (userClearance >= resourceClassification) {
    return { 
      allowed: true, 
      reason: `MAC: User clearance level (${userClearance}) sufficient for resource classification (${resourceClassification}). System-enforced policy.` 
    };
  }

  return { 
    allowed: false, 
    reason: `MAC: User clearance level (${userClearance}) insufficient for resource classification (${resourceClassification}). System-enforced denial.` 
  };
};

export default checkMAC;

