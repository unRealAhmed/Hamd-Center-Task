# Task Manager API

A robust RESTful API built with NestJS for managing tasks efficiently. This project implements a complete task management system with authentication, role-based access control, and comprehensive CRUD operations.

## Features

- JWT-based authentication system with refresh token support
- Role-based access control (RBAC) for administrative functions
- Task management with CRUD operations
- Advanced filtering and pagination
- PostgreSQL database integration
- Docker containerization
- Comprehensive unit tests
- API documentation with Swagger
- Security features including rate limiting, CORS, and Helmet

## Tech Stack

- NestJS - Progressive Node.js framework
- PostgreSQL - Primary database
- TypeORM - ORM for database interactions
- Docker - Containerization
- Jest - Testing framework
- Class Validator - Request validation
- Swagger - API documentation

## Prerequisites

- Node.js
- PostgreSQL
- Docker
- Yarn package manager

## Installation

1. Clone the repository:

```bash
git clone [https://github.com/unRealAhmed/Hamd-Center-Task]
cd task-manager-api
```

2. Install dependencies:

```bash
yarn install
```

3. Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the environment variables in `.env` with your configurations:

```
NODE_ENV=DEV
APP_PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password_here
DB_DATABASE=your_db_name_here
DB_SYNCHRONIZE=true
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_REFRESH_SECRET_KEY=your_jwt_refresh_secret_key_here
COOKIE_SECRET=your_cookie_secret_here
JWT_EXPIRES_IN=900
TTL_REFRESH_TOKEN=604800
```

## Running the Application

### Development Mode

```bash
yarn dev
```

### Production Mode

```bash
yarn build
yarn start:prod
```

### Using Docker

```bash
docker-compose up -d
```

## API Endpoints

### Auth Controller (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

### User Controller (`/users`) - Admin Only

- `GET /users` - Get all users
- `GET /users/:id` - Get specific user
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Task Controller (`/tasks`)

- `GET /tasks` - Get user's tasks
- `GET /tasks/:id` - Get specific task
- `POST /tasks` - Create task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Testing

Run unit tests:

```bash
yarn test
```

## Architecture Highlights

- **Abstract Patterns**: Implemented abstract repository, entity, and filter patterns for consistent code structure
- **Guards**: Token guard for authentication and roles guard for authorization
- **Interceptors**: Logging interceptor for request tracking
- **Filters**: HTTP exception filter for consistent error responses
- **DTOs**: Request validation using class-validator
- **Services**: JWT service, hashing service, and other utility services

## Security Features

- JWT Authentication with refresh tokens
- Role-based access control
- Rate limiting
- CORS protection
- Helmet security headers
- Request validation
- Error handling

## Documentation

API documentation is available via Swagger UI at `/api` when running the application.

## Project Structure

The project follows a modular architecture with clear separation of concerns:

- `src/common` - Shared utilities, decorators, and services
- `src/config` - Configuration management
- `src/database` - Database configuration and connections
- `src/modules` - Feature modules (auth, users, tasks)
- `src/filters` - Global exception filters
- `src/guards` - Authentication and authorization guards
- `src/interceptors` - Global interceptors
- `tests` - Unit and e2e tests

## Contact

- LinkedIn: [Ahmed Sayed](https://www.linkedin.com/in/ahmedsayed1120/)
- Email: ahmed.sayed.connect@gmail.com
