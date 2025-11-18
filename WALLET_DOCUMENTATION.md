# Client Wallet System Documentation

## Overview
The wallet system allows clients to manage their funds, add payment methods, deposit money, and withdraw money. The implementation includes mock MTN Mobile Money integration that can be replaced with real MTN MoMo API endpoints in production.

## Features Implemented

### 1. Database Schema
- **PaymentMethod Model**: Stores user payment methods (Mobile Money, Bank Account, Credit Card)
- **Wallet Model**: Tracks user balance and locked balance
- **Transaction Model**: Records all deposits and withdrawals

### 2. API Endpoints

#### Payment Methods (`/api/wallet/payment-methods`)
- **GET**: Retrieve all payment methods for the authenticated user
- **POST**: Add a new payment method
  - Request body:
    ```json
    {
      "type": "MOBILE_MONEY" | "BANK_ACCOUNT" | "CREDIT_CARD",
      "provider": "MTN",
      "accountNumber": "0788123456",
      "accountName": "John Doe",
      "isDefault": false
    }
    ```
- **DELETE**: Remove a payment method (query param: `id`)

#### Deposit (`/api/wallet/deposit`)
- **POST**: Deposit money to wallet
  - Request body:
    ```json
    {
      "amount": 10000,
      "paymentMethodId": "payment-method-uuid"
    }
    ```
  - Mock MTN Integration:
    - Minimum: 500 RWF
    - Maximum: 5,000,000 RWF
    - 95% success rate (simulated)
    - 1 second delay (simulated API call)
  - On success:
    - Wallet balance increases
    - Transaction record created with status COMPLETED
    - Returns new balance and transaction details

#### Withdraw (`/api/wallet/withdraw`)
- **POST**: Withdraw money from wallet
  - Request body:
    ```json
    {
      "amount": 5000,
      "paymentMethodId": "payment-method-uuid"
    }
    ```
  - Validates sufficient balance before processing
  - Mock MTN Integration (same limits as deposit)
  - On success:
    - Wallet balance decreases
    - Transaction record created with status COMPLETED
    - Returns new balance and transaction details

#### Wallet Info (`/api/wallet`)
- **GET**: Get wallet balance and recent transactions
  - Query params: `limit` (default: 10), `offset` (default: 0)
  - Returns:
    - Wallet balance, locked balance, available balance
    - Paginated transaction history
    - Transaction count and pagination info

### 3. Frontend Features

#### Balance Display
- Available Balance (can be used for transactions)
- Total Balance (includes locked funds)
- Locked Balance (funds reserved for pending orders)

#### Payment Method Management
- Add new payment methods (Mobile Money, Bank Account, Credit Card)
- View all saved payment methods
- Delete payment methods
- Mark payment method as default
- Visual indicators for payment method type

#### Deposit & Withdraw
- Toggle between deposit and withdrawal modes
- Select from saved payment methods
- Real-time amount validation
- Transaction summary before submission
- Processing state with loading indicators
- Success/error feedback

#### Transaction History
- View recent transactions
- Color-coded transaction types (deposit/withdraw)
- Status indicators (completed, pending, failed)
- Formatted amounts with currency
- Responsive table layout

## Testing the Implementation

### Step 1: Add a Payment Method
1. Navigate to the wallet page
2. Click "Add New Method"
3. Fill in the form:
   - Type: Mobile Money
   - Provider: MTN
   - Phone Number: 0788123456
   - Account Name: Test User
4. Click "Add Method"

### Step 2: Deposit Money
1. Ensure you have a payment method added
2. Select the "Deposit" tab
3. Enter amount (e.g., 10000)
4. Select your payment method
5. Click "Deposit Funds"
6. Verify:
   - Success message appears
   - Balance increases by the deposited amount
   - New transaction appears in history

### Step 3: Withdraw Money
1. Select the "Withdraw" tab
2. Enter amount (less than your balance)
3. Select your payment method
4. Click "Withdraw Funds"
5. Verify:
   - Success message appears
   - Balance decreases by the withdrawn amount
   - New transaction appears in history

### Step 4: View Transaction History
1. Scroll to the "Recent Transactions" section
2. Verify all transactions are displayed
3. Check transaction types, amounts, and statuses

## Mock MTN Mobile Money Integration

The current implementation uses mock functions that simulate MTN MoMo API behavior:

```typescript
// Mock deposit function (deposit/route.ts)
async function mockMTNDeposit(
  phoneNumber: string,
  amount: number,
  reference: string
): Promise<{ success: boolean; transactionId?: string; error?: string }>
```

```typescript
// Mock withdrawal function (withdraw/route.ts)
async function mockMTNWithdraw(
  phoneNumber: string,
  amount: number,
  reference: string
): Promise<{ success: boolean; transactionId?: string; error?: string }>
```

### Replacing with Real MTN MoMo API

To integrate with the real MTN MoMo API:

1. **Get MTN MoMo API Credentials**:
   - Register at MTN Developer Portal
   - Get API User, API Key, and Subscription Key
   - Configure callback URL

2. **Install MTN MoMo SDK**:
   ```bash
   npm install mtn-momo
   ```

3. **Replace Mock Functions**:
   - In `deposit/route.ts`, replace `mockMTNDeposit` with real MTN Collection API
   - In `withdraw/route.ts`, replace `mockMTNWithdraw` with real MTN Disbursement API

4. **Example Integration**:
   ```typescript
   import { Collections } from 'mtn-momo';

   const collections = new Collections({
     userSecret: process.env.MTN_MOMO_USER_SECRET,
     userId: process.env.MTN_MOMO_USER_ID,
     primaryKey: process.env.MTN_MOMO_PRIMARY_KEY,
   });

   async function realMTNDeposit(phoneNumber: string, amount: number, reference: string) {
     try {
       const result = await collections.requestToPay({
         amount: amount.toString(),
         currency: 'RWF',
         externalId: reference,
         payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
         payerMessage: 'Deposit to wallet',
         payeeNote: `Deposit: ${reference}`,
       });
       return { success: true, transactionId: result.referenceId };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

## Security Considerations

1. **Authentication**: All endpoints verify JWT token
2. **Authorization**: Users can only access their own wallet and payment methods
3. **Balance Validation**: Withdrawals check available balance before processing
4. **Transaction Atomicity**: Database transactions ensure balance updates and transaction records are atomic
5. **Input Validation**: All inputs are validated before processing

## Future Enhancements

1. **Real MTN MoMo Integration**: Replace mock functions with actual API calls
2. **Transaction Fees**: Add configurable fee structure
3. **Transaction Limits**: Add daily/monthly limits per user
4. **Refund System**: Allow refunds for failed transactions
5. **Webhooks**: Implement webhook handlers for async payment notifications
6. **Multi-currency Support**: Support multiple currencies
7. **Export Transactions**: Allow users to download transaction history
8. **Recurring Deposits**: Schedule automatic deposits
9. **Payment Method Verification**: Verify bank accounts/phone numbers before use
10. **Two-Factor Authentication**: Require 2FA for large transactions

## API Response Examples

### Successful Deposit
```json
{
  "message": "Deposit successful",
  "transaction": {
    "id": "uuid",
    "userId": "uuid",
    "type": "DEPOSIT",
    "amount": "10000",
    "status": "COMPLETED",
    "paymentMethod": "MOBILE_MONEY - MTN",
    "reference": "DEP1700123456789",
    "createdAt": "2025-11-18T10:30:00Z"
  },
  "newBalance": "15000.00"
}
```

### Failed Withdrawal (Insufficient Balance)
```json
{
  "error": "Insufficient balance"
}
```

### Get Wallet Response
```json
{
  "wallet": {
    "balance": "15000.00",
    "lockedBalance": "0.00",
    "availableBalance": "15000.00"
  },
  "transactions": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "amount": "10000",
      "status": "COMPLETED",
      "paymentMethod": "MOBILE_MONEY - MTN",
      "reference": "DEP1700123456789",
      "createdAt": "2025-11-18T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

## Error Codes

- **401 Unauthorized**: Missing or invalid token
- **400 Bad Request**: Invalid input (amount, payment method, etc.)
- **404 Not Found**: Payment method or wallet not found
- **500 Internal Server Error**: Server-side error

## Support

For issues or questions:
1. Check transaction history for failed transactions
2. Verify payment method is active
3. Ensure sufficient balance for withdrawals
4. Contact support with transaction reference number
