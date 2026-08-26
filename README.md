# Inspark Employee Management System

A modern, scalable monorepo for managing employee onboarding, attendance, and payroll.

## 🏗️ Project Architecture

This project uses a clean monorepo architecture, splitting the user interface and the server logic into distinct environments.

```text
insparktech.in/hbuilds/last-source/
│
├── frontend/                # 🌐 Frontend UI (React + Vite + TailwindCSS)
│   ├── src/
│   │   ├── portal/          # Employee & Admin Dashboard UI
│   │   └── components/      # Reusable UI Components
│   ├── public/              # Static assets
│   ├── .env                 # Frontend environment variables
│   └── package.json         # Frontend dependencies (React, Vite, etc.)
│
├── backend/                 # ⚙️ Backend API (Node.js + Express)
│   ├── routes/              # API endpoints (Auth, Emails, etc.)
│   ├── .env                 # Backend environment variables
│   ├── index.js             # Express server entry point
│   └── package.json         # Backend dependencies (Express, Nodemailer, etc.)
│
├── supabase/                # 🗄️ Database & Storage
│   └── migrations/          # SQL schema migrations & RLS policies
│
├── .env                     # Master environment config
└── package.json             # Root Monorepo configuration (concurrently)
```

## 🚀 Getting Started

To run the entire stack locally, you do not need to start the frontend and backend separately. 

1. **Install Dependencies** (One-time setup):
   ```bash
   npm install && cd frontend && npm install && cd ../backend && npm install
   ```

2. **Start the Application**:
   From the root folder, run:
   ```bash
   npm run dev
   ```
   *This single command will spin up the Backend API on port `5000` and the Frontend UI on port `5173` simultaneously.*

## 🔒 Environment Variables
This project relies on Supabase and Nodemailer. Ensure that you have the `.env` file present in **both** the `/frontend` and `/backend` directories, populated with your `VITE_SUPABASE_URL`, `SMTP_HOST`, etc.
