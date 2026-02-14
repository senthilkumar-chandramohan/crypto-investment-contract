# Contributing to Crypto Investment Contract

Thank you for your interest in contributing to this project!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy the example environment file: `cp .env.example .env`

## Project Structure

- `contracts/` - Solidity smart contracts
- `scripts/` - Deployment and utility scripts
- `test/` - Contract test files using Hardhat and Chai
- `server/` - Node.js deployment automation server
- `hardhat.config.js` - Hardhat configuration

## Development Workflow

### Writing Smart Contracts

1. Add new contracts to the `contracts/` directory
2. Compile contracts: `npm run compile`
3. Write tests in the `test/` directory
4. Run tests: `npm run test`

### Adding Deployment Scripts

1. Create scripts in the `scripts/` directory
2. Follow the pattern in `scripts/deploy.js`
3. Save deployment information for later reference

### Modifying the Deployment Server

1. Server code is in `server/index.js`
2. Add new endpoints as needed
3. Test locally before submitting PR

## Testing

Always run tests before submitting a PR:

```bash
npm run test
```

## Code Style

- Use 2 spaces for indentation
- Follow existing code patterns
- Comment complex logic
- Write descriptive commit messages

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test your changes thoroughly
4. Update documentation if needed
5. Submit a PR with a clear description

## Reporting Issues

When reporting issues, please include:

- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Node version, OS, etc.)

## Questions?

Feel free to open an issue for questions or discussions!
