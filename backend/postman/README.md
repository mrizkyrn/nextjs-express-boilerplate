# Postman API Test Collections

This folder contains comprehensive Postman collections for testing the NextJS Express Boilerplate API.

## 📁 Files

- **`environment.json`** - Shared environment variables for all collections
- **`auth/Auth_API.postman_collection.json`** - Complete authentication testing
- **`user/User_API.postman_collection.json`** - Complete user management testing

## 🚀 Quick Setup

### 1. Import Collections

1. Open Postman
2. Click **Import** button
3. Drag and drop all JSON files or select them manually
4. Import the environment file: `environment.json`
5. Import the collections from `auth/` and `user/` folders

### 2. Select Environment

1. Click the environment dropdown (top right)
2. Select **"NextJS Express Boilerplate"**

### 3. Update Environment Variables

Edit these variables in the environment:

| Variable        | Description        | Default Value               |
| --------------- | ------------------ | --------------------------- |
| `baseUrl`       | API base URL       | `http://localhost:8000/api` |
| `testEmail`     | Test user email    | `testuser@example.com`      |
| `testPassword`  | Test user password | `Test123456!`               |
| `testName`      | Test user name     | `Test User`                 |
| `adminEmail`    | Admin email        | `admin@example.com`         |
| `adminPassword` | Admin password     | `Admin123456!`              |

> **Note**: Other variables like `accessToken`, `refreshToken`, `userId`, etc. are automatically populated by the test scripts.

### 4. Run Collections

1. Select the collection you want to run (e.g., `Auth_API` or `User_API`)
2. Click the **Run** button
3. Monitor the results in the Postman console
