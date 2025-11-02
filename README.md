# Clinical Trial Data Dashboard - Full Stack Technical Challenge

A full-stack application for managing and visualizing clinical trial participant data, built with Next.js (React) and Flask (Python).

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend       │
│   (Next.js)     │◄────────┤   (Flask)        │
│   Port: 3000    │  HTTP   │   Port: 5000     │
└─────────────────┘         └─────────────────┘
       │                            │
       └─────────────┬──────────────┘
                     │
              ┌──────▼──────┐
              │  SQLite DB  │
              └─────────────┘
```

**Stack**: Next.js 16 (TypeScript) + Flask 3.0 (Python) + SQLite | **Patterns**: DDD-inspired structure, Repository pattern, React Context API

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Running with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd full-stack-technical-challenge
```

2. Start the application:
```bash
docker compose up --build
```

This will:
- Build both frontend and backend containers
- Run database migrations
- Seed the database with test users and participants
- Start both services

3. Access the application:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Test Credentials

The database is automatically seeded with test users:

- **Admin User**
  - Email: `admin@trial.com`
  - Password: `admin123`

- **Researcher**
  - Email: `researcher@trial.com`
  - Password: `research123`

## 🧪 Testing


### How to Test Protected Routes

1. Start the application with Docker:
```bash
docker compose up --build
```

2. Navigate to http://localhost:3000

3. Register a new user or login with test credentials

4. Once authenticated, try accessing:
   - Dashboard: http://localhost:3000/dashboard
   - Participant detail: http://localhost:3000/participants/1

5. Test API directly (requires authentication):
```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trial.com","password":"admin123"}'

# Use token to access protected route
curl -X GET http://localhost:5000/api/participants \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

## 🛠️ Technologies

**Frontend**: Next.js 16, React 19, TypeScript, Axios, Shadcn/ui  
**Backend**: Flask 3.0, SQLAlchemy, Pydantic 2.9, Flask-JWT-Extended  
**Infrastructure**: Docker, Docker Compose, SQLite

**Key Choices**: TypeScript for type safety, Pydantic for backend validation, Context API for state (vs Redux for this scale), Axios interceptors for automatic token injection, SQLite for simplicity (easily replaceable with PostgreSQL)

## ✅ Completed Features

- **CRUD Operations**: Create, read, update, delete participants with inline editing
- **Authentication**: JWT-based auth with protected routes
- **Dashboard**: Metrics display (total, by status, by group) and participant table
- **Validation**: Pydantic backend validation + TypeScript + frontend checks
- **Error Handling**: User-friendly messages with axios interceptors
- **Logging**: Structured logging for all operations

## ⏭️ What Was Skipped

- **Automated Testing**: Manual testing only (time constraint). Would add Jest/Vitest, pytest, Playwright
- **Security Enhancements**: Rate limiting, password complexity, RBAC, HTTPS enforcement
- **UX Improvements**: Field-level validation messages, loading skeletons, toast notifications
- **Accessibility**: Shadcn/ui is accessible by default, but explicit ARIA labels would help
- **CI/CD**: No pipeline implemented (awareness of concepts only)

## 🔒 Security

**Implemented**: JWT authentication, Pydantic input validation, SQLAlchemy ORM (SQL injection protection), TypeScript type safety, React content escaping

**Trade-offs**:
- JWT in `localStorage` (vs HttpOnly cookies) - mitigated by interceptors
- CORS allows all origins in dev - should restrict in production
- No rate limiting, password complexity, or RBAC (all users have same access)

## 📊 Architecture

**Frontend**: Next.js App Router with Context API for state (`AuthContext`, `ParticipantsContext`). DDD-inspired structure with Repository pattern in `infrastructure/domains/participants/`.

**Backend**: Flask app factory pattern, SQLAlchemy models, Pydantic schemas, route blueprints. Database migrations with Alembic.

**Patterns**: Repository (data abstraction), Adapter (API to repository), Context (state management), Factory (Flask app creation)

## 📚 API Documentation

API documentation is available in [API.md](./API.md).

For interactive API documentation, Flask-RESTX or flasgger could be added to auto-generate Swagger/OpenAPI documentation. Currently, all endpoints are documented in the API.md file.

## 🚀 Future Improvements

- **Testing**: Jest/Vitest, pytest, Playwright/Cypress for comprehensive test coverage
- **UX**: Field-level validation messages, loading skeletons, toast notifications, optimistic updates
- **Security**: Rate limiting, password complexity, RBAC, audit logging, CSP headers
- **Performance**: React Query for caching, pagination, virtual scrolling, API caching
- **Features**: Search/filter, CSV/PDF export, analytics charts, bulk operations, audit trail
- **Infrastructure**: PostgreSQL, CI/CD pipeline, environment configs, monitoring, log aggregation

## 🤖 AI Tools & Development Approach

**Heavy use of AI coding assistants**, particularly for backend Python code where I have less expertise.

**Primary Tools**: Cursor (backend Python, Flask, Pydantic, Docker, architecture patterns), v0.dev (UI components)

**Quality Control**: All AI-generated code was reviewed, modified, tested, and refactored. I understand and can explain all implementations.

**Areas of Expertise**: Frontend React/TypeScript, Context API, component design  
**Areas with AI Guidance**: Python/Flask backend, SQLAlchemy, Pydantic, Docker builds

I believe in transparency about AI usage while demonstrating ability to effectively use these tools, understand generated code, and maintain quality through review and testing.

## 📝 Additional Notes

**Database Seeding**: Auto-seeds on first run. Force re-seed: `docker compose down -v && docker compose up --build` or `SEED_DB=true docker compose up`

**Logging**: Backend logs via `docker compose logs -f backend`. Frontend logs in browser console.

**Environment Variables**: See `docker-compose.yml`. Key: `SECRET_KEY`, `JWT_SECRET_KEY`, `JWT_ACCESS_TOKEN_EXPIRES` (default: 3600s), `NEXT_PUBLIC_API_URL`

**Structure**: Next.js standalone output, multi-stage Docker builds, database in `backend/instance/`, migrations in `backend/migrations/versions/`

## 📄 License

This project was created as part of a technical challenge for evaluation purposes.

---

**Built with modern development practices, AI-assisted development, and a focus on clean architecture and code quality.**
