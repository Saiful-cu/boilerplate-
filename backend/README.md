# Backend - MongoDB worker + library

## Overview

This backend is now a MongoDB-first worker and library (no HTTP server). It provides Mongoose models and service classes (e.g., `users`) and CLI/scripts for DB operations, seeding, and maintenance.

## Directory Structure

```
backend/
├── src/
│   ├── config/           → Configuration management (environment variables)
│   ├── modules/          → Feature modules (services + models, no HTTP routing)
│   │   └── health/       → Health check helper (example, non-HTTP)
│   ├── lib/              → Shared utilities and libraries
│   │   ├── errors/       → Error classes and handling
│   │   └── logger/       → Structured logging
│   ├── server.ts         → Worker entrypoint (long-running Mongo worker)
│   └── cli.ts            → CLI for ad-hoc DB tasks and maintenance
├── package.json          → Dependencies and scripts
├── tsconfig.json         → TypeScript strict configuration
├── .eslintrc.json        → ESLint rules
├── .prettierrc            → Prettier formatting
├── .env.example          → Environment variable template
├── Dockerfile            → Docker configuration
└── README.md             → This file
```

## Core Principles

### 1. Configuration Management
- **Single Source of Truth**: All configuration comes from `config/index.ts`
- **Validation at Startup**: Configuration is validated when the server starts
- **Application Crashes If Invalid**: No silent failures
- **Environment-Based**: Different values for development, staging, production

```typescript
// ✅ Correct: Use centralized config
import { config } from '@/config';
const port = config.port;

// ❌ Wrong: Direct environment variable access
const port = parseInt(process.env.PORT || '4000', 10);

// ❌ Wrong: Hardcoded values
const port = 4000;
```

### 2. Error Handling
- **Structured Errors**: All errors extend `BaseError`
- **Type-Safe**: Errors have standardized code, message, and status
- **Centralized Middleware**: All errors handled in one place
- **User-Safe**: Internal details never exposed to clients
- **Logged with Context**: Full details available for debugging

```typescript
// ✅ Correct: Throw typed errors
if (!user) {
  throw new NotFoundError('User', { userId });
}

// ❌ Wrong: Raw error thrown
if (!user) {
  throw new Error('User not found');
}

// ❌ Wrong: Unhandled exception
const user = users.find(u => u.id === id); // What if undefined?
```

### 3. Structured Logging
- **JSON Format**: All logs are structured JSON
- **Never Concatenate**: Use objects for context
- **Log Levels**: debug, info, warn, error
- **No Secrets**: Never log passwords, tokens, PII
- **Request Tracking**: Include request ID for tracing

```typescript
// ✅ Correct: Structured logging
logger.info('User created', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

// ❌ Wrong: String concatenation
console.log('User created: ' + user.id + ' with email ' + user.email);

// ❌ Wrong: Logging secrets
logger.info('Authentication', {
  username: req.body.username,
  password: req.body.password, // NEVER!
});
```

### 4. Type Safety
- **Strict Mode**: TypeScript strict mode enabled
- **No `any`**: Never use `any` types
- **Explicit Types**: All function parameters and returns are typed
- **Better Errors**: Type system catches bugs early

```typescript
// ✅ Correct: Explicit types
interface CreateUserRequest {
  email: string;
  name: string;
}

async function createUser(cred: CreateUserRequest): Promise<User> {
  // Implementation
}

// ❌ Wrong: No types
async function createUser(data: any): any {
  // Implementation
}
```

### 5. Module Structure
- **One Responsibility**: Each module does one thing
- **Service Layer**: Business logic exposed via service classes (no HTTP routing)
- **Type Safety**: All types defined in the module

```typescript
// modules/users/service.ts
interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

class UserService {
  async create(payload: CreateUserRequest): Promise<User> {
    // Business logic (use UserModel)
  }
}

const userService = new UserService();

// Use programmatically or via `npm run db:cli` / `npm run db:seed`
```

## Environment Variables

All environment variables must be defined in `.env.example` with documentation.

### Development
```bash
cp .env.example .env
# Edit .env with your local configuration
```

### Production
Set environment variables in your deployment platform (AWS, Heroku, etc).

**Required Variables:**
- `NODE_ENV` - Environment (development, staging, production)
- `LOG_LEVEL` - Log level (debug, info, warn, error)
- `MONGO_URI` - MongoDB connection string for the application (e.g., `mongodb://mongo:27017/appdb`)

> **Tip:** If you're using MongoDB Atlas and see errors about "Could not connect to any servers" or similar, make sure your current IP (or 0.0.0.0/0 for testing) is added under **Network Access** in your Atlas project. See: https://www.mongodb.com/docs/atlas/security-whitelist/

## Available Scripts

```bash
# Development (runs the worker)
npm run dev          # Start worker with hot reload (ts-node)

# Production
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start compiled worker (node dist/server.js)
npm run start:worker # Alias to start worker

# DB utilities
npm run db:seed      # Seed the database with example data
npm run db:cli       # Run the DB CLI (use: npm run db:cli -- list-users)

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes

# Testing
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Adding New Features

### 1. Create a New Module
```typescript
// modules/users/service.ts
interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

class UserService {
  async create(payload: CreateUserRequest): Promise<{ id: string }> {
    // Business logic using models (no HTTP layer in backend)
    return { id: '123' };
  }
}

const userService = new UserService();

// Use programmatically or from `src/cli.ts` / `src/scripts/*`
```

### 2. Register the Module
```typescript
// server.ts
import { createUsersRouter } from '@/modules/users/router';

// ...
app.use('/users', createUsersRouter());
```

### 3. Error Handling
```typescript
import { ValidationError, NotFoundError } from '@/lib/errors';

async function getUser(id: string): Promise<User> {
  if (!id) {
    throw new ValidationError('User ID is required');
  }

  const user = await database.findUser(id);
  if (!user) {
    throw new NotFoundError('User', { userId: id });
  }

  return user;
}
```

### 4. Logging
```typescript
import { logger } from '@/lib/logger';

async function createUser(req: UserRequest): Promise<User> {
  logger.info('Creating user', { email: req.email });

  try {
    const user = await database.createUser(req);
    logger.info('User created', { userId: user.id });
    return user;
  } catch (error) {
    logger.error('Failed to create user', error as Error, { email: req.email });
    throw error;
  }
}
```

## Testing

### Unit Tests
```typescript
// modules/users/__tests__/service.test.ts
describe('UserService', () => {
  it('should create a user', async () => {
    const service = new UserService();
    const user = await service.createUser({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should throw ValidationError if email is missing', async () => {
    const service = new UserService();

    await expect(
      service.createUser({ email: '', name: 'Test' })
    ).rejects.toThrow(ValidationError);
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/users.test.ts
describe('POST /users', () => {
  it('should create a user', async () => {
    const res = await request(app).post('/users').send({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('should return 400 for invalid input', async () => {
    const res = await request(app).post('/users').send({
      email: 'invalid',
      name: '',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
```

## Error Responses

All errors are normalized into this format:

```json
{
  "message": "User-friendly error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid input
- `UNAUTHORIZED` (401) - Missing credentials
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Request conflicts with state
- `INTERNAL_SERVER_ERROR` (500) - Unexpected error

## Common Mistakes to Avoid

### ❌ Don't do this:

1. **Direct `process.env` access**
   ```typescript
   const port = parseInt(process.env.PORT || '4000', 10); // Wrong!
   ```

2. **Throwing raw errors**
   ```typescript
   throw new Error('Something failed'); // Wrong!
   ```

3. **Unstructured logging**
   ```typescript
   console.log('User created: ' + user.id); // Wrong!
   ```

4. **No error handling**
   ```typescript
   app.post('/users', (req, res) => {
     const user = createUser(req.body); // What if it throws?
     res.json(user);
   });
   ```

5. **Using `any` types**
   ```typescript
   function validateUser(data: any): any { } // Wrong!
   ```

6. **Logging sensitive info**
   ```typescript
   logger.info('Login', { username, password }); // Never!
   ```

7. **Fat route handlers**
   ```typescript
   // All business logic in the route - Wrong!
   router.post('/users', (req, res) => {
     // 100 lines of business logic
   });
   ```

## Security

### Input Validation
- Validate all request inputs
- Use type-safe validation libraries
- Return validation errors (400) not 500

### Error Messages
- Never expose internal details
- Never show stack traces
- Use user-friendly messages

### Secrets
- Never hardcod secrets
- Never log passwords, tokens, API keys
- Use environment variables

### CORS
- Configure allowed origins
- Restrict methods and headers
- Test in production

## Deployment

### Docker
```bash
docker build -t app-backend ./backend
docker run -p 4000:4000 app-backend
```

### Environment Variables
Set via your deployment platform, never hardcoded.

### Health Check
The `/health` endpoint is available for monitoring:
```bash
curl http://localhost:4000/health
```

## Support

- Check existing modules for patterns
- Review error handling examples
- Read TypeScript strict mode docs if type errors occur
- Look at test files for testing patterns

## Related Documentation

- [Frontend Documentation](../frontend/README.md)
- [Main README](../README.md)
