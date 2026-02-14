// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title CryptoInvestment
 * @dev A simple contract for managing crypto investments
 */
contract CryptoInvestment {
    address public owner;
    uint256 public totalInvestment;
    
    mapping(address => uint256) public investments;
    
    event InvestmentMade(address indexed investor, uint256 amount);
    event InvestmentWithdrawn(address indexed investor, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Allow users to invest by sending Ether
     */
    function invest() public payable {
        require(msg.value > 0, "Investment must be greater than 0");
        
        investments[msg.sender] += msg.value;
        totalInvestment += msg.value;
        
        emit InvestmentMade(msg.sender, msg.value);
    }
    
    /**
     * @dev Get the investment of a specific address
     */
    function getInvestment(address investor) public view returns (uint256) {
        return investments[investor];
    }
    
    /**
     * @dev Allow users to withdraw their investment
     */
    function withdraw(uint256 amount) public {
        require(investments[msg.sender] >= amount, "Insufficient balance");
        
        investments[msg.sender] -= amount;
        totalInvestment -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit InvestmentWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get total contract balance
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
