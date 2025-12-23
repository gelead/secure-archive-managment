# Testing RuBAC (Rule-Based Access Control)

This guide explains how to test the RuBAC feature in the secure archive management system.

## Overview

RuBAC enforces access control based on multiple rules that must ALL pass:
- **Time-based rules**: Working hours (9 AM - 5 PM, Monday-Friday)
- **Location-based rules**: Allowed locations (office, remote-vpn)
- **Device-based rules**: Allowed devices (company-laptop, company-mobile)
- **Business rules**: Conditional rules (e.g., HR Managers can approve leave > 10 days)

## Method 1: Switch via Admin UI (Easiest)

1. **Login as Admin user**
2. **Navigate to Admin page** (`/admin`)
3. **Click on "RuBAC"** in the Access Control Model section
4. The system will now use RuBAC for all access control checks

## Method 2: Switch via API

### Switch to RuBAC
```bash
# Get your admin access token first (from login)
POST /api/admin/model
Headers: {
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
Body: {
  "model": "RuBAC"
}
```

### Check current model
```bash
GET /api/admin/model
```

## Testing RuBAC Rules

### Test 1: File Access with Time-Based Rules

#### Access during working hours (9 AM - 5 PM, Mon-Fri)
```bash
GET /api/files/:fileId/access?location=office&device=company-laptop
Authorization: Bearer YOUR_TOKEN
```

**Expected**: Access granted (if other rules pass)

#### Access outside working hours
```bash
# Test this at night or on weekends
GET /api/files/:fileId/access?location=office&device=company-laptop
```

**Expected**: Access denied with reason: "RuBAC: Access denied outside working hours (09:00 - 17:00, Mon-Fri)"

**Exception**: Admins can access anytime (admin override)

### Test 2: Location-Based Rules

#### Allowed location (office)
```bash
GET /api/files/:fileId/access?location=office&device=company-laptop
```

**Expected**: Location rule passes

#### Allowed location (remote-vpn)
```bash
GET /api/files/:fileId/access?location=remote-vpn&device=company-laptop
```

**Expected**: Location rule passes

#### Blocked location
```bash
GET /api/files/:fileId/access?location=public-wifi&device=company-laptop
```

**Expected**: Access denied with reason: "RuBAC: Access denied from location: public-wifi"

### Test 3: Device-Based Rules

#### Allowed device (company-laptop)
```bash
GET /api/files/:fileId/access?location=office&device=company-laptop
```

**Expected**: Device rule passes

#### Allowed device (company-mobile)
```bash
GET /api/files/:fileId/access?location=office&device=company-mobile
```

**Expected**: Device rule passes

#### Blocked device
```bash
GET /api/files/:fileId/access?location=office&device=personal-phone
```

**Expected**: Access denied with reason: "RuBAC: Access denied from device: personal-phone"

### Test 4: Leave Request Approval (Business Rule)

This demonstrates RuBAC's conditional business rules.

#### Create a leave request (> 10 days)
```bash
POST /api/leave/requests
Authorization: Bearer YOUR_TOKEN
Body: {
  "startDate": "2024-01-01",
  "endDate": "2024-01-15",  // 15 days
  "reason": "Vacation"
}
```

#### Try to approve as non-HR Manager (should fail)
```bash
POST /api/leave/requests/:leaveRequestId/approve?location=office&device=company-laptop
Authorization: Bearer NON_HR_MANAGER_TOKEN
```

**Expected**: Access denied with reason: "RuBAC: Only HR Managers can approve leave requests exceeding 10 days"

#### Approve as HR Manager (should succeed)
```bash
POST /api/leave/requests/:leaveRequestId/approve?location=office&device=company-laptop
Authorization: Bearer HR_MANAGER_TOKEN
```

**Expected**: Leave request approved successfully

#### Approve leave <= 10 days (any manager can approve)
```bash
# Create leave request for 5 days
POST /api/leave/requests
Body: {
  "startDate": "2024-01-01",
  "endDate": "2024-01-05",  // 5 days
  "reason": "Short vacation"
}

# Approve as regular manager
POST /api/leave/requests/:leaveRequestId/approve
Authorization: Bearer MANAGER_TOKEN
```

**Expected**: Approval succeeds (rule only applies to leave > 10 days)

## Testing Multiple Rules Combined

All rules must pass. Here's an example combining multiple rules:

### Scenario: Access during working hours, from allowed location, with allowed device
```bash
GET /api/files/:fileId/access?location=office&device=company-laptop
Authorization: Bearer YOUR_TOKEN
# Make sure it's between 9 AM - 5 PM on a weekday
```

**Expected**: Access granted (all rules pass)

### Scenario: Access outside hours + wrong location
```bash
# Test at night (outside 9 AM - 5 PM)
GET /api/files/:fileId/access?location=public-wifi&device=company-laptop
```

**Expected**: Access denied (multiple rules fail)

## Testing Admin Override

Admins can override most rules:

```bash
# Admin accessing outside working hours
GET /api/files/:fileId/access?location=public-wifi&device=personal-phone
Authorization: Bearer ADMIN_TOKEN
# Even at night, from blocked location/device
```

**Expected**: Access granted (admin override for all rules)

## Complete Test Workflow

1. **Switch to RuBAC**:
   ```bash
   POST /api/admin/model
   Body: { "model": "RuBAC" }
   ```

2. **Test file access during working hours**:
   ```bash
   GET /api/files/:fileId/access?location=office&device=company-laptop
   ```

3. **Test file access outside working hours** (change system time or wait):
   ```bash
   GET /api/files/:fileId/access?location=office&device=company-laptop
   ```

4. **Test leave approval business rule**:
   ```bash
   # Create leave request > 10 days
   POST /api/leave/requests
   # Try to approve as non-HR manager (should fail)
   # Approve as HR manager (should succeed)
   ```

5. **Check audit logs**:
   ```bash
   GET /api/logs
   ```
   Look for entries showing RuBAC enforcement and reasons

## Testing with cURL Examples

### Switch to RuBAC
```bash
curl -X POST http://localhost:3000/api/admin/model \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "RuBAC"}'
```

### Test file access
```bash
curl -X GET "http://localhost:3000/api/files/FILE_ID/access?location=office&device=company-laptop" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test leave approval
```bash
# Create leave request
curl -X POST http://localhost:3000/api/leave/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01",
    "endDate": "2024-01-15",
    "reason": "Testing RuBAC"
  }'

# Approve leave request
curl -X POST "http://localhost:3000/api/leave/requests/LEAVE_REQUEST_ID/approve?location=office&device=company-laptop" \
  -H "Authorization: Bearer YOUR_HR_MANAGER_TOKEN"
```

## Verification Checklist

- [ ] Switch to RuBAC mode successfully
- [ ] File access works during working hours
- [ ] File access blocked outside working hours (except admin)
- [ ] File access works from allowed locations (office, remote-vpn)
- [ ] File access blocked from disallowed locations
- [ ] File access works with allowed devices (company-laptop, company-mobile)
- [ ] File access blocked with disallowed devices
- [ ] Leave request > 10 days can only be approved by HR Manager
- [ ] Leave request <= 10 days can be approved by any manager
- [ ] Admin can override all rules
- [ ] Audit logs show RuBAC enforcement reasons

## Understanding RuBAC Response

When access is checked, you'll receive:
```json
{
  "allowed": true/false,
  "reason": "RuBAC: [Explanation of rule evaluation]",
  "failedRules": [...] // Only present if access denied
}
```

**Example success**:
```json
{
  "allowed": true,
  "reason": "RuBAC: All rules passed"
}
```

**Example failure**:
```json
{
  "allowed": false,
  "reason": "RuBAC: Access denied outside working hours (09:00 - 17:00, Mon-Fri)",
  "failedRules": [
    {
      "passed": false,
      "reason": "RuBAC: Access denied outside working hours (09:00 - 17:00, Mon-Fri)"
    }
  ]
}
```

## Troubleshooting

1. **RuBAC not working?** Check current model: `GET /api/admin/model`
2. **Rules not evaluating?** Make sure context is passed correctly in query params or resource object
3. **Admin override not working?** Verify user has ADMIN role
4. **Leave approval not working?** Ensure leave request has `days > 10` and user is HR Manager

## Notes

- RuBAC requires **ALL rules to pass** for access to be granted
- Rules are evaluated in order, and first failure stops further evaluation (except for admin overrides)
- Context can be passed via query parameters (`?location=office&device=laptop`) or embedded in the resource object
- The system automatically merges context into the resource for RuBAC evaluation
