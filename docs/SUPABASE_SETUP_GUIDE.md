# 🚀 Complete Supabase Setup Guide for OTIC Vision

## Step 1: Database Setup

### 1.1 Run the Complete Setup Script

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Complete Setup**
   - Open `setup-supabase-complete.sql` from this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl/Cmd + Enter)

4. **Verify Success**
   - You should see: "OTIC Vision database setup completed successfully!"

## Step 2: Storage Bucket Setup

### 2.1 Create Storage Bucket

1. **Go to Storage**
   - Click "Storage" in the left sidebar
   - Click "Buckets"
   - Click "New Bucket"

2. **Configure Bucket**
   - **Name**: `product-images`
   - **Public**: ✅ Check this box (important!)
   - **File size limit**: 50MB (or your preference)
   - **Allowed MIME types**: `image/*` (or leave empty for all)
   - Click "Create Bucket"

### 2.2 Set Storage Policies

1. **Go to Storage Policies**
   - In Storage → Buckets → product-images
   - Click "Policies" tab
   - Click "New Policy"

2. **Create Upload Policy**
   - **Policy Name**: "Allow authenticated users to upload images"
   - **Policy Type**: "INSERT"
   - **Target Roles**: `authenticated`
   - **Policy Definition**:
   ```sql
   (auth.role() = 'authenticated')
   ```
   - Click "Save"

3. **Create View Policy**
   - **Policy Name**: "Allow public access to view images"
   - **Policy Type**: "SELECT"
   - **Target Roles**: `public`
   - **Policy Definition**:
   ```sql
   (bucket_id = 'product-images')
   ```
   - Click "Save"

## Step 3: Test the Setup

### 3.1 Test Database Tables

Run this query in SQL Editor to verify tables:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'personalised_visual_bank',
  'token_similarity_log', 
  'color_analysis_cache',
  'recognition_sessions'
);
```

### 3.2 Test RPC Functions

Run this query to verify functions:

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'find_best_token_match',
  'log_token_similarity',
  'get_product_by_visual_token',
  'register_visual_product'
);
```

### 3.3 Test Storage Access

1. **Go to Storage → product-images**
2. **Try uploading a test image**
3. **Verify the image appears in the bucket**

## Step 4: Environment Variables

Make sure your `.env.local` has the correct Supabase URL and anon key:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 5: Test the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Product Registration**:
   - Go to: http://localhost:8080/otic-vision-register
   - Upload a product image
   - Fill in product details
   - Click "Register Product"

3. **Test Product Recognition**:
   - Go to: http://localhost:8080/otic-vision-test
   - Click "Add Sample Data to PVB"
   - Use camera to scan a product
   - Click "Analyze with AI"

## Troubleshooting

### Storage Issues
- **Error**: "Access control checks"
  - **Solution**: Make sure the bucket is set to "Public"
  - **Solution**: Verify storage policies are correctly set

### Database Issues
- **Error**: "relation does not exist"
  - **Solution**: Run the complete setup script again
  - **Solution**: Check if you're in the correct Supabase project

### RLS Issues
- **Error**: "Row Level Security"
  - **Solution**: Verify RLS policies are created
  - **Solution**: Check if user is authenticated

## Success Indicators

✅ **Database**: All 4 tables created with RLS policies
✅ **Storage**: product-images bucket created and public
✅ **Functions**: All 4 RPC functions working
✅ **Application**: Product registration and recognition working
✅ **Console**: No storage or database errors

## Next Steps

Once setup is complete:
1. Register some test products
2. Test the recognition system
3. View detailed token comparisons
4. Analyze the similarity breakdowns

The system will now work with full Supabase integration! 🎯



