# Hostel Management System (HMS)

A professional, full-stack web application designed to streamline hostel operations, resident management, and communication for educational institutions.

## 🚀 Project Overview
The Hostel Management System is a centralized platform that connects Students, Wardens, and Administrators. It replaces manual record-keeping with a digital "Infrastructure Hub," "Support Desk," and "Official Bulletin," ensuring transparency and efficiency in hostel life.

## ✨ Key Features
- **Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for Admin, Warden, and Student.
- **Infrastructure Hub**: Real-time tracking of hostel occupancy and room availability.
- **Resident Hub**: Centralized student management with live search and profile filtering.
- **Support Desk**: A full complaint lifecycle (Student File -> Warden Process -> Resolved).
- **Official Bulletin**: Digital notice board for broadcasting urgent and standard announcements.
- **Secure Authentication**: JWT-based login and registration with protected routes.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Vite.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JSON Web Tokens (JWT), BcryptJS.
- **Deployment**: Localhost (Demo Ready).

## ⚙️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB (Local or Atlas)
- NPM or Yarn

### Backend Setup
1. Navigate to `hostel-management-backend/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file and add:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Start the server: `npm start`.

### Frontend Setup
1. Navigate to `hostel-management-frontend/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file and add:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the dev server: `npm run dev`.

## 🔐 Demo Credentials

| Role | Email (Example) | Password |
|------|-----------------|----------|
| **Admin** | admin@hms.com | admin123 |
| **Warden** | warden@hms.com | warden123 |
| **Student** | student@hms.com | student123 |

*(Note: Use these values if you have seeded the DB, otherwise register new accounts via the UI.)*

---
## 📄 License
This project is developed for educational purposes as part of the University Submission.
