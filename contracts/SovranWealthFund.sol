// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Sovran Wealth Fund
 * @dev ERC20 token with permission-based minting capabilities, pausability, and burn functions
 */
contract SovranWealthFund is ERC20Base, PermissionsEnumerable, Pausable, Ownable {
    // Define the minter role
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /**
     * @dev Constructor initializes the token with name, symbol, and sets up roles
     */
    constructor()
        ERC20Base("Sovran Wealth Fund", "SWF", msg.sender)
    {
        // Grant the MINTER_ROLE to the contract owner (msg.sender) and the hardcoded address
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, 0x2A5269E92C48829fdF21D8892c23E894B11D15e3);
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Pauses all token transfers
     * Only callable by the contract owner
     */
    function pause() public onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers
     * Only callable by the contract owner
     */
    function unpause() public onlyOwner {
        _unpause();
    }

    /**
     * @dev Mint new tokens
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     * Only callable by addresses with the MINTER_ROLE
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from the caller's address
     * @param amount The amount of tokens to burn
     * Any token holder can burn their own tokens
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Hook that is called before any token transfer
     * Used to implement the pausable functionality
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override
    {
        require(!paused(), "Token transfers are paused");
        super._beforeTokenTransfer(from, to, amount);
    }
}
