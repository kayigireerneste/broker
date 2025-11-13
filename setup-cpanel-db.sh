#!/bin/bash

# cPanel MySQL Connection Helper Script

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║           cPanel MySQL Migration Helper                       ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you configure your cPanel database connection.${NC}"
echo ""

# Collect cPanel database details
echo "Enter your cPanel MySQL database details:"
echo ""

read -p "Database Host (e.g., sql.example.com or localhost): " DB_HOST
read -p "Database Name (e.g., cpanel_eacse_broker): " DB_NAME
read -p "Database User (e.g., cpanel_broker): " DB_USER
read -sp "Database Password: " DB_PASS
echo ""
read -p "Database Port (default 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Database Configuration Summary:"
echo "═══════════════════════════════════════════════════════════════"
echo "Host:     $DB_HOST"
echo "Port:     $DB_PORT"
echo "Database: $DB_NAME"
echo "User:     $DB_USER"
echo "Password: ********"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Construct connection string
CONNECTION_STRING="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Your DATABASE_URL will be:"
echo -e "${YELLOW}$CONNECTION_STRING${NC}"
echo ""

read -p "Do you want to update .env file? (y/n): " UPDATE_ENV

if [ "$UPDATE_ENV" = "y" ] || [ "$UPDATE_ENV" = "Y" ]; then
    # Backup current .env
    if [ -f .env ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo -e "${GREEN}✓ Backed up current .env file${NC}"
    fi
    
    # Update .env
    if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
        # Replace existing DATABASE_URL
        sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$CONNECTION_STRING\"|g" .env
        echo -e "${GREEN}✓ Updated DATABASE_URL in .env${NC}"
    else
        # Add DATABASE_URL
        echo "" >> .env
        echo "# cPanel MySQL Database" >> .env
        echo "DATABASE_URL=\"$CONNECTION_STRING\"" >> .env
        echo -e "${GREEN}✓ Added DATABASE_URL to .env${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Testing Connection..."
echo "═══════════════════════════════════════════════════════════════"

# Test connection with Prisma
if npx prisma db pull --force 2>&1 | grep -q "Introspected"; then
    echo -e "${GREEN}✓ Connection successful!${NC}"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "Next Steps:"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    echo "1. Push your schema to the database:"
    echo -e "   ${BLUE}npx prisma db push${NC}"
    echo ""
    echo "2. Generate Prisma Client:"
    echo -e "   ${BLUE}npx prisma generate${NC}"
    echo ""
    echo "3. View your database:"
    echo -e "   ${BLUE}npx prisma studio${NC}"
    echo ""
    echo "4. Start your application:"
    echo -e "   ${BLUE}npm run dev${NC}"
    echo ""
    
    read -p "Do you want to push the schema now? (y/n): " PUSH_SCHEMA
    
    if [ "$PUSH_SCHEMA" = "y" ] || [ "$PUSH_SCHEMA" = "Y" ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════════════"
        echo "Pushing Schema to Database..."
        echo "═══════════════════════════════════════════════════════════════"
        
        if npx prisma db push; then
            echo ""
            echo -e "${GREEN}✓ Schema pushed successfully!${NC}"
            echo ""
            
            # Generate client
            echo "Generating Prisma Client..."
            npx prisma generate
            
            echo ""
            echo "╔═══════════════════════════════════════════════════════════════╗"
            echo "║                                                               ║"
            echo "║               ✅ MIGRATION COMPLETE! ✅                      ║"
            echo "║                                                               ║"
            echo "╚═══════════════════════════════════════════════════════════════╝"
            echo ""
            echo "Your database is ready! You can now start your application:"
            echo -e "${BLUE}npm run dev${NC}"
            echo ""
        else
            echo ""
            echo -e "${RED}✗ Failed to push schema${NC}"
            echo "Check the error messages above for details."
        fi
    fi
else
    echo ""
    echo -e "${RED}✗ Connection failed!${NC}"
    echo ""
    echo "Possible issues:"
    echo "1. Remote MySQL access not enabled in cPanel"
    echo "2. Incorrect credentials"
    echo "3. Database doesn't exist"
    echo "4. Firewall blocking connection"
    echo ""
    echo "Solutions:"
    echo ""
    echo "1. Enable Remote MySQL in cPanel:"
    echo "   - Login to cPanel"
    echo "   - Go to: Databases → Remote MySQL"
    echo "   - Add your IP address or use '%' for any host"
    echo ""
    echo "2. Check your IP address:"
    echo "   curl -4 ifconfig.me"
    echo ""
    echo "3. Use SSH Tunnel (alternative):"
    echo "   ssh -L 3306:localhost:3306 user@your-server.com"
    echo "   Then use 'localhost' as host in .env"
    echo ""
    echo "See CPANEL_MIGRATION_GUIDE.md for detailed troubleshooting."
fi

echo ""
