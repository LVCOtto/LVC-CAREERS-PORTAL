#!/bin/bash
set -e

npm install --legacy-peer-deps < /dev/null

npm run db:push --force < /dev/null 2>&1 || true
