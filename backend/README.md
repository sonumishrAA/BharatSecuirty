# CMS Engine - Backend

Express.js + PostgreSQL backend for the BharatSecurity CMS.

## Tech Stack

- **Express.js** - REST API framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **TypeScript** - Type safety

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the database credentials and JWT secret.

### 3. Setup Database

Create a PostgreSQL database:

```sql
CREATE DATABASE cms_engine;
```

Run the migration:

```bash
psql -U postgres -d cms_engine -f migrations/001_initial_schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user (requires auth) |

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts | List posts (public) |
| GET | /api/posts/:id | Get by ID (public) |
| GET | /api/posts/slug/:slug | Get by slug (public) |
| POST | /api/posts | Create (admin) |
| PUT | /api/posts/:id | Update (admin) |
| DELETE | /api/posts/:id | Delete (admin) |
| PATCH | /api/posts/:id/status | Toggle status (admin) |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/media | List all media (admin) |
| POST | /api/media/upload | Upload file (admin) |
| DELETE | /api/media/:type/:filename | Delete file (admin) |

## Default Admin

- **Email:** admin@bharatsecurity.org
- **Password:** admin123

## File Structure

```
backend/
├── src/
│   ├── config/        # Database & JWT config
│   ├── controllers/   # Route handlers
│   ├── middleware/    # Auth & upload middleware
│   ├── models/        # TypeScript interfaces
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── app.ts         # Main entry point
├── migrations/        # SQL migrations
├── uploads/           # Uploaded files
└── package.json
```
