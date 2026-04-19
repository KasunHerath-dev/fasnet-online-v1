#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Install Puppeteer browsers
npx puppeteer browsers install chrome
