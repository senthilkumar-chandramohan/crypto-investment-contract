// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title CryptoInvestment
 * @dev A contract for managing crypto investments with stablecoins
 */
contract CryptoInvestment {
    address public owner;
    uint256 public totalInvestment;
    address public stablecoinAddress;
    uint256 public roiPercentage;
    
    enum RiskLevel { LOW, MEDIUM, HIGH }
    RiskLevel public riskLevel;
    
    mapping(address => uint256) public investments;
    mapping(address => uint256) public investmentTimestamps;
    
    event InvestmentMade(address indexed investor, uint256 amount);
    event InvestmentWithdrawn(address indexed investor, uint256 amount, uint256 interest);
    
    constructor(address _stablecoinAddress, uint256 _roiPercentage, RiskLevel _riskLevel) {
        require(_stablecoinAddress != address(0), "Invalid stablecoin address");
        require(_roiPercentage > 0 && _roiPercentage <= 10000, "ROI must be between 0.01 and 100 (in basis points)");
        
        owner = msg.sender;
        stablecoinAddress = _stablecoinAddress;
        roiPercentage = _roiPercentage; // Stored in basis points (e.g., 850 = 8.5%)
        riskLevel = _riskLevel;
    }
    
    /**
     * @dev Allow users to invest by transferring stablecoins
     * @param sender The address for which the investment is tracked
     * @param amount The amount to invest
     */
    function invest(address sender, uint256 amount) public {
        require(sender != address(0), "Invalid sender address");
        require(amount > 0, "Investment must be greater than 0");
        require(investments[sender] == 0, "Must withdraw existing investment first");
        
        IERC20 stablecoin = IERC20(stablecoinAddress);
        require(stablecoin.transferFrom(sender, address(this), amount), "Transfer failed");
        
        investments[sender] = amount;
        investmentTimestamps[sender] = block.timestamp;
        totalInvestment += amount;
        
        emit InvestmentMade(sender, amount);
    }
    
    /**
     * @dev Get the investment of a specific address
     */
    function getInvestment(address investor) public view returns (uint256) {
        return investments[investor];
    }
    
    /**
     * @dev Allow users to withdraw their investment with calculated returns
     * Calculates interest based on time elapsed and ROI percentage (annualized)
     * @param sender The address for which to withdraw the investment
     */
    function withdraw(address sender) public returns (uint256) {
        require(sender != address(0), "Invalid sender address");
        require(investments[sender] > 0, "No investment found");
        
        uint256 principal = investments[sender];
        uint256 timeElapsed = block.timestamp - investmentTimestamps[sender];
        
        // Calculate interest: (principal * roi * timeElapsed) / (10000 * 365 days)
        // ROI is stored in basis points (e.g., 850 = 8.5%)
        // This gives us annualized ROI calculated per second
        uint256 interest = (principal * roiPercentage * timeElapsed) / (10000 * 365 days);
        uint256 totalAmount = principal + interest;
        
        // Reset investment data
        investments[sender] = 0;
        investmentTimestamps[sender] = 0;
        totalInvestment -= principal;
        
        emit InvestmentWithdrawn(sender, totalAmount, interest);
        
        IERC20 stablecoin = IERC20(stablecoinAddress);
        require(stablecoin.transfer(sender, totalAmount), "Transfer failed");
        
        return totalAmount;
    }
    
    /**
     * @dev Get total contract balance
     */
    function getContractBalance() public view returns (uint256) {
        IERC20 stablecoin = IERC20(stablecoinAddress);
        return stablecoin.balanceOf(address(this));
    }
    
    /**
     * @dev Get risk level as string
     */
    function getRiskLevelString() public view returns (string memory) {
        if (riskLevel == RiskLevel.LOW) return "LOW";
        if (riskLevel == RiskLevel.MEDIUM) return "MEDIUM";
        return "HIGH";
    }
    
    /**
     * @dev Calculate potential withdrawal amount for an investor
     */
    function calculateWithdrawalAmount(address investor) public view returns (uint256 principal, uint256 interest, uint256 total) {
        if (investments[investor] == 0) {
            return (0, 0, 0);
        }
        
        principal = investments[investor];
        uint256 timeElapsed = block.timestamp - investmentTimestamps[investor];
        interest = (principal * roiPercentage * timeElapsed) / (10000 * 365 days);
        total = principal + interest;
        
        return (principal, interest, total);
    }
}
