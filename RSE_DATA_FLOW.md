# RSE Data Integration - One-Way Sync

## Overview
Your platform automatically syncs market data FROM RSE every minute. When you make changes (trades), you communicate with RSE manually to update their records.

## Data Flow

### RSE → Your Database (Automatic)
```
Every 1 minute:
1. Cron job scrapes RSE website
2. Updates Company table (current prices, volumes)
3. Saves to MarketSnapshot table (historical record)
4. Your dashboards display updated data
```

### Your Database → RSE (Manual Communication)
```
When client trades:
1. Trade executes in your system
2. You notify RSE via email/phone/official channel
3. RSE updates their records manually
4. Next sync (1 min) pulls updated data back
```

## Database Tables

### 1. Company Table
**Current RSE market data:**
- `closingPrice` - Latest closing price from RSE
- `previousClosingPrice` - Previous closing price
- `priceChange` - Price change in Rwf
- `tradedVolume` - Total traded volume
- `tradedValue` - Total traded value
- `snapshotDate` - Last update timestamp

**Updated by:** `/api/market-sync` (every 1 minute)

### 2. MarketSnapshot Table
**Historical RSE data:**
- Every sync creates a new record
- Complete audit trail of all RSE updates
- Query past market data for analysis

**Fields:**
- `companyId` - Link to Company
- `security` - Security name from RSE
- `symbol` - Company symbol
- `closingPrice`, `previousClosingPrice`, `priceChange`
- `tradedVolume`, `tradedValue`
- `snapshotDate` - Market data date from RSE
- `syncedAt` - When we synced it

## API Endpoints

### Sync FROM RSE

**POST /api/market-sync?force=true**
- Manually trigger sync
- Updates Company table
- Creates MarketSnapshot records

**GET /api/market-sync**
- Check last sync time
- See sync status

### View Historical Data

**GET /api/market-snapshot?symbol=BK&limit=50**
Query historical market data:

```typescript
const response = await fetch('/api/market-snapshot?symbol=BK&limit=50');
const data = await response.json();
// Returns array of historical snapshots
```

## Usage Examples

### View Market History
```sql
-- Get last 10 syncs for BK Group
SELECT security, closingPrice, priceChange, snapshotDate, syncedAt
FROM MarketSnapshot
WHERE symbol = 'BK'
ORDER BY syncedAt DESC
LIMIT 10;
```

### Check Current Market Data
```sql
-- Get current data for all companies
SELECT name, symbol, closingPrice, priceChange, snapshotDate
FROM Company
WHERE symbol IS NOT NULL
ORDER BY snapshotDate DESC;
```

### Find Price Changes Over Time
```sql
-- Compare today vs yesterday
SELECT 
  c.name,
  c.symbol,
  c.closingPrice as current_price,
  ms.closingPrice as yesterday_price,
  (c.closingPrice - ms.closingPrice) as change
FROM Company c
LEFT JOIN MarketSnapshot ms ON c.id = ms.companyId
WHERE ms.snapshotDate = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
  AND c.symbol IS NOT NULL;
```

## Workflow: Client Buys Shares

1. **Client places order** → Trade created (PENDING)
2. **Trade executes** → Status: EXECUTED
3. **Update your database:**
   - Deduct from client wallet
   - Add to client portfolio
   - Update Company.availableShares
4. **Notify RSE manually:**
   - Email trade details to RSE
   - Or use official RSE communication channel
   - Include: Client CSD, Company CSD, quantity, price
5. **RSE updates their records** (manual process)
6. **Next sync** (1 minute) pulls updated data back

## What Gets Synced

### FROM RSE (Automatic):
✅ Closing prices
✅ Previous closing prices
✅ Price changes
✅ Traded volumes
✅ Traded values
✅ Market status (Open/Closed)

### TO RSE (Manual):
📧 Trade notifications via email/phone
📧 Share transfer requests
📧 Corporate actions
📧 Client registration updates

## Benefits

✅ **Real-time market data** - 1-minute sync interval
✅ **Complete history** - Every sync saved in MarketSnapshot
✅ **Audit trail** - Track all RSE data changes
✅ **No API dependency** - Works with RSE's current setup
✅ **Manual control** - You verify trades before notifying RSE
✅ **Compliance ready** - Full historical records

## Monitoring

### Check Sync Status
```bash
curl http://localhost:3000/api/market-sync
```

### Force Sync Now
```bash
curl -X POST http://localhost:3000/api/market-sync?force=true
```

### View Sync Logs
Check your server logs for:
```
[Market Sync] Starting market data fetch...
[Market Sync] Found 11 securities, syncing to database...
[Market Sync] Sync complete: 11 synced, 0 skipped, 0 errors
```

## RSE Communication Template

When notifying RSE about trades:

```
Subject: Trade Notification - [Date]

Dear RSE Team,

Please update your records with the following trade:

Trade Type: BUY/SELL
Client CSD: CSD123456
Client Name: John Doe
Company CSD: CSD789012
Security Symbol: BK
Quantity: 100 shares
Price: Rwf 338.00
Total Amount: Rwf 33,800.00
Execution Date: 2024-01-15 10:30:00

Best regards,
[Your Broker Name]
```

## Future Enhancement

When RSE provides an API, you can:
1. Add automated trade submission
2. Real-time trade confirmation
3. Webhook notifications from RSE
4. Automated reconciliation

For now, the manual process ensures accuracy and compliance.
