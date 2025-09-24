# Supabase Email Templates Configuration

This document provides the complete email templates for Supabase Authentication with Otic Business branding.

## 🎨 Template Design Principles

- **Brand Colors**: Navy (#040458) and Orange (#faa51a) gradient
- **Logo**: OTIC Business logo
- **Responsive**: Mobile-friendly design
- **Professional**: Clean, modern design
- **Security-focused**: Clear security notices

## 📧 Email Templates

### 1. Confirm Signup Template

**Subject**: Welcome to Otic Business - Confirm Your Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Otic Business</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #040458;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
            text-align: center;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(4, 4, 88, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .features {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 24px;
            margin: 32px 0;
        }
        
        .features h3 {
            color: #040458;
            font-size: 18px;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .feature-list {
            list-style: none;
            padding: 0;
        }
        
        .feature-list li {
            padding: 8px 0;
            color: #4b5563;
            position: relative;
            padding-left: 24px;
        }
        
        .feature-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #faa51a;
            font-weight: bold;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #040458;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 24px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">OTIC</div>
            <h1>Welcome to Otic Business!</h1>
            <p>The AI-Powered Business Platform That Sees, Understands, and Automates</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <p class="welcome-text">
                Hi there! 👋<br>
                Thank you for joining Otic Business. We're excited to have you on board!
            </p>
            
            <p style="color: #4b5563; margin-bottom: 24px;">
                To complete your account setup and start using our AI-powered business management platform, please confirm your email address by clicking the button below:
            </p>
            
            <!-- CTA Button -->
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Confirm My Email Address
                </a>
            </div>
            
            <!-- Features Preview -->
            <div class="features">
                <h3>🚀 What's Next?</h3>
                <ul class="feature-list">
                    <li>AI-powered sales and inventory management</li>
                    <li>Smart analytics and business insights</li>
                    <li>Mobile POS with camera-based product recognition</li>
                    <li>Real-time financial reporting and accounting</li>
                    <li>Multi-branch management and team collaboration</li>
                </ul>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <p>
                    <strong>🔒 Security Note:</strong> This confirmation link will expire in 24 hours. 
                    If you didn't create an account with Otic Business, please ignore this email.
                </p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #040458; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Otic Business</strong></p>
            <p>Empowering African SMEs with AI-driven business solutions</p>
            <p>
                <a href="https://oticbusiness.com">Visit our website</a> | 
                <a href="https://oticbusiness.com/support">Support</a> | 
                <a href="https://oticbusiness.com/privacy">Privacy Policy</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This email was sent to {{ .Email }}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
```

### 2. Reset Password Template

**Subject**: Reset Your Otic Business Password

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Otic Business</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #040458;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(4, 4, 88, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #040458;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 24px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">OTIC</div>
            <h1>Password Reset Request</h1>
            <p>Otic Business Security</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #4b5563; margin-bottom: 24px;">
                We received a request to reset your password for your Otic Business account. Click the button below to create a new password:
            </p>
            
            <!-- CTA Button -->
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Reset My Password
                </a>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <p>
                    <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security. 
                    If you didn't request this password reset, please ignore this email and consider changing your password.
                </p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #040458; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
            
            <h3 style="color: #1f2937; margin-top: 32px; margin-bottom: 16px;">Security Tips:</h3>
            <ul style="color: #4b5563; padding-left: 20px;">
                <li>Use a strong, unique password</li>
                <li>Don't share your password with anyone</li>
                <li>Log out from shared computers</li>
                <li>Enable two-factor authentication if available</li>
            </ul>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Otic Business</strong></p>
            <p>Empowering African SMEs with AI-driven business solutions</p>
            <p>
                <a href="https://oticbusiness.com">Visit our website</a> | 
                <a href="https://oticbusiness.com/support">Support</a> | 
                <a href="https://oticbusiness.com/privacy">Privacy Policy</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This email was sent to {{ .Email }}. If you didn't request a password reset, please contact our support team immediately.
            </p>
        </div>
    </div>
</body>
</html>
```

### 3. Magic Link Template

**Subject**: Your Otic Business Login Link

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Link - Otic Business</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #040458;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(4, 4, 88, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #040458;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 24px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">OTIC</div>
            <h1>Your Login Link</h1>
            <p>Otic Business Authentication</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Sign in to Otic Business</h2>
            <p style="color: #4b5563; margin-bottom: 24px;">
                Click the button below to securely sign in to your Otic Business account:
            </p>
            
            <!-- CTA Button -->
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Sign In to Otic Business
                </a>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <p>
                    <strong>🔒 Security Notice:</strong> This link will expire in 1 hour for your security. 
                    If you didn't request this login link, please ignore this email.
                </p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #040458; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Otic Business</strong></p>
            <p>Empowering African SMEs with AI-driven business solutions</p>
            <p>
                <a href="https://oticbusiness.com">Visit our website</a> | 
                <a href="https://oticbusiness.com/support">Support</a> | 
                <a href="https://oticbusiness.com/privacy">Privacy Policy</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This email was sent to {{ .Email }}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
```

### 4. Change Email Address Template

**Subject**: Confirm Your New Email Address - Otic Business

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm New Email - Otic Business</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #040458;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(4, 4, 88, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #040458;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 24px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">OTIC</div>
            <h1>Confirm New Email</h1>
            <p>Otic Business Account Update</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Email Address Change Request</h2>
            <p style="color: #4b5563; margin-bottom: 24px;">
                We received a request to change your email address for your Otic Business account. 
                Click the button below to confirm this new email address:
            </p>
            
            <!-- CTA Button -->
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Confirm New Email Address
                </a>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <p>
                    <strong>🔒 Security Notice:</strong> This confirmation link will expire in 24 hours. 
                    If you didn't request this email change, please ignore this email and contact our support team.
                </p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #040458; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Otic Business</strong></p>
            <p>Empowering African SMEs with AI-driven business solutions</p>
            <p>
                <a href="https://oticbusiness.com">Visit our website</a> | 
                <a href="https://oticbusiness.com/support">Support</a> | 
                <a href="https://oticbusiness.com/privacy">Privacy Policy</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This email was sent to {{ .Email }}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
```

### 5. Reauthentication Template

**Subject**: Reauthentication Required - Otic Business

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reauthentication Required - Otic Business</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background-color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #040458;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #040458 0%, #faa51a 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(4, 4, 88, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
        }
        
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer a {
            color: #040458;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 24px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">OTIC</div>
            <h1>Reauthentication Required</h1>
            <p>Otic Business Security</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Security Verification Required</h2>
            <p style="color: #4b5563; margin-bottom: 24px;">
                For your security, we need to verify your identity before proceeding with this action. 
                Click the button below to reauthenticate:
            </p>
            
            <!-- CTA Button -->
            <div class="button-container">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Verify My Identity
                </a>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <p>
                    <strong>🔒 Security Notice:</strong> This verification link will expire in 1 hour for your security. 
                    If you didn't request this verification, please ignore this email.
                </p>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
                Having trouble with the button? Copy and paste this link into your browser:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #040458; word-break: break-all;">{{ .ConfirmationURL }}</a>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Otic Business</strong></p>
            <p>Empowering African SMEs with AI-driven business solutions</p>
            <p>
                <a href="https://oticbusiness.com">Visit our website</a> | 
                <a href="https://oticbusiness.com/support">Support</a> | 
                <a href="https://oticbusiness.com/privacy">Privacy Policy</a>
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
                This email was sent to {{ .Email }}. If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
```

## 🔧 Supabase Configuration Steps

### 1. Authentication Settings

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Configure the following:

**Site URL**: `https://oticbusiness.com`

**Redirect URLs** (add all of these):
- `https://oticbusiness.com/auth/callback`
- `https://oticbusiness.com/verify-email`
- `https://oticbusiness.com/reset-password`
- `https://oticbusiness.com/oauth-callback`

### 2. Email Templates

1. Go to **Authentication** → **Email Templates**
2. For each template type, replace the default HTML with the templates above:
   - **Confirm signup** → Use the "Confirm Signup Template"
   - **Reset password** → Use the "Reset Password Template"
   - **Magic link** → Use the "Magic Link Template"
   - **Email change** → Use the "Change Email Address Template"
   - **Reauthentication** → Use the "Reauthentication Template"

### 3. SMTP Configuration (Optional)

If you want to use your own SMTP server:

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure with your SMTP provider:
   - **Host**: `smtp.resend.com` (or your provider)
   - **Port**: `587`
   - **Username**: `resend` (or your username)
   - **Password**: `[Your API Key]`
   - **Sender email**: `noreply@oticbusiness.com`

## ✅ Testing

After updating the templates:

1. **Test email verification**: Sign up with a new account
2. **Test password reset**: Request a password reset
3. **Test magic link**: Use magic link authentication
4. **Verify URLs**: Ensure all links point to `oticbusiness.com` in production

## 🎯 Key Features

- **Branded Design**: Uses Otic Business colors and logo
- **Responsive**: Works on mobile and desktop
- **Security-focused**: Clear security notices and expiration times
- **Professional**: Clean, modern design
- **Consistent**: All templates follow the same design pattern
