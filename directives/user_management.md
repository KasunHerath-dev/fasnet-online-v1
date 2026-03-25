# SOP: User and Security Management (FASNET)

This directive outlines the procedures for handling user accounts, roles, and security within the FASNET LMS.

## 1. Student Account Lifecycle

### Registration
- Students are imported via Bulk CSV in `Admin > Students > Bulk Import`.
- Initial accounts are created in a "Locked" state (no password set).

### Activation (Student Driven)
1. Student visits the Login page and clicks "Activate Account".
2. System verifies `registrationNumber` and `email`.
3. System sends a 6-digit OTP to the registered email.
4. Student verifies OTP and sets their personalized password.
5. Account status moves to "Active".

## 2. Role Management

### Permissions Hierarchy
- **Superadmin:** System configuration, Cloudinary wiping, Global settings.
- **Admin:** Student management, Resource uploads, Result processing.
- **User (Student):** Personal profile, Course materials, Result viewing.

### Role Modification
- Role changes must be performed by a Superadmin via `Admin > Users > Manage Users`.

## 3. Password Recovery
- If a student forgets their password, Admin can trigger a "Reset Password" email which forces the student back into the OTP/Activation flow.

---
**Version:** 1.0.0
**Owner:** System Architect
**Last Updated:** March 2026
