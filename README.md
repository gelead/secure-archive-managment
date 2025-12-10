# Secure Archive Management System

Enterprise-grade secure archive management system with comprehensive access control and authentication features.

## Features

- **Multiple Access Control Models**: MAC, DAC, RBAC, RuBAC, ABAC
- **Comprehensive Authentication**: Password, MFA, Biometric support
- **Audit & Logging**: Encrypted logs, centralized logging, alerting
- **Data Protection**: Automated backups, encryption
- **User Management**: Role-based access, profile management

## Project Structure

```
secure-archive-system/
├── backend/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── models/            # MongoDB Models/Schemas
│   │   ├── middleware/        # Custom middleware
│   │   ├── controllers/       # Route controllers
│   │   ├── services/          # Business logic/services
│   │   ├── utils/             # Utility functions
│   │   ├── routes/            # API Routes
│   │   ├── scripts/           # Database scripts
│   │   └── server.js          # Main server file
│   ├── logs/                  # Application logs
│   └── backups/               # System backups
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API services
│   │   └── styles/            # CSS files
├── database/                  # Database scripts & schemas
│   ├── migrations/            # DB migrations
│   └── seeds/                 # Seed data
├── docker/                    # Docker configuration
└── docs/                      # Documentation
```

## Quick Start

1. Install dependencies: `npm install`
2. Configure `.env` file (copy from `.env.example`)
3. Initialize database: `npm run init-db`
4. Start backend: `npm run start-server`
5. Start frontend: `npm run dev`

## Default Credentials

- Admin: username: `admin`, password: `Admin@123!`

## Documentation

See `docs/` directory for detailed documentation:
- `setup-guide.md` - Installation and setup instructions
- `api-docs.md` - API endpoint documentation
- `requirements.md` - Project requirements and features

## Docker Deployment

```bash
cd docker
docker-compose up -d
```

## License

See LICENSE file.
