#!/bin/bash

# Script to convert remaining HTML pages to use component system
# Run from the flash-site directory

set -e  # Exit on error

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=== Flash Website Component Conversion Script ==="
echo "Working directory: $SCRIPT_DIR"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if file has a header
has_header() {
    grep -q "<header>" "$1" 2>/dev/null
}

# Function to check if file has inline styles
has_inline_styles() {
    grep -q "<style>" "$1" 2>/dev/null
}

# Function to extract CSS filename from path
get_css_filename() {
    local html_path="$1"
    local dir_name=$(basename $(dirname "$html_path"))
    echo "${dir_name}.css"
}

# Function to extract inline CSS from HTML file
extract_css() {
    local html_file="$1"
    local css_file="$2"

    echo -e "${BLUE}Extracting CSS from $html_file to $css_file${NC}"

    # Extract content between <style> and </style>
    sed -n '/<style>/,/<\/style>/p' "$html_file" | sed '1d;$d' > "$css_file"

    if [ -s "$css_file" ]; then
        echo -e "${GREEN}✓ Created $css_file ($(wc -l < "$css_file") lines)${NC}"
        return 0
    else
        rm "$css_file"
        echo -e "${YELLOW}⚠ No CSS extracted from $html_file${NC}"
        return 1
    fi
}

# Function to update HTML file with component system
update_html_file() {
    local html_file="$1"
    local css_filename="$2"
    local path_prefix="$3"  # "../" for subdirectories, "" for root

    echo -e "${BLUE}Updating $html_file${NC}"

    # Create backup
    cp "$html_file" "${html_file}.bak"

    # Escape forward slashes in path_prefix for use in regex
    local escaped_prefix="${path_prefix//\//\\/}"

    # Step 1: Replace inline dark mode script with external reference
    if grep -q "localStorage.getItem(\"theme\")" "$html_file"; then
        perl -i -p0e 's/<!-- Script.*?-->\s*<script>\s*\/\/ DO NOT ADD OTHER SCRIPTS HERE.*?if \(localStorage\.getItem\("theme"\)\).*?\}\s*<\/script>/<script src="'${escaped_prefix}'js\/core\/dark-mode-init.js"><\/script>/gs' "$html_file"
        echo -e "${GREEN}✓ Replaced inline dark mode script${NC}"
    fi

    # Step 2: Replace inline <style> block with external CSS link (if CSS file exists)
    if [ -n "$css_filename" ] && has_inline_styles "$html_file"; then
        perl -i -p0e 's/(<link rel="stylesheet" href="'${escaped_prefix}'css\/main\.css" \/>)\s*<style>.*?<\/style>/$1\n    <link rel="stylesheet" href="'${escaped_prefix}'css\/pages\/'${css_filename}'" \/>/gs' "$html_file"
        echo -e "${GREEN}✓ Replaced inline styles with external CSS${NC}"
    fi

    # Step 3: Replace <header> block with placeholder
    if has_header "$html_file"; then
        perl -i -p0e 's/<header>.*?<\/header>/<div id="header-placeholder"><\/div>/gs' "$html_file"
        echo -e "${GREEN}✓ Replaced header with placeholder${NC}"
    fi

    # Step 4: Replace <footer> and SVG blocks with placeholders
    # Find the closing </main> and replace footer/SVG after it
    if grep -q "<footer>" "$html_file"; then
        # Replace footer block
        perl -i -p0e 's/<footer>.*?<\/footer>/<div id="footer-placeholder"><\/div>/gs' "$html_file"
        echo -e "${GREEN}✓ Replaced footer with placeholder${NC}"
    fi

    if grep -q "<!-- SVG Icons" "$html_file"; then
        # Replace SVG icons block
        perl -i -p0e 's/<!-- SVG Icons.*?<\/svg>\s*<\/svg>/<div id="svg-icons-placeholder"><\/div>/gs' "$html_file"
        echo -e "${GREEN}✓ Replaced SVG icons with placeholder${NC}"
    fi

    # Step 5: Add component loader script before jQuery/other scripts
    if ! grep -q "component-loader.js" "$html_file"; then
        # Find <!-- jQuery CDN --> and insert component loader before it
        perl -i -pe 's/(<!-- jQuery CDN -->)/<!-- Load components BEFORE other scripts -->\n  <script src="'${escaped_prefix}'js\/core\/component-loader.js"><\/script>\n\n  $1/' "$html_file"
        echo -e "${GREEN}✓ Added component loader script${NC}"
    fi

    # Step 6: Update JavaScript paths
    if grep -q 'src="\.\./js/main\.js"' "$html_file"; then
        sed -i '' 's|src="\.\./js/main\.js"|src="../js/core/main.js"|g' "$html_file"
        echo -e "${GREEN}✓ Updated main.js path${NC}"
    fi

    if grep -q 'src="\.\./js/btcTracker\.js"' "$html_file"; then
        sed -i '' 's|src="\.\./js/btcTracker\.js"|src="../js/modules/btcTracker.js"|g' "$html_file"
        echo -e "${GREEN}✓ Updated btcTracker.js path${NC}"
    fi

    # For root-level files (without ../)
    if grep -q 'src="js/main\.js"' "$html_file"; then
        sed -i '' 's|src="js/main\.js"|src="js/core/main.js"|g' "$html_file"
        echo -e "${GREEN}✓ Updated main.js path (root)${NC}"
    fi

    if grep -q 'src="js/btcTracker\.js"' "$html_file"; then
        sed -i '' 's|src="js/btcTracker\.js"|src="js/modules/btcTracker.js"|g' "$html_file"
        echo -e "${GREEN}✓ Updated btcTracker.js path (root)${NC}"
    fi

    echo -e "${GREEN}✓ Successfully updated $html_file${NC}"
}

# Main conversion process
echo -e "${YELLOW}Starting conversion of remaining pages...${NC}"
echo ""

# Array of subdirectory index.html files to convert
PAGES=(
    "rewards/index.html"
    "pulse/index.html"
    "sales/index.html"
    "metrics/index.html"
    "minutes/index.html"
    "training/index.html"
    "invite/index.html"
    "map/index.html"
)

# Process each page
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}Processing: $page${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        # Extract CSS if inline styles exist
        css_file=""
        if has_inline_styles "$page"; then
            css_filename=$(get_css_filename "$page")
            css_file="css/pages/$css_filename"

            if extract_css "$page" "$css_file"; then
                # CSS extracted successfully
                :
            else
                css_file=""
            fi
        else
            echo -e "${YELLOW}⚠ No inline styles found in $page${NC}"
        fi

        # Update HTML file
        update_html_file "$page" "$(basename "$css_file" 2>/dev/null)" "../"

        echo ""
    else
        echo -e "${RED}✗ File not found: $page${NC}"
        echo ""
    fi
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Cleaning up deprecated files...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Delete deprecated files
if [ -d "dev" ]; then
    echo -e "${BLUE}Deleting dev/ folder...${NC}"
    rm -rf dev/
    echo -e "${GREEN}✓ Deleted dev/ folder${NC}"
else
    echo -e "${YELLOW}⚠ dev/ folder not found${NC}"
fi

if [ -f "old_default.html" ]; then
    echo -e "${BLUE}Deleting old_default.html...${NC}"
    rm old_default.html
    echo -e "${GREEN}✓ Deleted old_default.html${NC}"
else
    echo -e "${YELLOW}⚠ old_default.html not found${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ CONVERSION COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Converted ${#PAGES[@]} HTML files to use component system"
echo "- Created external CSS files in css/pages/"
echo "- Removed deprecated files"
echo "- Backup files created with .bak extension"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test all pages in a browser"
echo "2. Verify components load correctly"
echo "3. Check navigation, dark mode, Bitcoin price widget"
echo "4. If everything works, remove .bak files with: find . -name '*.bak' -delete"
echo ""
echo -e "${BLUE}To test: Open each page and verify:${NC}"
for page in "${PAGES[@]}"; do
    echo "  - $page"
done
echo ""
