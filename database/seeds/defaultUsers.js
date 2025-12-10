import { hashPassword } from '../../backend/src/utils/auth.js';
import { Role } from '../../frontend/src/utils/constants.js';

export const defaultUsers = [
  {
    _id: 'admin',
    username: 'admin',
    email: 'admin@company.com',
    phone: '+1234567890',
    emailVerified: true,
    phoneVerified: true,
    passwordHash: hashPassword('Admin@123!'),
    role: Role.ADMIN,
    department: 'IT',
    clearanceLevel: 3,
    mfaEnabled: true,
    failedAttempts: 0,
    lockedUntil: null,
    profile: {
      firstName: 'System',
      lastName: 'Administrator',
      bio: 'System Administrator',
    },
  },
  {
    _id: 'manager1',
    username: 'alice_manager',
    email: 'alice@company.com',
    phone: '+1234567891',
    emailVerified: true,
    phoneVerified: true,
    passwordHash: hashPassword('Manager@123!'),
    role: Role.MANAGER,
    department: 'Finance',
    clearanceLevel: 2,
    mfaEnabled: true,
    failedAttempts: 0,
    lockedUntil: null,
    profile: {
      firstName: 'Alice',
      lastName: 'Manager',
      bio: 'Finance Manager',
    },
  },
  {
    _id: 'staff1',
    username: 'bob_staff',
    email: 'bob@company.com',
    phone: '+1234567892',
    emailVerified: true,
    phoneVerified: false,
    passwordHash: hashPassword('Staff@123!'),
    role: Role.STAFF,
    department: 'HR',
    clearanceLevel: 1,
    mfaEnabled: false,
    failedAttempts: 0,
    lockedUntil: null,
    profile: {
      firstName: 'Bob',
      lastName: 'Staff',
      bio: 'HR Staff Member',
    },
  },
];

export default defaultUsers;

