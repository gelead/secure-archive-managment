export const generateId = (prefix = '') => {
  return prefix + Math.random().toString(36).substr(2, 9);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString();
};

export const isWithinWorkingHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  return hour >= 9 && hour < 17 && day > 0 && day < 6;
};

export const getClientIp = (req) => {
  return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
};

export default {
  generateId,
  sanitizeInput,
  formatDate,
  isWithinWorkingHours,
  getClientIp,
};

