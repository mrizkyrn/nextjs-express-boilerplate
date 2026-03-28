# Testing Utilities

This directory contains reusable mocks, fixtures, and helpers for testing the backend application.

## Directory Structure

```
src/test/
├── mocks/          # Mock implementations of external dependencies
├── fixtures/       # Test data generators
├── helpers/        # Test utility functions (future)
└── setup.ts        # Global test setup (reflect-metadata, global mocks)

.env.test           # Test environment variables (in project root)
```

## Environment Configuration

Test environment variables are managed in `.env.test` at the project root:
- Loaded automatically by `jest.config.js` before tests run
- Separate test database to avoid conflicts
- Safe to commit (no real secrets)

## Mocks

### Prisma Mock (`mocks/prisma.mock.ts`)
Mock Prisma client for database operations.

```typescript
import { createMockPrisma } from '@/test/mocks/prisma.mock';

const mockPrisma = createMockPrisma();
mockPrisma.user.findUnique.mockResolvedValue(testUser);
```

### Email Service Mock (`mocks/email.mock.ts`)
Mock email service to prevent actual email sending.

```typescript
import { createMockEmailService } from '@/test/mocks/email.mock';

const mockEmailService = createMockEmailService();
expect(mockEmailService.sendVerifyEmail).toHaveBeenCalled();
```

### Express Mocks (`mocks/express.mock.ts`)
Mock Express Request, Response, and NextFunction.

```typescript
import { createMockRequest, createMockResponse, createMockNext } from '@/test/mocks/express.mock';

const req = createMockRequest({ body: { email: 'test@test.com' } });
const res = createMockResponse();
const next = createMockNext();
```

### Logger Mock (`mocks/logger.mock.ts`)
Mock Winston logger to prevent console output.

```typescript
import { createMockLogger } from '@/test/mocks/logger.mock';

const mockLogger = createMockLogger();
expect(mockLogger.info).toHaveBeenCalledWith('Expected message');
```

## Fixtures

### User Fixtures (`fixtures/user.fixture.ts`)
Pre-configured test users for various scenarios.

```typescript
import { 
  createTestUser, 
  createAdminUser, 
  createUnverifiedUser 
} from '@/test/fixtures/user.fixture';

const user = createTestUser({ email: 'custom@test.com' });
const admin = createAdminUser();
const unverified = createUnverifiedUser();
```

### Auth Fixtures (`fixtures/auth.fixture.ts`)
Test data for authentication flows.

```typescript
import { 
  createValidLoginData, 
  createTestTokenPair 
} from '@/test/fixtures/auth.fixture';

const loginData = createValidLoginData();
const tokens = createTestTokenPair();
```

## Usage Examples

### Testing a Service

```typescript
import { createMockPrisma } from '@/test/mocks/prisma.mock';
import { createTestUser } from '@/test/fixtures/user.fixture';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    userService = new UserService(mockPrisma as any);
  });

  it('should get user by id', async () => {
    const testUser = createTestUser();
    mockPrisma.user.findUnique.mockResolvedValue(testUser);

    const result = await userService.getUserById('test-user-id');

    expect(result.id).toBe(testUser.id);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
      select: expect.any(Object),
    });
  });
});
```

### Testing a Controller

```typescript
import { createMockRequest, createMockResponse, createMockNext } from '@/test/mocks/express.mock';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('should handle login request', async () => {
    const req = createMockRequest({
      body: { email: 'test@test.com', password: 'Password123!' }
    });
    const res = createMockResponse();

    await authController.login(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Use fixtures for test data** - Don't create users manually in each test
2. **Reset mocks between tests** - Use `jest.clearAllMocks()` in `afterEach`
3. **Mock external dependencies only** - Don't mock your own utilities
4. **Keep tests isolated** - Each test should be independent
5. **Use descriptive names** - `should return user when valid ID provided`
