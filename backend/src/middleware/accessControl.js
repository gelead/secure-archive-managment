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
  switch (currentModel) {
    case AccessModel.MAC:
      return checkMAC(user, resource);
    
    case AccessModel.DAC:
      return checkDAC(user, resource);
    
    case AccessModel.RBAC:
      return checkRBAC(user, resource);
    
    case AccessModel.RuBAC:
      return checkRuBAC(user, resource, context.action || 'ACCESS', context);
    
    case AccessModel.ABAC:
      return checkABAC(user, resource, context.action || 'ACCESS', context);
    
    default:
      return { allowed: false, reason: 'Unknown access control model' };
  }
};

export default checkAccess;
