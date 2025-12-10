// User model schema and validation
export const UserSchema = {
  _id: String,
  username: { type: String, required: true, unique: true },
  email: { type: String, sparse: true, unique: true },
  phone: { type: String, sparse: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ['ADMIN', 'MANAGER', 'STAFF', 'HR', 'IT'] },
  department: { type: String, default: 'All' },
  clearanceLevel: { type: Number, default: 1, min: 1, max: 3 },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  emailVerificationCode: String,
  phoneVerificationCode: String,
  mfaEnabled: { type: Boolean, default: false },
  biometricEnabled: { type: Boolean, default: false },
  pendingOtp: Object,
  refreshToken: String,
  failedAttempts: { type: Number, default: 0 },
  lockedUntil: Date,
  roleAuditTrail: { type: Array, default: [] },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    updatedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
};

export const createUser = (data) => {
  return {
    _id: data._id || 'u' + Math.random().toString(36).substr(2, 9),
    username: data.username,
    email: data.email || null,
    phone: data.phone || null,
    passwordHash: data.passwordHash,
    role: data.role || 'STAFF',
    department: data.department || 'All',
    clearanceLevel: data.clearanceLevel || 1,
    emailVerified: data.emailVerified || false,
    phoneVerified: data.phoneVerified || false,
    mfaEnabled: data.mfaEnabled || false,
    biometricEnabled: data.biometricEnabled || false,
    failedAttempts: 0,
    lockedUntil: null,
    refreshToken: null,
    pendingOtp: null,
    roleAuditTrail: [],
    profile: {
      firstName: '',
      lastName: '',
      bio: '',
      avatar: null,
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    ...data,
  };
};

export default UserSchema;

