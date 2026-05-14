# IoT Bridge API Documentation

## Base URL

```bash
https://iotbridge.dick/api
```

---

# Authentication API

## 1. Register User

### Endpoint

```http
POST /auth/register
```

### Description

Digunakan untuk melakukan registrasi akun baru.

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "username": "username",
  "email": "user@example.com",
  "phone_number": "08xxxxxxxx",
  "password": "password123"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Check your email and spam folder for a link to verify your account."
}
```

---

# 2. Verify Email

## Endpoint

```http
GET /auth/verify-email
```

### Description

Digunakan untuk verifikasi email pengguna menggunakan token.

### Query Parameters

| Parameter | Type   | Required | Description            |
| ---------- | ------ | -------- | ---------------------- |
| token      | string | Yes      | Token verifikasi email |

### Example Request

```http
GET /auth/verify-email?token=YOUR_TOKEN
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Type

```http
text/html
```

### Response

Endpoint ini akan mengembalikan halaman HTML verifikasi berhasil.

---

# 3. Login

## Endpoint

```http
POST /auth/login
```

### Description

Digunakan untuk login pengguna.

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "identity": "username atau user@example.com atau 08xxxxxxxx",
  "password": "password123"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "User logged in successfully.",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "c353a34c-2aad-44c4-8830-796360c16d2e",
      "role": "Admin System"
    }
  }
}
```

---

# 4. Forgot Password

## Endpoint

```http
POST /auth/forgot-password
```

### Description

Digunakan untuk mengirim email reset password.

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Check your email and spam folder for a link to reset your password."
}
```

---

# 5. Reset Password Page

## Endpoint

```http
GET /auth/reset-password/{token}
```

### Description

Digunakan untuk membuka halaman reset password berdasarkan token.

### Path Parameters

| Parameter | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| token      | string | Yes      | Reset password token |

### Example Request

```http
GET /auth/reset-password/YOUR_RESET_TOKEN
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Type

```http
text/html
```

### Response

Endpoint ini akan mengembalikan halaman form reset password berbentuk HTML.

---

# 6. Reset Password

## Endpoint

```http
POST /auth/reset-password
```

### Description

Digunakan untuk menyimpan password baru pengguna.

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "token": "RESET_PASSWORD_TOKEN",
  "newPassword": "passwordBaru123"
}
```

### Validation Rules

| Field       | Rules                                |
| ------------ | ------------------------------------ |
| newPassword  | Minimal 6 karakter                   |
| newPassword  | Maksimal 20 karakter                 |
| newPassword  | Hanya huruf dan angka                |
| newPassword  | Tidak boleh mengandung spasi         |

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Password updated successfully."
}
```

---

# Authentication Flow

## Register Flow

```text
Register Account
      ↓
Verification Email Sent
      ↓
Click Verification Link
      ↓
Account Verified
      ↓
Login
```

---

## Forgot Password Flow

```text
Request Reset Password
        ↓
Reset Link Sent to Email
        ↓
Open Reset Password Page
        ↓
Input New Password
        ↓
Password Updated
```

---

# Authorization

Gunakan JWT token dari endpoint login untuk mengakses endpoint yang membutuhkan autentikasi.

## Example Authorization Header

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# Notes

- Pastikan email valid saat registrasi.
- Token verifikasi dan reset password bersifat sementara.
- Periksa folder spam jika email tidak masuk ke inbox.
- Password hanya mendukung kombinasi huruf dan angka.
- Endpoint verify-email dan reset-password page mengembalikan halaman HTML.

---

# 7. Get Profile

## Endpoint

```http
GET /auth/profile
```

### Description

Digunakan untuk mengambil data profil user yang sedang login.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "User profile retrieved successfully.",
  "data": {
    "user": {
      "id": "c353a34c-2aad-44c4-8830-796360c16d2e",
      "username": "Bill Valentinov",
      "email": "user@example.com",
      "phone_number": "08xx-xxxx-xxxx",
      "profile_picture": "https://example.com/profile-picture.jpg",
      "role": "Admin System"
    }
  }
}
```

---

# 8. Update Profile

## Endpoint

```http
PATCH /auth/profile
```

### Description

Digunakan untuk memperbarui username, nomor telepon, dan foto profil user.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: multipart/form-data
```

### Request Body

| Field            | Type   | Required | Description        |
| ---------------- | ------ | -------- | ------------------ |
| username         | string | Yes      | Username baru      |
| phone_number     | string | Yes      | Nomor telepon baru |
| profile_picture  | file   | No       | Foto profil user   |

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Profile updated successfully.",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "c353a34c-2aad-44c4-8830-796360c16d2e",
      "username": "Bill Valentinov",
      "email": "user@example.com",
      "phone_number": "08xx-xxxx-xxxx",
      "profile_picture": "https://example.com/profile-picture.jpg",
      "role": "Admin System"
    }
  }
}
```

---

# 9. Change Email

## Endpoint

```http
PATCH /auth/email
```

### Description

Digunakan untuk mengganti email akun user.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "new_email": "user@example.com"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Check your email and spam folder for a link to verify your account."
}
```

---

# 10. Change Password

## Endpoint

```http
PATCH /auth/password
```

### Description

Digunakan untuk mengganti password akun user.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "old_password": "passwordLama123",
  "new_password": "passwordBaru123"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Password changed successfully."
}
```

---

# Organizations API

# 11. Get Organizations List

## Endpoint

```http
GET /organizations/list
```

### Description

Digunakan untuk mengambil daftar organisasi milik user.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response

#### Status Code

```http
200 OK
```

### Response Type

```http
application/json
```

### Example Response

```json
{
  "message": "Organizations retrieved successfully.",
  "data": [
    {
      "id": "organization-id",
      "name": "IoT Organization",
      "description": "Organization description"
    }
  ]
}
```

---

# Security Notes

- Semua endpoint yang memiliki ikon gembok membutuhkan JWT token.
- Token dikirim menggunakan Bearer Authentication.
- Gunakan `multipart/form-data` untuk upload file profile picture.
- Endpoint profile dan organizations hanya bisa diakses user yang sudah login.

---

# Common Headers

## JSON Request

```http
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

## Multipart Request

```http
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 12. Propose Organization

## Endpoint

```http
POST /organizations/propose
```

### Description

Digunakan untuk mengajukan organisasi baru.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "name": "POKDAKAN BINTANG ROSELA JAYA"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Organization proposed successfully, please contact admin system for verification.",
  "data": {
    "id": "cbb5e309-b7e9-424a-a0bf-a0e8b53c93b8",
    "name": "Proposed Organization",
    "description": null,
    "organization_picture": null,
    "status": "Pending",
    "created_by": "cbb5e309-b7e9-424a-a0bf-a0e8b53c93b8",
    "created_at": "2025-04-26T01:31:42.530Z"
  }
}
```

---

# 13. Verify Organization

## Endpoint

```http
PATCH /organizations/verify
```

### Description

Digunakan oleh admin untuk memverifikasi organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "organization_id": "xxxxxx"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Organization verified successfully"
}
```

---

# 14. Unverify Organization

## Endpoint

```http
PATCH /organizations/unverify
```

### Description

Digunakan oleh admin untuk membatalkan verifikasi organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Request Body

```json
{
  "organization_id": "xxxxxx"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Organization unverified successfully"
}
```

---

# 15. Get Organization Profile

## Endpoint

```http
GET /organizations/{organizationId}/profile
```

### Description

Digunakan untuk mengambil detail profil organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Example Request

```http
GET /organizations/organizationId/profile
```

### Success Response

#### Status Code

```http
200 OK
```

### Response Type

```http
application/json
```

### Example Response

```json
{
  "message": "Organization profile retrieved successfully.",
  "data": {
    "id": "organization-id",
    "name": "POKDAKAN BINTANG ROSELA JAYA",
    "description": "Organization description",
    "status": "Pending",
    "organization_picture": "https://example.com/organization-picture.jpg",
    "created_by": "user-id"
  }
}
```

---

# Organizations Authorization Notes

| Endpoint                           | Minimum Role              |
| ---------------------------------- | ------------------------- |
| GET /organizations/list            | Local Member              |
| POST /organizations/propose        | Regular User              |
| PATCH /organizations/verify        | Admin System              |
| PATCH /organizations/unverify      | Admin System              |
| GET /organizations/{id}/profile    | Organization Viewer       |

---

# Organizations Status

| Status   | Description |
| -------- | ----------- |
| Pending  | Menunggu verifikasi admin |
| Verified | Organisasi sudah diverifikasi |
| Rejected | Organisasi ditolak |
| Unverified | Verifikasi organisasi dibatalkan |

---

---

# 16. Update Organization Profile

## Endpoint

```http
PATCH /organizations/{organizationId}/profile
```

### Description

Digunakan untuk memperbarui profil organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: multipart/form-data
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Request Body

| Field                 | Type   | Required | Description              |
| --------------------- | ------ | -------- | ------------------------ |
| name                  | string | Yes      | Nama organisasi          |
| description           | string | Yes      | Deskripsi organisasi     |
| organization_picture  | file   | No       | Foto organisasi          |
| location              | string | Yes      | Lokasi organisasi        |

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Organization profile updated successfully.",
  "data": {
    "id": "4cd1eb2f-319f-42aa-8a04-40e1728ecdfc",
    "name": "POKDAKAN BINTANG ROSELA JAYA",
    "description": "kolam ikan lampung",
    "organization_picture": "http://localhost:3000/uploads/organization_picture/1745810588643-360135057.png",
    "location": null
  }
}
```

---

# 17. Search Organization Members

## Endpoint

```http
GET /organizations/{organizationId}/search-members
```

### Description

Digunakan untuk mencari member organisasi berdasarkan username, email, atau nomor telepon.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Query Parameters

| Parameter | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| identity   | string | Yes      | Keyword pencarian user |

### Example Request

```http
GET /organizations/{organizationId}/search-members?identity=bill
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Users list",
  "data": [
    {
      "id": "0555f6b5-c724-45a6-87cf-95786eb2a020",
      "username": "Bill Valentinov",
      "email": "valentinovbil10@gmail.com",
      "phone_number": "085691496242"
    }
  ]
}
```

---

# 18. Member Invitation

## Endpoint

```http
POST /organizations/{organizationId}/member-invitation
```

### Description

Digunakan untuk mengundang user menjadi member organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Request Body

```json
{
  "user_id": "xxxxxx"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Member invitation successfully.",
  "data": {
    "organization_member": {
      "id": "921df4c5-6c5c-46aa-8f60-44f0810a65c2",
      "user_id": "25d35595-fd8c-4f3f-ad93-023a7c799bd4",
      "organization_id": "4cd1eb2f-319f-42aa-8a04-40e1728ecdfc",
      "role": "Viewer",
      "status": "Pending"
    }
  }
}
```

---

# 19. Member Invitation Response

## Endpoint

```http
PATCH /organizations/{organizationId}/member-invitation-response
```

### Description

Digunakan oleh user untuk menerima atau menolak undangan organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Request Body

```json
{
  "is_accepted": true
}
```

### Request Body Description

| Field        | Type    | Required | Description |
| ------------ | ------- | -------- | ----------- |
| is_accepted  | boolean | Yes      | Status penerimaan undangan |

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Invitation response submitted successfully."
}
```

---

# Organization Roles

| Role               | Description |
| ------------------ | ----------- |
| Admin Organization | Pengelola organisasi |
| Viewer             | Member biasa organisasi |

---

# Organization Member Status

| Status   | Description |
| -------- | ----------- |
| Pending  | Menunggu respon user |
| Accepted | Undangan diterima |
| Rejected | Undangan ditolak |

---

---

# 20. Create Local Member

## Endpoint

```http
POST /organizations/{organizationId}/local-member
```

### Description

Digunakan untuk membuat akun local member pada organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Request Body

```json
{
  "username": "username",
  "password": "password123"
}
```

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Local member created successfully.",
  "data": {
    "user": {
      "id": "25d35595-fd8c-4f3f-ad93-023a7c799bd4",
      "username": "Bill Valentinov",
      "role": "LOCAL_MEMBER"
    },
    "organization": {
      "id": "921df4c5-6c5c-46aa-8f60-44f0810a65c2",
      "user_id": "25d35595-fd8c-4f3f-ad93-023a7c799bd4",
      "organization_id": "4cd1eb2f-319f-42aa-8a04-40e1728ecdfc",
      "role": "Viewer",
      "status": "Accepted"
    }
  }
}
```

---

# 21. Get Member List

## Endpoint

```http
GET /organizations/{organizationId}/member-list
```

### Description

Digunakan untuk mengambil daftar member organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "List member of organization.",
  "data": [
    {
      "user_id": "da50de59-1f67-4007-ab33-3de8d08825b9",
      "username": "Kanaya",
      "role": "Admin"
    }
  ]
}
```

---

# 22. Change Member Roles

## Endpoint

```http
PATCH /organizations/{organizationId}/member-roles
```

### Description

Digunakan untuk mengubah role member organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Request Headers

```http
Content-Type: application/json
```

### Path Parameters

| Parameter      | Type   | Required | Description   |
| -------------- | ------ | -------- | ------------- |
| organizationId | string | Yes      | ID organisasi |

### Request Body

```json
{
  "user_id": "xxxxxx",
  "new_role": "Operator"
}
```

### Request Body Description

| Field      | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| user_id    | string | Yes      | ID user member |
| new_role   | string | Yes      | Role baru member |

### Success Response

#### Status Code

```http
200 OK
```

#### Response Body

```json
{
  "message": "Member roles changed successfully."
}
```

---

# 23. Delete Member

## Endpoint

```http
DELETE /organizations/{organizationId}/member/{userId}
```

### Description

Digunakan untuk menghapus member dari organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| userId         | string | Yes      | ID user |

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Member deleted successfully."
}
```

---

# 24. Leave Organization

## Endpoint

```http
DELETE /organizations/{organizationId}/leave
```

### Description

Digunakan untuk keluar dari organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Leave organization successfully."
}
```

---

# Organization Member Roles

| Role           | Description |
| -------------- | ----------- |
| Admin          | Pengelola utama organisasi |
| Operator       | Pengelola operasional organisasi |
| Viewer         | Member biasa organisasi |
| LOCAL_MEMBER   | Member lokal internal organisasi |

---

# Organization Permission Matrix

| Endpoint | Minimal Role |
| -------- | ------------- |
| POST /organizations/{id}/local-member | Organization Admin |
| GET /organizations/{id}/member-list | Organization Viewer |
| PATCH /organizations/{id}/member-roles | Organization Admin |
| DELETE /organizations/{id}/member/{userId} | Organization Admin |
| DELETE /organizations/{id}/leave | Organization Viewer |

---

---

# 25. Search Organizations

## Endpoint

```http
GET /organizations/search
```

### Description

Digunakan untuk mencari organisasi berdasarkan keyword.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Query Parameters

| Parameter | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| keyword    | string | Yes      | Keyword pencarian organisasi |

### Example Request

```http
GET /organizations/search?keyword=organization
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "List of organizations.",
  "data": [
    {
      "name": "organization_test",
      "status": "Pending"
    }
  ]
}
```

---

# 26. Get Organization By ID

## Endpoint

```http
GET /organizations/{organizationId}
```

### Description

Digunakan untuk mengambil detail organisasi berdasarkan ID.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |

### Example Request

```http
GET /organizations/{organizationId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Organization detail.",
  "data": {
    "id": "organization-id",
    "name": "POKDAKAN BINTANG ROSELA JAYA",
    "description": "Organization description",
    "status": "Verified"
  }
}
```

---

# Notifications API

# 27. Get Notifications

## Endpoint

```http
GET /notifications
```

### Description

Digunakan untuk mengambil daftar notifikasi user.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Notifications.",
  "data": [
    {
      "id": "15b292bc-2e5f-4d5d-a808-c5c3dd951073",
      "subject": "Pengajuan organisasi baru: POKDAKAN BINTANG ROSELA JAYA 3",
      "message": "User pak Eko mengajukan organisasi: POKDAKAN BINTANG ROSELA JAYA 3",
      "type": "organization_propose",
      "created_at": "2025-04-26T13:21:37.416Z"
    }
  ]
}
```

---

# 28. Delete All Notifications

## Endpoint

```http
DELETE /notifications
```

### Description

Digunakan untuk menghapus semua notifikasi user.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Successfully delete all notifications."
}
```

---

# 29. Delete Notification By ID

## Endpoint

```http
DELETE /notifications/{notificationId}
```

### Description

Digunakan untuk menghapus notifikasi berdasarkan ID.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| notificationId | string | Yes      | ID notifikasi |

### Example Request

```http
DELETE /notifications/{notificationId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Successfully delete notification."
}
```

---

# Notification Types

| Type                    | Description |
| ----------------------- | ----------- |
| organization_propose    | Pengajuan organisasi baru |
| member_invitation       | Undangan menjadi member organisasi |
| organization_verified   | Organisasi berhasil diverifikasi |
| organization_unverified | Verifikasi organisasi dibatalkan |

---

# Notifications Authorization

| Endpoint | Minimal Role |
| -------- | ------------- |
| GET /notifications | Local Member |
| DELETE /notifications | Local Member |
| DELETE /notifications/{id} | Local Member |

---

---

# Devices API

# 30. Create Device

## Endpoint

```http
POST /organizations/{organizationId}/devices
```

### Description

Digunakan untuk membuat device baru pada organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter      | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| organizationId | string | Yes      | ID organisasi |

### Request Body

| Field | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| name  | string | Yes      | Nama device |

### Example Request

```json
{
  "name": "KOLAM A - RAS"
}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Device created successfully.",
  "data": {
    "id": "device-id",
    "name": "KOLAM A - RAS"
  }
}
```

---

# 31. Search Devices

## Endpoint

```http
GET /organizations/{organizationId}/devices/search
```

### Description

Digunakan untuk mencari device berdasarkan nama.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| organizationId | string | Yes      | ID organisasi |

### Query Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| name      | string | Yes      | Nama device |

### Example Request

```http
GET /organizations/{organizationId}/devices/search?name=KOLAM
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "List devices.",
  "data": [
    {
      "id": "device-id",
      "name": "KOLAM A - RAS"
    }
  ]
}
```

---

# 32. Get Device By ID

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}
```

### Description

Digunakan untuk mengambil detail device berdasarkan ID.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Device detail.",
  "data": {
    "id": "device-id",
    "name": "KOLAM A - RAS"
  }
}
```

---

# 33. Update Device

## Endpoint

```http
PATCH /organizations/{organizationId}/devices/{deviceId}
```

### Description

Digunakan untuk memperbarui data device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Request Body

| Field | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| name  | string | Yes      | Nama device |

### Example Request

```json
{
  "name": "KOLAM A - RAS"
}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Device updated successfully."
}
```

---

# 34. Delete Device

## Endpoint

```http
DELETE /organizations/{organizationId}/devices/{deviceId}
```

### Description

Digunakan untuk menghapus device dari organisasi.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Example Request

```http
DELETE /organizations/{organizationId}/devices/{deviceId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Device deleted successfully."
}
```

---

# 35. Get Pin List

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}/pin-list
```

### Description

Digunakan untuk mengambil daftar pin pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}/pin-list
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Pin list.",
  "data": [
    {
      "pin": 1,
      "label": "PH Sensor"
    },
    {
      "pin": 2,
      "label": "Temperature Sensor"
    }
  ]
}
```

---

# Devices Authorization Matrix

| Endpoint | Minimal Role |
| -------- | ------------- |
| POST /organizations/{organizationId}/devices | Organization Operator |
| GET /organizations/{organizationId}/devices/search | Organization Viewer |
| GET /organizations/{organizationId}/devices/{deviceId} | Organization Viewer |
| PATCH /organizations/{organizationId}/devices/{deviceId} | Organization Operator |
| DELETE /organizations/{organizationId}/devices/{deviceId} | Organization Operator |
| GET /organizations/{organizationId}/devices/{deviceId}/pin-list | Organization Viewer |

---

---

# Widget Boxes API

# 36. Create or Update Widget Box

## Endpoint

```http
PUT /organizations/{organizationId}/devices/{deviceId}/widget-boxes
```

### Description

Digunakan untuk membuat atau memperbarui widget box pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Request Body

| Field         | Type   | Required | Description |
| ------------- | ------ | -------- | ----------- |
| id            | string | Yes      | ID widget box |
| name          | string | Yes      | Nama widget |
| pin           | string | Yes      | Pin sensor |
| unit          | string | Yes      | Satuan data |
| min_value     | string | Yes      | Nilai minimum |
| max_value     | string | Yes      | Nilai maksimum |
| default_value | string | Yes      | Nilai default |

### Example Request

```json
{
  "id": "xxxxxx",
  "name": "suhu",
  "pin": "V1",
  "unit": "Celcius",
  "min_value": "0",
  "max_value": "100",
  "default_value": "50"
}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Widget box updated successfully."
}
```

---

# 37. Get Widget Box List

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/list
```

### Description

Digunakan untuk mengambil daftar widget box pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/list
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Widget boxes list retrieved successfully.",
  "data": [
    {
      "id": "widget-box-id",
      "name": "suhu",
      "pin": "V1",
      "unit": "Celcius"
    }
  ]
}
```

---

# 38. Get Widget Box By ID

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

### Description

Digunakan untuk mengambil detail widget box berdasarkan ID.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |
| widgetBoxId    | string | Yes      | ID widget box |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Widget box detail.",
  "data": {
    "id": "widget-box-id",
    "name": "suhu",
    "pin": "V1",
    "unit": "Celcius",
    "min_value": "0",
    "max_value": "100",
    "default_value": "50"
  }
}
```

---

# 39. Delete Widget Box

## Endpoint

```http
DELETE /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

### Description

Digunakan untuk menghapus widget box pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |
| widgetBoxId    | string | Yes      | ID widget box |

### Example Request

```http
DELETE /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Widget box deleted successfully."
}
```

---

# 40. Get Device Report

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}/report
```

### Description

Digunakan untuk mengambil laporan data device berdasarkan pin dan rentang waktu.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Query Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| start     | string | Yes      | Waktu mulai |
| end       | string | Yes      | Waktu selesai |
| pin       | string | Yes      | Pin sensor |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}/report?start=2025-05-01&end=2025-05-10&pin=V2
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Report retrieved successfully.",
  "data": [
    {
      "pin": "V2",
      "value": 31.45,
      "time": "2025-05-10T10:12:50.625Z"
    },
    {
      "pin": "V2",
      "value": 47.6,
      "time": "2025-05-10T10:12:50.625Z"
    }
  ]
}
```

---

# 41. Create Notification Event

## Endpoint

```http
POST /organizations/{organizationId}/devices/{deviceId}/notification-events
```

### Description

Digunakan untuk membuat notification event pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Request Body

| Field      | Type   | Required | Description |
| ---------- | ------ | -------- | ----------- |
| title      | string | Yes      | Judul notifikasi |
| pin        | string | Yes      | Pin sensor |
| condition  | string | Yes      | Kondisi trigger |
| value      | number | Yes      | Nilai trigger |

### Example Request

```json
{
  "title": "Suhu Tinggi",
  "pin": "V1",
  "condition": ">",
  "value": 40
}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Notification event created successfully."
}
```

---

# Widget Boxes & Reports Authorization Matrix

| Endpoint | Minimal Role |
| -------- | ------------- |
| PUT /organizations/{organizationId}/devices/{deviceId}/widget-boxes | Organization Operator |
| GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/list | Organization Viewer |
| GET /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId} | Organization Viewer |
| DELETE /organizations/{organizationId}/devices/{deviceId}/widget-boxes/{widgetBoxId} | Organization Operator |
| GET /organizations/{organizationId}/devices/{deviceId}/report | Organization Viewer |
| POST /organizations/{organizationId}/devices/{deviceId}/notification-events | Organization Operator |

---

---

# 42. Get Notification Events List

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}/notification-events/list
```

### Description

Digunakan untuk mengambil daftar notification events pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter      | Type   | Required | Description |
| -------------- | ------ | -------- | ----------- |
| organizationId | string | Yes      | ID organisasi |
| deviceId       | string | Yes      | ID device |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}/notification-events/list
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Notification events list.",
  "data": [
    {
      "id": "notification-event-id",
      "pin": "V1",
      "subject": "Suhu terlalu dingin",
      "message": "Suhu terlalu dingin, nyalakan pompa",
      "comparison_type": "=",
      "threshold_value": "50",
      "is_active": true
    }
  ]
}
```

---

# 43. Get Notification Event By ID

## Endpoint

```http
GET /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Description

Digunakan untuk mengambil detail notification event berdasarkan ID.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Viewer
```

### Path Parameters

| Parameter           | Type   | Required | Description |
| ------------------- | ------ | -------- | ----------- |
| organizationId      | string | Yes      | ID organisasi |
| deviceId            | string | Yes      | ID device |
| notificationEventId | string | Yes      | ID notification event |

### Example Request

```http
GET /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Notification event detail.",
  "data": {
    "id": "notification-event-id",
    "pin": "V1",
    "subject": "Suhu terlalu dingin",
    "message": "Suhu terlalu dingin, nyalakan pompa",
    "comparison_type": "=",
    "threshold_value": "50",
    "is_active": true
  }
}
```

---

# 44. Update Notification Event

## Endpoint

```http
PATCH /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Description

Digunakan untuk memperbarui notification event pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter           | Type   | Required | Description |
| ------------------- | ------ | -------- | ----------- |
| organizationId      | string | Yes      | ID organisasi |
| deviceId            | string | Yes      | ID device |
| notificationEventId | string | Yes      | ID notification event |

### Request Body

| Field            | Type    | Required | Description |
| ---------------- | ------- | -------- | ----------- |
| pin              | string  | Yes      | Pin sensor |
| subject          | string  | Yes      | Judul notifikasi |
| message          | string  | Yes      | Isi notifikasi |
| comparison_type  | string  | Yes      | Jenis perbandingan |
| threshold_value  | string  | Yes      | Nilai threshold |
| is_active        | boolean | Yes      | Status aktif |

### Example Request

```json
{
  "pin": "V1",
  "subject": "suhu terlalu dingin",
  "message": "suhu terlalu dingin, nyalakan pompa",
  "comparison_type": "=",
  "threshold_value": "50",
  "is_active": true
}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Notification event updated successfully."
}
```

---

# 45. Delete Notification Event

## Endpoint

```http
DELETE /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Description

Digunakan untuk menghapus notification event pada device.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Organization Operator
```

### Path Parameters

| Parameter           | Type   | Required | Description |
| ------------------- | ------ | -------- | ----------- |
| organizationId      | string | Yes      | ID organisasi |
| deviceId            | string | Yes      | ID device |
| notificationEventId | string | Yes      | ID notification event |

### Example Request

```http
DELETE /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Notification event deleted successfully."
}
```

---

# 46. Search Users

## Endpoint

```http
GET /users/search
```

### Description

Digunakan untuk mencari user berdasarkan identity.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Admin System
```

### Query Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| identity  | string | Yes      | Username / email / identitas user |

### Example Request

```http
GET /users/search?identity=kanaya
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Users list",
  "data": [
    {
      "id": "0555f6b5-c724-45a6-87cf-95786eb2a020",
      "username": "Bill Valentinov",
      "email": "valentinovbil10@gmail.com"
    }
  ]
}
```

---

# 47. Get User By ID

## Endpoint

```http
GET /users/{userId}
```

### Description

Digunakan untuk mengambil detail user berdasarkan ID.

### Authorization

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Minimal Role

```text
Admin System
```

### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| userId    | string | Yes      | ID user |

### Example Request

```http
GET /users/{userId}
```

### Success Response

#### Status Code

```http
200 OK
```

### Example Response

```json
{
  "message": "Users details.",
  "data": {
    "username": "Kanaya",
    "email": "valentinur8060@gmail.com",
    "phone_number": "+628123456789"
  }
}
```

---

# Notification Events & Users Authorization Matrix

| Endpoint | Minimal Role |
| -------- | ------------- |
| GET /organizations/{organizationId}/devices/{deviceId}/notification-events/list | Organization Viewer |
| GET /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId} | Organization Viewer |
| PATCH /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId} | Organization Operator |
| DELETE /organizations/{organizationId}/devices/{deviceId}/notification-events/{notificationEventId} | Organization Operator |
| GET /users/search | Admin System |
| GET /users/{userId} | Admin System |

---

