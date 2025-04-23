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
     * @dev Constructor initializes the token with name, symbol and sets the contract owner
     * The owner address is also granted the MINTER_ROLE
     */
    constructor()
        ERC20Base("Sovran Wealth Fund", "SWF", 0x2A5269E92C48829fdF21D8892c23E894B11D15e3)
    {
        // Grant the MINTER_ROLE to the contract owner
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
