# 📧 Otic Vision Email Templates Setup Guide

## 🎯 Overview
This guide provides the complete setup for professional email templates in Supabase with the new Otic Vision branding, proper action buttons, and mobile-responsive design.

## 🖼️ Logo Setup

### Step 1: Upload Logo to Your Domain
1. **Upload the logo file** ` otic Vision blue.png` to your production domain:
   ```
   https://oticbusiness.com/ otic Vision blue.png
   ```

2. **Ensure the logo is accessible** via HTTPS for email clients

## 📧 Email Templates Configuration

### 1. Confirm Signup Template

**Subject**: `Welcome to Otic Vision - Confirm Your Email`

**Template Content**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Otic Vision - Confirm Your Email</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #040458 0%, #faa51a 100%); padding: 40px 30px; text-align: center; }
        .logo { width: 80px; height: 80px; margin: 0 auto 20px; background-color: white; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        .header h1 { color: white; font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        .header p { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome-text { font-size: 18px; color: #1f2937; margin-bottom: 24px; text-align: center; }
        .verification-box { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
        .verification-box h2 { color: #0369a1; font-size: 20px; margin-bottom: 12px; }
        .verification-box p { color: #0c4a6e; font-size: 14px; margin-bottom: 20px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #040458 0%, #faa51a 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(4, 4, 88, 0.3); transition: all 0.3s ease; }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(4, 4, 88, 0.4); }
        .features { margin: 32px 0; }
        .features h3 { color: #1f2937; font-size: 18px; margin-bottom: 16px; text-align: center; }
        .feature-list { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .feature-item { display: flex; align-items: center; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #faa51a; }
        .feature-icon { width: 20px; height: 20px; margin-right: 12px; color: #faa51a; }
        .feature-text { color: #374151; font-size: 14px; }
        .security-notice { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; }
        .security-notice h4 { color: #92400e; font-size: 14px; margin-bottom: 8px; }
        .security-notice p { color: #92400e; font-size: 12px; margin: 0; }
        .footer { background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
        .footer a { color: #040458; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
        @media (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header, .content, .footer { padding: 24px 20px; }
            .header h1 { font-size: 24px; }
            .cta-button { padding: 14px 28px; font-size: 14px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <img src="https://oticbusiness.com/ otic Vision blue.png" alt="Otic Vision" style="width: 60px; height: 60px; object-fit: contain;">
            </div>
            <h1>Welcome to Otic Vision!</h1>
            <p>Your business management platform awaits</p>
        </div>
        
        <div class="content">
            <div class="welcome-text">
                Hi {{.Email}},<br>
                Thank you for joining Otic Vision! We're excited to help you streamline your business operations.
            </div>
            
            <div class="verification-box">
                <h2>🔐 Verify Your Email Address</h2>
                <p>To complete your account setup and access all features, please verify your email address by clicking the button below:</p>
                <a href="{{.ConfirmationURL}}" class="cta-button">Verify Email Address</a>
            </div>
            
            <div class="features">
                <h3>🚀 What You Can Do With Otic Vision</h3>
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <span class="feature-text">Real-time business analytics and insights</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📦</span>
                        <span class="feature-text">Complete inventory management system</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">💰</span>
                        <span class="feature-text">Advanced accounting and financial tracking</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">👥</span>
                        <span class="feature-text">Team collaboration and user management</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📱</span>
                        <span class="feature-text">Mobile-responsive design for on-the-go access</span>
                    </div>
                </div>
            </div>
            
            <div class="security-notice">
                <h4>🛡️ Security Notice</h4>
                <p>This verification link will expire in 24 hours. If you didn't create an account with Otic Vision, please ignore this email or contact our support team.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@oticbusiness.com">support@oticbusiness.com</a></p>
            <p>© 2024 Otic Vision. All rights reserved.</p>
            <div class="social-links">
                <a href="https://oticbusiness.com">Website</a>
                <a href="https://oticbusiness.com/privacy">Privacy Policy</a>
                <a href="https://oticbusiness.com/terms">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>
```

### 2. Reset Password Template

**Subject**: `Reset Your Password - Otic Vision`

**Template Content**: (Use the reset-password.html template from the email-templates folder)

### 3. Google Signup Success Template

**Subject**: `🎉 Welcome to Otic Vision - Google Signup Success!`

**Template Content**: (Use the google-signup-success.html template from the email-templates folder)

## 🔧 Supabase Configuration Steps

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Each Template
1. **Confirm signup**: Replace the default template with the Otic Vision template
2. **Reset password**: Replace with the reset password template
3. **Magic Link**: Use the same styling as confirm signup

### Step 3: Set Redirect URLs
Configure these redirect URLs in Supabase:

**Site URL**: `https://oticbusiness.com`

**Redirect URLs**:
- `https://oticbusiness.com/auth/callback`
- `https://oticbusiness.com/auth/google-callback`
- `https://oticbusiness.com/verify-email-success`
- `https://oticbusiness.com/reset-password-success`
- `http://localhost:8081/auth/callback` (for development)

### Step 4: Email Provider Configuration
Ensure your email provider (Resend/SendGrid) is configured with:
- **From Email**: `noreply@oticbusiness.com`
- **From Name**: `Otic Vision`
- **Reply To**: `support@oticbusiness.com`

## 🎨 Design Features

### ✅ Professional Branding
- **Otic Vision logo** prominently displayed
- **Navy (#040458) and Orange (#faa51a)** color scheme
- **Gradient backgrounds** for visual appeal
- **Consistent typography** using system fonts

### ✅ Mobile Responsive
- **Responsive design** that works on all devices
- **Touch-friendly buttons** with proper sizing
- **Optimized layouts** for mobile screens
- **Readable text** at all screen sizes

### ✅ Action-Oriented
- **Clear call-to-action buttons** with hover effects
- **Direct links** to verification and dashboard pages
- **Proper button styling** with gradients and shadows
- **Accessible design** with proper contrast ratios

### ✅ Security Focused
- **Security notices** for user protection
- **Expiration warnings** for time-sensitive actions
- **Clear instructions** for each action
- **Professional tone** to build trust

## 🚀 Google OAuth Integration

### Features Implemented
- ✅ **Google Sign-in/Sign-up** buttons on all auth pages
- ✅ **OAuth callback handling** with proper user type detection
- ✅ **Profile completion flow** for new Google users
- ✅ **Congratulatory emails** for Google signups
- ✅ **Dashboard redirection** after successful auth

### OAuth Flow
1. **User clicks "Continue with Google"**
2. **Redirected to Google OAuth**
3. **Google returns to callback URL**
4. **System detects new vs existing user**
5. **New users**: Redirected to profile completion
6. **Existing users**: Redirected to dashboard
7. **Congratulatory email sent** for new Google users

## 📱 Mobile Responsiveness

### Responsive Features
- ✅ **Mobile-first design** approach
- ✅ **Responsive grid layouts** (1 col mobile, 2-4 cols desktop)
- ✅ **Touch-friendly buttons** and interactions
- ✅ **Optimized text sizes** for mobile reading
- ✅ **Collapsible navigation** for mobile
- ✅ **Mobile-specific components** where needed

### Breakpoints Used
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`

## 🎯 Next Steps

1. **Upload logo** to your production domain
2. **Configure email templates** in Supabase dashboard
3. **Set redirect URLs** in Supabase settings
4. **Test email delivery** with different email clients
5. **Test Google OAuth flow** end-to-end
6. **Verify mobile responsiveness** on actual devices

## 📞 Support

For any issues with email template setup:
- **Email**: support@oticbusiness.com
- **Documentation**: Check the email-templates folder for full HTML files
- **Testing**: Use the test pages in the test-pages folder

---

**🎉 Your Otic Vision platform is now ready with professional email templates, Google OAuth integration, and mobile-responsive design!**
