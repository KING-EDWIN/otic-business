# Flutterwave Testing Guide

## 🧪 **How to Test Flutterwave Integration**

### **Step 1: Set Up Your Phone Number**
1. Go to `/payments` page
2. Click "Upgrade Plan" 
3. Enter your phone number in the format: `+256 700 000 000`
4. Click "Pay Now"

### **Step 2: What Happens Next**
When you click "Pay Now", Flutterwave will:

1. **Redirect you to their payment page**
2. **Show payment options**:
   - Card payment (Visa/Mastercard)
   - Mobile Money Uganda (MTN/Airtel)
   - USSD

### **Step 3: Testing Mobile Money Flow**
1. **Select "Mobile Money Uganda"**
2. **Choose your provider** (MTN or Airtel)
3. **Enter your phone number** (if not pre-filled)
4. **Flutterwave will send you an OTP** via SMS
5. **Enter the OTP** you receive
6. **You'll get a USSD prompt** on your phone
7. **Follow the USSD instructions** to complete payment

### **Step 4: Testing Card Payments**
1. **Select "Card Payment"**
2. **Use test card details**:
   - Card Number: `4187427415564246`
   - CVV: `828`
   - Expiry: `09/32`
   - PIN: `3310`

### **Step 5: What You'll See**
- **Success**: Redirected to `/payments/success` with transaction details
- **Failure**: Error message with details
- **Pending**: Payment is being processed

## 🔧 **Troubleshooting**

### **401 Error (Authentication)**
- Check your `.env` file has correct API keys
- Make sure you have your Merchant ID set
- Verify you're using TEST keys (not live keys)

### **Phone Number Issues**
- Use format: `+256 700 000 000`
- Make sure it's a valid Uganda number
- Test with your actual phone number

### **Payment Not Working**
- Check browser console for errors
- Verify Flutterwave webhook is set up
- Make sure database table exists

## 📱 **Mobile Money Testing**

### **MTN Mobile Money**
1. Select MTN Mobile Money
2. Enter your MTN number
3. Receive OTP via SMS
4. Enter OTP
5. Follow USSD prompt

### **Airtel Money**
1. Select Airtel Money
2. Enter your Airtel number
3. Receive OTP via SMS
4. Enter OTP
5. Follow USSD prompt

## 🎯 **Expected Flow**

```
1. Enter Phone Number → 2. Click Pay Now → 3. Flutterwave Page → 4. Select Payment Method → 5. Enter OTP → 6. USSD Prompt → 7. Payment Complete → 8. Success Page
```

## 📞 **Test Phone Numbers**

For testing, you can use:
- **MTN**: `+256 700 000 000`
- **Airtel**: `+256 700 000 001`

*Note: These are test numbers. Use your actual phone number for real testing.*

## 🔍 **Debugging**

Check browser console for:
- API key validation
- Payment payload
- Flutterwave response
- Error messages

## 📋 **Checklist**

- [ ] `.env` file has correct API keys
- [ ] Merchant ID is set
- [ ] Phone number is entered
- [ ] Flutterwave redirects properly
- [ ] OTP is received
- [ ] USSD prompt appears
- [ ] Payment completes successfully

