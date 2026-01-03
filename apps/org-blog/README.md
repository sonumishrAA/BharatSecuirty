# CMS Engine - Frontend

Angular 17+ frontend for the BharatSecurity CMS.

## Tech Stack

- **Angular 17** - Frontend framework
- **TypeScript** - Core language
- **SCSS** - Styling
- **Signals** - Reactive state management
- **Standalone Components** - Modern Angular architecture

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Update API URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### 3. Start Development Server

```bash
npm start
```

App runs on `http://localhost:4200`

## Features

### Admin Panel (`/admin`)

- **Dashboard** - Posts table with status toggle
- **Editor** - Create/edit posts with rich text
- **Categories** - Posts grouped by category
- **Media** - Uploaded files management

### Public Site (`/`)

- **Home** - Hero section + horizontal blog sections
- **Blog** - Grid listing with filters
- **Post View** - Full post with TipTap rendering
- **Static Pages** - About, Privacy, Terms, Contact

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Guards, interceptors, services
│   │   ├── admin/             # Admin module
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── public/            # Public module
│   │   │   ├── layout/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── auth/              # Login
│   │   └── shared/            # Models
│   ├── styles/                # Global SCSS
│   └── environments/          # Config
├── angular.json
└── package.json
```

## Styling

The app uses two themes:

- **Admin** - Clean white/light theme
- **Public** - Cyber dark theme with neon accents

SCSS variables in `src/styles/_variables.scss`.

## Authentication

JWT-based authentication:
- Token stored in localStorage
- HTTP interceptor adds Bearer token
- Route guards protect admin routes
