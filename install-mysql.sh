#!/bin/bash

# Quick MySQL Installation and Setup Script
# For Ubuntu/Debian systems

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║          MySQL Installation & Setup Script                    ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database credentials
DB_USER="eacse_broker"
DB_PASS="broker@2025"
DB_NAME="eacse_broker"

echo "This script will:"
echo "  1. Install MySQL Server"
echo "  2. Create database: $DB_NAME"
echo "  3. Create user: $DB_USER"
echo "  4. Grant privileges"
echo "  5. Push Prisma schema"
echo ""
echo -e "${YELLOW}⚠️  This requires sudo privileges${NC}"
echo ""
read -p "Continue? (y/n): " CONTINUE

if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 1: Updating package index..."
echo "════════════════════════════════════════════════════════════════"
sudo apt update

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 2: Installing MySQL Server..."
echo "════════════════════════════════════════════════════════════════"
sudo apt install mysql-server -y

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 3: Starting MySQL service..."
echo "════════════════════════════════════════════════════════════════"
sudo systemctl start mysql
sudo systemctl enable mysql

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 4: Creating database and user..."
echo "════════════════════════════════════════════════════════════════"

sudo mysql <<MYSQL_SCRIPT
-- Create database
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';

-- Grant privileges
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show results
SELECT 'Database created successfully!' AS status;
SHOW DATABASES LIKE '$DB_NAME';
SELECT user, host FROM mysql.user WHERE user='$DB_USER';
MYSQL_SCRIPT

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 5: Testing connection..."
echo "════════════════════════════════════════════════════════════════"

if mysql -u "$DB_USER" -p"$DB_PASS" -e "SELECT 'Connection successful!' AS status;" 2>/dev/null; then
    echo -e "${GREEN}✓ Database connection successful!${NC}"
else
    echo -e "${RED}✗ Connection failed!${NC}"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 6: Pushing Prisma schema..."
echo "════════════════════════════════════════════════════════════════"

if npx prisma db push; then
    echo -e "${GREEN}✓ Schema pushed successfully!${NC}"
else
    echo -e "${RED}✗ Failed to push schema${NC}"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 7: Generating Prisma Client..."
echo "════════════════════════════════════════════════════════════════"

if npx prisma generate; then
    echo -e "${GREEN}✓ Prisma Client generated!${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma Client${NC}"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "Step 8: Verifying database structure..."
echo "════════════════════════════════════════════════════════════════"

mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SHOW TABLES;"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║               ✅ INSTALLATION COMPLETE! ✅                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}MySQL is now installed and configured!${NC}"
echo ""
echo "Database Information:"
echo "  Host:     localhost"
echo "  Port:     3306"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Password: $DB_PASS"
echo ""
echo "Next steps:"
echo "  1. Start your application: npm run dev"
echo "  2. View database: npx prisma studio"
echo "  3. Test all features"
echo ""
echo "To secure MySQL (recommended):"
echo "  sudo mysql_secure_installation"
echo ""
