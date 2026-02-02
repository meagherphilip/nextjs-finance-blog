#!/bin/bash
# Full verification script - run before declaring anything "done"
# Usage: npm run verify

echo "🔍 Running full verification..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Test 1: Build
echo "📦 Step 1: Building project..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓${NC} Build successful"
else
    echo -e "${RED}✗${NC} Build failed"
    tail -30 /tmp/build.log
    exit 1
fi

# Test 2: Start server
echo ""
echo "🚀 Step 2: Starting dev server..."
pkill -f "next dev" 2>/dev/null
sleep 1
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

# Wait for server
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Server started on port 3000"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗${NC} Server failed to start"
        exit 1
    fi
done

# Test 3: E2E tests
echo ""
echo "🧪 Step 3: Running E2E tests..."
sleep 3
if node scripts/e2e-test.js; then
    echo ""
else
    echo -e "${RED}✗${NC} E2E tests failed"
    FAILED=1
fi

# Cleanup
echo ""
echo "🧹 Step 4: Cleaning up..."
kill $SERVER_PID 2>/dev/null

# Summary
echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED${NC}"
    echo "Ready to commit and deploy!"
    exit 0
else
    echo -e "${RED}✗ SOME CHECKS FAILED${NC}"
    echo "Fix errors before continuing."
    exit 1
fi
