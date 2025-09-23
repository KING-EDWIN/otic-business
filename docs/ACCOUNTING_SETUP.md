# Accounting Integration Setup Guide

## Akaunting Integration

Otic Business now includes free accounting integration using **Akaunting** - a free, open-source accounting software perfect for African SMEs.

### Features Included:
- ✅ **Invoice Management** - Create, send, and track invoices
- ✅ **Expense Tracking** - Record and categorize business expenses
- ✅ **Customer Management** - Manage customer information
- ✅ **Financial Reports** - Profit & Loss, Balance Sheet, Cash Flow
- ✅ **Real-time Dashboard** - Live financial statistics
- ✅ **Multi-currency Support** - Perfect for African businesses

## Setup Options

### Option 1: Use Demo Mode (Default)
The system works out-of-the-box with demo data for testing and demonstration purposes.

### Option 2: Connect to Akaunting (Production)
To connect to a real Akaunting instance:

1. **Install Akaunting** (Free):
   - Visit: https://akaunting.com
   - Download and install on your server
   - Or use their cloud hosting

2. **Get API Credentials**:
   - Login to your Akaunting instance
   - Go to Settings > API
   - Create a new API token
   - Note your Company ID

3. **Configure Environment Variables**:
   Create a `.env` file in your project root:
   ```env
   VITE_AKAUNTING_URL=https://your-akaunting-instance.com
   VITE_AKAUNTING_API_KEY=your_api_token_here
   VITE_AKAUNTING_COMPANY_ID=1
   ```

4. **Restart the Application**:
   ```bash
   npm run dev
   ```

## API Endpoints Used

The integration uses these Akaunting API endpoints:
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/{id}/send` - Send invoice
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/accounts` - List accounts
- `GET /api/reports/profit-loss` - Profit & Loss report
- `GET /api/reports/balance-sheet` - Balance Sheet report

## Demo Data

When in demo mode, the system shows:
- Sample invoices and customers
- Mock financial statistics
- Realistic transaction history
- All features work without external API

## Benefits for African SMEs

1. **Free Forever** - No subscription costs
2. **Local Currency** - Full UGX support
3. **Offline Capable** - Works without internet
4. **Mobile Friendly** - Access from any device
5. **Tax Compliant** - Meets local requirements
6. **Multi-language** - English and local languages

## Support

For Akaunting support:
- Documentation: https://akaunting.com/docs
- Community: https://akaunting.com/community
- GitHub: https://github.com/akaunting/akaunting

For Otic Business integration:
- Check the console for API errors
- Ensure CORS is enabled on your Akaunting instance
- Verify API token permissions


