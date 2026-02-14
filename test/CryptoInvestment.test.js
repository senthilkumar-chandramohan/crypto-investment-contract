const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CryptoInvestment", function () {
  let cryptoInvestment;
  let owner;
  let investor1;
  let investor2;

  beforeEach(async function () {
    [owner, investor1, investor2] = await ethers.getSigners();
    
    const CryptoInvestment = await ethers.getContractFactory("CryptoInvestment");
    cryptoInvestment = await CryptoInvestment.deploy();
    await cryptoInvestment.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await cryptoInvestment.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total investment", async function () {
      expect(await cryptoInvestment.totalInvestment()).to.equal(0);
    });
  });

  describe("Investments", function () {
    it("Should accept investments", async function () {
      const investmentAmount = ethers.parseEther("1.0");
      
      await expect(
        cryptoInvestment.connect(investor1).invest({ value: investmentAmount })
      ).to.emit(cryptoInvestment, "InvestmentMade")
        .withArgs(investor1.address, investmentAmount);

      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(investmentAmount);
      expect(await cryptoInvestment.totalInvestment()).to.equal(investmentAmount);
    });

    it("Should reject zero investments", async function () {
      await expect(
        cryptoInvestment.connect(investor1).invest({ value: 0 })
      ).to.be.revertedWith("Investment must be greater than 0");
    });

    it("Should track multiple investments", async function () {
      const investment1 = ethers.parseEther("1.0");
      const investment2 = ethers.parseEther("2.0");

      await cryptoInvestment.connect(investor1).invest({ value: investment1 });
      await cryptoInvestment.connect(investor2).invest({ value: investment2 });

      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(investment1);
      expect(await cryptoInvestment.getInvestment(investor2.address)).to.equal(investment2);
      expect(await cryptoInvestment.totalInvestment()).to.equal(investment1 + investment2);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const investmentAmount = ethers.parseEther("2.0");
      await cryptoInvestment.connect(investor1).invest({ value: investmentAmount });
    });

    it("Should allow partial withdrawals", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      
      await expect(
        cryptoInvestment.connect(investor1).withdraw(withdrawAmount)
      ).to.emit(cryptoInvestment, "InvestmentWithdrawn")
        .withArgs(investor1.address, withdrawAmount);

      expect(await cryptoInvestment.getInvestment(investor1.address)).to.equal(ethers.parseEther("1.0"));
    });

    it("Should reject withdrawals exceeding balance", async function () {
      const withdrawAmount = ethers.parseEther("3.0");
      
      await expect(
        cryptoInvestment.connect(investor1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
