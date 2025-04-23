
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoloMethodEngine is Ownable {
    IERC20 public stakingToken;
    uint256 public totalStaked;
    uint256 public aprBasisPoints = 2500; // 25% APR (in basis points)
    uint256 public lastUpdate;
    mapping(address => uint256) public staked;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public lastStaked;

    uint256 public constant BPS_DIVISOR = 10000;
    uint256 public constant SECONDS_IN_YEAR = 31536000;

    constructor(address _token) {
        stakingToken = IERC20(_token);
    }

    function setAPR(uint256 _bps) external onlyOwner {
        require(_bps <= 10000, "APR too high");
        aprBasisPoints = _bps;
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Stake more than 0");
        _updateRewards(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), amount);
        staked[msg.sender] += amount;
        totalStaked += amount;
        lastStaked[msg.sender] = block.timestamp;
    }

    function _updateRewards(address user) internal {
        uint256 pending = earned(user);
        rewardDebt[user] = pending;
        lastStaked[user] = block.timestamp;
    }

    function earned(address user) public view returns (uint256) {
        if (staked[user] == 0) return rewardDebt[user];
        uint256 timeElapsed = block.timestamp - lastStaked[user];
        uint256 reward = (staked[user] * aprBasisPoints * timeElapsed) / BPS_DIVISOR / SECONDS_IN_YEAR;
        return reward + rewardDebt[user];
    }

    function claim() external {
        _updateRewards(msg.sender);
        uint256 reward = rewardDebt[msg.sender];
        rewardDebt[msg.sender] = 0;
        stakingToken.transfer(msg.sender, reward);
    }

    function withdraw(uint256 amount) external {
        require(amount <= staked[msg.sender], "Withdraw less");
        _updateRewards(msg.sender);
        staked[msg.sender] -= amount;
        totalStaked -= amount;
        stakingToken.transfer(msg.sender, amount);
    }
}
