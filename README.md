# 🚀 Otic Business - AI-Powered SME Management Platform

> **Empowering African SMEs with AI-driven growth, mobile POS, and integrated business management**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KING-EDWIN/otic-business)

## 🌟 Features

### 📱 **Mobile-First POS System**
- Real-time barcode scanning with phone camera
- Instant receipt generation
- Multi-payment support (Mobile Money, Cards, Flutterwave)
- Offline-capable sales processing

### 📊 **AI-Powered Analytics**
- Sales forecasting and trend analysis
- Inventory optimization recommendations
- Customer behavior insights
- Fraud detection and anomaly alerts

### 🏪 **Inventory Management**
- Automatic barcode generation
- Real-time stock tracking
- Low-stock alerts
- Supplier management
- Category organization

### 💳 **Integrated Accounting**
- QuickBooks API integration
- Automated P&L and balance sheets
- Tax computation and compliance
- Financial reporting

### 🔐 **Tier-Based Subscriptions**
- **Free Trial**: 14 days full access
- **Basic Plan**: UGX 1,000,000/month - POS, basic reports
- **Standard Plan**: UGX 3,000,000/month - + QuickBooks, AI analytics
- **Premium Plan**: UGX 5,000,000/month - + Multi-branch, forecasting

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: React Query, Context API
- **Barcode Scanning**: ZXing Library
- **Charts**: Recharts
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KING-EDWIN/otic-business.git
   cd otic-business
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Run the SQL files in order:
     - `database-schema.sql` - Creates all tables
     - `backend-functions-safe.sql` - Creates backend functions
     - `seed-demo-data.sql` - Populates demo data

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:8080`

## 📱 Demo Account

**Email**: `demo@oticbusiness.com`  
**Password**: `demo123456`

This gives you full access to test all features with pre-populated demo data.

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Your app will be live at**: `https://your-app-name.vercel.app`

### Alternative Deployments

- **Netlify**: Similar to Vercel, excellent for React apps
- **Railway**: Good for full-stack applications
- **Self-hosted**: Use the provided Docker configuration

## 📊 Database Schema

The app uses PostgreSQL with the following main tables:
- `user_profiles` - User and business information
- `products` - Product catalog with barcodes
- `sales` - Transaction records
- `sale_items` - Individual sale line items
- `subscriptions` - User subscription plans
- `analytics_data` - Business intelligence data

## 🔧 API Endpoints

- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **RPC Functions**: Custom business logic
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

## 📱 Mobile Support

- **Responsive Design**: Works on all screen sizes
- **PWA Ready**: Can be installed as mobile app
- **Camera Integration**: Barcode scanning with phone camera
- **Offline Support**: Basic functionality without internet

## 🔐 Security

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure user sessions
- **Input Validation**: All inputs sanitized
- **HTTPS Only**: Secure data transmission

## 📈 Performance

- **Vite Build**: Lightning-fast development and builds
- **React Query**: Intelligent caching and data fetching
- **Code Splitting**: Optimized bundle sizes
- **CDN**: Global content delivery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [DEPLOYMENT.md](DEPLOYMENT.md) file
- **Issues**: Open an issue on GitHub
- **Email**: Contact the development team

## 🌍 Made for Africa

Built specifically for African SMEs with:
- Mobile Money integration
- Local currency support (UGX)
- Offline-first approach
- Mobile-optimized interface
- African business workflows

---

**Built with ❤️ for African SMEs**