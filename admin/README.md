# UNIMIGO Admin Panel

Complete admin panel for UNIMIGO platform with Super Admin and University Admin roles.

## Features

### Super Admin
- Manage all universities globally
- Add/Edit/Delete universities
- View platform-wide analytics
- Monitor all users and posts
- Subscription management

### University Admin
- Manage university students
- Review and moderate posts
- Handle flagged content
- Adjust trust scores
- View university-specific analytics

## Tech Stack
- Next.js 14 + TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios (API Client)
- Lucide React (Icons)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_APP_NAME=UNIMIGO Admin
```

3. Run development server:
```bash
npm run dev
```

Admin panel will run on: http://localhost:3001

## Default Login
- Super Admin: `superadmin@unimigo.co` / `admin123`
- University Admin: `admin@lpu.in` / `admin123`

## Pages

### Super Admin Routes
- `/super-admin` - Dashboard
- `/super-admin/universities` - Manage Universities
- `/super-admin/users` - All Users
- `/super-admin/analytics` - Platform Analytics

### University Admin Routes
- `/university-admin` - Dashboard
- `/university-admin/users` - Manage Students
- `/university-admin/posts` - Review Posts
- `/university-admin/reports` - View Reports

## API Integration

All API calls go through `/src/lib/api.ts` which handles:
- Base URL configuration
- JWT token injection
- Request/Response interceptors

## Deployment

Build for production:
```bash
npm run build
npm start
```

Deploy to Vercel:
```bash
vercel deploy
```
