# Store Rating Platform

Full-stack store rating app built for the coding challenge.

## Stack

- Backend: Express.js
- Database: PostgreSQL via Prisma
- Frontend: React + Vite

## Setup

1. Install dependencies from the project root.
2. Copy `server/.env.example` to `server/.env` and update `DATABASE_URL` and `JWT_SECRET`.
3. Run Prisma migration and seed data.
4. Start the API and client.

## Commands

```bash
npm install
npm run migrate -w server
npm run seed -w server
npm run dev
```

## Demo accounts

- Admin: `admin@example.com` / `Password@1`
- Store owner: `owner@example.com` / `Password@1`
- Normal user: `user@example.com` / `Password@1`

## What is covered

- Single login system for all roles
- Normal user signup
- Admin dashboard with user, store, and rating management views
- Store owner dashboard with submitted ratings and average rating
- Store browsing, rating, and rating updates for normal users
- Validation for name, address, email, and password rules
- Sorting for all main listing tables
