// Audit Log model
export const AuditLogSchema = {
  _id: String,
  timestamp: { type: Date, default: Date.now },
  userId: String,
  username: String,
  action: { type: String, required: true },
  details: String,
  status: { type: String, enum: ['SUCCESS', 'DENIED', 'ERROR', 'PENDING'], default: 'SUCCESS' },
  ip: String,
  userAgent: String,
  location: String,
  device: String,
  encryptedPayload: String,
  metadata: Object,
};

export const createAuditLog = (data) => {
  return {
    _id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    userId: data.userId || null,
    username: data.username || 'SYSTEM',
    action: data.action,
    details: data.details || '',
    status: data.status || 'SUCCESS',
    ip: data.ip || '127.0.0.1',
    userAgent: data.userAgent || '',
    location: data.location || null,
    device: data.device || null,
    encryptedPayload: data.encryptedPayload || null,
    metadata: data.metadata || {},
  };
};

export default AuditLogSchema;

