const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

// Simple mutex to prevent concurrent operations
let operationInProgress = false;

const acquireLock = async () => {
  while (operationInProgress) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  operationInProgress = true;
};

const releaseLock = () => {
  operationInProgress = false;
};

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Deployment server is running' });
});

// Deploy contract endpoint
app.post('/deploy', async (req, res) => {
  try {
    await acquireLock();
    
    const { network } = req.body;
    const targetNetwork = network || 'localhost';

    // Validate network parameter to prevent command injection
    const allowedNetworks = ['localhost', 'hardhat', 'sepolia', 'mainnet', 'goerli'];
    if (!allowedNetworks.includes(targetNetwork)) {
      releaseLock();
      return res.status(400).json({
        success: false,
        message: `Invalid network. Allowed networks: ${allowedNetworks.join(', ')}`
      });
    }

    console.log(`Starting deployment to ${targetNetwork}...`);

    // Run the deployment script
    const { stdout, stderr } = await execAsync(
      `npx hardhat run scripts/deploy.js --network ${targetNetwork}`,
      { cwd: path.join(__dirname, '..') }
    );

    console.log('Deployment output:', stdout);
    if (stderr) console.error('Deployment errors:', stderr);

    // Read deployment info
    const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.json');
    const deploymentInfo = JSON.parse(await fs.readFile(deploymentInfoPath, 'utf8'));

    releaseLock();
    
    res.json({
      success: true,
      message: 'Contract deployed successfully',
      deployment: deploymentInfo,
      logs: stdout
    });
  } catch (error) {
    releaseLock();
    console.error('Deployment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Deployment failed',
      error: error.message
    });
  }
});

// Get deployment info endpoint
app.get('/deployment-info', async (req, res) => {
  try {
    const deploymentInfoPath = path.join(__dirname, '..', 'deployment-info.json');
    const deploymentInfo = JSON.parse(await fs.readFile(deploymentInfoPath, 'utf8'));
    res.json(deploymentInfo);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'No deployment information found',
      error: error.message
    });
  }
});

// Compile contracts endpoint
app.post('/compile', async (req, res) => {
  try {
    await acquireLock();
    
    console.log('Starting contract compilation...');

    const { stdout, stderr } = await execAsync(
      'npx hardhat compile',
      { cwd: path.join(__dirname, '..') }
    );

    console.log('Compilation output:', stdout);
    if (stderr) console.error('Compilation warnings:', stderr);

    releaseLock();
    
    res.json({
      success: true,
      message: 'Contracts compiled successfully',
      logs: stdout
    });
  } catch (error) {
    releaseLock();
    console.error('Compilation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Compilation failed',
      error: error.message
    });
  }
});

// Test contracts endpoint
app.post('/test', async (req, res) => {
  try {
    await acquireLock();
    
    console.log('Starting contract tests...');

    const { stdout, stderr } = await execAsync(
      'npx hardhat test',
      { cwd: path.join(__dirname, '..') }
    );

    console.log('Test output:', stdout);
    if (stderr) console.error('Test warnings:', stderr);

    releaseLock();
    
    res.json({
      success: true,
      message: 'Tests completed successfully',
      logs: stdout
    });
  } catch (error) {
    releaseLock();
    console.error('Tests failed:', error);
    res.status(500).json({
      success: false,
      message: 'Tests failed',
      error: error.message,
      logs: error.stdout
    });
  }
});

app.listen(PORT, () => {
  console.log(`Deployment server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Deploy endpoint: POST http://localhost:${PORT}/deploy`);
  console.log(`Compile endpoint: POST http://localhost:${PORT}/compile`);
  console.log(`Test endpoint: POST http://localhost:${PORT}/test`);
  console.log(`Deployment info: GET http://localhost:${PORT}/deployment-info`);
});
