import { Role } from '../utils/constants.js';

/**
 * Discretionary Access Control (DAC) Middleware
 * Owner-controlled access where resource owners grant/revoke permissions
 */
export const checkDAC = (user, resource) => {
  // Owner always has access
  if (resource.ownerId === user._id) {
    return { 
      allowed: true, 
      reason: 'DAC: User is the resource owner.' 
    };
  }

  // Check if explicitly shared
  const sharedWith = resource.sharedWith || [];
  if (sharedWith.includes(user._id)) {
    return { 
      allowed: true, 
      reason: 'DAC: Resource explicitly shared with user by owner.' 
    };
  }

  // Admins can access (optional - can be removed for stricter DAC)
  if (user.role === Role.ADMIN) {
    return { 
      allowed: true, 
      reason: 'DAC: Admin override (optional).' 
    };
  }

  return { 
    allowed: false, 
    reason: 'DAC: Resource not shared with user by resource owner.' 
  };
};

export default checkDAC;

