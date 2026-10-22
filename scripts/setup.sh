#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  UNIVERSAL AI APP BUILDER - AUTOMATED SETUP (LINUX/MAC)  "
echo "=========================================================="

echo -e "\n[1/5] Checking environment prerequisites..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    exit 1
fi
echo "✔ Node.js: $(node --version)"

if command -v dotnet &> /dev/null; then
    echo "✔ .NET SDK: $(dotnet --version)"
fi

echo -e "\n[2/5] Initializing environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✔ Created .env from .env.example"
fi

echo -e "\n[3/5] Installing npm workspace dependencies..."
npm install

echo -e "\n[4/5] Compiling shared models and syncing database schema..."
npm run build --workspace=@zafizdan/shared
npx prisma generate --schema=apps/server/prisma/schema.prisma
npx prisma db push --schema=apps/server/prisma/schema.prisma

echo -e "\n[5/5] Building platform services..."
npm run build --workspace=@zafizdan/server
npm run build --workspace=@zafizdan/web

echo -e "\n=========================================================="
echo "  SETUP COMPLETED SUCCESSFULLY!                           "
echo "=========================================================="
echo -e "\nTo start the platform:"
echo "  Terminal 1 (Backend): npm run server:dev"
echo "  Terminal 2 (Frontend): npm run web:dev"
echo "  Browser URL:          http://localhost:3000\n"

