#!/bin/bash

# Fix AuthContext imports to use unified AuthContext
echo "🔧 Fixing AuthContext imports..."

# Find all files using AuthContextHybrid
files=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*AuthContextHybrid")

echo "Found $(echo "$files" | wc -l) files using AuthContextHybrid"

# Update each file
for file in $files; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        # Replace imports from AuthContextHybrid to AuthContext
        sed -i '' "s|from '@/contexts/AuthContextHybrid'|from '@/contexts/AuthContext'|g" "$file"
        sed -i '' "s|from './AuthContextHybrid'|from './AuthContext'|g" "$file"
    fi
done

echo "✅ All files updated to use unified AuthContext"

# Verify the fix
echo "🔍 Verifying fix..."
remaining=$(find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*AuthContextHybrid" | wc -l)

if [ "$remaining" -eq 0 ]; then
    echo "✅ All files now use unified AuthContext"
else
    echo "❌ $remaining files still using AuthContextHybrid:"
    find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "from.*AuthContextHybrid"
fi

echo "🎉 AuthContext consolidation complete!"



