# Setup Guide

## Prerequisites

- Node.js 18+ 
- MongoDB 7+
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Initialize database:
   ```bash
   node backend/src/scripts/initDatabase.js
   ```

5. Start backend server:
   ```bash
   npm run start-server
   ```

6. Start frontend (in another terminal):
   ```bash
   npm run dev
   ```

## Docker Setup

```bash
cd docker
docker-compose up -d
```

## Default Credentials

- Admin: username: `admin`, password: `Admin@123!`

## Environment Variables

See `.env.example` for all required environment variables.

