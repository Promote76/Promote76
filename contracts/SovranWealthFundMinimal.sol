// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Sovran Wealth Fund (Minimal Version)
 * @dev Gas-optimized ERC20 token with basic functionality
 */
contract SovranWealthFundMinimal is ERC20, Ownable {
    address public treasury;
    
    /**
     * @dev Constructor initializes the token with name and symbol
     */
    constructor()
        ERC20("Sovran Wealth Fund", "SWF")
        Ownable(msg.sender)
    {
        treasury = 0x26A8401287cE33CC4aeb5a106cd6D282a92Cf51d;
    }
    
    /**
     * @dev Mint new tokens - only owner or treasury can mint
     */
    function mint(address to, uint256 amount) public {
        require(msg.sender == owner() || msg.sender == treasury, "Not authorized");
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's balance
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}