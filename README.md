<p align="center">
  <img src="https://img.shields.io/badge/RideBuddy-FFC83D?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzBGMTcyQSI+PHBhdGggZD0iTTUgMTFsMS41LTQuNUMzLjUgNi41IDQgNiA1IDZoMTRjMSAwIDEuNS41IDEuNSAxLjVMNSAxMXptMTQgMEg1Yy0xLjEgMC0yIC45LTIgMnY2YzAgLjU1LjQ1IDEgMSAxaDFjLjU1IDAgMS0uNDUgMS0xdi0xaDEydjFjMCAuNTUuNDUgMSAxIDFoMWMuNTUgMCAxLS40NSAxLTF2LTZjMC0xLjEtLjktMi0yLTJ6bS0xMiAzYy0uODMgMC0xLjUtLjY3LTEuNS0xLjVTNi4xNyAxMSA3IDExcy0xLjUuNjctMS41IDEuNVM3LjgzIDE0IDcgMTR6bTEwIDBjLS44MyAwLTEuNS0uNjctMS41LTEuNVMxNi4xNyAxMSAxNyAxMXMxLjUuNjcgMS41IDEuNVMxNy44MyAxNCAxNyAxNHoiLz48L3N2Zz4=&logoColor=0F172A" alt="RideBuddy" height="40" />
</p>

<h1 align="center">🚗 RideBuddy</h1>

<p align="center">
  <strong>The Smartest Way to Travel Together.</strong><br/>
  A modern ride-sharing platform that connects commuters heading the same way — saving costs, reducing traffic, and making every journey social.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Framer_Motion-12-FF0050?style=flat-square&logo=framer" />
  <img src="https://img.shields.io/badge/Status-In_Development-FFC83D?style=flat-square" />
</p>

---

## ✨ Features

### 🔍 Find a Ride
- Search available rides by **pickup**, **drop-off**, **date**, and **seats**
- Browse **popular routes** with one-click quick search
- View driver profiles with **ratings**, **trip count**, and **vehicle details**
- Filter by **amenities** (AC, Music, Pet-Friendly, Luggage Space, etc.)
- **Join rides** with a single click

### 🚗 Offer a Ride
- Publish your ride with route, timing, pricing, and vehicle info
- Select **amenities** your vehicle offers
- Passengers find and request to join your ride
- Track your **offered rides** and **joined rides**

### 🔐 Authentication
- Email/password signup & login with **JWT tokens**
- Passwords secured with **bcrypt** hashing
- Protected API routes with Bearer token verification
- Auth-aware navigation (user dropdown when logged in)

### 🎨 Premium UI
- **Glassmorphism** design with backdrop blur effects
- Smooth **page transitions** with Framer Motion
- **Responsive** across all screen sizes
- Dark mode support
- Custom scrollbar styling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3.4, Framer Motion 12 |
| **Backend** | Node.js, Express 4, Mongoose 8 |
| **Database** | MongoDB Atlas (Cloud) |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | express-validator |
| **Routing** | React Router DOM v7 |

### Upcoming Integrations
| Feature | Technology |
|---------|-----------|
| **OAuth** | Google Sign-In via Passport.js |
| **Notifications** | Telegram Bot API |
| **Maps** | Google Maps Geocoding API |

---

## 📁 Project Structure

```
RideBuddy/
├── frontend/
│   └── ridebuddy-web/              # React + Vite frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.jsx       # Auth-aware navigation
│       │   │   └── Footer.jsx       # Site footer
│       │   ├── pages/
│       │   │   ├── Home.jsx         # Landing page with hero, carousel, stats
│       │   │   ├── Search.jsx       # Find Ride + Offer Ride (tabbed)
│       │   │   ├── Login.jsx        # Sign in with API integration
│       │   │   └── Signup.jsx       # Create account with API integration
│       │   ├── utils/
│       │   │   └── api.js           # Fetch wrapper with JWT auto-injection
│       │   ├── App.jsx              # Router + page transitions
│       │   ├── main.jsx             # Entry point
│       │   └── index.css            # Global styles + design system
│       ├── tailwind.config.js
│       └── package.json
│
├── backend/
│   └── ridebuddy-backend/           # Node.js + Express API
│       ├── config/
│       │   └── db.js                # MongoDB connection
│       ├── models/
│       │   ├── User.js              # User schema + password hashing
│       │   └── Ride.js              # Ride schema + text indexes
│       ├── controllers/
│       │   ├── authController.js    # signup, login, getMe
│       │   └── rideController.js    # CRUD rides, join, search
│       ├── routes/
│       │   ├── authRoutes.js        # /api/auth/*
│       │   └── rideRoutes.js        # /api/rides/*
│       ├── middlewares/
│       │   └── auth.js              # JWT verification
│       ├── utils/
│       │   └── validators.js        # Input validation rules
│       ├── services/                # (future: telegram, maps)
│       ├── app.js                   # Express setup
│       ├── server.js                # Entry point
│       ├── .env                     # Environment variables
│       └── package.json
│
├── mobile/                          # (future: React Native app)
├── docs/                            # (future: API docs)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **MongoDB Atlas** account ([free tier](https://cloud.mongodb.com))
- **Git** ([download](https://git-scm.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/RideBuddy.git
cd RideBuddy
```

### 2. Setup Backend

```bash
cd backend/ridebuddy-backend

# Install dependencies
npm install

# Create .env file (update with your values)
cp .env.example .env   # or manually edit .env
```

Edit `.env` with your credentials:

```env
MONGO_URI=mongodb+srv://your_user:your_pass@cluster0.xxxxx.mongodb.net/ridebuddy
JWT_SECRET=your_secret_key_here
PORT=5000
```

Start the backend:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected: cluster0-shard-xxxxx.mongodb.net
🚀 RideBuddy API running on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd frontend/ridebuddy-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/signup` | Create account | ✗ |
| `POST` | `/api/auth/login` | Login, returns JWT | ✗ |
| `GET` | `/api/auth/me` | Get current user | ✓ |

### Rides

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/rides` | Search rides (query: `from`, `to`, `date`, `seats`) | ✗ |
| `GET` | `/api/rides/:id` | Get single ride | ✗ |
| `POST` | `/api/rides` | Create/offer a ride | ✓ |
| `POST` | `/api/rides/:id/join` | Join a ride | ✓ |
| `GET` | `/api/rides/my` | Get user's rides (offered + joined) | ✓ |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server status check |

**Auth header format:** `Authorization: Bearer <jwt_token>`

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#FFC83D` | Buttons, accents, highlights |
| `primaryDark` | `#EAB308` | Hover states |
| `brandDark` | `#0F172A` | Dark backgrounds, text on primary |
| `surface` | `#1E293B` | Card backgrounds (dark mode) |
| `accent` | `#38BDF8` | Secondary accent color |

**Components:** `glass-header`, `glass-card`, `btn-primary`, `btn-secondary`, `text-gradient`, `premium-gradient`

---

## 📅 Roadmap

- [x] Landing page with premium design
- [x] Search page with Find + Offer Ride tabs
- [x] User authentication (signup/login/JWT)
- [x] Backend API (Express + MongoDB)
- [x] Frontend-backend integration
- [ ] Google OAuth (Sign in with Google)
- [ ] Telegram Bot notifications
- [ ] Google Maps geocoding + distance
- [ ] My Rides dashboard page
- [ ] User profile page
- [ ] Mobile app (React Native)
- [ ] Production deployment

---

## 🤝 Contributing

This is a personal project currently in active development.

---

## 📄 License

This project is private and not licensed for public use.

---

<p align="center">
  <strong>Built with ❤️ for a greener commute.</strong><br/>
  <sub>RideBuddy © 2026</sub>
</p>
