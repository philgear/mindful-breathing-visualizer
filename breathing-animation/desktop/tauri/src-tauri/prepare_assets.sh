#!/bin/bash
# Wrapper script to build frontend assets from src-tauri context
set -e
# Robustly get the directory where this script resides
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/../../../frontend/vanilla-js"

echo "Building frontend assets from $FRONTEND_DIR..."
cd "$FRONTEND_DIR"
npm run build:docs
echo "Assets built in docs/"
