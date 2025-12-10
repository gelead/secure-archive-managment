#!/bin/bash
# Update MongoDB Atlas connection string

cat > .env << 'ENVEOF'
# MongoDB Configuration (MongoDB Atlas)
MONGO_URI=mongodb+srv://Gelead:legendgelel1243@cluster0.mzrm4fg.mongodb.net/secure_archive?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB=secure_archive

# JWT Secret (change this in production!)
JWT_SECRET=dev_jwt_secret_change_me_in_production_12345

# Server Port
SERVER_PORT=4000
NODE_ENV=development

# Log Encryption Key (32+ characters)
LOG_KEY=dev_log_key_32_bytes_minimum_change_this_in_production_12345678901234567890
ENVEOF

echo "✅ .env file updated with MongoDB Atlas connection string"
