# 📧 Supabase Email Templates with Otic Logo Setup Guide

## 🎯 Overview
This guide shows how to add the Otic Business logo to Supabase email templates for a professional branded experience.

## 🖼️ Available Logo Files
The project contains these logo files in the `public/` directory:
- `Otic icon@2x.png` - Square icon logo
- `Otic horizontal@2x.png` - Horizontal logo

## 🌐 Option 1: Host Logos on Your Domain (Recommended)

### Step 1: Upload Logos to Your Domain
1. **Upload the logo files to your production domain:**
   ```
   https://oticbusiness.com/logos/Otic-icon@2x.png
   https://oticbusiness.com/logos/Otic-horizontal@2x.png
   ```

2. **Create a logos directory on your server** and upload both PNG files

### Step 2: Update Supabase Email Templates
1. **Go to Supabase Dashboard** → Authentication → Email Templates
2. **For each template** (Confirm signup, Reset password, etc.), add the logo:

```html
<!-- Add this at the top of your email template -->
<div style="text-align: center; margin-bottom: 30px;">
  <img src="https://oticbusiness.com/logos/Otic-horizontal@2x.png" 
       alt="Otic Business" 
       style="max-width: 200px; height: auto;" />
</div>
```

## 🌐 Option 2: Use Public CDN (Alternative)

### Step 1: Upload to Public CDN
1. **Upload logos to a public CDN** like:
   - Cloudinary
   - AWS S3 (public bucket)
   - GitHub (raw file URLs)

### Step 2: Use CDN URLs in Templates
```html
<img src="https://your-cdn.com/logos/Otic-horizontal@2x.png" 
     alt="Otic Business" 
     style="max-width: 200px; height: auto;" />
```

## 📝 Complete Email Template Examples

### Confirm Signup Template
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your email - Otic Business</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Logo Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #040458 0%, #faa51a 100%); border-radius: 10px;">
    <img src="https://oticbusiness.com/logos/Otic-horizontal@2x.png" 
         alt="Otic Business" 
         style="max-width: 200px; height: auto; filter: brightness(0) invert(1);" />
  </div>

  <!-- Main Content -->
  <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #040458; text-align: center; margin-bottom: 20px;">Welcome to Otic Business!</h1>
    
    <p>Hi there!</p>
    
    <p>Thank you for signing up for Otic Business. To complete your registration and start managing your business efficiently, please confirm your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #040458 0%, #faa51a 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                display: inline-block;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, you can also copy and paste this link into your browser:<br>
      <a href="{{ .ConfirmationURL }}" style="color: #faa51a;">{{ .ConfirmationURL }}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 14px;">
      If you didn't create an account with Otic Business, you can safely ignore this email.
    </p>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
    <p>© 2024 Otic Business. All rights reserved.</p>
    <p>Kampala, Uganda</p>
  </div>
</body>
</html>
```

### Reset Password Template
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password - Otic Business</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Logo Header -->
  <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #040458 0%, #faa51a 100%); border-radius: 10px;">
    <img src="https://oticbusiness.com/logos/Otic-horizontal@2x.png" 
         alt="Otic Business" 
         style="max-width: 200px; height: auto; filter: brightness(0) invert(1);" />
  </div>

  <!-- Main Content -->
  <div style="background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #040458; text-align: center; margin-bottom: 20px;">Reset Your Password</h1>
    
    <p>Hi there!</p>
    
    <p>We received a request to reset your password for your Otic Business account. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #040458 0%, #faa51a 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 8px; 
                font-weight: bold; 
                display: inline-block;">
        Reset Password
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, you can also copy and paste this link into your browser:<br>
      <a href="{{ .ConfirmationURL }}" style="color: #faa51a;">{{ .ConfirmationURL }}</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 14px;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
    <p>© 2024 Otic Business. All rights reserved.</p>
    <p>Kampala, Uganda</p>
  </div>
</body>
</html>
```

## 🔧 Implementation Steps

### Step 1: Upload Logos
```bash
# On your production server, create logos directory
mkdir -p /var/www/oticbusiness.com/logos

# Copy logo files from your local project
cp public/Otic-icon@2x.png /var/www/oticbusiness.com/logos/
cp public/Otic-horizontal@2x.png /var/www/oticbusiness.com/logos/
```

### Step 2: Update Supabase Templates
1. **Go to Supabase Dashboard**
2. **Navigate to Authentication → Email Templates**
3. **For each template:**
   - Click "Edit"
   - Replace the content with the template above
   - Update the logo URL to match your domain
   - Save changes

### Step 3: Test Email Templates
1. **Test signup flow** to verify logo appears
2. **Test password reset** to verify branding
3. **Check on different email clients** (Gmail, Outlook, etc.)

## 🎨 Design Notes

### Color Scheme
- **Primary Navy**: `#040458`
- **Accent Orange**: `#faa51a`
- **Gradient**: `linear-gradient(135deg, #040458 0%, #faa51a 100%)`

### Logo Usage
- **Horizontal logo** for email headers
- **Icon logo** for smaller spaces
- **White filter** for logos on colored backgrounds
- **Max width**: 200px to ensure mobile compatibility

## ✅ Benefits
- **Professional branding** in all email communications
- **Consistent visual identity** across all touchpoints
- **Improved user trust** with branded emails
- **Better email deliverability** with proper HTML structure

## 🚨 Important Notes
- **Always test** email templates before going live
- **Use absolute URLs** for images (not relative paths)
- **Optimize image sizes** for faster email loading
- **Include alt text** for accessibility
- **Test on mobile devices** for responsive design
