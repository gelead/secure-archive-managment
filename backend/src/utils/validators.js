import { passwordPolicyCheck } from './auth.js';

export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

export const validateEmail = (email) => {
  if (!email) return { valid: true }; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  return { valid: true };
};

export const validatePhone = (phone) => {
  if (!phone) return { valid: true }; // Phone is optional
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }
  return { valid: true };
};

export const validatePassword = (password) => {
  return passwordPolicyCheck(password);
};

export const validateRole = (role) => {
  const validRoles = ['ADMIN', 'MANAGER', 'STAFF', 'HR', 'IT'];
  if (!validRoles.includes(role)) {
    return { valid: false, error: 'Invalid role' };
  }
  return { valid: true };
};

export default {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateRole,
};

