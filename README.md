# crypto-investment-contract

Contract and server to create and expose crypto investments.

## Project Structure

```
crypto-investment-contract/
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── test/             # Contract tests
├── server/           # Node.js deployment server
├── hardhat.config.js # Hardhat configuration
└── package.json      # Project dependencies
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/senthilkumar-chandramohan/crypto-investment-contract.git
cd crypto-investment-contract
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, copy from `.env.example`):
```bash
cp .env.example .env
```

## Smart Contract

The `CryptoInvestment` contract allows users to:
- Invest Ether into the contract
- Track individual investments
- Withdraw their investments
- View total investment and contract balance

## Usage

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy Contract

#### Deploy to local Hardhat network:
```bash
npm run deploy:hardhat
```

#### Deploy to local node (start node first):
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contract
npm run deploy:local
```

### Automated Deployment Server

The project includes a Node.js server for automated contract deployment.

#### Start the server:
```bash
npm run server
```

The server will start on port 3000 (or the port specified in .env).

#### Available endpoints:

1. **Health Check**
   ```bash
   GET http://localhost:3000/health
   ```

2. **Compile Contracts**
   ```bash
   POST http://localhost:3000/compile
   ```

3. **Deploy Contract**
   ```bash
   POST http://localhost:3000/deploy
   Content-Type: application/json
   
   {
     "network": "localhost"  // or "hardhat", "sepolia", etc.
   }
   ```

4. **Run Tests**
   ```bash
   POST http://localhost:3000/test
   ```

5. **Get Deployment Info**
   ```bash
   GET http://localhost:3000/deployment-info
   ```

### Example: Using the Deployment Server

```bash
# Start the server
npm run server

# In another terminal, compile contracts
curl -X POST http://localhost:3000/compile

# Deploy to Hardhat network
curl -X POST http://localhost:3000/deploy \
  -H "Content-Type: application/json" \
  -d '{"network": "hardhat"}'

# Run tests
curl -X POST http://localhost:3000/test

# Get deployment information
curl http://localhost:3000/deployment-info
```

## Configuration

Edit `hardhat.config.js` to configure:
- Solidity compiler version
- Network settings
- Path configurations

Edit `.env` to configure:
- Server port
- RPC URLs for different networks
- Private keys for deployment (never commit this file!)

## Security Notes

- Never commit your `.env` file containing private keys
- Always use a separate wallet for testnet deployments
- Thoroughly test contracts before deploying to mainnet

## License

ISC

