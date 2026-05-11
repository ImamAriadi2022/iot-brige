# IoT Bridge API Documentation

## Base URL

```txt
https://iotbridge.click
```

## API Docs

```txt
https://iotbridge.click/api-docs
```

---

# Authentication

## Authorization Header

Gunakan header berikut untuk endpoint yang membutuhkan autentikasi:

```http
Authorization: Bearer <your_access_token>
```

---

# Auth Endpoints

## Register

```http
POST /auth/register
```

### Full URL

```txt
https://iotbridge.click/auth/register
```

### Request Body

```json
{
  "username": "string",
  "email": "string",
  "phone_number": "string",
  "password": "string"
}
```

---

## Verify Email

```http
GET /auth/verify-email
```

### Full URL

```txt
https://iotbridge.click/auth/verify-email
```

---

## Login

```http
POST /auth/login
```

### Full URL

```txt
https://iotbridge.click/auth/login
```

### Request Body

```json
{
  "identity": "string",
  "password": "string"
}
```

---

## Forgot Password

```http
POST /auth/forgot-password
```

### Full URL

```txt
https://iotbridge.click/auth/forgot-password
```

### Request Body

```json
{
  "email": "string"
}
```

---

## Reset Password Page

```http
GET /auth/reset-password/{token}
```

### Full URL

```txt
https://iotbridge.click/auth/reset-password/{token}
```

---

## Reset Password

```http
POST /auth/reset-password
```

### Full URL

```txt
https://iotbridge.click/auth/reset-password
```

### Request Body

```json
{
  "token": "string",
  "password": "string"
}
```

---

## Get Profile

```http
GET /auth/profile
```

### Full URL

```txt
https://iotbridge.click/auth/profile
```

### Authorization

Required.

---

## Update Profile

```http
PATCH /auth/profile
```

### Full URL

```txt
https://iotbridge.click/auth/profile
```

### Authorization

Required.

---

## Change Email

```http
PATCH /auth/email
```

### Full URL

```txt
https://iotbridge.click/auth/email
```

### Authorization

Required.

---

## Change Password

```http
PATCH /auth/password
```

### Full URL

```txt
https://iotbridge.click/auth/password
```

### Authorization

Required.

---

# Organizations

## Get User Organizations

```http
GET /organizations/list
```

### Full URL

```txt
https://iotbridge.click/organizations/list
```

---

## Propose Organization

```http
POST /organizations/propose
```

### Full URL

```txt
https://iotbridge.click/organizations/propose
```

### Authorization

Required.

---

## Verify Organization

```http
PATCH /organizations/verify
```

### Full URL

```txt
https://iotbridge.click/organizations/verify
```

### Role

Admin System.

---

## Unverify Organization

```http
PATCH /organizations/unverify
```

### Full URL

```txt
https://iotbridge.click/organizations/unverify
```

### Role

Admin System.

---

## Get Organization Profile

```http
GET /organizations/{organizationId}/profile
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/profile
```

---

## Update Organization Profile

```http
PATCH /organizations/{organizationId}/profile
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/profile
```

---

## Search Members

```http
GET /organizations/{organizationId}/search-members
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/search-members
```

---

## Invite Member

```http
POST /organizations/{organizationId}/member-invitation
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/member-invitation
```

---

## Member Invitation Response

```http
PATCH /organizations/{organizationId}/member-invitation-response
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/member-invitation-response
```

---

## Create Local Member

```http
POST /organizations/{organizationId}/local-member
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/local-member
```

---

## Get Member List

```http
GET /organizations/{organizationId}/member-list
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/member-list
```

---

## Change Member Roles

```http
PATCH /organizations/{organizationId}/member-roles
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/member-roles
```

---

## Delete Member

```http
DELETE /organizations/{organizationId}/member/{userId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/member/{userId}
```

---

## Leave Organization

```http
DELETE /organizations/{organizationId}/leave
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/leave
```

---

## Search Organizations

```http
GET /organizations/search
```

### Full URL

```txt
https://iotbridge.click/organizations/search
```

### Role

Admin System.

---

## Get Organization By ID

```http
GET /organizations/{organizationId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}
```

### Role

Admin System.

---

# Notifications

## Get Notifications

```http
GET /notifications
```

### Full URL

```txt
https://iotbridge.click/notifications
```

---

## Delete All Notifications

```http
DELETE /notifications
```

### Full URL

```txt
https://iotbridge.click/notifications
```

---

## Delete Notification By ID

```http
DELETE /notifications/{notificationId}
```

### Full URL

```txt
https://iotbridge.click/notifications/{notificationId}
```

---

# Devices

## Create Device

```http
POST /organizations/{organizationId}/devices
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices
```

---

## Search Devices

```http
GET /organizations/{organizationId}/devices/search
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/search
```

---

## Get Device By ID

```http
GET /organizations/{organizationId}/devices/{deviceId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}
```

---

## Update Device

```http
PATCH /organizations/{organizationId}/devices/{deviceId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}
```

---

## Delete Device

```http
DELETE /organizations/{organizationId}/devices/{deviceId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}
```

---

## Get Pin List

```http
GET /organizations/{organizationId}/devices/{deviceId}/pin-list
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/pin-list
```

---

## Create or Update Widget Box

```http
PUT /organizations/{organizationId}/devices/{deviceId}/widget-boxes
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/widget-boxes
```

---

## Get Widget Box List

```http
GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/list
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/widget-boxes/list
```

---

## Get Widget Box By ID

```http
GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

---

## Delete Widget Box

```http
DELETE /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

---

## Get Device Report

```http
GET /organizations/{organizationId}/devices/{deviceId}/report
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/report
```

---

## Create Notification Event

```http
POST /organizations/{organizationId}/devices/{deviceId}/notification-events
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/notification-events
```

---

## Get Notification Event List

```http
GET /organizations/{organizationId}/devices/{deviceId}/notification-events/list
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/notification-events/list
```

---

## Get Notification Event By ID

```http
GET /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

---

## Update Notification Event

```http
PATCH /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

---

## Delete Notification Event

```http
DELETE /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Full URL

```txt
https://iotbridge.click/organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

---

# Users

## Search Users

```http
GET /users/search
```

### Full URL

```txt
https://iotbridge.click/users/search
```

### Role

Admin System.

---

## Get User By ID

```http
GET /users/{userId}
```

### Full URL

```txt
https://iotbridge.click/users/{userId}
```

### Role

Admin System.

---

# DTO Schemas

## PostRegisterDto

```json
{
  "username": "string",
  "email": "string",
  "phone_number": "string",
  "password": "string"
}
```

---

## PostLoginDto

```json
{
  "identity": "string",
  "password": "string"
}
```

---

## PostForgotPasswordDto

```json
{
  "email": "string"
}
```

---

## Mentioned DTOs

- PostResetPasswordDto
- PatchEmailDto
- PatchPasswordDto
- PostProposeDto
- PatchVerifyDto

---