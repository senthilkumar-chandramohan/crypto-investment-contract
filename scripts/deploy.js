const hre = require("hardhat");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

// Map stablecoin addresses to names
const STABLECOIN_MAP = {
  "0xcac524bca292aaade2df8a05cc58f0a65b1b3bb9": "PYUSD",
  "0xf08a50178dfcde18524640ea6618a1f965821715": "USDC",
  "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0": "USDT"
};

function getStablecoinName(address) {
  const lowerAddress = address.toLowerCase();
  return STABLECOIN_MAP[lowerAddress] || address;
}

async function main() {
  // Get command line arguments or use defaults
  const args = process.argv.slice(2);
  let stablecoinAddress = process.env.STABLECOIN_ADDRESS;
  let roiPercentage = process.env.ROI_PERCENTAGE;
  let riskLevel = process.env.RISK_LEVEL;
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--stablecoin' && args[i + 1]) {
      stablecoinAddress = args[i + 1];
    } else if (args[i] === '--roi' && args[i + 1]) {
      roiPercentage = args[i + 1];
    } else if (args[i] === '--risk' && args[i + 1]) {
      riskLevel = args[i + 1];
    }
  }
  
  // Validate required parameters
  if (!stablecoinAddress) {
    throw new Error("Stablecoin address is required. Set STABLECOIN_ADDRESS env var or use --stablecoin flag");
  }
  
  if (!roiPercentage) {
    throw new Error("ROI percentage is required. Set ROI_PERCENTAGE env var or use --roi flag");
  }
  
  if (!riskLevel) {
    throw new Error("Risk level is required. Set RISK_LEVEL env var or use --risk flag");
  }
  
  // Validate risk level
  const validRiskLevels = ['LOW', 'MEDIUM', 'HIGH'];
  const riskLevelUpper = riskLevel.toUpperCase();
  if (!validRiskLevels.includes(riskLevelUpper)) {
    throw new Error(`Invalid risk level. Must be one of: ${validRiskLevels.join(', ')}`);
  }
  
  // Convert risk level to enum value (0, 1, 2)
  const riskLevelEnum = validRiskLevels.indexOf(riskLevelUpper);
  
  console.log("Deploying CryptoInvestment contract...");
  console.log(`Stablecoin: ${stablecoinAddress}`);
  console.log(`ROI: ${roiPercentage}%`);
  console.log(`Risk Level: ${riskLevelUpper}`);

  const CryptoInvestment = await hre.ethers.getContractFactory("CryptoInvestment");
  const cryptoInvestment = await CryptoInvestment.deploy(
    stablecoinAddress,
    roiPercentage,
    riskLevelEnum
  );

  await cryptoInvestment.waitForDeployment();

  const address = await cryptoInvestment.getAddress();
  console.log(`CryptoInvestment deployed to: ${address}`);

  const deployerAddress = (await hre.ethers.getSigners())[0].address;
  const stablecoinName = getStablecoinName(stablecoinAddress);

  // Save deployment info to file
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: address,
    stablecoinAddress: stablecoinAddress,
    roiPercentage: roiPercentage,
    riskLevel: riskLevelUpper,
    network: hre.network.name,
    deployer: deployerAddress,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-info.json");

  // Save to database
  try {
    await prisma.investmentContract.create({
      data: {
        contractAddress: address,
        rateOfInterest: parseInt(roiPercentage),
        stableCoin: stablecoinName,
        riskLevel: riskLevelUpper,
        network: hre.network.name,
        deployer: deployerAddress
      }
    });
    console.log("Contract info saved to database");
  } catch (dbError) {
    console.error("Failed to save to database:", dbError.message);
    // Don't fail the deployment if DB save fails
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    prisma.$disconnect();
    process.exit(1);
  });
