# Azure Coast Guide 🌊

A full-stack tourism web app for discovering the best spots on the Azure Coast — beaches, restaurants, nature trails, and more.

Built with **React + Vite** (client) and **Express + MongoDB** (server).

---

## ✨ Features

- Browse and filter tourism spots by category (Beach, Restaurant, Nature, etc.)
- View detailed information and get Google Maps directions
- Save favourite spots — synced to your account across devices
- Secure user authentication (JWT via httpOnly cookies)
- Forgot password flow (generates a secure reset token)

---

## 🗂 Project Structure

```
local_tourism/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── data.js          # Tourism spot data
│   │   ├── App.css
│   │   └── index.css
│   ├── .env                 # Local env vars (not committed)
│   └── package.json
└── server/          # Express + MongoDB backend
    ├── server.js
    ├── .env                 # Server env vars (not committed)
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB Atlas cluster (or local MongoDB instance)

### 1. Clone the repo

```bash
git clone https://github.com/Guptha747458/local_tourism.git
cd local_tourism
```

### 2. Set up the server

```bash
cd server
cp .env.example .env   # Then fill in your values
npm install
npm run dev            # Starts on http://localhost:5001
```

### 3. Set up the client

```bash
cd ../client
cp .env.example .env   # Then fill in your values
npm install
npm run dev            # Starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

### `server/.env`

| Variable           | Description                                          | Example                         |
|--------------------|------------------------------------------------------|---------------------------------|
| `DATABASE_URL`     | MongoDB connection string                            | `mongodb+srv://user:pass@...`   |
| `JWT_SECRET`       | Secret key for signing JWTs — **use a strong random value in production** | `openssl rand -hex 32` |
| `FRONTEND_ORIGIN`  | The client origin allowed by CORS                   | `http://localhost:5173`         |
| `PORT`             | Port the Express server listens on (default: 5001)  | `5001`                          |

### `client/.env`

| Variable                         | Description                          | Example                               |
|----------------------------------|--------------------------------------|---------------------------------------|
| `VITE_REACT_APP_BACKEND_BASEURL` | Base URL of the Express server       | `http://localhost:5001/`              |

> **Production note:** On Vercel/Render, set `FRONTEND_ORIGIN` to your deployed frontend URL and `VITE_REACT_APP_BACKEND_BASEURL` to your deployed backend URL.

---

## 📦 Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite 7, Lucide React          |
| Backend   | Node.js, Express 5, Mongoose            |
| Database  | MongoDB Atlas                           |
| Auth      | JWT (httpOnly cookies), bcryptjs        |
| Security  | express-rate-limit, cookie-parser, CORS |

---

## 🔑 API Endpoints

| Method | Route                    | Auth | Description                        |
|--------|--------------------------|------|------------------------------------|
| POST   | `/api/signup`            | ❌   | Register + receive JWT cookie      |
| POST   | `/api/login`             | ❌   | Login + receive JWT cookie         |
| POST   | `/api/logout`            | ❌   | Clear JWT cookie                   |
| GET    | `/api/me`                | ✅   | Get current user + favorites       |
| POST   | `/api/forgot-password`   | ❌   | Request a password reset token     |
| POST   | `/api/reset-password`    | ❌   | Reset password using token         |
| GET    | `/api/favorites`         | ✅   | Get user's favorite spot IDs       |
| POST   | `/api/favorites`         | ✅   | Save/replace user's favorites      |

---

## 🛡 Security Notes

- Auth tokens are stored in **httpOnly cookies** (not accessible via JavaScript).
- `/api/login` and `/api/signup` are rate-limited to **10 requests per 15 minutes** per IP.
- CORS is restricted to `FRONTEND_ORIGIN` only.
- `.env` files are excluded from git via `.gitignore`.
- Password reset tokens are hashed with SHA-256 and expire after 1 hour.

---

## 📝 License

MIT
