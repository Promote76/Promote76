
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

/// @title Sovran Wealth Fund Token
contract SovranWealthFund is ERC20Base, PermissionsEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20Base("Sovran Wealth Fund", "SWF") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}

/// @title Solo Method Engine
/// @notice Manages 16-role staking logic and tracks per-user wallet structure
contract SoloMethodEngine {
    IERC20 public swf;
    address public admin;

    enum WalletRole { BUYER, HOLDER, STAKER, LIQUIDITY, TRACKER }

    struct WalletInfo {
        WalletRole role;
        uint256 balance;
    }

    mapping(address => WalletInfo[16]) public userWallets;
    mapping(address => uint256) public stakedAmount;

    event Deposited(address indexed user, uint256 amount);
    event Minted(address indexed user, uint256 reward);

    constructor(address _swfTokenAddress) {
        swf = IERC20(_swfTokenAddress);
        admin = msg.sender;
    }

    function deposit(uint256 amount) external {
        require(amount >= 50 * 1e18, "Minimum 50 SWF required");
        require(swf.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        for (uint8 i = 0; i < 16; i++) {
            userWallets[msg.sender][i] = WalletInfo(WalletRole(i % 5), amount / 16);
        }

        stakedAmount[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function getWalletBreakdown(address user) external view returns (WalletInfo[16] memory) {
        return userWallets[user];
    }

    function getTotalStaked(address user) external view returns (uint256) {
        return stakedAmount[user];
    }
}
