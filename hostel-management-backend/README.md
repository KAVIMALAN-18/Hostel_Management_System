<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
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
>>>>>>> 7ec557b87aacd8c37e2232589f535a5e9e891ed5
