# Flutterwave Integration Setup Instructions

## Step 1: Get Flutterwave Credentials

1. **Sign up for Flutterwave**
   - Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
   - Create an account or sign in
   - Complete your business verification

2. **Get API Keys**
   - Navigate to **Settings > API Keys**
   - Copy your **Public Key** (starts with `FLWPUBK-`)
   - Copy your **Secret Key** (starts with `FLWSECK-`)
   - Note your **Merchant ID** (found in your dashboard)

## Step 2: Configure Environment Variables

### Frontend Environment Variables
Add these to your `.env` file in the project root:

```env
# Flutterwave Configuration
VITE_FLUTTERWAVE_PUBLIC_KEY=your_public_key_here
VITE_FLUTTERWAVE_SECRET_KEY=your_secret_key_here
VITE_FLUTTERWAVE_MERCHANT_ID=your_merchant_id_here
```

### Supabase Environment Variables
Add these to your Supabase project settings:

1. Go to **Settings > Edge Functions**
2. Add these environment variables:
   - `FLUTTERWAVE_SECRET_KEY=your_secret_key_here`
   - `FLUTTERWAVE_MERCHANT_ID=your_merchant_id_here`

## Step 3: Deploy Supabase Edge Function

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Deploy the webhook function**:
   ```bash
   supabase functions deploy flutterwave-webhook
   ```

3. **Get the webhook URL**:
   - Go to your Supabase dashboard
   - Navigate to **Edge Functions**
   - Copy the URL for `flutterwave-webhook`
   - It should look like: `https://your-project.supabase.co/functions/v1/flutterwave-webhook`

## Step 4: Configure Flutterwave Webhook

1. **In Flutterwave Dashboard**:
   - Go to **Settings > Webhooks**
   - Add a new webhook with the URL from Step 3
   - Select these events:
     - `charge.completed`
     - `charge.failed`
     - `transfer.completed`

2. **Test the webhook**:
   - Use Flutterwave's webhook testing tool
   - Or make a test payment to verify the webhook works

## Step 5: Run Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Run the contents of SETUP_PAYMENT_TRANSACTIONS_TABLE.sql
```

## Step 6: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test payments**:
   - Go to `/payments` page
   - Click on "Upgrade Plan" or use the "Flutterwave" tab
   - Make a test payment using Flutterwave's test cards

## Supported Payment Methods

The integration supports:
- **Cards**: Visa, Mastercard
- **Mobile Money**: MTN Mobile Money, Airtel Money
- **Bank Transfer**: Direct bank transfers
- **Other**: USSD, QR codes

## Test Cards (Flutterwave)

For testing, use these test card numbers:

**Successful Payment**:
- Card Number: `4187427415564246`
- CVV: `828`
- Expiry: `09/32`
- PIN: `3310`

**Failed Payment**:
- Card Number: `4187427415564246`
- CVV: `828`
- Expiry: `09/32`
- PIN: `3310`

## Troubleshooting

### Common Issues:

1. **"Invalid API Key" Error**:
   - Check that your environment variables are correctly set
   - Ensure you're using the right keys (Public vs Secret)

2. **Webhook Not Receiving Events**:
   - Verify the webhook URL is correct
   - Check Supabase Edge Function logs
   - Ensure webhook events are enabled in Flutterwave

3. **Payment Not Redirecting**:
   - Check that `redirect_url` is correctly set
   - Verify the success page route exists

4. **Database Errors**:
   - Ensure the `payment_transactions` table exists
   - Check RLS policies are correctly set

### Support:

- **Flutterwave Documentation**: [https://developer.flutterwave.com/](https://developer.flutterwave.com/)
- **Supabase Edge Functions**: [https://supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)

## Security Notes

- Never expose your Secret Key in frontend code
- Always use environment variables for sensitive data
- Enable webhook signature verification in production
- Use HTTPS for all webhook URLs
- Regularly rotate your API keys

## Production Checklist

Before going live:
- [ ] Replace test API keys with live keys
- [ ] Update webhook URLs to production URLs
- [ ] Test with real payment methods
- [ ] Set up monitoring and logging
- [ ] Configure proper error handling
- [ ] Test refund functionality
- [ ] Verify webhook signature validation

