# Bharat Security Project Documentation

## 1. Project Overview
This project is a unified web ecosystem for Bharat Security, consisting of a single PostgreSQL backend and four distinct frontend applications.

### Architecture Root
```text
/Users/PulaG/Documents/BHARAT-SECURITY/
├── backend/            # Consolidated Node.js API (PostgreSQL)
└── apps/
    ├── net-business/   # Public Business Site (bharatsecurity.net)
    ├── net-admin/      # Admin Panel (admin.bharatsecurity.net)
    ├── net-user/       # User Portal (user.bharatsecurity.net)
    └── org-blog/       # Blog Site (bharatsecurity.org)
```

---

## 2. Database Schema (PostgreSQL)

### `users` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key (Auto-generated) |
| `email` | VARCHAR(255) | Unique Email Address |
| `password_hash` | VARCHAR(255) | Bcrypt hash |
| `role` | VARCHAR(20) | 'admin' or 'user' |
| `created_at` | TIMESTAMP | Creation Timestamp |

### `posts` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `title` | VARCHAR(255) | Post Title |
| `slug` | VARCHAR(255) | URL Slug (Unique) |
| `content` | JSONB | Rich Text Content (TipTap/ProseMirror JSON) |
| `excerpt` | TEXT | Short summary |
| `category` | VARCHAR(50) | 'blog', 'scam_alert', 'osint_guide', 'resource' |
| `status` | VARCHAR(20) | 'draft', 'published' |
| `cover_image_url` | TEXT | URL to cover image |

---

## 3. API Documentation
**Base URL**: `http://localhost:3000/api`

### Auth Endpoints
*   **POST** `/auth/login`
    *   **Input**: `{ "email": "user@example.com", "password": "password" }`
    *   **Output**: `{ "token": "jwt_token...", "user": { ... } }`
*   **POST** `/auth/logout`
*   **GET** `/auth/me` (Protected)

### Posts Endpoints
*   **GET** `/posts`
    *   **Query Params**: `?status=published&category=blog&limit=10`
*   **GET** `/posts/:id`
*   **GET** `/posts/slug/:slug`
*   **POST** `/posts` (Admin Only)
    *   **Input**:
        ```json
        {
          "title": "My New Post",
          "slug": "my-new-post",
          "excerpt": "Short summary...",
          "content": { "type": "doc", "content": [...] },
          "category": "blog",
          "status": "draft"
        }
        ```
*   **PUT** `/posts/:id` (Admin Only)
*   **DELETE** `/posts/:id` (Admin Only)

---

## 4. User Flows

### Business Client Flow
1.  **Visit**: `bharatsecurity.net` (Business App)
2.  **Action**: User browses services, case studies.
3.  **Login**: User clicks **"Existing User"** button in Navbar (Top Right).
4.  **Redirect**: Redirects to `user.bharatsecurity.net` (User Portal).
5.  **Dashboard**: User logs in to view reports/status.

### Admin Flow
1.  **Visit**: `admin.bharatsecurity.net` (Admin App).
2.  **Login**: Admin logs in with credentials.
3.  **Manage**:
    *   Create/Edit Blog Posts.
    *   Manage Media/Files.
    *   Check Statistics.

### Public Reader Flow
1.  **Visit**: `bharatsecurity.org` (Blog App).
2.  **Action**: Reads Blog posts, OSINT guides, and Scam Alerts.
3.  **Data Source**: Fetches content from `http://localhost:3000/api/posts`.

---

## 5. Development Plan & Configuration

### Environment Variables (`backend/.env`)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_engine
DB_USER=postgres
JWT_SECRET=your_secret
```

### Port Allocation (Local Dev)
*   **Backend**: `3000`
*   **Business App**: `4201`
*   **Admin App**: `4202`
*   **User Portal**: `4203`
*   **Blog App**: `4204`
