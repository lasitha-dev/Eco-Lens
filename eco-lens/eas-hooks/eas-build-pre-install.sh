#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# This script runs before npm/yarn install

set -e

echo "🧹 Cleaning up previous builds..."

# Remove any cached gradle files
if [ -d "android/.gradle" ]; then
  echo "Removing android/.gradle"
  rm -rf android/.gradle
fi

# Remove build directories
if [ -d "android/app/build" ]; then
  echo "Removing android/app/build"
  rm -rf android/app/build
fi

if [ -d "android/build" ]; then
  echo "Removing android/build"
  rm -rf android/build
fi

echo "✅ Pre-install cleanup complete"
