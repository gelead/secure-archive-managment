// Policy model for ABAC
export const PolicySchema = {
  _id: String,
  name: { type: String, required: true },
  description: String,
  conditions: { type: Array, required: true }, // Array of condition objects
  effect: { type: String, enum: ['ALLOW', 'DENY'], default: 'ALLOW' },
  priority: { type: Number, default: 0 }, // Higher priority = evaluated first
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

export const createPolicy = (data) => {
  return {
    _id: 'policy_' + Math.random().toString(36).substr(2, 9),
    name: data.name,
    description: data.description || '',
    conditions: data.conditions || [],
    effect: data.effect || 'ALLOW',
    priority: data.priority || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// Example policy conditions structure:
// {
//   attribute: 'user.role',
//   operator: 'equals',
//   value: 'ADMIN'
// }

export default PolicySchema;

