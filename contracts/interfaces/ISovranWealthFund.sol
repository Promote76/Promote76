// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISovranWealthFund
 * @dev Interface for SovranWealthFund contract to avoid import conflicts
 */
interface ISovranWealthFund {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function paused() external view returns (bool);
    function pause() external;
    function unpause() external;
    function hasRole(bytes32 role, address account) external view returns (bool);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
}

/**
 * @title SovranWealthFund
 * @dev Type casting for using SovranWealthFund as IERC20 while accessing mint function
 */
abstract contract SovranWealthFund is ISovranWealthFund {
}