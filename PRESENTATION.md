# Secure Archive Management System
## Comprehensive Presentation Documentation

---

## Slide 1: Project Overview

### Title
**Secure Archive Management System**

### What is it?
An enterprise-grade secure archive management system designed for organizations requiring fine-grained access control, comprehensive security auditing, and data protection. The system implements five different access control models that can be dynamically switched to meet various security requirements.

### Key Statistics
- **5 Access Control Models**: MAC, DAC, RBAC, RuBAC, ABAC
- **10 Frontend Pages**: Complete user interface
- **8 Backend Route Modules**: RESTful API endpoints
- **7 Middleware Components**: Access control and authentication
- **Full Encryption**: AES-256-CBC encrypted audit trails
- **Automated Backups**: Hourly backup system

### Primary Use Cases
- Document and file archive management
- Sensitive data access control
- Compliance and audit requirements
- Multi-tenant secure storage
- Enterprise-level security enforcement

---

## Slide 2: Architecture & Technology Stack

### Backend Stack
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB (local: mongodb://127.0.0.1:27017/secure_archive)
- **Authentication**: JWT tokens with refresh tokens
- **Password Security**: bcryptjs for password hashing (10 rounds)
- **Email Services**: nodemailer for MFA OTP delivery
- **MFA/TOTP**: speakeasy for time-based OTP generation
- **Encryption**: crypto module for AES-256-CBC log encryption

### Frontend Stack
- **Framework**: React 19 with functional components and hooks
- **Routing**: React Router v6 for navigation
- **Build Tool**: Vite for fast development and building
- **Icons**: Lucide React icon library
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS (via global.css)

### Infrastructure
- **Database**: Local MongoDB instance
- **Environment**: Environment-based configuration (.env)
- **Architecture**: RESTful API with JWT authentication

---

## Slide 3: Project Structure

### Backend Structure
```
backend/src/
├── config/          # Configuration files
│   ├── database.js   # MongoDB connection & utilities
│   ├── logger.js     # Logging with AES-256-CBC encryption
│   └── security.js   # Security policies & settings
├── controllers/      # Business logic
│   ├── authController.js    # Authentication & user management
│   └── policyController.js  # Access control model management
├── middleware/       # Express middleware
│   ├── accessControl.js  # Main access control router
│   ├── auth.js          # JWT authentication middleware
│   ├── mac.js           # Mandatory Access Control
│   ├── dac.js           # Discretionary Access Control
│   ├── rbac.js          # Role-Based Access Control
│   ├── rubac.js         # Rule-Based Access Control
│   └── abac.js          # Attribute-Based Access Control
├── models/          # MongoDB schemas
│   ├── User.js
│   ├── Role.js
│   ├── Permission.js
│   ├── SecurityLabel.js
│   ├── Policy.js
│   └── AuditLog.js
├── routes/          # API endpoints
│   ├── auth.js      # Authentication routes
│   ├── users.js     # User management
│   ├── files.js     # File operations
│   ├── roles.js     # Role requests
│   ├── policies.js  # Admin & policies
│   ├── security.js  # Security labels & clearance
│   └── audit.js     # Audit logs & alerts
├── services/        # Business services
│   ├── backup.js    # Automated backup system
│   ├── emailService.js
│   ├── encryption.js
│   ├── mfa.js
│   └── alert.js     # Security alerting
└── utils/           # Helper functions
    ├── auth.js
    ├── captcha.js
    ├── constants.js
    ├── helpers.js
    └── validators.js
```

### Frontend Structure
```
frontend/src/
├── pages/           # Page components
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Files.jsx
│   ├── Users.jsx
│   ├── Admin.jsx
│   ├── Profile.jsx
│   ├── AuditLogs.jsx
│   ├── Alerts.jsx
│   ├── Backups.jsx
│   ├── RoleRequests.jsx
│   └── SecurityManagement.jsx
├── components/      # Reusable components
│   ├── Layout.jsx
│   ├── CaptchaQuiz.jsx
│   └── common/
├── contexts/        # React context
│   └── AuthContext.jsx
├── services/        # API client
│   └── api.js
└── utils/
    └── constants.js
```

---

## Slide 4: Access Control Models - Overview

### Dynamic Access Control Switching
The system implements **5 different access control models** that can be dynamically switched by administrators. Only one model is active at a time, and it applies to all access control decisions system-wide.

### Models Implemented
1. **MAC** - Mandatory Access Control
2. **DAC** - Discretionary Access Control
3. **RBAC** - Role-Based Access Control
4. **RuBAC** - Rule-Based Access Control
5. **ABAC** - Attribute-Based Access Control

### How It Works
- All models implemented as middleware functions
- Central router (`accessControl.js`) selects active model
- Admin can switch models via UI (Admin page)
- Model changes are logged and audited
- Each model uses consistent `(user, resource)` signature

### Switching Models
- **Via UI**: Admin page → Select model button
- **Via API**: `POST /api/admin/model` with `{ "model": "MAC" }`
- **Current Model**: `GET /api/admin/model`

---

## Slide 5: MAC - Mandatory Access Control

### Concept
**Mandatory Access Control** is a system-enforced security model where access decisions are made by the system based on security labels and clearance levels. Users cannot override these decisions - only system administrators can modify access policies.

### How It Works
- **Security Labels**: Resources are classified as Public (1), Internal (2), or Confidential (3)
- **Clearance Levels**: Users are assigned clearance levels 1-3
- **Access Rule**: `userClearance >= resourceClassification`
- **Enforcement**: System automatically enforces policies - no user discretion allowed

### Implementation Details

#### Security Levels
```javascript
PUBLIC = 1      // Accessible to all users
INTERNAL = 2    // Requires clearance level 2+
CONFIDENTIAL = 3 // Requires clearance level 3 (highest)
```

#### Access Decision Logic
```javascript
if (userClearance >= resourceClassification) {
  return { allowed: true, reason: 'Clearance sufficient' };
} else {
  return { allowed: false, reason: 'Insufficient clearance' };
}
```

### Features
- ✅ Admin-only security label management
- ✅ Clearance level assignment to users
- ✅ System-enforced access policies
- ✅ Frontend: Security Management page for clearance levels and labels

### Use Cases
- Government/military document classification
- Healthcare data (HIPAA compliance)
- Financial records requiring strict access control
- Legal documents with confidentiality requirements

### Code Reference
- `backend/src/middleware/mac.js` - MAC logic
- `backend/src/routes/security.js` - Security label management endpoints
- `frontend/src/pages/SecurityManagement.jsx` - MAC UI

---

## Slide 6: DAC - Discretionary Access Control

### Concept
**Discretionary Access Control** is an owner-controlled model where resource owners grant or revoke permissions to other users. The owner has complete discretion over who can access their resources.

### How It Works
- **Ownership**: Every resource has an owner (creator)
- **Owner Access**: Owner always has full access
- **Sharing**: Owner can explicitly share with other users
- **Permissions**: Granular permissions (read, write, delete)
- **Revocation**: Owner can revoke access at any time

### Implementation Details

#### Access Decision Logic
```javascript
// 1. Owner always has access
if (resource.ownerId === user._id) {
  return { allowed: true, reason: 'User is owner' };
}

// 2. Check explicit sharing
if (resource.sharedWith.includes(user._id)) {
  return { allowed: true, reason: 'Explicitly shared by owner' };
}

// 3. Optional: Admin override
if (user.role === Role.ADMIN) {
  return { allowed: true, reason: 'Admin override' };
}

// 4. Default: Deny
return { allowed: false, reason: 'Not shared by owner' };
```

### Features
- ✅ File/record ownership system
- ✅ Owner-controlled permission granting/revoking
- ✅ File-level permissions (read, write, delete)
- ✅ Permission audit logs
- ✅ Frontend: File sharing UI with permission selection

### Permission Types
- **Read**: View file contents
- **Write**: Modify file contents
- **Delete**: Remove file

### Use Cases
- Collaborative document editing
- Personal file sharing
- Project-based access management
- User-controlled data sharing

### Code Reference
- `backend/src/middleware/dac.js` - DAC logic
- `backend/src/routes/files.js` - File sharing endpoints
- `frontend/src/pages/Files.jsx` - File sharing UI

---

## Slide 7: RBAC - Role-Based Access Control

### Concept
**Role-Based Access Control** assigns permissions to roles rather than individual users. Users are assigned roles, and roles determine what resources they can access.

### How It Works
- **Roles**: Predefined roles (ADMIN, MANAGER, STAFF, HR, IT)
- **Role Assignment**: Users are assigned to roles
- **Role Permissions**: Each role has defined permissions
- **Dynamic Assignment**: Role changes require approval workflow

### Roles and Permissions

#### ADMIN
- **Access**: Full access to all resources
- **Responsibilities**: System administration, user management

#### MANAGER
- **Access**: Access to most resources
- **Restriction**: Cannot access Confidential IT files (unless IT department)
- **Responsibilities**: Team oversight, resource approval

#### STAFF
- **Access**: Only Public resources
- **Restriction**: No access to Internal or Confidential resources
- **Responsibilities**: General document access

#### HR
- **Access**: HR department resources + Public resources
- **Restriction**: Cannot access other department resources
- **Responsibilities**: Human resources document management

#### IT
- **Access**: IT department resources + Public resources
- **Restriction**: Cannot access other department Confidential resources
- **Responsibilities**: IT documentation and systems

### Implementation Details

#### Access Decision Logic
```javascript
// Admin always has access
if (user.role === Role.ADMIN) return { allowed: true };

// Manager: Access most resources, except Confidential IT
if (user.role === Role.MANAGER) {
  if (resource.department === 'IT' && resource.classification === CONFIDENTIAL) {
    return { allowed: false };
  }
  return { allowed: true };
}

// Staff: Only Public resources
if (user.role === Role.STAFF) {
  return resource.classification === PUBLIC;
}

// HR: HR department + Public
if (user.role === Role.HR) {
  return resource.department === 'HR' || resource.classification === PUBLIC;
}

// IT: IT department + Public
if (user.role === Role.IT) {
  return resource.department === 'IT' || resource.classification === PUBLIC;
}
```

### Features
- ✅ Role-based permissions (5 predefined roles)
- ✅ Dynamic role assignment mechanism
- ✅ Role change requests and approvals workflow
- ✅ Role audit trail
- ✅ Frontend: Role Requests page for requesting and managing role changes

### Role Change Workflow
1. User requests role change
2. Request submitted to system
3. Admin reviews request
4. Admin approves or rejects
5. If approved, role is updated
6. All changes are audited

### Use Cases
- Organizational hierarchy-based access
- Department-specific access control
- Team-based permissions
- Compliance with organizational policies

### Code Reference
- `backend/src/middleware/rbac.js` - RBAC logic
- `backend/src/routes/roles.js` - Role request endpoints
- `frontend/src/pages/RoleRequests.jsx` - Role request UI

---

## Slide 8: RuBAC - Rule-Based Access Control

### Concept
**Rule-Based Access Control** evaluates multiple rules that must ALL pass for access to be granted. Rules can be based on time, location, device, or custom business logic.

### How It Works
- **Multiple Rules**: Several rules are evaluated
- **All Must Pass**: Access is granted only if ALL rules pass
- **Rule Types**: Time, location, device, business rules
- **Admin Override**: Admins can bypass rules

### Rule Types Implemented

#### Rule 1: Time-Based Access
- **Restriction**: Working hours only (9 AM - 5 PM, Monday-Friday)
- **Enforcement**: Access denied outside working hours
- **Exception**: Admins can access anytime, or with preapproval

#### Rule 2: Location-Based Restriction
- **Allowed Locations**: office, remote-vpn
- **Blocked Locations**: Any other location
- **Enforcement**: Access denied from unauthorized locations
- **Exception**: Admin override

#### Rule 3: Device-Based Restriction
- **Allowed Devices**: company-laptop, company-mobile
- **Blocked Devices**: Any other device
- **Enforcement**: Access denied from unauthorized devices
- **Exception**: Admin override

#### Rule 4: Resource-Specific Rules
- **Custom Rules**: Resources can define custom rules
- **Rule Types**: Role-based, department-based
- **Flexibility**: Extensible rule system

### Implementation Details

#### Access Decision Logic
```javascript
const rules = [];

// Rule 1: Working hours check
if (outsideWorkingHours) {
  if (isAdmin || preapproved) {
    rules.push({ passed: true });
  } else {
    rules.push({ passed: false, reason: 'Outside working hours' });
  }
} else {
  rules.push({ passed: true });
}

// Rule 2: Location check
if (!allowedLocations.includes(location)) {
  if (isAdmin) {
    rules.push({ passed: true });
  } else {
    rules.push({ passed: false, reason: 'Unauthorized location' });
  }
} else {
  rules.push({ passed: true });
}

// Rule 3: Device check
if (!allowedDevices.includes(device)) {
  if (isAdmin) {
    rules.push({ passed: true });
  } else {
    rules.push({ passed: false, reason: 'Unauthorized device' });
  }
} else {
  rules.push({ passed: true });
}

// All rules must pass
const failedRules = rules.filter(r => !r.passed);
if (failedRules.length > 0) {
  return { allowed: false, reason: failedRules[0].reason };
}

return { allowed: true, reason: 'All rules passed' };
```

### Features
- ✅ Time-based access rules (9 AM - 5 PM, Mon-Fri)
- ✅ Location-based restrictions
- ✅ Device-based restrictions
- ✅ Custom resource-specific rules
- ✅ Admin override capability

### Use Cases
- Compliance with work-hour policies
- Remote access security
- Device management policies
- Temporary access restrictions
- Regulatory compliance (access logging)

### Code Reference
- `backend/src/middleware/rubac.js` - RuBAC logic
- `backend/src/routes/files.js` - File access with context

---

## Slide 9: ABAC - Attribute-Based Access Control

### Concept
**Attribute-Based Access Control** makes access decisions based on attributes of the user, resource, and environment. It's the most flexible model, allowing fine-grained policy definitions.

### How It Works
- **Policy Decision Point (PDP)**: Evaluates policies
- **Policies**: Ordered list of policy rules
- **First Match Wins**: First matching policy determines access
- **Attributes**: User attributes (role, department, clearance), resource attributes (classification, department, owner), environment attributes (time, location)

### Policies Implemented

#### Policy 1: Admin Override
- **Condition**: User role is ADMIN
- **Decision**: Always allow
- **Priority**: Highest (checked first)

#### Policy 2: Department Match with Role
- **Condition**: User department matches resource department
- **Decision**: Allow if user has appropriate role for confidential resources
- **Logic**: Confidential resources require MANAGER, HR, or IT role

#### Policy 3: Public Resources
- **Condition**: Resource classification is PUBLIC
- **Decision**: Allow all users
- **Purpose**: Public documents accessible to everyone

#### Policy 4: Finance Time-Based Access
- **Condition**: Finance department resource and user
- **Decision**: Confidential resources only accessible during working hours (9 AM - 5 PM)
- **Purpose**: Time-restricted sensitive financial data

#### Policy 5: Payroll Salary Access
- **Condition**: Resource name contains "salary" AND user department is Payroll
- **Decision**: Allow access
- **Purpose**: Payroll department exclusive access to salary data

#### Policy 6: IT Salary Denial
- **Condition**: Resource name contains "salary" AND user department is IT
- **Decision**: Deny access
- **Purpose**: Prevent IT from accessing salary information

#### Policy 7: Resource Owner
- **Condition**: User is resource owner
- **Decision**: Allow access
- **Purpose**: Owners always have access (DAC-like behavior)

#### Policy 8: Manager Role Access
- **Condition**: User role is MANAGER
- **Decision**: Allow, except Confidential IT resources
- **Purpose**: Manager-level access with restrictions

#### Policy 9: Clearance Level Check
- **Condition**: Resource has classification AND user has clearance level
- **Decision**: Allow if clearance >= classification
- **Purpose**: MAC-like behavior within ABAC

### Implementation Details

#### Policy Decision Point
```javascript
class PolicyDecisionPoint {
  static evaluate(user, resource) {
    const policies = [
      { condition: () => user.role === ADMIN, allow: true },
      { condition: () => user.department === resource.department, 
        allow: () => checkRoleForConfidential(user, resource) },
      { condition: () => resource.classification === PUBLIC, allow: true },
      // ... more policies
    ];

    for (const policy of policies) {
      if (policy.condition()) {
        const result = typeof policy.allow === 'function' 
          ? policy.allow() 
          : policy.allow;
        return { allowed: result, reason: policy.reason };
      }
    }

    return { allowed: false, reason: 'No matching policy' };
  }
}
```

### Features
- ✅ Fine-grained attribute evaluation
- ✅ Policy Decision Point (PDP) implementation
- ✅ Real-time policy enforcement
- ✅ Multiple attribute combinations
- ✅ Extensible policy system

### Use Cases
- Complex organizational access requirements
- Multi-attribute access decisions
- Regulatory compliance with multiple factors
- Dynamic access control requirements
- Fine-grained data protection

### Code Reference
- `backend/src/middleware/abac.js` - ABAC PDP implementation
- `backend/src/routes/files.js` - File access with ABAC

---

## Slide 10: Authentication & Security

### Multi-Factor Authentication (MFA)

#### MFA Types Supported
1. **Email OTP**: One-time password sent via email
2. **TOTP**: Time-based one-time password (TOTP authenticator apps)
3. **SMS OTP**: One-time password sent via SMS
4. **Biometric**: Biometric authentication support

#### MFA Workflow
1. User enters username and password
2. System validates credentials
3. If valid, MFA challenge is sent
4. User enters MFA code
5. System verifies MFA code
6. Access granted with JWT tokens

### Password Policies

#### Requirements
- **Minimum Length**: 8 characters (configurable)
- **Complexity**: Must contain uppercase, lowercase, number, special character
- **Hashing**: bcryptjs with 10 salt rounds
- **Storage**: Only hashed passwords stored (never plaintext)

#### Security Features
- Password strength validation
- Password change mechanism
- Account lockout after failed attempts (brute-force protection)
- Secure password transmission (HTTPS recommended)

### Token-Based Authentication

#### JWT Tokens
- **Access Token**: Short-lived (15 minutes default)
- **Refresh Token**: Long-lived (7 days default)
- **Token Storage**: HTTP-only cookies or localStorage
- **Token Rotation**: Refresh tokens can be rotated

#### Session Management
- Active session tracking
- Multiple sessions per user
- Session revocation capability
- Session timeout handling

### Account Security

#### Account Lockout
- **Max Attempts**: 5 failed login attempts
- **Lockout Duration**: 30 minutes
- **Automatic Unlock**: After lockout period
- **Alert Generation**: Alerts on lockout events

#### CAPTCHA Protection
- **Registration**: CAPTCHA quiz required
- **Purpose**: Bot protection
- **Implementation**: Custom quiz-based CAPTCHA

---

## Slide 11: User Registration & Profile Management

### Registration Process

#### Steps
1. **CAPTCHA**: Complete CAPTCHA quiz
2. **User Info**: Enter username, email, phone, password
3. **Validation**: Server-side validation
4. **Email Verification**: OTP sent to email
5. **Phone Verification**: OTP sent to phone
6. **Account Creation**: Account created after verification

#### Validation Rules
- Username: Unique, alphanumeric, 3-20 characters
- Email: Valid email format, unique
- Phone: Valid phone format, unique
- Password: Meets complexity requirements

### Profile Management

#### User Profile
- View profile information
- Update email and phone (requires re-verification)
- Change password
- Enable/disable MFA
- View active sessions

#### Verification
- Email verification required for account activation
- Phone verification optional but recommended
- Re-verification required when contact info changes

---

## Slide 12: Audit Trails & Logging

### Logging System

#### Log Types
1. **User Activity Logs**: All user actions
2. **Authentication Logs**: Login, logout, MFA
3. **Access Control Logs**: File access attempts
4. **System Event Logs**: Startup, shutdown, config changes
5. **Security Event Logs**: Failed access, lockouts, alerts

#### Log Information Captured
- **User ID**: Who performed the action
- **Username**: Username for identification
- **Action Type**: What action was performed
- **Description**: Detailed description
- **Status**: SUCCESS, DENIED, PENDING, ERROR
- **IP Address**: Source IP address
- **Timestamp**: When action occurred
- **Metadata**: Additional context

### Encryption

#### Log Encryption
- **Algorithm**: AES-256-CBC
- **Key Management**: Environment-based encryption key
- **Storage**: Encrypted logs stored in MongoDB
- **Retrieval**: Automatic decryption on retrieval

#### Encryption Process
```javascript
// Encryption
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update(logData, 'utf8', 'hex');
encrypted += cipher.final('hex');

// Decryption
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

### Audit Features
- ✅ Comprehensive activity logging
- ✅ Encrypted log storage
- ✅ Centralized log aggregation
- ✅ Log search and filtering
- ✅ Export capabilities
- ✅ Retention policies

### Compliance
- **Retention**: Configurable log retention
- **Integrity**: Encrypted storage prevents tampering
- **Completeness**: All security-relevant events logged
- **Access Control**: Only admins can view audit logs

---

## Slide 13: Security Alerts

### Alert System

#### Alert Types
1. **Brute-Force Detection**: Multiple failed login attempts
2. **Suspicious Access**: Unusual access patterns
3. **Account Lockout**: Account locked due to failed attempts
4. **Configuration Changes**: Access model or security policy changes
5. **Failed Access Attempts**: Repeated denied access to resources

#### Alert Generation
- **Automated**: System automatically generates alerts
- **Real-time**: Alerts generated immediately
- **Threshold-based**: Alerts triggered by thresholds
- **Pattern-based**: Alerts based on behavior patterns

### Alert Management

#### Alert Features
- View all alerts
- Filter by type, severity, date
- Acknowledge alerts
- Alert history
- Alert notifications

#### Alert Workflow
1. Event occurs
2. System evaluates alert rules
3. Alert generated if conditions met
4. Alert stored in database
5. Admin notified (UI display)
6. Admin acknowledges alert
7. Alert marked as acknowledged

---

## Slide 14: Data Backups

### Backup System

#### Automated Backups
- **Frequency**: Hourly automated backups
- **Components**: Database, logs, configuration
- **Storage**: Local backup directory
- **Retention**: Multiple backup snapshots
- **Format**: JSON files with timestamps

#### Manual Backups
- **Trigger**: Admin can trigger on-demand backups
- **API Endpoint**: `POST /api/admin/backup`
- **UI**: Admin page backup button
- **Immediate**: Backup created immediately

### Backup Contents

#### Database Backup
- User data
- File metadata
- Role assignments
- Security labels
- Settings
- Audit logs

#### Log Backup
- Centralized logs
- Alert logs
- Access logs
- System logs

#### Manifest
- Backup timestamp
- Backup size
- Component versions
- Backup metadata

### Backup Management

#### Features
- View backup history
- Download backups
- Backup restoration
- Backup deletion
- Backup verification

#### Backup Storage
```
backend/backups/
└── snapshot-YYYY-MM-DDTHH-mm-ss-sssZ/
    ├── database/
    │   └── backup.json
    ├── logs/
    │   ├── alerts.log
    │   └── centralized.log
    └── manifest.json
```

---

## Slide 15: File Management

### File Operations

#### File Access
- **List Files**: View all files (based on access control)
- **View File**: Access file contents (access control enforced)
- **Share File**: Share with other users (DAC model)
- **Unshare File**: Revoke access (DAC model)

#### File Properties
- **File Name**: Document name
- **Owner**: File creator/owner
- **Department**: Department classification
- **Classification**: Security level (Public, Internal, Confidential)
- **Created Date**: When file was created
- **Shared With**: List of users with access
- **Permissions**: Read, write, delete permissions

### File Sharing (DAC)

#### Sharing Process
1. File owner selects file
2. Owner selects user to share with
3. Owner selects permissions (read, write, delete)
4. Sharing request submitted
5. Access granted
6. Permission log created

#### Permission Types
- **Read**: View file contents
- **Write**: Modify file contents
- **Delete**: Remove file

---

## Slide 16: Role Management

### Role System

#### Available Roles
1. **ADMIN**: Full system access
2. **MANAGER**: Management-level access
3. **STAFF**: Standard employee access
4. **HR**: Human resources access
5. **IT**: IT department access

### Role Change Workflow

#### Request Process
1. User requests role change
2. Request submitted with justification
3. Request stored in database
4. Admin notified
5. Admin reviews request
6. Admin approves or rejects
7. If approved, role updated
8. User notified of decision
9. Change logged in audit trail

#### Role Request Features
- Submit role change request
- View pending requests
- Admin approval/rejection
- Request history
- Audit trail

---

## Slide 17: Security Management (MAC)

### Clearance Levels

#### Levels
- **Level 1**: Public access (default)
- **Level 2**: Internal access
- **Level 3**: Confidential access (highest)

#### Assignment
- Admin assigns clearance levels to users
- Clearance level determines resource access (MAC model)
- Clearance level stored in user profile

### Security Labels

#### Classifications
- **Public (1)**: Accessible to all users
- **Internal (2)**: Requires clearance level 2+
- **Confidential (3)**: Requires clearance level 3

#### Management
- Admin assigns security labels to files
- Labels determine access under MAC model
- Labels can be changed by admin
- Label changes are audited

---

## Slide 18: API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - MFA verification
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone
- `POST /api/auth/enable-mfa` - Enable MFA

### File Endpoints
- `GET /api/files` - List all files
- `GET /api/files/:id/access` - Check file access
- `POST /api/files/:id/share` - Share file
- `POST /api/files/:id/unshare` - Unshare file

### User Endpoints
- `GET /api/users` - List all users (admin)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/assign-role` - Assign role (admin)

### Role Endpoints
- `POST /api/role-requests/requests` - Request role change
- `GET /api/role-requests/requests` - Get role requests
- `POST /api/role-requests/requests/:id/approve` - Approve request
- `POST /api/role-requests/requests/:id/reject` - Reject request

### Admin Endpoints
- `GET /api/admin/model` - Get current access model
- `POST /api/admin/model` - Set access model
- `POST /api/admin/backup` - Trigger backup
- `GET /api/admin/backups` - List backups
- `GET /api/admin/sessions` - List sessions
- `DELETE /api/admin/sessions/:id` - Revoke session

### Security Endpoints
- `GET /api/security/clearance-levels` - Get clearance levels
- `POST /api/security/clearance-levels/:userId` - Update clearance
- `GET /api/security/labels` - Get security labels
- `POST /api/security/labels/:fileId` - Update label

### Audit Endpoints
- `GET /api/logs` - Get audit logs
- `GET /api/alerts` - Get security alerts
- `POST /api/alerts/:id/acknowledge` - Acknowledge alert
- `GET /api/permissions/logs` - Get permission logs

---

## Slide 19: Frontend Pages

### Dashboard
- **Purpose**: System overview and statistics
- **Features**: User stats, recent activity, quick actions
- **Access**: All authenticated users

### Files
- **Purpose**: File management and sharing
- **Features**: List files, view files, share/unshare, permission management
- **Access**: All authenticated users

### Users
- **Purpose**: User management
- **Features**: List users, assign roles, manage accounts
- **Access**: ADMIN only

### Admin
- **Purpose**: System administration
- **Features**: Switch access control models, trigger backups
- **Access**: ADMIN only

### Profile
- **Purpose**: User profile management
- **Features**: View/update profile, change password, manage MFA, view sessions
- **Access**: Own profile only

### Audit Logs
- **Purpose**: View system audit trail
- **Features**: Search logs, filter by type/date, view encrypted logs
- **Access**: ADMIN only

### Alerts
- **Purpose**: Security alert management
- **Features**: View alerts, acknowledge alerts, filter alerts
- **Access**: ADMIN only

### Backups
- **Purpose**: Backup management
- **Features**: View backups, trigger backups, download backups
- **Access**: ADMIN only

### Role Requests
- **Purpose**: Role change requests
- **Features**: Submit requests, view requests, approve/reject (admin)
- **Access**: All authenticated users (view own), ADMIN (manage all)

### Security Management
- **Purpose**: MAC security management
- **Features**: Manage clearance levels, manage security labels
- **Access**: ADMIN only

---

## Slide 20: Installation & Setup

### Prerequisites
- **Node.js**: v18+ (recommended)
- **MongoDB**: v6+ (local instance)
- **npm**: v9+ (comes with Node.js)

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd secure-archive-management-system
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Configure Environment

Create `.env` file in backend directory:
```env
# Server
SERVER_PORT=4000

# Database
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB=secure_archive

# JWT
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=32-character-key-for-aes-256
ENCRYPTION_IV=16-character-iv-key

# Email (for MFA)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

#### 4. Start MongoDB
```bash
# Ensure MongoDB is running locally
mongod --dbpath /path/to/data/db
```

#### 5. Initialize Database
```bash
cd backend/src/scripts
node initDatabase.js
```

#### 6. Start Backend
```bash
cd backend
npm start
```

#### 7. Start Frontend
```bash
cd frontend
npm run dev
```

### Default Admin Credentials
- **Username**: admin
- **Password**: admin123 (change immediately)
- **Email**: admin@example.com

---

## Slide 21: Configuration

### Database Configuration

#### Local MongoDB
- **URI**: `mongodb://127.0.0.1:27017`
- **Database**: `secure_archive`
- **Connection**: Direct connection to local instance
- **No Authentication**: Default local setup (add auth for production)

### Security Configuration

#### Password Policies
- Minimum length: 8 characters
- Complexity: Upper, lower, number, special char
- Hashing rounds: 10 (bcryptjs)

#### JWT Configuration
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Algorithm: HS256

#### Account Lockout
- Max attempts: 5
- Lockout duration: 30 minutes
- Auto-unlock: Yes

### Access Control Model

#### Default Model
- **Initial**: RBAC
- **Changeable**: Yes (admin only)
- **Persistence**: Stored in database
- **Audited**: Yes

---

## Slide 22: Testing Access Control Models

### Testing MAC

#### Steps
1. Switch to MAC model (Admin page)
2. Assign clearance level 3 to user
3. Set file classification to Confidential (3)
4. Test access with user (should work)
5. Lower user clearance to 2
6. Test access again (should fail)

#### Expected Behavior
- Clearance 3 → Access Confidential ✓
- Clearance 2 → Access Confidential ✗
- Clearance 1 → Access Confidential ✗

### Testing DAC

#### Steps
1. Switch to DAC model
2. User A creates file
3. User B tries to access (should fail)
4. User A shares file with User B
5. User B tries to access (should work)

#### Expected Behavior
- Owner → Always has access ✓
- Shared user → Has access ✓
- Other user → No access ✗

### Testing RBAC

#### Steps
1. Switch to RBAC model
2. Create file with Public classification
3. Test with STAFF role (should work)
4. Create file with Confidential classification
5. Test with STAFF role (should fail)
6. Test with MANAGER role (should work)

#### Expected Behavior
- STAFF → Public files ✓
- STAFF → Confidential files ✗
- MANAGER → Most files ✓
- ADMIN → All files ✓

### Testing RuBAC

#### Steps
1. Switch to RuBAC model
2. Test access during working hours (should work)
3. Test access outside working hours (should fail, unless admin)
4. Test with allowed location (office) → should work
5. Test with blocked location (public-wifi) → should fail
6. Test with allowed device (company-laptop) → should work
7. Test with blocked device (personal-phone) → should fail

#### Expected Behavior
- Working hours + allowed location + allowed device → Access ✓
- Outside hours OR wrong location OR wrong device → Access ✗
- Admin → Override all rules ✓

### Testing ABAC

#### Steps
1. Switch to ABAC model
2. Create file with "salary" in name
3. Test with Payroll department → should work
4. Test with IT department → should fail
5. Test with Finance department, Confidential, during working hours → should work
6. Test with Finance department, Confidential, outside hours → should fail

#### Expected Behavior
- Payroll → Salary files ✓
- IT → Salary files ✗
- Finance → Confidential files (working hours only) ✓
- Public files → All users ✓

---

## Slide 23: Security Best Practices

### Production Deployment

#### Environment Variables
- Use strong, unique secrets
- Rotate encryption keys regularly
- Use environment-specific configurations
- Never commit secrets to version control

#### Database Security
- Enable MongoDB authentication
- Use strong database passwords
- Restrict database network access
- Regular database backups

#### Application Security
- Use HTTPS in production
- Enable CORS only for trusted domains
- Rate limit API endpoints
- Regular security updates

#### Access Control
- Review access control model regularly
- Audit user permissions periodically
- Monitor failed access attempts
- Implement least privilege principle

### Monitoring

#### Key Metrics
- Failed login attempts
- Access denials
- Security alerts
- Backup status
- System uptime

#### Alerting
- Configure email alerts for critical events
- Monitor audit logs regularly
- Review security alerts daily
- Investigate suspicious activities

---

## Slide 24: Troubleshooting

### Common Issues

#### MongoDB Connection Failed
**Problem**: Cannot connect to MongoDB
**Solution**: 
- Check if MongoDB is running: `mongod --version`
- Verify connection string: `mongodb://127.0.0.1:27017`
- Check firewall settings
- Verify MongoDB port (default: 27017)

#### Access Denied Errors
**Problem**: User cannot access files
**Solution**:
- Check current access control model
- Verify user role/permissions
- Check resource classification/clearance
- Review audit logs for details

#### MFA Not Working
**Problem**: OTP not received
**Solution**:
- Check email configuration
- Verify email credentials
- Check spam folder
- Verify email address in profile

#### Backup Failed
**Problem**: Backup creation fails
**Solution**:
- Check disk space
- Verify backup directory permissions
- Check MongoDB connection
- Review error logs

---

## Slide 25: Summary & Key Takeaways

### System Highlights

#### Access Control
- **5 Models**: MAC, DAC, RBAC, RuBAC, ABAC
- **Dynamic Switching**: Change model without restart
- **Consistent Interface**: All models use same signature
- **Comprehensive**: Covers all major access control paradigms

#### Security Features
- **MFA**: Multi-factor authentication
- **Encryption**: AES-256-CBC encrypted logs
- **Audit Trails**: Comprehensive logging
- **Alerts**: Automated security alerting
- **Backups**: Automated and manual backups

#### User Management
- **Roles**: 5 predefined roles
- **Workflow**: Role change approval process
- **Profiles**: Comprehensive profile management
- **Sessions**: Active session tracking

### Use Cases

#### Ideal For
- Government organizations
- Healthcare institutions
- Financial services
- Legal firms
- Any organization requiring strict access control

#### Benefits
- Flexible access control models
- Comprehensive audit trails
- Strong security features
- Easy administration
- Scalable architecture

### Future Enhancements
- Additional access control models
- Enhanced reporting
- Mobile app support
- API rate limiting
- Advanced analytics

---

## Appendix A: Code Structure

### Key Files

#### Access Control
- `backend/src/middleware/accessControl.js` - Main router
- `backend/src/middleware/mac.js` - MAC implementation
- `backend/src/middleware/dac.js` - DAC implementation
- `backend/src/middleware/rbac.js` - RBAC implementation
- `backend/src/middleware/rubac.js` - RuBAC implementation
- `backend/src/middleware/abac.js` - ABAC implementation

#### Authentication
- `backend/src/middleware/auth.js` - JWT authentication
- `backend/src/routes/auth.js` - Auth endpoints
- `backend/src/controllers/authController.js` - Auth logic

#### Database
- `backend/src/config/database.js` - MongoDB connection
- `backend/src/models/` - Data models

#### Services
- `backend/src/services/backup.js` - Backup service
- `backend/src/services/encryption.js` - Encryption service
- `backend/src/services/alert.js` - Alert service
- `backend/src/services/emailService.js` - Email service

---

## Appendix B: Database Schema

### Collections

#### users
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  phone: String (unique),
  passwordHash: String,
  role: String (ADMIN|MANAGER|STAFF|HR|IT),
  department: String,
  clearanceLevel: Number (1-3),
  mfaEnabled: Boolean,
  mfaSecret: String,
  emailVerified: Boolean,
  phoneVerified: Boolean,
  failedLoginAttempts: Number,
  lockedUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### files
```javascript
{
  _id: String,
  name: String,
  ownerId: String,
  department: String,
  classification: Number (1-3),
  sharedWith: [String],
  permissions: Object,
  createdAt: Date,
  updatedAt: Date
}
```

#### logs
```javascript
{
  _id: ObjectId,
  userId: String,
  username: String,
  action: String,
  description: String,
  status: String,
  ipAddress: String,
  timestamp: Date,
  encrypted: Boolean
}
```

#### settings
```javascript
{
  key: String,
  value: String
}
```

---

## End of Presentation

This comprehensive presentation document covers all aspects of the Secure Archive Management System, including detailed explanations of all five access control models, security features, and system capabilities.

For technical details, refer to the source code in the `backend/src/` and `frontend/src/` directories.

**System Version**: 1.0.0  
**Last Updated**: 2024  
**Database**: MongoDB (mongodb://127.0.0.1:27017/secure_archive)

