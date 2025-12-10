# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# MongoDB Configuration (use local MongoDB or MongoDB Atlas)
MONGO_URI=mongodb://localhost:27017/secure_archive
MONGO_DB=secure_archive

# JWT Secret (change this in production!)
JWT_SECRET=your_jwt_secret_key_here_change_in_production

# Server Port
SERVER_PORT=4000
NODE_ENV=development

# Log Encryption Key (32+ characters)
LOG_KEY=your_log_encryption_key_32_bytes_minimum_change_this

# Email Configuration (for MFA and verification codes)
# For Gmail: Use App Password (not regular password)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=your-email@gmail.com
```

**Note:** If you don't have MongoDB installed locally, you can:
- Install MongoDB: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (free cloud): https://www.mongodb.com/cloud/atlas

## Step 3: Start MongoDB (if using local MongoDB)

```bash
# On Linux/Mac:
sudo systemctl start mongod
# or
mongod

# On Windows:
# Start MongoDB service from Services panel
```

## Step 4: Initialize Database

**⚠️ IMPORTANT: You MUST run this step before logging in!**

```bash
npm run init-db
```

This creates the default admin user:
- Username: `admin`
- Password: `Admin@123!`

**Note:** If you get "user not found" when trying to log in, run this command again to create the admin user.

## Step 5: Start Backend Server

Open a terminal and run:

```bash
npm run start-server
```

You should see:
```
[Database] Connected to MongoDB
[Server] Backend API server listening on http://localhost:4000
```

## Step 6: Start Frontend (in a new terminal)

Open another terminal and run:

```bash
npm run dev
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## Step 7: Access the Application

Open your browser and go to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/health

## Login Credentials

**⚠️ Make sure you've run `npm run init-db` first!**

- **Username:** `admin`
- **Password:** `Admin@123!`

If you see "user not found" error:
1. Stop the backend server (Ctrl+C)
2. Run: `npm run init-db`
3. Start the server again: `npm run start-server`
4. Try logging in again

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGO_URI` in `.env`
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/secure_archive`

### Port Already in Use
- Change `SERVER_PORT` in `.env` for backend
- Change port in `vite.config.ts` for frontend

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Running with Docker

If you prefer Docker:

```bash
cd docker
docker-compose up -d
```

This starts MongoDB, backend, and frontend in containers.

