# Realtime CSBS Timetable Management System

This repository contains the complete Role-Based Timetable Management System built using React, Vite, Fastify, Socket.IO, and MongoDB Atlas.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (v3), shadcn/ui, Zustand, Socket.IO Client.
- **Backend:** Node.js, Fastify, TypeScript, Socket.IO, Mongoose, Argon2, JWT.

## Project Structure
- `/frontend`: The Vite React application.
- `/backend`: The Fastify Node.js API and WebSocket server.

## Prerequisites
- Node.js (v20+)
- `pnpm` (or `npm`)
- MongoDB Atlas Cluster

## Installation & Setup

### 1. Database Seed
First, you need to set up your MongoDB Atlas connection and seed the database.
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` and add your `MONGODB_URI`.
```bash
pnpm install
pnpm ts-node src/seed.ts
```
This will populate the database with the exact HOD, 19 Staff members, Class Reps, Subjects, and the 2nd, 3rd, and 4th-year Timetables as specified. All passwords are set to `Password@123` by default.

### 2. Start Backend Server
```bash
cd backend
pnpm dev
```
The server will run on `http://localhost:3000`.

### 3. Start Frontend App
```bash
cd frontend
pnpm install
pnpm dev
```
The frontend will run on `http://localhost:5173`.

## Deployment

**Backend (Render Free Tier):**
- Set Build Command: `pnpm install && pnpm tsc`
- Set Start Command: `node dist/server.js`
- Set Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` (e.g., `https://your-frontend.vercel.app`), `NODE_ENV=production`.

**Frontend (Vercel):**
- Set Build Command: `pnpm build`
- Set Environment Variables: `VITE_API_URL` (e.g., `https://your-backend.onrender.com/api`).
