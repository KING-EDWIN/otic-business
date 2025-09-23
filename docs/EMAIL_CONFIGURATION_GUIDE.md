# Email Configuration Guide for OTIC Business

## 📧 Overview

This guide covers the complete email setup for OTIC Business using Supabase SMTP with Resend integration. The system handles user verification, password resets, and business notifications.

## 🔧 Current Configuration

### **SMTP Provider: Resend**
- **Service**: Resend (via Supabase)
- **Status**: ✅ Configured
- **Domain**: oticbusiness.com

### **Email Features Implemented**
- ✅ User email verification
- ✅ Password reset emails
- ✅ Account confirmation
- ✅ Business notifications
- ✅ System alerts

---

## 📋 Email Templates

### **1. Email Verification Template**

**Subject**: Verify your OTIC Business account
**Template**: `email-verification.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email - OTIC Business</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #040458, #faa51a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #faa51a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to OTIC Business!</h1>
            <p>Your AI-powered business management platform</p>
        </div>
        <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up for OTIC Business! To complete your registration and start using our platform, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
            
            <h3>What's Next?</h3>
            <ul>
                <li>✅ Access your personalized dashboard</li>
                <li>✅ Set up your business profile</li>
                <li>✅ Start managing inventory with AI</li>
                <li>✅ Track sales and analytics</li>
            </ul>
            
            <p><strong>Need help?</strong> If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
            <p>This email was sent to {{ .Email }}. If you didn't create an account with OTIC Business, you can safely ignore this email.</p>
            <p>&copy; 2024 OTIC Business. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

### **2. Password Reset Template**

**Subject**: Reset your OTIC Business password
**Template**: `password-reset.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Your Password - OTIC Business</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #040458, #faa51a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #faa51a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
            <p>OTIC Business Security</p>
        </div>
        <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password for your OTIC Business account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request this password reset, please ignore this email and consider changing your password.
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">{{ .ConfirmationURL }}</p>
            
            <h3>Security Tips:</h3>
            <ul>
                <li>Use a strong, unique password</li>
                <li>Don't share your password with anyone</li>
                <li>Log out from shared computers</li>
                <li>Enable two-factor authentication if available</li>
            </ul>
        </div>
        <div class="footer">
            <p>This email was sent to {{ .Email }}. If you didn't request a password reset, please contact our support team immediately.</p>
            <p>&copy; 2024 OTIC Business. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
```

---

## 🚀 Implementation Details

### **1. Email Verification Flow**

```typescript
// User signs up
const { data, error } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?user_type=${userType}`
  }
})

// Email is sent automatically
// User clicks link in email
// Redirected to /auth/callback
// EmailVerificationService.handleEmailVerificationCallback() is called
// User profile is updated with email_verified: true
// User is redirected to appropriate dashboard
```

### **2. Password Reset Flow**

```typescript
// User requests password reset
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password?user_type=${userType}`
})

// Email is sent with reset link
// User clicks link in email
// Redirected to /reset-password
// User enters new password
// Password is updated via supabase.auth.updateUser()
```

### **3. Email Verification Service**

The `EmailVerificationService` provides:

- **`sendVerificationEmail()`** - Resend verification email
- **`isEmailVerified()`** - Check verification status
- **`updateEmailVerificationStatus()`** - Update database status
- **`handleEmailVerificationCallback()`** - Process verification callback
- **`sendPasswordResetEmail()`** - Send password reset
- **`checkVerificationStatus()`** - Get verification status

---

## 🔧 Supabase Configuration

### **1. Authentication Settings**

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Configure **Site URL**: `https://oticbusiness.com`
3. Add **Redirect URLs**:
   - `https://oticbusiness.com/auth/callback`
   - `https://oticbusiness.com/oauth-callback`
   - `https://oticbusiness.com/reset-password`

### **2. Email Templates**

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**
   - **Email change**

### **3. SMTP Settings**

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure with Resend:
   - **Host**: `smtp.resend.com`
   - **Port**: `587`
   - **Username**: `resend`
   - **Password**: `[Your Resend API Key]`
   - **Sender email**: `noreply@oticbusiness.com`

---

## 📊 Email Analytics

### **Tracked Metrics**
- Email delivery rates
- Open rates
- Click-through rates
- Bounce rates
- Unsubscribe rates

### **Monitoring**
- Failed email deliveries
- Spam folder issues
- Email template performance
- User engagement metrics

---

## 🛠️ Testing Email Functionality

### **1. Test Email Verification**

```bash
# Start development server
npm run dev

# Navigate to signup page
# Create a new account
# Check email for verification link
# Click verification link
# Verify redirect to dashboard
```

### **2. Test Password Reset**

```bash
# Go to login page
# Click "Forgot Password"
# Enter email address
# Check email for reset link
# Click reset link
# Enter new password
# Verify login with new password
```

### **3. Test Email Templates**

```bash
# Check email content
# Verify branding consistency
# Test responsive design
# Validate all links work
# Check spam score
```

---

## 🔒 Security Considerations

### **1. Email Security**
- ✅ HTTPS for all email links
- ✅ Secure token generation
- ✅ Token expiration (1 hour)
- ✅ Rate limiting on email sending
- ✅ Spam protection

### **2. Data Protection**
- ✅ No sensitive data in email content
- ✅ Secure password reset flow
- ✅ Email verification required
- ✅ Account lockout after failed attempts

---

## 📈 Performance Optimization

### **1. Email Delivery**
- ✅ Resend for reliable delivery
- ✅ Template optimization
- ✅ Image optimization
- ✅ Mobile-responsive design

### **2. User Experience**
- ✅ Clear call-to-action buttons
- ✅ Helpful error messages
- ✅ Loading states
- ✅ Success confirmations

---

## 🚨 Troubleshooting

### **Common Issues**

1. **Emails not being sent**
   - Check SMTP configuration
   - Verify Resend API key
   - Check email quotas

2. **Verification links not working**
   - Check redirect URL configuration
   - Verify domain settings
   - Check URL encoding

3. **Users not receiving emails**
   - Check spam folders
   - Verify email addresses
   - Check delivery logs

### **Debug Steps**

1. Check Supabase logs
2. Verify email templates
3. Test with different email providers
4. Check DNS settings
5. Validate SMTP configuration

---

## 📞 Support

For email-related issues:

1. **Check Supabase Dashboard** - Authentication logs
2. **Review Resend Dashboard** - Delivery analytics
3. **Test with different emails** - Gmail, Outlook, etc.
4. **Contact Support** - Technical assistance

---

*This email configuration ensures reliable communication with users while maintaining security and providing an excellent user experience.*

**Last Updated**: December 2024
**Version**: 1.0.0
