const hre = require("hardhat");

async function main() {
  console.log("Deploying CryptoInvestment contract...");

  const CryptoInvestment = await hre.ethers.getContractFactory("CryptoInvestment");
  const cryptoInvestment = await CryptoInvestment.deploy();

  await cryptoInvestment.waitForDeployment();

  const address = await cryptoInvestment.getAddress();
  console.log(`CryptoInvestment deployed to: ${address}`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
