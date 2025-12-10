# API Documentation

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

### POST /api/auth/login
Login with username and password.

### POST /api/auth/verify-otp
Verify MFA OTP code.

### POST /api/auth/refresh
Refresh access token.

### POST /api/auth/logout
Logout user.

## File Endpoints

### GET /api/files
Get all files.

### GET /api/files/:id/access
Check file access permissions.

### POST /api/files/:id/share
Share file with user.

### POST /api/files/:id/unshare
Revoke file share.

## Admin Endpoints

### GET /api/admin/model
Get current access control model.

### POST /api/admin/model
Set access control model (admin only).

### POST /api/admin/backup
Trigger system backup (admin only).

## User Endpoints

### GET /api/users
Get all users (admin only).

### GET /api/users/profile
Get current user profile.

### PUT /api/users/profile
Update user profile.

### POST /api/users/assign-role
Assign role to user (admin only).

## Audit Endpoints

### GET /api/logs
Get audit logs (admin only).

### GET /api/alerts
Get security alerts (admin only).

### GET /api/permissions/logs
Get permission logs.

