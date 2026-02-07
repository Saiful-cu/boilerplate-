# Frontend - Production-Grade Next.js Application

## Overview

This is a production-grade Next.js application with strict TypeScript, comprehensive error handling, and centralized configuration management.

## Directory Structure

```
frontend/
├── app/                    → Next.js App Router pages and layouts
│   ├── layout.tsx         → Root layout component
│   ├── error.tsx          → Global error boundary
│   ├── loading.tsx        → Loading skeleton
│   ├── not-found.tsx      → 404 page
│   └── page.tsx           → Home page
├── components/            → Reusable React components
│   ├── ui/               → Base UI components (Button, Input, etc)
│   ├── layout/           → Layout components (Header, Footer, Sidebar)
│   └── shared/           → Shared components across features
├── lib/                   → Utilities and libraries
│   ├── errors/           → Error handling (AppError, normalization)
│   ├── http/             → HTTP client (centralized API communication)
│   ├── logger/           → Client-side logging
│   └── validators/       → Input validation
├── config/               → Configuration management
├── types/                → Global TypeScript types
├── styles/               → Global styles and Tailwind CSS
├── public/               → Static assets
├── package.json          → Dependencies and scripts
├── tsconfig.json         → TypeScript strict configuration
├── next.config.js        → Next.js configuration
├── .eslintrc.json        → ESLint rules
├── .prettierrc            → Prettier formatting
├── .env.example          → Environment variable template
└── README.md             → This file
```

## Core Principles

### 1. Configuration Management
- **Single Source of Truth**: All configuration comes from `config/index.ts`
- **Validation at Startup**: Configuration is validated when the app loads
- **Environment-Based**: Different values for development, staging, production
- **No Hardcoded Values**: All URLs, timeouts, and settings are configurable

```typescript
// ✅ Correct: Use centralized config
import { config } from '@/config';
const apiUrl = config.apiBaseUrl;

// ❌ Wrong: Direct environment variable access
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// ❌ Wrong: Hardcoded values
const apiUrl = 'http://localhost:4000';
```

### 2. Error Handling
- **Centralized**: All API errors go through `lib/errors/index.ts`
- **Normalized**: Different error types are converted to `AppError`
- **User-Friendly**: Internal details never shown to users
- **Structured**: Errors have `code`, `message`, and `status`

```typescript
// ✅ Correct: Catch and normalize errors
try {
  await httpClient.get('/api/users');
} catch (error) {
  const appError = normalizeError(error);
  showUserMessage(getUserFriendlyMessage(appError.code));
}

// ❌ Wrong: Show raw error to user
catch (error) {
  alert((error as Error).message);
}
```

### 3. HTTP Communication
- **Centralized Client**: `lib/http/client.ts` for all API calls
- **Automatic Base URL**: Base URL injected automatically
- **Error Handling**: Errors normalized into AppError
- **Timeout Handling**: Automatic timeout with configurable duration
- **Type-Safe**: All responses are typed

```typescript
// ✅ Correct: Use HTTP client
const response = await httpClient.get<User>('/api/users/me');

// ❌ Wrong: Direct fetch calls
const response = await fetch('http://localhost:4000/api/users/me');
```

### 4. Type Safety
- **Strict Mode**: TypeScript strict mode enabled
- **No `any`**: Never use `any` types
- **Explicit Types**: All function parameters and returns are typed
- **Discriminated Unions**: Use unions instead of loose objects

```typescript
// ✅ Correct: Explicit types
function handleResponse(data: User): void {
  console.log(data.id, data.name);
}

// ❌ Wrong: No types
function handleResponse(data: any): void {
  console.log(data.id, data.name);
}
```

### 5. Component Design
- **Small & Focused**: Components do one thing well
- **Props Typed**: All props have explicit TypeScript types
- **Server Components Default**: Use Server Components unless you need client features
- **Client Boundary**: Mark client components with `'use client'`

```typescript
// ✅ Correct: Small, focused component
interface LoginFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps): ReactNode {
  // Implementation
}

// ❌ Wrong: Too many responsibilities
export function Page(): ReactNode {
  // handles auth, data fetching, rendering, error handling, etc
}
```

## Environment Variables

All environment variables must be defined in `.env.example` with clear documentation.

### Development
```bash
cp .env.example .env.local
# Edit .env.local with your local configuration
```

### Production
Set environment variables in your deployment platform (Vercel, AWS, etc).

**Required Variables:**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL

## Available Scripts

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Type checking
npm run type-check   # Run TypeScript compiler check

# Linting & Formatting
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes

# Building
npm run build        # Create production build
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

## Adding New Features

### 1. API Integration
```typescript
// 1. Define types
interface User {
  id: string;
  name: string;
  email: string;
}

// 2. Create API service
// lib/api/users.ts
export async function fetchUser(id: string): Promise<User> {
  const response = await httpClient.get<User>(`/api/users/${id}`);
  return response.data;
}

// 3. Use in component
import { fetchUser } from '@/lib/api/users';

export async function UserProfile({ id }: { id: string }): Promise<ReactNode> {
  const user = await fetchUser(id);
  return <div>{user.name}</div>;
}
```

### 2. Error Handling in Components
```typescript
'use client';

import { getUserFriendlyMessage, normalizeError } from '@/lib/errors';

export function MyComponent(): ReactNode {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(): Promise<void> {
    try {
      await someApiCall();
      setError(null);
    } catch (unknownError) {
      const appError = normalizeError(unknownError);
      setError(getUserFriendlyMessage(appError.code));
    }
  }

  return (
    <>
      {error && <ErrorAlert message={error} />}
      <button onClick={handleAction}>Do Something</button>
    </>
  );
}
```

### 3. New Component
```typescript
// components/ui/Card.tsx
import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children: ReactNode;
}

export function Card({ title, children }: CardProps): ReactNode {
  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

// Use it
import { Card } from '@/components/ui/Card';

export function HomePage(): ReactNode {
  return <Card title="Welcome">Hello!</Card>;
}
```

## Testing

### Unit Tests
```typescript
// __tests__/utils/validators.test.ts
describe('validateEmail', () => {
  it('should return true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('should render email input', () => {
    render(<LoginForm onSubmit={() => Promise.resolve()} isLoading={false} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  });
});
```

## Common Mistakes to Avoid

### ❌ Don't do this:

1. **Direct `process.env` access**
   ```typescript
   const url = process.env.NEXT_PUBLIC_API_BASE_URL; // Wrong!
   ```

2. **Hardcoded URLs**
   ```typescript
   await fetch('http://localhost:4000/api/data'); // Wrong!
   ```

3. **Unhandled errors**
   ```typescript
   const data = await someApiCall(); // What if it fails?
   ```

4. **Using `any` types**
   ```typescript
   function handleData(data: any): void { } // Wrong!
   ```

5. **Showing raw errors to users**
   ```typescript
   alert((error as Error).message); // Users don't understand technical errors
   ```

6. **Fat components**
   ```typescript
   // 500 lines doing multiple things - Wrong!
   ```

7. **State management chaos**
   ```typescript
   // Passing props through 10 levels of components - Wrong!
   ```

## Support

- Check existing components for patterns
- Review error handling examples
- Read TypeScript strict mode docs if type errors occur
- Look at test files for testing patterns

## Related Documentation

- [Backend Documentation](../backend/README.md)
- [Main README](../README.md)
