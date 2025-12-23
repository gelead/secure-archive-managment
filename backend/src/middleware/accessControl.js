import { AccessModel } from '../utils/constants.js';
import checkMAC from './mac.js';
import checkDAC from './dac.js';
import checkRBAC from './rbac.js';
import checkRuBAC from './rubac.js';
import { checkABAC } from './abac.js';

/**
 * Main Access Control Middleware
 * Routes to appropriate access control model based on current system setting
 */
export const checkAccess = (user, resource, currentModel, context = {}) => {
  // Merge context into resource for RuBAC and ABAC to extract if needed
  // This maintains backward compatibility while allowing all models to work consistently
  const resourceWithContext = context && Object.keys(context).length > 0 
    ? { ...resource, context, ...context } 
    : resource;

  switch (currentModel) {
    case AccessModel.MAC:
      return checkMAC(user, resource);
    
    case AccessModel.DAC:
      return checkDAC(user, resource);
    
    case AccessModel.RBAC:
      return checkRBAC(user, resource);
    
    case AccessModel.RuBAC:
      return checkRuBAC(user, resourceWithContext);
    
    case AccessModel.ABAC:
      return checkABAC(user, resourceWithContext);
    
    default:
      return { allowed: false, reason: 'Unknown access control model' };
  }
};

export default checkAccess;
