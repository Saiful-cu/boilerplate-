# Production Boilerplate - Frontend + Backend

## Overview

This is a production-grade, company-wide boilerplate for building scalable web applications with a decoupled frontend and backend architecture.

## Architecture Decisions

### Separation of Concerns
- **Frontend** and **Backend** are completely decoupled
- Communication happens exclusively via HTTP API
- No shared runtime dependencies
- Each service can be deployed, scaled, and maintained independently

### Type Safety
- TypeScript strict mode enforced everywhere
- No `any` types allowed
- Shared contracts defined explicitly (no type duplication)
- Type checking enforced in CI

### Error Handling
- Structured error handling throughout
- Frontend: User-safe error messages
- Backend: Centralized error middleware
- No silent failures

### Configuration Management
- Environment-based configuration
- All config validated at startup
- App crashes if configuration is invalid
- No magic strings or hardcoded values

## Project Structure

```
root/
├── frontend/          → Next.js application (React + TypeScript)
├── backend/           → MongoDB worker + library (no HTTP server)
├── .github/
│   └── workflows/     → CI/CD pipelines
├── docker-compose.yml → Local development environment
└── README.md          → This file
```

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- Docker & Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env.local

   # Backend
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` files with your configuration.

4. **Start with Docker Compose (recommended for local dev)**
   ```bash
   docker-compose up
   ```
   - Frontend: http://localhost:3000
   - Backend worker: running inside the backend container (see `docker-compose.yml`)

5. **Or start services individually**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Development Workflow

### Adding a New Feature

1. **Identify the layer**: Is this UI, business logic, or infrastructure?
2. **Follow folder conventions**: Place code where it belongs, not where it "just works"
3. **Define types first**: Create interfaces before implementation
4. **Write code**: Follow the style guide and linting rules
5. **Test locally**: Ensure both frontend and backend work together
6. **Run checks**: `npm run lint`, `npm run type-check`, `npm run build`
7. **Commit**: CI will enforce all checks

### Breaking Standards Protection

This boilerplate is designed to prevent common mistakes:

- **No `any` types**: TypeScript strict mode will catch this
- **No magic strings**: ESLint rules enforce constants
- **No silent errors**: Error handling is centralized and required
- **No inline config**: Config layer is the single source of truth
- **CI enforcement**: Pull requests cannot merge if checks fail

## Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## CI/CD Pipeline

Every push triggers:
1. Dependency installation
2. Linting (fails on warnings)
3. Type checking (strict)
4. Build verification
5. All steps must pass

## Docker

### Development
```bash
docker-compose up
```

### Production Build
```bash
# Frontend
docker build -t app-frontend ./frontend

# Backend
docker build -t app-backend ./backend
```

## Environment Variables

### Development
- Use `.env.local` (frontend) and `.env` (backend)
- Never commit actual environment files
- `.env.example` files document all required variables

### Production
- Set environment variables in your deployment platform
- All variables must be defined (app will crash if missing)

## Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Standards & Conventions

This project enforces strict engineering standards:

1. **Correctness over cleverness**: No hacks or shortcuts
2. **Explicit over implicit**: Clarity beats brevity
3. **Maintainability over speed**: Code should be readable in 6 months
4. **Consistency over personal preference**: Follow existing patterns

### What NOT To Do

❌ Over-engineering simple problems
❌ Under-engineering critical paths
❌ Adding libraries without justification
❌ Writing code that only works for happy paths
❌ Silencing lint or type errors
❌ Copying patterns without understanding them

### Review Checklist

Before committing code, verify:

- [ ] Does this introduce hidden complexity?
- [ ] Does this break an existing convention?
- [ ] Will this confuse a junior engineer?
- [ ] Will this scale without refactoring?
- [ ] Are all types explicit and correct?
- [ ] Are errors handled properly?
- [ ] Is configuration externalized?

## Support

For questions or issues:
1. Check the relevant README (frontend or backend)
2. Review existing code for patterns
3. Consult with the team lead

## License

[Specify your license here]
