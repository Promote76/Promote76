// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

/**
 * @title Sovran Wealth Fund
 * @dev ERC20 token with permission-based minting capabilities
 */
contract SovranWealthFund is ERC20Base, PermissionsEnumerable {
    // Define the minter role
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Constructor initializes the token with an admin address, name, and symbol
     * The admin address is also granted the MINTER_ROLE
     */
    constructor()
        ERC20Base(msg.sender, "Sovran Wealth Fund", "SWF")
    {
        // Grant the MINTER_ROLE to the contract owner (msg.sender) and the hardcoded address
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, 0x2A5269E92C48829fdF21D8892c23E894B11D15e3);
    }

    /**
     * @dev Mint new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
