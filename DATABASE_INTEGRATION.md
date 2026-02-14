# Database Integration Summary

## ✅ Setup Complete

Prisma has been successfully integrated with the crypto investment contract project. Contract deployment information is now automatically persisted to PostgreSQL.

## What Was Added

### 1. Database Configuration
- **File**: [.env](.env)
- Added `DATABASE_URL` pointing to your PostgreSQL database

### 2. Prisma Schema
- **File**: [prisma/schema.prisma](prisma/schema.prisma)
- Created `InvestmentContract` model with:
  - `contractAddress` (Primary Key)
  - `rateOfInterest` (indexed)
  - `stableCoin` (indexed) - PYUSD/USDC/USDT
  - `riskLevel` (indexed) - LOW/MEDIUM/HIGH
  - `network`
  - `deployer`
  - `createdAt`
  - `updatedAt`

### 3. Package Dependencies
- **File**: [package.json](package.json)
- Added `@prisma/client` (runtime)
- Added `prisma` (dev tool)
- Added npm scripts for Prisma operations

### 4. Deployment Script Enhancement
- **File**: [scripts/deploy.js](scripts/deploy.js)
- Now saves contract info to database after deployment
- Maps stablecoin addresses to names (PYUSD/USDC/USDT)
- Graceful error handling (deployment succeeds even if DB save fails)

### 5. Server API Endpoints
- **File**: [server/index.js](server/index.js)

#### New Endpoints:

**GET /contracts**
- Fetch all contracts with optional filters
- Query params: `stableCoin`, `riskLevel`, `minRoi`, `maxRoi`
- Example: `GET /contracts?stableCoin=USDC&riskLevel=MEDIUM`

**GET /contracts/:address**
- Fetch specific contract by address
- Example: `GET /contracts/0x1234...`

## Usage Examples

### Deploy a Contract
```bash
curl -X POST http://localhost:3000/deploy \
  -H "Content-Type: application/json" \
  -d '{
    "network": "sepolia",
    "stablecoinAddress": "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9",
    "roiPercentage": "8",
    "riskLevel": "MEDIUM"
  }'
```

Contract info is automatically saved to the database.

### Query Contracts
```bash
# Get all USDC contracts with HIGH risk
curl "http://localhost:3000/contracts?stableCoin=USDC&riskLevel=HIGH"

# Get contracts with ROI between 5-15%
curl "http://localhost:3000/contracts?minRoi=5&maxRoi=15"

# Get specific contract
curl "http://localhost:3000/contracts/0xYourContractAddress"
```

### View Data in Prisma Studio
```bash
npm run prisma:studio
```
Opens at http://localhost:5555

## Database Indexes

Optimized for fast queries on:
- Rate of Interest
- Stable Coin
- Risk Level

## Supported Stablecoins

The deploy script automatically recognizes:
- **PYUSD**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **USDC**: `0xf08a50178dfcde18524640ea6618a1f965821715`
- **USDT**: `0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0`

Other addresses are stored as-is.

## Next Steps

1. **Start the server**: `npm run server`
2. **Deploy contracts**: Use the `/deploy` endpoint
3. **Query data**: Use the `/contracts` endpoints
4. **View in Studio**: Run `npm run prisma:studio`

See [PRISMA_SETUP.md](PRISMA_SETUP.md) for detailed documentation.
