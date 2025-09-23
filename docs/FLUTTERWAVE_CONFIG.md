# Flutterwave Configuration

## Environment Variables Setup

Create a `.env` file in your project root with these values:

```env
# Flutterwave Configuration (Test Environment)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-2b6aa140d3ee117e4c73771e1c42951f-X
VITE_FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-205bf0231484df7d6c9690f8d678c064-X
VITE_FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TEST2a678d8f2de5
VITE_FLUTTERWAVE_MERCHANT_ID=your_merchant_id_here
```

## Next Steps:

1. **Create the .env file** in your project root with the above content
2. **Get your Merchant ID** from Flutterwave dashboard:
   - Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com/)
   - Navigate to Settings > API Keys
   - Copy your Merchant ID and replace `your_merchant_id_here`

3. **Run the database setup**:
   ```sql
   -- Execute the contents of SETUP_PAYMENT_TRANSACTIONS_TABLE.sql in Supabase SQL Editor
   ```

4. **Deploy the webhook function**:
   ```bash
   supabase functions deploy flutterwave-webhook
   ```

5. **Configure webhook in Flutterwave**:
   - Go to Settings > Webhooks in Flutterwave dashboard
   - Add webhook URL: `https://your-project.supabase.co/functions/v1/flutterwave-webhook`
   - Select events: `charge.completed`, `charge.failed`, `transfer.completed`

## Test Cards for Development:

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

## Security Notes:

- These are TEST credentials - never use them in production
- For production, get live credentials from Flutterwave
- Keep your secret keys secure and never expose them in frontend code

