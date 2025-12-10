// Permission model for DAC
export const PermissionSchema = {
  _id: String,
  fileId: { type: String, required: true },
  resourceOwner: { type: String, required: true },
  grantedTo: { type: String, required: true },
  permissions: { type: Array, default: ['read'] }, // read, write, delete, share
  grantedBy: { type: String, required: true },
  grantedAt: { type: Date, default: Date.now },
  revokedAt: Date,
  isActive: { type: Boolean, default: true },
};

export const PermissionTypes = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  SHARE: 'share',
};

export const createPermission = (data) => {
  return {
    _id: 'perm_' + Math.random().toString(36).substr(2, 9),
    fileId: data.fileId,
    resourceOwner: data.resourceOwner,
    grantedTo: data.grantedTo,
    permissions: data.permissions || ['read'],
    grantedBy: data.grantedBy,
    grantedAt: new Date(),
    revokedAt: null,
    isActive: true,
  };
};

export default PermissionSchema;

