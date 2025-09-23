# Test Pages Directory

This directory contains all HTML test pages for the OTIC Business project. These pages are used for testing various functionalities, debugging issues, and validating system components.

## 📁 Test Pages Overview

### 🔐 **Authentication & User Management**
- `test-individual-signup.html` - Test individual user signup flow
- `test-user-access.html` - Test user access permissions
- `test-invitation-system.html` - Test business invitation system
- `test-invitation-fix.html` - Test invitation system fixes
- `signout-test.html` - Test sign out functionality
- `debug-auth.html` - Debug authentication issues

### 💳 **Payment Integration**
- `test-flutterwave.html` - Test Flutterwave payment integration
- `flutterwave-test.html` - Additional Flutterwave testing
- `test-backend-connection.html` - Test backend payment connections

### 📧 **Email & SMTP**
- `test-smtp.html` - Test SMTP email functionality
- `smtp-diagnostic.html` - SMTP diagnostic tools
- `quick-smtp-test.html` - Quick SMTP testing
- `resend-config-helper.html` - Resend email configuration helper

### 🤖 **AI & External APIs**
- `test-ai.html` - Test AI functionality
- `test-mistral-live.html` - Test Mistral AI integration
- `test-akaunting-api.html` - Test Akaunting API integration
- `test-google-oauth.html` - Test Google OAuth integration

### 🌐 **Network & Connections**
- `test-network.html` - Test network connectivity
- `test-frontend-connection.html` - Test frontend connections
- `test-supabase-connection.html` - Test Supabase database connection
- `test-db-connection.html` - Test database connections

### 🔧 **System Diagnostics**
- `system-status-check.html` - Comprehensive system status check
- `debug-config.html` - Debug configuration issues
- `test-performance.html` - Test system performance
- `test-pages.html` - Test page functionality

## 🚀 **Usage Instructions**

### **Quick Testing**
1. Open any test file in your browser
2. Follow the on-screen instructions
3. Check console logs for detailed information
4. Review results and error messages

### **SMTP Testing**
1. Start with `quick-smtp-test.html` for basic email testing
2. Use `smtp-diagnostic.html` for detailed SMTP diagnostics
3. Use `resend-config-helper.html` for Resend configuration

### **Payment Testing**
1. Use `test-flutterwave.html` for payment flow testing
2. Check `test-backend-connection.html` for API connectivity
3. Verify payment processing with test transactions

### **Authentication Testing**
1. Test signup with `test-individual-signup.html`
2. Verify user access with `test-user-access.html`
3. Test sign out with `signout-test.html`

## 📋 **Test Categories**

### **🔴 Critical Tests** (Run First)
- `system-status-check.html` - Overall system health
- `test-supabase-connection.html` - Database connectivity
- `quick-smtp-test.html` - Email functionality

### **🟡 Integration Tests**
- `test-flutterwave.html` - Payment processing
- `test-individual-signup.html` - User registration
- `test-invitation-system.html` - Business invitations

### **🟢 Debugging Tools**
- `debug-auth.html` - Authentication debugging
- `debug-config.html` - Configuration debugging
- `smtp-diagnostic.html` - Email system debugging

## 🛠️ **Development Workflow**

1. **Before Development**: Run `system-status-check.html`
2. **During Development**: Use specific test pages for features being worked on
3. **After Changes**: Run relevant test pages to verify functionality
4. **Before Deployment**: Run all critical tests

## 📝 **Notes**

- All test pages are self-contained HTML files
- They include JavaScript for testing functionality
- Console logs provide detailed debugging information
- Test results are displayed on the page
- Some tests require valid API keys or credentials

## 🔧 **Troubleshooting**

If a test fails:
1. Check browser console for error messages
2. Verify API keys and credentials
3. Check network connectivity
4. Review server logs if applicable
5. Use debugging tools for detailed analysis

---

**Total Test Files**: 25+ test pages  
**Categories**: 6 organized sections  
**Last Updated**: September 23, 2024
