# Secure Archive Management System

An enterprise-grade secure archive management system with comprehensive access control models, multi-factor authentication, encrypted audit logging, and automated backup capabilities.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [File Descriptions](#file-descriptions)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [License](#license)

## 🎯 Overview

This system implements a comprehensive secure archive management solution with five different access control models (MAC, DAC, RBAC, RuBAC, ABAC), mandatory multi-factor authentication via email, encrypted audit trails, and automated backup systems. It's designed for organizations requiring fine-grained access control and comprehensive security auditing.

## ✨ Features

### Access Control Models
- **MAC (Mandatory Access Control)**: Security labels and clearance levels
- **DAC (Discretionary Access Control)**: File ownership and permission management
- **RBAC (Role-Based Access Control)**: Role-based permissions and role change workflows
- **RuBAC (Rule-Based Access Control)**: Time, location, and device-based access rules
- **ABAC (Attribute-Based Access Control)**: Fine-grained attribute-based policies

### Authentication & Security
- **Multi-Factor Authentication (MFA)**: Mandatory email-based OTP verification
- **Password Policies**: Configurable complexity requirements
- **Account Lockout**: Brute-force protection
- **JWT Tokens**: Secure token-based authentication
- **Session Management**: Active session tracking
- **CAPTCHA**: Bot protection during registration

### Audit & Compliance
- **Encrypted Logging**: AES-256-CBC encrypted audit trails
- **Comprehensive Activity Tracking**: User actions, system events, access attempts
- **Centralized Logging**: MongoDB-based log storage
- **Security Alerts**: Automated alerting for suspicious activities
- **Audit Trail**: Complete history of all system changes

### Data Protection
- **Automated Backups**: Hourly automated backup system
- **Manual Backup Triggers**: On-demand backup capability
- **Backup Management**: UI for backup history and restoration

## 🛠 Technology Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** for data storage
- **JWT** for authentication
- **bcryptjs** for password hashing
- **nodemailer** for email services
- **speakeasy** for MFA/TOTP

### Frontend
- **React 19** with functional components
- **React Router** for navigation
- **Vite** for build tooling
- **Lucide React** for icons
- **Recharts** for data visualization

### Infrastructure
- **Docker** for containerization
- **MongoDB Atlas** support
- **Environment-based configuration**

## 📁 Project Structure

```
secure-archive-management-system/
├── backend/                          # Backend application
│   ├── backup.js                    # Manual backup script
│   ├── server.js                    # Entry point (imports src/server.js)
│   ├── SECURITY_NOTES.md           # Security documentation
│   └── src/
│       ├── config/                  # Configuration files
│       │   ├── database.js         # MongoDB connection & utilities
│       │   ├── logger.js           # Logging configuration & encryption
│       │   └── security.js          # Security policies & settings
│       ├── controllers/            # Business logic controllers
│       │   ├── authController.js    # Authentication & user management
│       │   └── policyController.js  # Access control policy management
│       ├── middleware/              # Express middleware
│       │   ├── abac.js              # Attribute-Based Access Control
│       │   ├── accessControl.js     # Main access control router
│       │   ├── auth.js              # Authentication middleware
│       │   ├── dac.js               # Discretionary Access Control
│       │   ├── mac.js               # Mandatory Access Control
│       │   ├── rbac.js              # Role-Based Access Control
│       │   └── rubac.js             # Rule-Based Access Control
│       ├── models/                   # MongoDB data models
│       │   ├── AuditLog.js          # Audit log schema
│       │   ├── Permission.js        # Permission schema
│       │   ├── Policy.js            # Policy schema
│       │   ├── Role.js              # Role schema
│       │   ├── SecurityLabel.js     # Security label schema
│       │   └── User.js              # User schema
│       ├── routes/                   # API route handlers
│       │   ├── auth.js               # Authentication routes
│       │   ├── users.js              # User management routes
│       │   ├── files.js              # File operations routes
│       │   ├── roles.js              # Role management routes
│       │   ├── leave.js              # Leave request routes
│       │   ├── security.js           # Security management routes
│       │   ├── audit.js              # Audit log routes
│       │   └── policies.js           # Policy management routes
│       ├── services/                 # Business logic services
│       │   ├── alert.js              # Alerting service
│       │   ├── backup.js             # Backup service
│       │   ├── emailService.js       # Email/MFA service
│       │   ├── encryption.js         # Encryption utilities
│       │   └── mfa.js                # MFA service wrapper
│       ├── utils/                    # Utility functions
│       │   ├── auth.js               # Authentication utilities
│       │   ├── captcha.js           # CAPTCHA verification
│       │   ├── constants.js         # Application constants
│       │   ├── helpers.js           # Helper functions
│       │   └── validators.js        # Input validation
│       ├── scripts/                  # Database scripts
│       │   └── initDatabase.js      # Database initialization
│       ├── public/                   # Static files
│       │   └── index.html           # Public HTML
│       └── server.js                 # Main Express server
├── frontend/                         # Frontend application
│   ├── index.html                   # HTML entry point
│   └── src/
│       ├── App.jsx                  # Main React application
│       ├── index.jsx                # React entry point
│       ├── components/              # Reusable components
│       │   ├── CaptchaQuiz.jsx      # CAPTCHA component
│       │   ├── Layout.jsx           # Main layout wrapper
│       │   └── common/              # Common UI components
│       │       ├── Button.jsx       # Button component
│       │       ├── Card.jsx        # Card component
│       │       └── Input.jsx       # Input component
│       ├── pages/                   # Page components
│       │   ├── Admin.jsx           # Admin dashboard
│       │   ├── Alerts.jsx           # Security alerts page
│       │   ├── AuditLogs.jsx        # Audit log viewer
│       │   ├── Backups.jsx          # Backup management
│       │   ├── Dashboard.jsx       # Main dashboard
│       │   ├── Files.jsx           # File management
│       │   ├── LeaveRequests.jsx    # Leave request system
│       │   ├── Login.jsx            # Login page
│       │   ├── MFASetup.jsx         # MFA setup page
│       │   ├── Profile.jsx          # User profile
│       │   ├── Register.jsx        # Registration page
│       │   ├── RoleRequests.jsx     # Role request management
│       │   ├── SecurityManagement.jsx # Security label management
│       │   └── Users.jsx           # User management
│       ├── contexts/                 # React contexts
│       │   └── AuthContext.jsx      # Authentication context
│       ├── hooks/                   # Custom React hooks
│       │   └── useAuth.js          # Authentication hook
│       ├── services/                # API services
│       │   └── api.js              # API client
│       ├── styles/                  # CSS files
│       │   └── global.css          # Global styles
│       └── utils/                   # Frontend utilities
│           └── constants.js        # Frontend constants
├── database/                        # Database scripts
│   ├── migrations/                 # Database migrations
│   │   └── 001_initial_schema.js  # Initial schema migration
│   └── seeds/                      # Seed data
│       └── defaultUsers.js        # Default user seeds
├── docker/                         # Docker configuration
│   ├── docker-compose.yml         # Docker Compose config
│   ├── Dockerfile.backend         # Backend Dockerfile
│   └── Dockerfile.frontend        # Frontend Dockerfile
├── docs/                           # Documentation
│   ├── api-docs.md                # API documentation
│   ├── requirements.md            # Requirements specification
│   └── setup-guide.md             # Setup guide
├── .gitignore                      # Git ignore rules
├── package.json                    # NPM dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite configuration
├── README.md                       # This file
├── QUICKSTART.md                   # Quick start guide
├── EMAIL_SETUP.md                  # Email configuration guide
├── SMTP_REQUIRED.md                # SMTP setup instructions
├── IMPLEMENTATION_SUMMARY.md       # Implementation details
└── update-mongo-atlas.sh          # MongoDB Atlas update script
```

## 📄 File Descriptions

### Backend Files

#### Configuration Files
- **`backend/src/config/database.js`**: MongoDB connection management, database utilities, and connection pooling
- **`backend/src/config/logger.js`**: Logging configuration with AES-256-CBC encryption for audit logs
- **`backend/src/config/security.js`**: Security policies including password rules, account lockout, JWT settings, MFA configuration

#### Controllers
- **`backend/src/controllers/authController.js`**: Handles user authentication, registration, login, MFA verification, password changes, email/phone verification, and MFA setup
- **`backend/src/controllers/policyController.js`**: Manages access control policies, policy switching between MAC/DAC/RBAC/RuBAC/ABAC, and policy state management

#### Middleware
- **`backend/src/middleware/abac.js`**: Attribute-Based Access Control - evaluates access based on user attributes (role, department, location, time)
- **`backend/src/middleware/accessControl.js`**: Main access control router that delegates to appropriate model (MAC/DAC/RBAC/RuBAC/ABAC)
- **`backend/src/middleware/auth.js`**: JWT token verification, session validation, user authentication middleware
- **`backend/src/middleware/dac.js`**: Discretionary Access Control - file ownership and permission checks
- **`backend/src/middleware/mac.js`**: Mandatory Access Control - security label and clearance level enforcement
- **`backend/src/middleware/rbac.js`**: Role-Based Access Control - role-based permission checks
- **`backend/src/middleware/rubac.js`**: Rule-Based Access Control - time, location, and device-based rule evaluation

#### Models
- **`backend/src/models/AuditLog.js`**: Audit log data model with encryption support
- **`backend/src/models/Permission.js`**: Permission data model for DAC
- **`backend/src/models/Policy.js`**: Access control policy data model
- **`backend/src/models/Role.js`**: Role data model for RBAC
- **`backend/src/models/SecurityLabel.js`**: Security label data model for MAC
- **`backend/src/models/User.js`**: User data model with authentication fields

#### Routes
- **`backend/src/routes/auth.js`**: Authentication endpoints (login, register, verify OTP, refresh token, logout)
- **`backend/src/routes/users.js`**: User management endpoints (CRUD operations, profile management)
- **`backend/src/routes/files.js`**: File operations with DAC sharing capabilities
- **`backend/src/routes/roles.js`**: Role management and role request workflows
- **`backend/src/routes/leave.js`**: Leave request system demonstrating RuBAC
- **`backend/src/routes/security.js`**: Security label and clearance level management (MAC)
- **`backend/src/routes/audit.js`**: Audit log retrieval and alert management
- **`backend/src/routes/policies.js`**: Access control policy management and switching

#### Services
- **`backend/src/services/alert.js`**: Security alert generation and management
- **`backend/src/services/backup.js`**: Automated backup service with scheduling
- **`backend/src/services/emailService.js`**: Email service using nodemailer for MFA codes and notifications
- **`backend/src/services/encryption.js`**: AES-256-CBC encryption utilities for log encryption
- **`backend/src/services/mfa.js`**: Multi-factor authentication service wrapper

#### Utilities
- **`backend/src/utils/auth.js`**: Password hashing, JWT token generation, OTP generation, biometric auth utilities
- **`backend/src/utils/captcha.js`**: CAPTCHA verification logic
- **`backend/src/utils/constants.js`**: Application-wide constants (roles, permissions, etc.)
- **`backend/src/utils/helpers.js`**: General helper functions
- **`backend/src/utils/validators.js`**: Input validation utilities

#### Scripts
- **`backend/src/scripts/initDatabase.js`**: Database initialization script for setting up collections and indexes
- **`backend/backup.js`**: Manual backup script for creating data snapshots
- **`backend/server.js`**: Entry point that imports and starts the main server

### Frontend Files

#### Core Application
- **`frontend/src/App.jsx`**: Main React application component with routing configuration
- **`frontend/src/index.jsx`**: React application entry point
- **`frontend/index.html`**: HTML template for the React application

#### Components
- **`frontend/src/components/CaptchaQuiz.jsx`**: CAPTCHA quiz component for bot protection
- **`frontend/src/components/Layout.jsx`**: Main layout wrapper with navigation and sidebar
- **`frontend/src/components/common/Button.jsx`**: Reusable button component
- **`frontend/src/components/common/Card.jsx`**: Reusable card component
- **`frontend/src/components/common/Input.jsx`**: Reusable input component

#### Pages
- **`frontend/src/pages/Admin.jsx`**: Admin dashboard for access control model management
- **`frontend/src/pages/Alerts.jsx`**: Security alerts display page
- **`frontend/src/pages/AuditLogs.jsx`**: Comprehensive audit log viewer with filtering
- **`frontend/src/pages/Backups.jsx`**: Backup management interface
- **`frontend/src/pages/Dashboard.jsx`**: Main dashboard with statistics and overview
- **`frontend/src/pages/Files.jsx`**: File management with DAC sharing capabilities
- **`frontend/src/pages/LeaveRequests.jsx`**: Leave request system demonstrating RuBAC rules
- **`frontend/src/pages/Login.jsx`**: Login page with MFA support
- **`frontend/src/pages/MFASetup.jsx`**: Multi-factor authentication setup page
- **`frontend/src/pages/Profile.jsx`**: User profile management page
- **`frontend/src/pages/Register.jsx`**: User registration page with email verification
- **`frontend/src/pages/RoleRequests.jsx`**: Role request and approval workflow
- **`frontend/src/pages/SecurityManagement.jsx`**: Security label and clearance level management (MAC)
- **`frontend/src/pages/Users.jsx`**: User management interface

#### Contexts & Hooks
- **`frontend/src/contexts/AuthContext.jsx`**: React context for authentication state management
- **`frontend/src/hooks/useAuth.js`**: Custom hook for authentication operations

#### Services & Utilities
- **`frontend/src/services/api.js`**: Complete API client with all backend endpoints
- **`frontend/src/utils/constants.js`**: Frontend constants and configuration
- **`frontend/src/styles/global.css`**: Global CSS styles

### Database Files
- **`database/migrations/001_initial_schema.js`**: Initial database schema migration
- **`database/seeds/defaultUsers.js`**: Default user seed data

### Docker Files
- **`docker/docker-compose.yml`**: Docker Compose configuration for full stack deployment
- **`docker/Dockerfile.backend`**: Backend Docker image configuration
- **`docker/Dockerfile.frontend`**: Frontend Docker image configuration

### Documentation Files
- **`docs/api-docs.md`**: Complete API endpoint documentation
- **`docs/requirements.md`**: Project requirements and specifications
- **`docs/setup-guide.md`**: Detailed setup and installation guide
- **`EMAIL_SETUP.md`**: Email/SMTP configuration instructions
- **`SMTP_REQUIRED.md`**: SMTP setup requirements for MFA
- **`QUICKSTART.md`**: Quick start guide for developers
- **`IMPLEMENTATION_SUMMARY.md`**: Detailed implementation summary
- **`backend/SECURITY_NOTES.md`**: Security implementation notes

### Configuration Files
- **`package.json`**: NPM dependencies, scripts, and project metadata
- **`tsconfig.json`**: TypeScript configuration (for type checking)
- **`vite.config.ts`**: Vite build tool configuration
- **`.gitignore`**: Git ignore patterns
- **`update-mongo-atlas.sh`**: MongoDB Atlas connection update script

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- SMTP email account (Gmail recommended)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/gelead/secure-archive-managment.git
   cd secure-archive-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```bash
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/secure_archive
   # or for MongoDB Atlas:
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/secure_archive
   MONGO_DB=secure_archive

   # JWT Secret
   JWT_SECRET=your-secret-key-change-in-production

   # Server Port
   SERVER_PORT=4000
   NODE_ENV=development

   # Log Encryption Key (32+ characters)
   LOG_KEY=your-32-character-encryption-key

   # SMTP Configuration (REQUIRED for MFA)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Start the backend server**
   ```bash
   npm run start-server
   ```

6. **Start the frontend (in a new terminal)**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

## ⚙️ Configuration

### SMTP Email Setup (Required for MFA)

MFA is mandatory for all users. You must configure SMTP email settings:

1. **For Gmail:**
   - Enable 2-Step Verification
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the 16-character app password as `SMTP_PASS`

2. **See `EMAIL_SETUP.md`** for detailed instructions for other email providers

### Security Configuration

Edit `backend/src/config/security.js` to customize:
- Password policies
- Account lockout settings
- JWT token expiration
- MFA code expiration
- Backup intervals

## 📖 Usage

### Default Admin Account
- **Username**: `admin`
- **Password**: `Admin@123!` (change after first login)

### Access Control Models

The system supports five access control models that can be switched via the Admin page:

1. **MAC**: Set security labels (Public, Internal, Confidential) and clearance levels
2. **DAC**: Share files with specific users and set permissions (read, write, delete)
3. **RBAC**: Assign roles (ADMIN, MANAGER, STAFF, HR, IT) with role-based permissions
4. **RuBAC**: Configure time-based, location-based, and device-based access rules
5. **ABAC**: Fine-grained policies based on multiple attributes

### Key Features Usage

- **MFA**: All users must verify via email OTP on login
- **File Sharing**: Use the Files page to share files with DAC permissions
- **Role Requests**: Request role changes via Role Requests page (requires admin approval)
- **Leave Requests**: Submit leave requests (demonstrates RuBAC time-based rules)
- **Audit Logs**: View all system activities in the Audit Logs page
- **Backups**: Automated hourly backups, view history in Backups page

## 📚 API Documentation

See `docs/api-docs.md` for complete API endpoint documentation.

### Main Endpoints

- `POST /api/auth/login` - User login (requires MFA)
- `POST /api/auth/verify-otp` - Verify MFA code
- `POST /api/auth/register` - User registration
- `GET /api/users` - Get users (requires auth)
- `POST /api/files` - Create file
- `GET /api/files` - List files
- `POST /api/roles/request` - Request role change
- `GET /api/audit/logs` - Get audit logs

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **MFA**: Mandatory email-based OTP verification
- **Encrypted Logs**: AES-256-CBC encryption for audit trails
- **Account Lockout**: Brute-force protection (5 failed attempts = 5 min lockout)
- **CAPTCHA**: Bot protection during registration
- **Session Management**: Active session tracking and expiration
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured CORS policies

## 🐳 Deployment

### Docker Deployment

```bash
cd docker
docker-compose up -d
```

### Manual Deployment

1. Build frontend: `npm run build`
2. Set `NODE_ENV=production` in `.env`
3. Start backend: `npm run start-server`
4. Serve frontend build from a web server

### MongoDB Atlas

Use the `update-mongo-atlas.sh` script to update MongoDB Atlas connection strings.

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. For issues or questions, please contact the repository owner.

## 📧 Support

For setup assistance, see:
- `QUICKSTART.md` - Quick start guide
- `EMAIL_SETUP.md` - Email configuration
- `SMTP_REQUIRED.md` - SMTP setup requirements
- `docs/setup-guide.md` - Detailed setup guide

---

**Note**: This system requires SMTP email configuration for MFA to function. See `SMTP_REQUIRED.md` for setup instructions.
