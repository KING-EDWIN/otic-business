#!/bin/bash

# Fix multiple Supabase client instances
# This script updates all files to use @/lib/supabaseClient instead of @/lib/supabase

echo "🔧 Fixing multiple Supabase client instances..."

# Find all files using the wrong client
files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '@/lib/supabase'")

echo "Found $(echo "$files" | wc -l) files using wrong Supabase client"

# Update each file
for file in $files; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        sed -i '' "s|from '@/lib/supabase'|from '@/lib/supabaseClient'|g" "$file"
    fi
done

echo "✅ All files updated to use @/lib/supabaseClient"

# Verify the fix
echo "🔍 Verifying fix..."
remaining=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '@/lib/supabase'" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo "✅ All files now use the correct Supabase client"
else
    echo "❌ $remaining files still using wrong client:"
    find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '@/lib/supabase'"
fi

echo "🎉 Supabase client consolidation complete!"
