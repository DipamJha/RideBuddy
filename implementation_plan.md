# RideBuddy Backend — Full-Stack Implementation Plan

## Current State

**Frontend** (fully built):
- Home, Search (with Find/Offer tabs), Login, Signup pages
- All frontend-only with dummy data — no API calls yet

**Backend** (`backend/ridebuddy-backend/`):
- Empty scaffolding — `app.js` is blank, all folders (`models`, `controllers`, `routes`, `middlewares`, `services`, `utils`) are empty

**Tech stack per README**: Node.js + Express, MongoDB, Telegram Bot API, Google Maps API

---

## User Review Required

> [!IMPORTANT]
> **MongoDB Setup**: Do you want to use a local MongoDB instance or a cloud MongoDB Atlas cluster? I'll need a connection URI.

> [!IMPORTANT]
> **Telegram Notifications**: Do you want to include Telegram bot integration in this phase, or defer it to later? If yes, we'll need a bot token.

> [!IMPORTANT]
> **Google Maps API**: Do you want Google Maps integration for distance/geocoding now, or is it fine to skip for MVP and just use text-based locations?

---

## Proposed Architecture

```
backend/ridebuddy-backend/
├── app.js                    # Express app setup + middleware
├── server.js                 # Entry point (starts HTTP server)
├── .env                      # Secrets (MONGO_URI, JWT_SECRET, etc.)
├── package.json
│
├── config/
│   └── db.js                 # MongoDB connection
│
├── models/
│   ├── User.js               # User schema
│   └── Ride.js               # Ride schema
│
├── routes/
│   ├── authRoutes.js          # POST /api/auth/signup, /login
│   └── rideRoutes.js          # CRUD /api/rides
│
├── controllers/
│   ├── authController.js      # signup, login logic
│   └── rideController.js      # create, search, join, my-rides
│
├── middlewares/
│   └── auth.js                # JWT verification middleware
│
├── services/                  # (future: telegram, maps)
└── utils/
    └── validators.js          # Input validation helpers
```

---

## Proposed Changes

### Phase 1: Backend Core

#### [NEW] package.json
Initialize with dependencies: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `express-validator`

---

#### [NEW] config/db.js
MongoDB connection using Mongoose with error handling and connection pooling.

---

#### [NEW] models/User.js
```
User {
  firstName:  String (required)
  lastName:   String (required)
  email:      String (required, unique, indexed)
  password:   String (required, hashed)
  avatar:     String (default emoji)
  rating:     Number (default 5.0)
  trips:      Number (default 0)
  createdAt:  Date
}
```

#### [NEW] models/Ride.js
```
Ride {
  driver:      ObjectId → User (required)
  from:        String (required)
  to:          String (required)
  date:        Date (required)
  time:        String (required)
  seats:       Number (required, min 1)
  seatsBooked: Number (default 0)
  price:       Number (required)
  vehicle:     String
  vehicleType: Enum ["SUV", "Sedan", "MPV", "Hatchback", "Other"]
  amenities:   [String]
  passengers:  [ObjectId → User]
  status:      Enum ["active", "completed", "cancelled"]
  createdAt:   Date
}
```

---

#### [NEW] routes/authRoutes.js
| Method | Endpoint             | Description        | Auth |
|--------|---------------------|--------------------|------|
| POST   | `/api/auth/signup`   | Create account     | ✗    |
| POST   | `/api/auth/login`    | Login, return JWT  | ✗    |
| GET    | `/api/auth/me`       | Get current user   | ✓    |

#### [NEW] routes/rideRoutes.js
| Method | Endpoint              | Description                  | Auth |
|--------|-----------------------|------------------------------|------|
| POST   | `/api/rides`          | Create (offer) a ride        | ✓    |
| GET    | `/api/rides`          | Search rides (query filters) | ✗    |
| GET    | `/api/rides/:id`      | Get single ride details      | ✗    |
| POST   | `/api/rides/:id/join` | Join a ride as passenger     | ✓    |
| GET    | `/api/rides/my`       | Get user's rides (offered & joined) | ✓   |

---

#### [NEW] controllers/authController.js
- **signup**: Validate inputs → hash password → create user → return JWT
- **login**: Find user by email → compare password → return JWT
- **me**: Return user from JWT token

#### [NEW] controllers/rideController.js
- **createRide**: Create with driver = authenticated user
- **searchRides**: Filter by `from`, `to`, `date`, `seats` (partial text match with regex)
- **joinRide**: Add user to passengers, increment seatsBooked, check capacity
- **getMyRides**: Return rides where user is driver or passenger

---

#### [NEW] middlewares/auth.js
JWT verification using `Authorization: Bearer <token>` header. Attaches `req.user` to request.

---

#### [NEW] app.js & server.js
Express setup with: `cors`, `express.json()`, route mounting, MongoDB connection, error handler.

---

### Phase 2: Frontend API Integration

#### [MODIFY] Login.jsx
Wire up form to `POST /api/auth/login`, store JWT in localStorage, redirect on success.

#### [MODIFY] Signup.jsx
Wire up form to `POST /api/auth/signup`, store JWT, redirect to search.

#### [MODIFY] Search.jsx
- **Find tab**: Fetch rides from `GET /api/rides?from=...&to=...`
- **Offer tab**: Submit form to `POST /api/rides` with auth header
- **Join Ride button**: Call `POST /api/rides/:id/join`

#### [MODIFY] Navbar.jsx
Show user name/avatar when logged in. Replace "Sign In / Join Ride" with a user dropdown.

#### [NEW] src/utils/api.js
Axios or fetch wrapper with base URL and automatic JWT header injection.

---

## Dependency Summary

| Package            | Purpose                         |
|--------------------|---------------------------------|
| express            | Web framework                   |
| mongoose           | MongoDB ODM                     |
| bcryptjs           | Password hashing                |
| jsonwebtoken       | JWT auth tokens                 |
| cors               | Cross-origin requests           |
| dotenv             | Environment variables           |
| express-validator  | Request validation              |

---

## Open Questions

> [!IMPORTANT]
> 1. **MongoDB**: Local or Atlas? (I need a connection string)
> 2. **Telegram Bot**: Include in this phase or defer?
> 3. **Google Maps**: Include geocoding or text-only locations for now?
> 4. **Google OAuth**: The frontend has a "Continue with Google" button. Should we implement Google OAuth, or is email/password enough for MVP?

---

## Verification Plan

### Automated Tests
- Start the backend with `npm run dev` and verify server starts on port 5000
- Test all API endpoints using curl/browser:
  - `POST /api/auth/signup` → creates user, returns token
  - `POST /api/auth/login` → returns token
  - `POST /api/rides` → creates ride (with auth)
  - `GET /api/rides` → returns rides list
  - `POST /api/rides/:id/join` → adds passenger

### Manual Verification
- Signup on the frontend → verify user appears in MongoDB
- Create a ride from "Offer Ride" tab → verify it appears in "Find Ride" results
- Click "Join Ride" → verify seat count updates
- Login/Logout flow works end-to-end
