# Hostel Management System (HMS)

Production-ready full-stack platform to manage hostel operations across students, wardens, and administrators.

## Features
- Role-based dashboards and route protection (`admin`, `warden`, `student`)
- Student directory, complaints, announcements, attendance, leave workflow
- OTP-based forgot-password reset flow (email/phone lookup, OTP to registered phone)
- Centralized API service layer in frontend

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Runtime hardening: Helmet, CORS allowlist, rate limiting, compression, request logging

## Local Development

### 1) Backend
```bash
cd hostel-management-backend
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend
```bash
cd hostel-management-frontend
cp .env.example .env
npm install
npm run dev
```

Frontend default: `http://localhost:5173`  
Backend default: `http://localhost:5001`

## Environment Variables

### Backend (`hostel-management-backend/.env`)
```env
PORT=5001
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (`hostel-management-frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

## Deployment (Docker)

### Single-command local production
```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5001`
- MongoDB: `mongodb://localhost:27017`

## API Production Readiness Added
- Security headers (`helmet`)
- CORS origin allowlist using `FRONTEND_URL`
- Global API rate limiting (`/api`)
- Gzip compression
- Structured request logging (`morgan`)
- Graceful shutdown handlers (`SIGINT`, `SIGTERM`)
- Health endpoint: `GET /api/health`

## Notes
- In non-production mode, forgot-password OTP returns `devOtp` for testing.
- In production mode, integrate an SMS provider and disable OTP exposure fully.
