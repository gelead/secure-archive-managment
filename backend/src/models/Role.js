// Role model for RBAC
export const RoleSchema = {
  _id: String,
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: { type: Array, default: [] },
  hierarchy: { type: Number, default: 0 }, // Higher number = higher privilege
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

export const RoleHierarchy = {
  ADMIN: 5,
  MANAGER: 4,
  HR: 3,
  IT: 3,
  STAFF: 1,
};

export const DefaultRoles = {
  ADMIN: {
    name: 'ADMIN',
    description: 'System Administrator',
    permissions: ['*'], // All permissions
    hierarchy: RoleHierarchy.ADMIN,
  },
  MANAGER: {
    name: 'MANAGER',
    description: 'Department Manager',
    permissions: ['read', 'write', 'share'],
    hierarchy: RoleHierarchy.MANAGER,
  },
  HR: {
    name: 'HR',
    description: 'Human Resources',
    permissions: ['read', 'write'],
    hierarchy: RoleHierarchy.HR,
  },
  IT: {
    name: 'IT',
    description: 'Information Technology',
    permissions: ['read', 'write'],
    hierarchy: RoleHierarchy.IT,
  },
  STAFF: {
    name: 'STAFF',
    description: 'Regular Staff',
    permissions: ['read'],
    hierarchy: RoleHierarchy.STAFF,
  },
};

export default RoleSchema;

