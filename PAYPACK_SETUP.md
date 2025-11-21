# Paypack Integration Setup

## Current Issue: "Unsupported Provider" Error

This error occurs because **phone numbers must be whitelisted** in your Paypack merchant dashboard before they can be used for transactions.

## How to Fix

### Step 1: Access Your Paypack Dashboard
1. Go to [Paypack Merchant Dashboard](https://merchants.paypack.rw/)
2. Log in with your merchant credentials

### Step 2: Whitelist Phone Numbers
1. Navigate to Settings or Configuration section
2. Find "Whitelisted Numbers" or "Allowed Phone Numbers"
3. Add the phone number you want to test: `250780605612`
4. Save the changes

### Step 3: Test the Integration
1. Restart your development server: `npm run dev`
2. Try making a deposit with the whitelisted phone number
3. You should receive an SMS prompt on your phone to approve the payment

## Important Notes

- **No Test/Production Modes**: Paypack doesn't have separate test and production environments
- **Whitelist Required**: ALL phone numbers must be whitelisted before use
- **For Production**: Request Paypack to enable all Rwanda phone numbers for your merchant account
- **Current Credentials**: Using production credentials (no sandbox mode)

## Current Configuration

```env
PAYPACK_BASE_URL=https://payments.paypack.rw/api
PAYPACK_APP_ID=b9a5d4ee-c61a-11f0-8828-deadd43720af
PAYPACK_APP_SECRET=54baf8daddc45c215ffe953f5ef8efe9da39a3ee5e6b4b0d3255bfef95601890afd80709
PAYPACK_TEST_MODE=false
```

## Test Mode (Simulated Payments)

If you want to test without real payments while waiting for phone number whitelisting:

```env
PAYPACK_TEST_MODE=true
```

This will:
- ✅ Simulate successful payments
- ✅ Update wallet balances
- ✅ Create transaction records
- ❌ NOT send real SMS or charge money
- ❌ NOT require whitelisted numbers

## Production Deployment

Before going live:
1. Contact Paypack support to enable all Rwanda phone numbers
2. Set `PAYPACK_TEST_MODE=false`
3. Ensure your merchant account is fully verified
4. Test with multiple phone numbers from different providers (MTN, Airtel, etc.)

## API Documentation

- [Paypack API Docs](https://docs.paypack.rw/)
- [Merchant Dashboard](https://merchants.paypack.rw/)
- [Support](https://paypack.rw/contact)
