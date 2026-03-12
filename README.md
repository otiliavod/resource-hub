# Resource Hub

Resource Hub is a full-stack web application for managing clients, projects, timesheets, and employee leave in one place.

It is built with a modern Angular frontend and a NestJS backend, using PostgreSQL with Prisma ORM.

## Tech Stack

### Frontend

- Angular 21 (standalone components)
- PrimeNG UI library
- SCSS styling
- RxJS
- Angular Router
- HTTP Interceptor for authentication

### Backend

- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt password hashing
- class-validator for request validation

### Infrastructure

- Docker
- Docker Compose
- PostgreSQL container

## Features

### Authentication

- Register and login
- JWT access tokens
- Refresh token rotation
- Secure cookie refresh flow
- Password validation rules

### Dashboard

- Weekly hours summary
- Timesheet activity visualization
- Team member stats
- Upcoming leave overview

### Leave Management

- Leave balance tracking
- Leave request system
- Approval status (pending, approved, rejected)

### Projects & Clients

- Client management
- Project tracking
- Project team membership
- Time tracking per project

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/resource-hub.git
cd resource-hub
```

### 2. Running the database (Docker)

Start PostgreSQL using Docker: 

```bash
docker compose up -d
```

Verify it's working:

```bash
docker ps
```

The database will run on: localhost:5432

## Backend setup

Navigate to backend

```bash
cd backend
```

Install dependencies:


```bash
npm install
```

Create .env file:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb"
JWT_ACCESS_SECRET=supersecret
JWT_REFRESH_SECRET=supersecret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
```

Run migrations: 

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Start backend:

```bash
npm run start:dev
```

Backend runs on: localhost:3000

## Frontend setup

Navigate to frontend

```bash
cd frontend
```

Install dependencies:


```bash
npm install
```

Start frontend:

```bash
 ng serve --proxy-config proxy.conf.json
```

Frontend runs on: localhost:4200
