# Swagger TypeScript Express Node Mongo AWS

A REST API for **authentication**, **session management**, **user management**, and **product CRUD** built with Express.js, TypeScript, MongoDB (Mongoose), and JWT. API documentation is provided via Swagger UI for easy testing and integration.

## Features

- **Authentication** — Register, login, logout, JWT-based auth, forgot/reset password
- **Sessions** — Express session with MongoDB store
- **Users** — Get user by ID, update profile, delete account (authenticated)
- **Products** — Create, list, get by ID, update, delete; list own products (authenticated)
- **Validation** — Request validation with express-validator (including Indian/international phone formats)
- **API docs** — Swagger UI at `/swagger-api-docs`
- **Postman** — Collection included for full API testing

## Tech stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt, express-session (connect-mongo)
- **Docs:** Swagger (OpenAPI 3), swagger-ui-express
- **Security:** Helmet, CORS

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or remote)
- npm or yarn

## Installation

```bash
git clone https://github.com/TechnologicalJerry/swagger-typescript-express-node-mongo-aws.git
cd swagger-typescript-express-node-mongo-aws
npm install
```

## Environment variables

Copy the example env and set your values:

```bash
cp example.env .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` or `production` |
| `PORT` | Server port | `5050` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/swagger-express-node-mongo-aws` |
| `JWT_SECRET` | Secret for signing JWTs | Strong random string |
| `JWT_EXPIRES_IN` | JWT expiry | `1d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:3000` |
| `SESSION_SECRET` | Session signing secret | Strong random string |
| `PASSWORD_RESET_TOKEN_EXPIRES_MINUTES` | Reset token TTL | `30` |

## Running the app

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with nodemon (ts-node) |
| `npm run serve` | Run once with ts-node (no watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled app: `node dist/server.js` |

Default base URL: **http://localhost:5050**

## API overview

All API routes are under **`/api`**.

### System

- `GET /api/health` — Health check

### Auth (`/api/auth`)

- `POST /api/auth/register` — Register (email, password, optional profile fields)
- `POST /api/auth/login` — Login (returns JWT and user)
- `POST /api/auth/forgot-password` — Request password reset (email)
- `POST /api/auth/reset-password` — Reset password (token, password, confirmPassword)
- `GET /api/auth/profile` — Get current user profile (Bearer JWT)
- `POST /api/auth/logout` — Logout (Bearer JWT)

### Users (`/api/users`)

- `GET /api/users/:id` — Get user by ID
- `PUT /api/users` — Update current user (Bearer JWT)
- `DELETE /api/users` — Delete current user (Bearer JWT)

### Products (`/api/products`)

- `POST /api/products` — Create product (Bearer JWT)
- `GET /api/products` — List products (query: `limit`, `offset`)
- `GET /api/products/my-products` — List current user’s products (Bearer JWT)
- `GET /api/products/:id` — Get product by ID
- `PUT /api/products/:id` — Update product (Bearer JWT)
- `DELETE /api/products/:id` — Delete product (Bearer JWT)

## Testing the API

### Swagger UI

Open in the browser:

**http://localhost:5050/swagger-api-docs**

Use “Try it out” on the endpoints. For protected routes, use **Authorize** and paste a JWT from login/register.

### Postman

1. Import **`postman_collection.json`** from the project root.
2. Set collection variable **`baseUrl`** to `http://localhost:5050` (default).
3. Run **Health Check**, then **Register** or **Login** so `authToken` and `userId` are set.
4. Run other requests; product requests will set `productId` from Create/Get All.

Suggested order: **Health → Auth (Register/Login) → Users → Products**.

## Validation notes

### Phone number (register / update user)

Accepted formats (digits with optional `+`, parentheses, and separators `-`, `.`, or space):

- `+91-9876543210`
- `+919876543210`
- `+91-98765-43210`
- `+1-555-0100`
- `(555) 123-4567`
- `555.123.4567`

### Password (register / reset)

- Minimum 8 characters
- At least one uppercase, one lowercase, and one number

## Project structure (high level)

```
src/
  app.ts              # Express app, middleware, routes
  server.ts           # Start server, DB connect, graceful shutdown
  config/             # env, logger, database, session store
  controllers/        # auth, user, product
  docs/               # Swagger/OpenAPI spec
  middlewares/        # auth (JWT), session, validate, error
  models/             # User, Product, UserSession
  routes/             # auth, user, product, index
  services/           # user, product, session
  types/              # Express augmentation (req.user, session)
  utils/              # JWT, password, response helpers
  validations/        # auth, user, product
```

## License

MIT — see [LICENSE](LICENSE).
