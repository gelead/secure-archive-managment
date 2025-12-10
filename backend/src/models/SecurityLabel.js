// Security Label model for MAC
export const SecurityLabelSchema = {
  _id: String,
  name: { type: String, required: true },
  level: { type: Number, required: true, min: 1, max: 3 },
  description: String,
  createdAt: { type: Date, default: Date.now },
};

export const SecurityLevels = {
  PUBLIC: { name: 'Public', level: 1, description: 'Publicly accessible information' },
  INTERNAL: { name: 'Internal', level: 2, description: 'Internal use only' },
  CONFIDENTIAL: { name: 'Confidential', level: 3, description: 'Highly sensitive information' },
};

export const getSecurityLevel = (level) => {
  return Object.values(SecurityLevels).find(sl => sl.level === level) || SecurityLevels.PUBLIC;
};

export default SecurityLabelSchema;

