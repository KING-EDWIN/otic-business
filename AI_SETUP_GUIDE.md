# 🤖 AI Integration Setup Guide

## Step 1: Get Mistral AI API Key

1. **Go to**: https://console.mistral.ai/
2. **Sign up** with your email
3. **Get your API key** from the dashboard
4. **Copy the key** (starts with `mistral-`)

## Step 2: Add Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration (Already configured)
VITE_SUPABASE_URL=https://jvgiyscchxxekcbdicco.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Z2l5c2NjaHh4ZWtjYmRpY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDc0MTAsImV4cCI6MjA3MjcyMzQxMH0.TPHpZCjKC0Xb-IhrS0mT_2IdS-mqANDjwPsmJCWUAu8

# AI Configuration
VITE_MISTRAL_API_KEY=your-mistral-api-key-here
```

## Step 3: For Vercel Deployment

Add the environment variable in Vercel:

1. **Go to**: https://vercel.com/dashboard
2. **Select your project**: otic-businesssss
3. **Go to Settings** → **Environment Variables**
4. **Add new variable**:
   - **Name**: `VITE_MISTRAL_API_KEY`
   - **Value**: Your Mistral API key
   - **Environment**: Production, Preview, Development

## Step 4: Test AI Features

1. **Start the app**: `npm run dev`
2. **Go to**: http://localhost:8080
3. **Sign in** and go to **Analytics** page
4. **Look for AI Insights** section
5. **Click refresh** to generate AI insights

## AI Features Available

### 🧠 AI Insights
- **Inventory Analysis**: Stock level recommendations
- **Sales Performance**: Revenue optimization tips
- **Financial Health**: Cost optimization advice
- **Customer Behavior**: Shopping pattern insights

### 🔮 AI Predictions
- **Sales Forecasting**: Revenue predictions
- **Inventory Needs**: Restocking recommendations
- **Customer Trends**: Behavior predictions
- **Financial Projections**: Profit forecasts

## Troubleshooting

### If AI features don't work:
1. **Check API key**: Make sure it's correctly set
2. **Check console**: Look for error messages
3. **Check network**: Ensure internet connection
4. **Check limits**: Mistral free tier has limits

### Error: "AI service temporarily unavailable"
- This means the API key is missing or invalid
- Check your `.env.local` file
- Restart the development server

## Free Tier Limits

- **Mistral AI**: 4,000 requests/month
- **Hugging Face**: Unlimited (with rate limits)
- **Usage**: Each AI insight = 1 request

## Next Steps

1. **Get your Mistral API key**
2. **Add it to environment variables**
3. **Test the AI features**
4. **Deploy to Vercel with the API key**

Your AI integration is ready! 🚀

