#!/bin/bash
# Keys of the Caribbean - Public Site Cleanup Script
# Run this before deploying to getflash.io production

echo "🏴‍☠️ Keys of the Caribbean - Production Cleanup"
echo "=============================================="
echo ""
echo "This script will remove private backend files from the public site."
echo "Make sure you have backed up the backend to /flash-treasure-hunt-backend/"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Cleanup cancelled."
    exit 1
fi

# Get the current directory
TREASURE_HUNT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "📁 Working directory: $TREASURE_HUNT_DIR"
echo ""

# Files and directories to remove
FILES_TO_REMOVE=(
    "api"
    "schema.sql"
    "dashboard.html"
    "rabbithole.html"
    "css/dashboard.css"
    "css/stage.css"
    "js/dashboard.js"
    "js/rabbithole.js"
)

echo "🗑️  Removing private files..."
echo ""

for item in "${FILES_TO_REMOVE[@]}"; do
    FULL_PATH="$TREASURE_HUNT_DIR/$item"

    if [ -e "$FULL_PATH" ]; then
        echo "  ❌ Removing: $item"
        rm -rf "$FULL_PATH"
    else
        echo "  ✓ Already removed: $item"
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📋 Remaining public files:"
ls -la "$TREASURE_HUNT_DIR"
echo ""
echo "🔍 Verify these API URLs are correct:"
echo ""
grep -r "API_BASE" "$TREASURE_HUNT_DIR/js/"
echo ""
echo "🚀 Ready to deploy to getflash.io!"
echo ""
echo "Next steps:"
echo "1. Verify API_BASE points to your backend server"
echo "2. Upload public files to getflash.io/treasure-hunt/"
echo "3. Test registration and leaderboard"
echo ""
