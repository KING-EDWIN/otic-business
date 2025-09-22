# Flutterwave Integration Guide for OTIC Business

This guide follows the exact integration plan specified for OTIC Business.

## 🚀 Implementation Overview

### 1. **Setup Complete** ✅
- ✅ Flutterwave API keys configured (public key in frontend, secret key in backend)
- ✅ Orders table created with proper schema
- ✅ Payment verification service implemented
- ✅ Frontend checkout integration complete

### 2. **Frontend Implementation** ✅
- ✅ "Pay with Flutterwave" button implemented
- ✅ Flutterwave Checkout Modal integration
- ✅ Proper transaction reference generation (`OTIC-{timestamp}-{random}`)
- ✅ Customer details passed correctly
- ✅ Redirect URL configured

### 3. **Backend Verification** ✅
- ✅ Payment verification endpoint implemented
- ✅ Flutterwave API integration for transaction verification
- ✅ Database order status updates
- ✅ Proper error handling

### 4. **Database Schema** ✅
- ✅ Orders table with all required fields
- ✅ Proper RLS policies
- ✅ Indexes for performance
- ✅ Order summaries view

## 🔧 Environment Variables Required

Add these to your `.env` file:

```env
# Flutterwave Configuration
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key-X
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key-X

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📋 Database Setup

**IMPORTANT**: The existing `orders` table doesn't have Flutterwave-specific columns. Run this SQL script to add the required columns:

```sql
-- Run this in Supabase SQL Editor
-- File: ADD_FLUTTERWAVE_COLUMNS_TO_ORDERS.sql
```

This script will:
- Add Flutterwave-specific columns to the existing `orders` table
- Create necessary indexes for performance
- Add sample test data
- Create helper functions for payment status updates

## 🧪 Testing Guide

### Test Keys (Sandbox)
- **Public Key**: `FLWPUBK_TEST-...-X`
- **Secret Key**: `FLWSECK_TEST-...-X`

### Test Cards
- **Visa**: `4187427415564246`
- **Mastercard**: `5438898014560229`
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **PIN**: Any 4 digits

### Test Mobile Money Numbers
- **MTN**: `+256700000000`
- **Airtel**: `+256700000001`

### Test Flow
1. Go to `/payments` page
2. Enter a test phone number
3. Click "Pay Now" on any tier
4. Use test card details or mobile money
5. Complete payment
6. Verify redirect to success page

## 🔄 Payment Flow

### 1. **Customer Initiates Payment**
```javascript
// Frontend triggers Flutterwave Checkout
FlutterwaveCheckout({
  public_key: process.env.FLW_PUBLIC_KEY,
  tx_ref: "OTIC-1703123456789-abc123def",
  amount: 50000, // UGX 50,000
  currency: "UGX",
  payment_options: "mobilemoneyuganda,card,ussd",
  customer: {
    email: "customer@example.com",
    phonenumber: "+256700000000",
    name: "Customer Name",
  },
  callback: function(payment) {
    // Send payment.id to backend for verification
  }
});
```

### 2. **Backend Verification**
```javascript
// Verify with Flutterwave API
const response = await axios.get(
  `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
  {
    headers: {
      Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`
    }
  }
);

if (response.data.status === "success") {
  // ✅ Payment verified
  // Save order in DB with "paid" status
  await db.orders.update({
    tx_ref: response.data.data.tx_ref,
    status: "paid",
    amount: response.data.data.amount,
    currency: response.data.data.currency,
    customer_email: response.data.data.customer.email,
  });
}
```

### 3. **Database Updates**
- Order created with `payment_status: 'pending'`
- After verification: `payment_status: 'paid'`
- Transaction details stored in orders table

## 🛡️ Security Features

### 1. **API Key Security**
- ✅ Public key only in frontend
- ✅ Secret key only in backend
- ✅ Environment variables properly configured

### 2. **Database Security**
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own orders
- ✅ Proper authentication checks

### 3. **Payment Verification**
- ✅ Server-side verification with Flutterwave API
- ✅ Transaction ID validation
- ✅ Amount and currency verification

## 📊 Order Management

### Order Status Flow
1. **Pending**: Order created, payment initiated
2. **Paid**: Payment verified and successful
3. **Failed**: Payment failed or verification failed

### Order Fields
- `id`: Unique order identifier
- `tx_ref`: Transaction reference (OTIC-{timestamp}-{random})
- `transaction_id`: Flutterwave transaction ID
- `amount`: Payment amount
- `currency`: Payment currency (UGX)
- `payment_status`: pending/paid/failed
- `customer_name`, `customer_email`, `customer_phone`
- `created_at`, `updated_at`
- `user_id`: Associated user
- `tier`: Subscription tier (basic/standard/premium)

## 🔍 Troubleshooting

### Common Issues

1. **"Flutterwave public key not configured"**
   - Check `.env` file has `VITE_FLUTTERWAVE_PUBLIC_KEY`
   - Restart dev server after adding env vars

2. **"Payment verification failed"**
   - Check secret key is correct
   - Verify transaction ID is valid
   - Check Flutterwave API status

3. **"Order not found"**
   - Check `tx_ref` parameter in URL
   - Verify order was created in database

4. **CORS errors**
   - Ensure using Flutterwave web SDK (not direct API calls)
   - Check domain is whitelisted in Flutterwave dashboard

### Debug Steps
1. Check browser console for errors
2. Verify environment variables are loaded
3. Check Supabase database for order records
4. Test with Flutterwave test keys
5. Use test card numbers for payment testing

## 🚀 Going Live

### Production Checklist
- [ ] Switch to live Flutterwave keys
- [ ] Update webhook URLs to production
- [ ] Test with real payment methods
- [ ] Configure proper error monitoring
- [ ] Set up payment notifications
- [ ] Review security settings

### Live Keys
- **Public Key**: `FLWPUBK-...-X`
- **Secret Key**: `FLWSECK-...-X`

## 📞 Support

- **Flutterwave Documentation**: https://developer.flutterwave.com/
- **Flutterwave Support**: support@flutterwave.com
- **OTIC Business Support**: [Your support contact]

---

**Implementation Status**: ✅ Complete
**Last Updated**: [Current Date]
**Version**: 1.0.0
