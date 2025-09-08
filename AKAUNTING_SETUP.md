# Akaunting API Setup Guide

## **🔧 How to Get Akaunting API (FREE)**

### **Step 1: Create Akaunting Account**
1. **Visit**: https://akaunting.com
2. **Click "Get Started Free"**
3. **Sign up** with your email (no credit card required)
4. **Choose "Self-hosted"** or **"Cloud"** (both are free)

### **Step 2: Get API Credentials**
1. **Login to your Akaunting dashboard**
2. **Go to Settings → API** (or Settings → Developer → API)
3. **Click "Create New Token"**
4. **Copy your API Token** (keep this safe!)
5. **Note your Company ID** (usually "1" for first company)

### **Step 3: Configure Your App**

Add these environment variables to your `.env` file:

```env
# Akaunting API Configuration
VITE_AKAUNTING_URL=https://your-company.akaunting.com
VITE_AKAUNTING_API_KEY=your_api_token_here
VITE_AKAUNTING_COMPANY_ID=1
```

**Example:**
```env
VITE_AKAUNTING_URL=https://mybusiness.akaunting.com
VITE_AKAUNTING_API_KEY=ak_1234567890abcdef
VITE_AKAUNTING_COMPANY_ID=1
```

### **Step 4: Test the Integration**

1. **Restart your app**: `npm run dev`
2. **Go to Dashboard → Accounting tab**
3. **Try creating an invoice** - it should sync with Akaunting
4. **Check your Akaunting dashboard** - you should see the data

## **🎯 What This Gives You**

### **Real Accounting Features:**
- ✅ **Professional Invoicing** - Create invoices in Akaunting
- ✅ **Customer Management** - Sync customers between systems
- ✅ **Expense Tracking** - Record business expenses
- ✅ **Financial Reports** - Profit & Loss, Balance Sheet
- ✅ **Multi-currency Support** - Perfect for African businesses
- ✅ **Tax Management** - VAT calculations and reporting

### **Data Sync:**
- ✅ **Bidirectional Sync** - Data flows both ways
- ✅ **Real-time Updates** - Changes appear immediately
- ✅ **Fallback System** - Works even if Akaunting is down
- ✅ **Data Consistency** - Same numbers everywhere

## **🔧 Troubleshooting**

### **API Not Working?**
1. **Check your URL** - Make sure it's correct
2. **Verify API Key** - Copy it exactly from Akaunting
3. **Check Company ID** - Usually "1" for first company
4. **Test API manually** - Use Postman or curl

### **Test API Connection:**
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "X-Company: 1" \
     https://your-company.akaunting.com/api/customers
```

### **Still Not Working?**
- Check Akaunting logs
- Verify CORS settings
- Make sure your Akaunting instance is accessible
- Contact Akaunting support if needed

## **📊 Benefits for Your Business**

1. **Professional Accounting** - Full accounting software integration
2. **Compliance Ready** - Meets accounting standards
3. **Multi-currency** - Perfect for African businesses
4. **Free Forever** - No subscription costs
5. **Scalable** - Grows with your business
6. **Real-time Sync** - Always up-to-date data

## **🚀 Next Steps**

1. **Set up Akaunting account**
2. **Get API credentials**
3. **Add environment variables**
4. **Test the integration**
5. **Start using real accounting features!**

Your Otic Business system will now have **professional accounting** with **real data sync**! 🎯


