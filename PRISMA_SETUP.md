# Prisma Database Setup

This project uses Prisma ORM to store investment contract information in a PostgreSQL database.

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install both `@prisma/client` and `prisma` packages.

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

### 3. Push Schema to Database

Since the database is managed and doesn't allow shadow database creation, use:

```bash
npx prisma db push
```

This will create the `investment_contracts` table with the following fields:
- `contract_address` (Primary Key)
- `rate_of_interest` (with index)
- `stable_coin` (with index)
- `risk_level` (with index)
- `network`
- `deployer`
- `created_at`
- `updated_at`

## Database Schema

```prisma
model InvestmentContract {
  contractAddress String   @id
  rateOfInterest  Int
  stableCoin      String   // PYUSD, USDC, or USDT
  riskLevel       String   // LOW, MEDIUM, or HIGH
  network         String
  deployer        String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## Environment Variables

The database URL is configured in `.env`:

```
DATABASE_URL="postgres://u702qani5n15t3:p11d5079c22119f957d93d64dd44340478eb3161a3f54ef2d2f24424aa4ead4ec@c6m2hub4lh1mqp.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddo4lcqj5n454s?schema=fund"
```

## Usage

### Automatic Storage on Deployment

When you deploy a contract, it's automatically saved to the database:

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

### API Endpoints

#### Get All Contracts
```bash
GET /contracts
```

Query parameters (all optional):
- `stableCoin` - Filter by stablecoin (PYUSD, USDC, USDT)
- `riskLevel` - Filter by risk level (LOW, MEDIUM, HIGH)
- `minRoi` - Minimum rate of interest
- `maxRoi` - Maximum rate of interest

Examples:
```bash
# Get all contracts
curl http://localhost:3000/contracts

# Get USDC contracts with MEDIUM risk
curl http://localhost:3000/contracts?stableCoin=USDC&riskLevel=MEDIUM

# Get contracts with ROI between 5% and 10%
curl http://localhost:3000/contracts?minRoi=5&maxRoi=10
```

#### Get Contract by Address
```bash
GET /contracts/:address
```

Example:
```bash
curl http://localhost:3000/contracts/0x1234567890abcdef...
```

## Prisma Studio

To view and manage data in a visual interface:

```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555`

## Database Indexes

The following indexes are created for optimal query performance:
- `idx_rate_of_interest` on `rate_of_interest`
- `idx_stable_coin` on `stable_coin`
- `idx_risk_level` on `risk_level`

These indexes speed up filtering and searching by these fields.
