#!/bin/bash

# Quick script to auto-create and push git tag
# Automatically increments patch version

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Quick Tag Creator${NC}"

# Check if in git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Not in a git repository!${NC}"
    exit 1
fi

# Get latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
echo "📋 Latest tag: $LATEST_TAG"

# Extract version numbers
if [[ $LATEST_TAG =~ v([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
    MAJOR=${BASH_REMATCH[1]}
    MINOR=${BASH_REMATCH[2]}
    PATCH=${BASH_REMATCH[3]}
    
    # Increment patch version
    NEW_PATCH=$((PATCH + 1))
    NEW_VERSION="v${MAJOR}.${MINOR}.${NEW_PATCH}"
else
    # If no valid tag found, start with v1.0.0
    NEW_VERSION="v1.0.0"
fi

echo "🏷️  Creating tag: $NEW_VERSION"

# Create and push tag
git tag -a "$NEW_VERSION" -m "Release $NEW_VERSION"
git push origin "$NEW_VERSION"

echo -e "${GREEN}✅ Successfully created and pushed tag: $NEW_VERSION${NC}" 