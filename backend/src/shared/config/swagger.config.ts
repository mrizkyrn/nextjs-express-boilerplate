import { Options } from 'swagger-jsdoc';
import { env } from './environment.config';

export const swaggerConfig: Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Next.js Express Boilerplate API',
      version: '1.0.0',
      description: `
## Overview
A full-stack boilerplate API with authentication, user management, and role-based access control.

## Authentication
This API uses JWT-based authentication with two token types:
- **Access Token**: Short-lived token sent in the Authorization header
- **Refresh Token**: Long-lived token stored in HTTP-only cookie

### Authentication Flow
1. Login with email/password to receive tokens
2. Use access token in the Authorization header: \`Bearer <token>\`
3. When access token expires, use the refresh endpoint to get a new one
4. Logout clears the refresh token cookie

## Authorization
- **Public**: Endpoints accessible without authentication
- **Authenticated**: Requires valid access token
- **Admin Only**: Requires valid access token with ADMIN role

## Rate Limiting
API endpoints have rate limiting to prevent abuse:
- **Authentication endpoints** (\`/api/auth/login\`, \`/api/auth/register\`, etc.): 5 requests per 15 minutes
- **General API endpoints**: 100 requests per 15 minutes

## Error Responses
All error responses follow this format:
\`\`\`json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
\`\`\`

Common HTTP status codes:
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing or invalid authentication
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource not found
- **409**: Conflict - Resource already exists
- **422**: Unprocessable Entity - Validation errors
- **429**: Too Many Requests - Rate limit exceeded
- **500**: Internal Server Error - Server error

## Quick Start
1. **Register**: Create a new account at \`POST /api/auth/register\`
2. **Login**: Get your access token at \`POST /api/auth/login\`
3. **Authorize**: Click the "Authorize" button and paste your access token
4. **Try it out**: Test protected endpoints with "Try it out" button
      `.trim(),
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.app.port}`,
        description: 'Development server',
      },
      {
        url: 'https://staging-api.example.com',
        description: 'Staging server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Auth',
        description: 'Authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your access token (without "Bearer" prefix)',
        },
        CookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'Refresh token stored in HTTP-only cookie (automatically sent by browser)',
        },
      },
      schemas: {}, // Will be populated by Zod schemas
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/**/*.route.ts',
    './src/core/app.ts',
  ],
};
