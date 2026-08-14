#!/bin/bash

# Script to create and push git tag
# Usage: ./create-tag.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get version from argument or prompt user
if [ $# -eq 1 ]; then
    VERSION=$1
else
    # Get the latest tag as default
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    print_status "Latest tag: $LATEST_TAG"
    
    read -p "Enter version (e.g., v1.0.1): " VERSION
    if [ -z "$VERSION" ]; then
        print_error "Version cannot be empty!"
        exit 1
    fi
fi

# Validate version format (should start with 'v')
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+ ]]; then
    print_warning "Version should follow format: vX.Y.Z (e.g., v1.0.1)"
    read -p "Do you want to continue with '$VERSION'? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if tag already exists
if git tag -l | grep -q "^$VERSION$"; then
    print_error "Tag '$VERSION' already exists!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Create tag
print_status "Creating tag: $VERSION"
git tag -a "$VERSION" -m "Release $VERSION"

# Push tag to remote
print_status "Pushing tag to remote..."
git push origin "$VERSION"

# Also push current branch if not already up to date
print_status "Pushing current branch..."
git push origin "$CURRENT_BRANCH"

print_status "Successfully created and pushed tag: $VERSION"
print_status "Tag URL: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\)\.git/\1/')/releases/tag/$VERSION" 