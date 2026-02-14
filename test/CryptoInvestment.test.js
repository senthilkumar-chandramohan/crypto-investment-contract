const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoInvestment", function () {
  let cryptoInvestment;
  let mockToken;
  let owner;
  let investor1;
  let investor2;
  const ROI_PERCENTAGE = 10;
  const RISK_LEVEL = 1; // MEDIUM

  beforeEach(async function () {
    [owner, investor1, investor2] = await ethers.getSigners();
    
    // Deploy a mock ERC20 token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockToken = await MockERC20.deploy("Mock USDC", "USDC", ethers.parseEther("1000000"));
    await mockToken.waitForDeployment();
    
    // Deploy CryptoInvestment contract
    const CryptoInvestment = await ethers.getContractFactory("CryptoInvestment");
    cryptoInvestment = await CryptoInvestment.deploy(
      await mockToken.getAddress(),
      ROI_PERCENTAGE,
      RISK_LEVEL
    );
    await cryptoInvestment.waitForDeployment();
    
    // Transfer tokens to investors for testing
    await mockToken.transfer(investor1.address, ethers.parseEther("1000"));
    await mockToken.transfer(investor2.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cryptoInvestment.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total investment", async function () {
      expect(await cryptoInvestment.totalInvestment()).to.equal(0);
    });
    
    it("Should set the correct stablecoin address", async function () {
      expect(await cryptoInvestment.stablecoinAddress()).to.equal(await mockToken.getAddress());
    });
    
    it("Should set the correct ROI percentage", async function () {
      expect(await cryptoInvestment.roiPercentage()).to.equal(ROI_PERCENTAGE);
    });
    
    it("Should set the correct risk level", async function () {
      expect(await cryptoInvestment.riskLevel()).to.equal(RISK_LEVEL);
      expect(await cryptoInvestment.getRiskLevelString()).to.equal("MEDIUM");
    });
  });

  describe("Investments", function () {
    it("Should accept investments", async function () {
      const investmentAmount = ethers.parseEther("1.0");
      
      // Approve the contract to spend tokens
      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), investmentAmount);
      
      await expect(
        cryptoInvestment.connect(investor1).invest(investor1.address, investmentAmount)
      ).to.emit(cryptoInvestment, "InvestmentMade")
        .withArgs(investor1.address, investmentAmount);

      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(investmentAmount);
      expect(await cryptoInvestment.totalInvestment()).to.equal(investmentAmount);
    });

    it("Should reject zero investments", async function () {
      await expect(
        cryptoInvestment.connect(investor1).invest(investor1.address, 0)
      ).to.be.revertedWith("Investment must be greater than 0");
    });

    it("Should track multiple investments", async function () {
      const investment1 = ethers.parseEther("1.0");
      const investment2 = ethers.parseEther("2.0");

      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), investment1);
      await cryptoInvestment.connect(investor1).invest(investor1.address, investment1);
      
      await mockToken.connect(investor2).approve(await cryptoInvestment.getAddress(), investment2);
      await cryptoInvestment.connect(investor2).invest(investor2.address, investment2);

      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(investment1);
      expect(await cryptoInvestment.getInvestment(investor2.address)).to.equal(investment2);
      expect(await cryptoInvestment.totalInvestment()).to.equal(investment1 + investment2);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const investmentAmount = ethers.parseEther("2.0");
      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), investmentAmount);
      await cryptoInvestment.connect(investor1).invest(investor1.address, investmentAmount);
    });

    it("Should calculate and pay interest on withdrawal", async function () {
      // Fast forward time by 365 days to get full ROI
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const investmentAmount = ethers.parseEther("2.0");
      const expectedInterest = (investmentAmount * BigInt(ROI_PERCENTAGE)) / BigInt(100);
      const expectedTotal = investmentAmount + expectedInterest;
      
      const initialBalance = await mockToken.balanceOf(investor1.address);
      
      await expect(
        cryptoInvestment.connect(investor1).withdraw(investor1.address)
      ).to.emit(cryptoInvestment, "InvestmentWithdrawn");
      
      const finalBalance = await mockToken.balanceOf(investor1.address);
      const received = finalBalance - initialBalance;
      
      // Allow for small rounding differences
      expect(received).to.be.closeTo(expectedTotal, ethers.parseEther("0.01"));
      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(0);
    });

    it("Should reject withdrawals with no investment", async function () {
      await expect(
        cryptoInvestment.connect(investor2).withdraw(investor2.address)
      ).to.be.revertedWith("No investment found");
    });
    
    it("Should prevent reinvestment before withdrawal", async function () {
      const newInvestment = ethers.parseEther("1.0");
      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), newInvestment);
      
      await expect(
        cryptoInvestment.connect(investor1).invest(investor1.address, newInvestment)
      ).to.be.revertedWith("Must withdraw existing investment first");
    });
    
    it("Should allow reinvestment after withdrawal", async function () {
      // First withdrawal
      await cryptoInvestment.connect(investor1).withdraw(investor1.address);
      
      // Now can invest again
      const newInvestment = ethers.parseEther("3.0");
      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), newInvestment);
      await cryptoInvestment.connect(investor1).invest(investor1.address, newInvestment);
      
      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(newInvestment);
    });
  });
  
  describe("Contract Balance", function () {
    it("Should report correct contract balance", async function () {
      const investmentAmount = ethers.parseEther("5.0");
      
      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), investmentAmount);
      await cryptoInvestment.connect(investor1).invest(investor1.address, investmentAmount);
      
      expect(await cryptoInvestment.getContractBalance()).to.equal(investmentAmount);
    });
  });
  
  describe("Withdrawal Calculations", function () {
    it("Should calculate correct withdrawal amounts", async function () {
      const investmentAmount = ethers.parseEther("100.0");
      
      await mockToken.connect(investor1).approve(await cryptoInvestment.getAddress(), investmentAmount);
      await cryptoInvestment.connect(investor1).invest(investor1.address, investmentAmount);
      
      // Fast forward 365 days
      await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const [principal, interest, total] = await cryptoInvestment.calculateWithdrawalAmount(investor1.address);
      
      expect(principal).to.equal(investmentAmount);
      
      // After 1 year at 10% ROI, should get 10% interest
      const expectedInterest = (investmentAmount * BigInt(ROI_PERCENTAGE)) / BigInt(100);
      expect(interest).to.be.closeTo(expectedInterest, ethers.parseEther("0.01"));
      expect(total).to.equal(principal + interest);
    });
    
    it("Should return zero for non-investors", async function () {
      const [principal, interest, total] = await cryptoInvestment.calculateWithdrawalAmount(investor2.address);
      
      expect(principal).to.equal(0);
      expect(interest).to.equal(0);
      expect(total).to.equal(0);
    });
  });
});
