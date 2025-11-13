#!/bin/bash

# MySQL Migration Script for Broker Application
# This script helps complete the MySQL migration

echo "============================================"
echo "MySQL Migration Helper Script"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is installed
echo "Step 1: Checking MySQL installation..."
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL client not found${NC}"
    echo ""
    echo "Install MySQL client with one of these commands:"
    echo "  sudo apt install mysql-client-core"
    echo "  sudo apt install mariadb-client-core"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓ MySQL client found${NC}"
fi

# Check if MySQL server is running
echo ""
echo "Step 2: Checking MySQL server status..."
if systemctl is-active --quiet mysql || systemctl is-active --quiet mariadb; then
    echo -e "${GREEN}✓ MySQL server is running${NC}"
else
    echo -e "${RED}❌ MySQL server is not running${NC}"
    echo ""
    echo "Start MySQL with:"
    echo "  sudo systemctl start mysql"
    echo "  (or: sudo systemctl start mariadb)"
    echo ""
    exit 1
fi

# Test database connection
echo ""
echo "Step 3: Testing database connection..."
DB_USER="eacse_broker"
DB_PASS="broker@2025"
DB_HOST="localhost"
DB_NAME="eacse_broker"

if mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "SELECT 1;" &> /dev/null; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to MySQL${NC}"
    echo ""
    echo "Please verify:"
    echo "  - Username: $DB_USER"
    echo "  - Password: $DB_PASS"
    echo "  - Host: $DB_HOST"
    echo ""
    exit 1
fi

# Check if database exists
echo ""
echo "Step 4: Checking if database exists..."
if mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "USE $DB_NAME;" &> /dev/null; then
    echo -e "${GREEN}✓ Database '$DB_NAME' exists${NC}"
else
    echo -e "${YELLOW}⚠ Database '$DB_NAME' does not exist${NC}"
    echo ""
    read -p "Do you want to create it? (y/n): " CREATE_DB
    if [ "$CREATE_DB" = "y" ] || [ "$CREATE_DB" = "Y" ]; then
        mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        echo -e "${GREEN}✓ Database created successfully${NC}"
    else
        echo "Please create the database manually and run this script again."
        exit 1
    fi
fi

# Push Prisma schema
echo ""
echo "Step 5: Pushing Prisma schema to MySQL..."
echo -e "${YELLOW}Running: npx prisma db push${NC}"
echo ""

if npx prisma db push; then
    echo ""
    echo -e "${GREEN}✓ Schema pushed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Failed to push schema${NC}"
    echo "Check the error messages above for details."
    exit 1
fi

# Generate Prisma client
echo ""
echo "Step 6: Generating Prisma Client..."
if npx prisma generate; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Show database tables
echo ""
echo "Step 7: Verifying database structure..."
echo ""
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" -e "SHOW TABLES;"

echo ""
echo "============================================"
echo -e "${GREEN}✓ MySQL Migration Complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Test your application: npm run dev"
echo "  2. Run Prisma Studio to view data: npx prisma studio"
echo "  3. Create seed data if needed"
echo ""
echo "If you had data in PostgreSQL, you'll need to migrate it manually."
echo "See MYSQL_MIGRATION_GUIDE.md for details."
echo ""
