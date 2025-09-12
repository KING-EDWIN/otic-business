# Otic Business - Complete Project Context

## 🎯 **Project Overview**
Otic Business is a comprehensive business management platform built with React/TypeScript frontend and Supabase backend. It provides multi-business management, user roles, analytics, and various business tools.

## 🏗️ **Architecture**

### **Frontend Stack**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React

### **Backend Stack**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime
- **API**: Supabase RPC functions

## 📁 **Project Structure**

```
otic-business/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   ├── pages/               # Page components
│   ├── services/            # API service layers
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── dist/                    # Build output
└── *.sql                    # Database scripts
```

## 🔑 **Key Configuration Files**

### **Environment Configuration**
- **File**: `src/config/storageConfig.ts`
- **Purpose**: Centralized configuration for all environments
- **Supabase URL**: `https://jvgiyscchxxekcbdicco.supabase.co`
- **Environment**: Production

### **Supabase Client**
- **File**: `src/lib/supabaseClient.ts`
- **Purpose**: Supabase client initialization
- **Features**: Auto-refresh tokens, session persistence

## 🗄️ **Database Schema**

### **Core Tables**
1. **`user_profiles`** - User account information
2. **`businesses`** - Business entities
3. **`business_memberships`** - User-business relationships
4. **`system_troubleshoot_logs`** - Error reporting system
5. **`admin_auth`** - Admin authentication

### **Business Management Tables**
- **`businesses`**: Stores business information
- **`business_memberships`**: Links users to businesses with roles
- **`business_invitations`**: Handles user invitations (planned)

### **User Tier System**
- **`free_trial`**: 1 business, basic features
- **`start_smart`**: 3 businesses, enhanced features
- **`grow_intelligence`**: 10 businesses, advanced features
- **`enterprise_advantage`**: Unlimited businesses, all features

## 🔐 **Authentication & Authorization**

### **User Authentication**
- **Provider**: Supabase Auth
- **Methods**: Email/password, Google OAuth
- **Session Management**: Automatic refresh, persistent sessions

### **Row Level Security (RLS)**
- **Enabled**: On all tables
- **Policy Type**: User-specific data access
- **Pattern**: Users can only access their own data

### **Business Access Control**
- **Owner**: Full access to business
- **Admin**: Manage users, settings
- **Manager**: Manage operations
- **Employee**: Basic operations
- **Viewer**: Read-only access

## 🚀 **Key Features**

### **Multi-Business Management**
- Create multiple businesses
- Switch between business contexts
- Role-based access control
- Business-specific data isolation

### **User Management**
- Invite users to businesses
- Role assignment
- Permission management
- User activity tracking

### **Business Tools**
- Point of Sale (POS)
- Inventory management
- Customer management
- Accounting integration
- Analytics and reporting

### **Error Reporting System**
- Automatic error logging
- User-reported issues
- Admin dashboard for issue management
- System troubleshooting logs

## 🔧 **RPC Functions**

### **Business Management**
- **`get_user_businesses(user_id)`**: Get user's businesses
- **`can_create_business(user_id)`**: Check business creation limits
- **`get_business_members(business_id)`**: Get business members

### **Error Reporting**
- **`log_system_error(...)`**: Log system errors
- **`get_system_error_reports(...)`**: Get error reports (admin)
- **`update_error_report_status(...)`**: Update error status (admin)

## 🎨 **UI/UX Design**

### **Color Scheme**
- **Primary**: `#040458` (Dark Blue)
- **Secondary**: `#faa51a` (Orange)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Yellow)
- **Error**: `#ef4444` (Red)

### **Branding**
- **Company**: Otic Business
- **Logo**: `/Otic icon@2x.png`
- **Favicon**: `/favicon.ico`

## 📱 **Navigation Structure**

### **Main Navigation**
- **Dashboard**: Main business dashboard
- **POS**: Point of sale system
- **Inventory**: Product management
- **Accounting**: Financial management
- **Analytics**: Business analytics
- **Reports**: Business reports
- **Customers**: Customer management
- **Payments**: Payment processing
- **Settings**: User settings

### **Business Management**
- **Business Management**: List and manage businesses
- **Create Business**: Create new business
- **Business Dashboard**: Business-specific dashboard
- **Business Members**: Manage team members

### **My Extras**
- **Feature Access**: Tier-based feature access
- **Multi-User Access**: Invite users to business
- **Multi-Business Management**: Manage multiple businesses
- **Role-Based Permissions**: User role management

## 🐛 **Known Issues & Solutions**

### **Database Issues**
1. **Type Mismatch Errors**: RPC functions return types don't match database schema
   - **Solution**: Use `COMPLETE_DATABASE_FIX.sql`
   - **Cause**: VARCHAR vs TEXT type differences

2. **Missing Tables**: Some tables don't exist
   - **Solution**: Run complete table creation script
   - **Cause**: Incomplete database setup

3. **RLS Policy Issues**: Access denied errors
   - **Solution**: Recreate RLS policies
   - **Cause**: Incorrect or missing policies

### **Frontend Issues**
1. **Page Refresh**: Pages refresh when switching tabs
   - **Solution**: Fixed useEffect dependencies
   - **Cause**: Object reference changes in dependencies

2. **Business Not Found**: Business members page shows "Business Not Found"
   - **Solution**: Smart navigation based on business state
   - **Cause**: Missing businessId parameter

3. **Infinite Loading**: Pages load forever
   - **Solution**: Added error handling and fallbacks
   - **Cause**: Failed API calls without error handling

## 🛠️ **Development Workflow**

### **Database Changes**
1. **Always use**: `COMPLETE_DATABASE_FIX.sql` for major changes
2. **Test locally**: Use Supabase SQL Editor
3. **Verify**: Check RPC functions work
4. **Deploy**: Run scripts in production

### **Frontend Changes**
1. **Context Updates**: Update relevant contexts
2. **Service Updates**: Update API service calls
3. **Component Updates**: Update UI components
4. **Testing**: Test in browser with console logs

### **Error Handling**
1. **No Fallbacks**: Use real-time data only
2. **Error Reporting**: Log all errors to database
3. **User Feedback**: Show error popups with reporting
4. **Admin Monitoring**: Monitor error logs

## 📋 **Deployment**

### **Environment Variables**
- **VITE_SUPABASE_URL**: Supabase project URL
- **VITE_SUPABASE_ANON_KEY**: Supabase anonymous key
- **VITE_MISTRAL_API_KEY**: AI service key

### **Build Process**
- **Command**: `npm run build`
- **Output**: `dist/` directory
- **Deployment**: Static hosting (Vercel, Netlify)

## 🔍 **Debugging**

### **Browser Console**
- **Business Loading**: Check for RPC function calls
- **Error Logging**: Check for error reports
- **Authentication**: Check user session status

### **Database Queries**
- **User Businesses**: `SELECT * FROM get_user_businesses(auth.uid())`
- **Business Members**: `SELECT * FROM get_business_members('business-id')`
- **Error Logs**: `SELECT * FROM system_troubleshoot_logs`

### **Common Debug Commands**
```sql
-- Check current user
SELECT auth.uid(), auth.email();

-- Check user profile
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Check user businesses
SELECT * FROM get_user_businesses(auth.uid());

-- Check business members
SELECT * FROM get_business_members('business-id');
```

## 🎯 **Next Steps**

### **Immediate Fixes**
1. **Run**: `COMPLETE_DATABASE_FIX.sql` in Supabase SQL Editor
2. **Test**: Business management functionality
3. **Verify**: Multi-user access works
4. **Monitor**: Error reporting system

### **Future Enhancements**
1. **Business Invitations**: Complete invitation system
2. **Advanced Analytics**: Enhanced reporting
3. **Mobile App**: React Native version
4. **API Integration**: Third-party service integrations

---

**This document should be updated whenever major changes are made to the project structure or functionality.**
