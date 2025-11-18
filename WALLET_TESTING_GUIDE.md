# Wallet System Testing Guide

## Quick Start Testing

### Prerequisites
1. Ensure you're logged in as a CLIENT user
2. Navigate to `/dashboard/client/wallet`

## Test Scenarios

### Test 1: Add Payment Method (Mobile Money)
**Expected Behavior**: User can add MTN Mobile Money payment method

**Steps**:
1. Click "Add New Method" button
2. Select Type: "Mobile Money"
3. Enter Provider: "MTN"
4. Enter Phone Number: "0788123456"
5. Enter Account Name: "Test User" (optional)
6. Click "Add Method"

**Expected Result**:
- ✅ Payment method appears in the list
- ✅ Shows provider name "MTN"
- ✅ Shows phone number
- ✅ First method is marked as "Default"

---

### Test 2: Deposit Money (Balance Increases)
**Expected Behavior**: User deposits 10,000 RWF and balance increases

**Steps**:
1. Ensure you have at least one payment method added
2. Select "Deposit" tab (green button)
3. Enter Amount: 10000
4. Select your payment method from the list
5. Click "Deposit Funds"
6. Wait for processing (mock ~1 second delay)

**Expected Result**:
- ✅ Success message appears
- ✅ Available Balance increases by 10,000
- ✅ New transaction appears in "Recent Transactions"
- ✅ Transaction shows as "DEPOSIT" with +Rwf 10,000
- ✅ Transaction status is "completed"

**Mock Behavior**:
- 95% chance of success
- 5% chance of failure (randomly simulated)
- Minimum deposit: 500 RWF
- Maximum deposit: 5,000,000 RWF

---

### Test 3: Withdraw Money (Balance Decreases)
**Expected Behavior**: User withdraws 5,000 RWF and balance decreases

**Pre-condition**: Must have at least 5,000 RWF in balance (deposit first)

**Steps**:
1. Select "Withdraw" tab (blue button)
2. Enter Amount: 5000
3. Select your payment method from the list
4. Click "Withdraw Funds"
5. Wait for processing

**Expected Result**:
- ✅ Success message appears
- ✅ Available Balance decreases by 5,000
- ✅ New transaction appears in "Recent Transactions"
- ✅ Transaction shows as "WITHDRAW" with -Rwf 5,000
- ✅ Transaction status is "completed"

**Validation**:
- ❌ Cannot withdraw more than available balance
- ❌ Minimum withdrawal: 500 RWF
- ❌ Maximum withdrawal: 5,000,000 RWF

---

### Test 4: Insufficient Balance
**Expected Behavior**: Withdrawal fails when insufficient balance

**Steps**:
1. Check your Available Balance
2. Try to withdraw more than your balance
3. Click "Withdraw Funds"

**Expected Result**:
- ✅ Error message: "Insufficient balance"
- ✅ Balance remains unchanged
- ✅ Transaction record created with status "FAILED"

---

### Test 5: Add Multiple Payment Methods
**Expected Behavior**: User can add and manage multiple payment methods

**Steps**:
1. Add MTN Mobile Money (0788123456)
2. Add Bank Account:
   - Type: Bank Account
   - Provider: "Bank of Kigali"
   - Account Number: "1234567890"
3. Add Credit Card:
   - Type: Credit Card
   - Provider: "Visa"
   - Account Number: "4532123456789012"

**Expected Result**:
- ✅ All three payment methods appear
- ✅ Each has appropriate icon (phone/building/card)
- ✅ First method marked as "Default"
- ✅ Can select any method for transactions

---

### Test 6: Delete Payment Method
**Expected Behavior**: User can remove unwanted payment methods

**Steps**:
1. Ensure you have at least 2 payment methods
2. Click the trash icon on one payment method
3. Confirm deletion

**Expected Result**:
- ✅ Confirmation dialog appears
- ✅ Payment method is removed from list
- ✅ Cannot delete if it's the only method (future enhancement)

---

### Test 7: Transaction History
**Expected Behavior**: All transactions are logged and displayed

**Steps**:
1. Perform 2-3 deposits
2. Perform 1-2 withdrawals
3. Scroll to "Recent Transactions" table

**Expected Result**:
- ✅ All transactions appear in chronological order (newest first)
- ✅ Deposits show green color with + sign
- ✅ Withdrawals show blue color with - sign
- ✅ Each transaction shows:
  - Reference number
  - Type (Deposit/Withdraw)
  - Payment method
  - Amount
  - Status
  - Date/Time

---

### Test 8: Balance Calculation
**Expected Behavior**: Balance calculations are accurate

**Test Sequence**:
1. Start with 0 balance
2. Deposit 10,000 → Balance = 10,000
3. Deposit 5,000 → Balance = 15,000
4. Withdraw 3,000 → Balance = 12,000
5. Deposit 8,000 → Balance = 20,000
6. Withdraw 7,000 → Balance = 13,000

**Expected Result**:
- ✅ Each transaction updates balance correctly
- ✅ Available Balance = Total Balance - Locked Balance
- ✅ No negative balances possible

---

## Edge Cases to Test

### Edge Case 1: Minimum Amount
- Try depositing 499 RWF
- **Expected**: Error message "Minimum deposit amount is 500 RWF"

### Edge Case 2: Maximum Amount
- Try depositing 5,000,001 RWF
- **Expected**: Error message "Maximum deposit amount is 5,000,000 RWF"

### Edge Case 3: No Payment Methods
- Delete all payment methods
- Try to deposit/withdraw
- **Expected**: Error message prompting to add payment method first

### Edge Case 4: Mock Failure (5% chance)
- Keep trying deposits until you hit the simulated failure
- **Expected**: Error message "Transaction failed. Please try again."
- **Expected**: Transaction record with status "FAILED"

---

## API Testing with cURL

### Add Payment Method
```bash
curl -X POST http://localhost:3000/api/wallet/payment-methods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MOBILE_MONEY",
    "provider": "MTN",
    "accountNumber": "0788123456",
    "accountName": "Test User"
  }'
```

### Deposit Money
```bash
curl -X POST http://localhost:3000/api/wallet/deposit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "paymentMethodId": "PAYMENT_METHOD_UUID"
  }'
```

### Withdraw Money
```bash
curl -X POST http://localhost:3000/api/wallet/withdraw \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "paymentMethodId": "PAYMENT_METHOD_UUID"
  }'
```

### Get Wallet Info
```bash
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Payment Methods
```bash
curl -X GET http://localhost:3000/api/wallet/payment-methods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Payment Method
```bash
curl -X DELETE "http://localhost:3000/api/wallet/payment-methods?id=PAYMENT_METHOD_UUID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Checklist for Complete Testing

- [ ] Can add Mobile Money payment method
- [ ] Can add Bank Account payment method
- [ ] Can add Credit Card payment method
- [ ] Can deposit money successfully
- [ ] Balance increases after deposit
- [ ] Deposit transaction appears in history
- [ ] Can withdraw money successfully
- [ ] Balance decreases after withdrawal
- [ ] Withdrawal transaction appears in history
- [ ] Cannot withdraw more than available balance
- [ ] Can delete payment methods
- [ ] Can view transaction history
- [ ] All balance cards show correct amounts
- [ ] UI is responsive on mobile
- [ ] Loading states work correctly
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Mock MTN integration simulates delay
- [ ] Transaction references are unique

---

## Known Limitations (Mock Mode)

1. **No Real Money Transfer**: This is using mock MTN MoMo integration
2. **Simulated Delay**: 1 second delay is simulated, real API may be slower
3. **Random Failures**: 5% failure rate is simulated for testing
4. **No SMS Notifications**: Real MTN MoMo sends SMS confirmations
5. **No Transaction Reversals**: Cannot reverse/refund transactions yet
6. **No Receipt Generation**: No PDF/email receipts generated

---

## Next Steps After Testing

1. **Production Integration**:
   - Replace mock functions with real MTN MoMo API
   - Get MTN developer credentials
   - Configure webhook endpoints
   - Test with real money (small amounts first)

2. **Enhancements**:
   - Add transaction receipt download
   - Add SMS notifications
   - Add email confirmations
   - Add transaction filters/search
   - Add export to CSV/PDF
   - Add scheduled deposits
   - Add payment method verification

3. **Security**:
   - Add 2FA for large transactions
   - Add transaction limits
   - Add fraud detection
   - Add IP whitelisting for API calls
