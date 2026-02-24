# Task Management App (Node.js + Express + EJS + MongoDB)

A practical exam project with JWT authentication (cookie-based), role-based access control, multiuser task support, category populate, and a minimalist EJS UI.

## Features

- User registration and login
- JWT token issued on login and stored in HTTP-only cookie
- Logout by clearing auth cookie
- Role-based access (`admin`, `user`)
- Task CRUD with ownership rules:
	- `user`: manage only own tasks
	- `admin`: manage tasks for any user
- Category support with MongoDB references and `populate`
- EJS views with reusable navbar partial

## Tech Stack

- Node.js
- Express.js
- EJS
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- `cookie-parser`, `body-parser`, `method-override`, `bcryptjs`

## Project Structure

```
practical exam/
├── app.js
├── config/
│   └── db.js
├── controllers/
├── middlewares/
├── models/
├── public/
│   └── css/
├── routes/
├── views/
│   ├── auth/
│   ├── partials/
│   └── tasks/
├── .env.example
└── package.json
```

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Keep these keys in `.env`:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
```

### Notes

- `MONGO_URI` should point to your running MongoDB instance.
- You can use a database name in URI (recommended), for example:
	- `mongodb://127.0.0.1:27017/task_management`
- Generate secure JWT secret:
	- `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

## Installation

```bash
npm install
```

## Run the App

```bash
npm start
```

For development (auto-restart):

```bash
npm run dev
```

App URL:

- `http://localhost:3000`

## Main Routes

### Auth

- `GET /register` - register page
- `POST /register` - create user
- `GET /login` - login page
- `POST /login` - login user, set JWT cookie
- `POST /logout` - clear cookie and logout

### Tasks (Protected)

- `GET /tasks` - list tasks (own tasks for user, own/all via scope for admin)
- `GET /tasks/new` - create task form
- `POST /tasks` - create task
- `GET /tasks/:id/edit` - edit task form
- `PUT /tasks/:id` - update task
- `DELETE /tasks/:id` - delete task
- `POST /tasks/categories` - create category

## Validation Behavior

- Password must be at least 6 characters.
- Duplicate usernames are blocked with a clear message.
- Validation errors are shown on the register form.

## Troubleshooting

- **MongoDB connection error (`uri undefined`)**:
	- Ensure `.env` exists (not only `.env.example`).
	- Ensure `MONGO_URI` is present and valid.
- **Port already in use (`EADDRINUSE`)**:
	- Stop previous Node process using port `3000`, then restart.

## Author

- Yash Patel
