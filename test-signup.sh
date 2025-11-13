#!/bin/bash

# Test signup endpoint

echo "Testing signup endpoint..."
echo ""

curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "phoneCountryCode": "+250",
    "phone": "788123456",
    "password": "Test@1234",
    "confirmPassword": "Test@1234",
    "gender": "MALE",
    "country": "Rwanda",
    "city": "Kigali"
  }' | jq .

echo ""
echo "Check the database:"
sudo mysql -D eacse_broker -e "SELECT id, fullName, email, phone, isVerified FROM User;"
