#!/bin/bash

# This script demonstrates how to use the deployment server API

BASE_URL="http://localhost:3000"

echo "=== Crypto Investment Contract Deployment Server Demo ==="
echo ""

# Health check
echo "1. Checking server health..."
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Compile contracts
echo "2. Compiling contracts..."
curl -s -X POST "$BASE_URL/compile" | jq '.'
echo ""

# Run tests
echo "3. Running tests..."
curl -s -X POST "$BASE_URL/test" | jq '.'
echo ""

# Deploy contract
echo "4. Deploying contract to hardhat network..."
curl -s -X POST "$BASE_URL/deploy" \
  -H "Content-Type: application/json" \
  -d '{"network": "hardhat"}' | jq '.'
echo ""

# Get deployment info
echo "5. Fetching deployment info..."
curl -s "$BASE_URL/deployment-info" | jq '.'
echo ""

echo "=== Demo Complete ==="
