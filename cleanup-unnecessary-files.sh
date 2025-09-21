#!/bin/bash

# Cleanup unnecessary files after fixing the system
echo "🧹 Cleaning up unnecessary files..."

# Remove all SQL files except the definitive fix
find . -name "*.sql" -not -name "DEFINITIVE-FIX.sql" -delete
echo "✅ Removed unnecessary SQL files"

# Remove debug HTML files
find . -name "debug-*.html" -delete
find . -name "test-*.html" -delete
echo "✅ Removed debug HTML files"

# Remove shell scripts
find . -name "*.sh" -not -name "cleanup-unnecessary-files.sh" -delete
echo "✅ Removed shell scripts"

# Remove markdown files except README
find . -name "*.md" -not -name "README.md" -delete
echo "✅ Removed unnecessary markdown files"

echo "🎉 Cleanup completed! Only essential files remain."



