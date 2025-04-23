import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { formatBigNumber, parseBigNumber } from "../lib/web3";
import { 
  SWF_TOKEN_ABI, 
  SOLO_METHOD_ENGINE_ABI, 
  DYNAMIC_APR_CONTROLLER_ABI,
  BPS_DIVISOR,
  SECONDS_IN_YEAR 
} from "../lib/constants";

export default function StakingDashboard({ stakingAddress, swfAddress, aprControllerAddress, provider }) {
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [stats, setStats] = useState({
    totalStaked: 0,
    userStaked: 0,
    pendingRewards: 0,
    currentAPR: 0,
    swfBalance: 0,
    nextAdjustment: "",
    rewardRate: 0,
    estimatedDailyRewards: 0,
    vaultDeposits: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTx, setActiveTx] = useState(null);

  useEffect(() => {
    if (!provider || !stakingAddress || !swfAddress || !aprControllerAddress) {
      return;
    }
    
    let stakingEngine, swf, aprController, userAddress;
    
    const fetchContracts = async () => {
      try {
        const signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        stakingEngine = new ethers.Contract(stakingAddress, SOLO_METHOD_ENGINE_ABI, signer);
        swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
        aprController = new ethers.Contract(aprControllerAddress, DYNAMIC_APR_CONTROLLER_ABI, signer);
        
        await updateStats(stakingEngine, swf, aprController, userAddress);
      } catch (err) {
        console.error("Error initializing contracts:", err);
        setError("Error connecting to contracts. Please check your network connection.");
      }
    };
    
    fetchContracts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      if (stakingEngine && swf && aprController && userAddress) {
        updateStats(stakingEngine, swf, aprController, userAddress);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [provider, stakingAddress, swfAddress, aprControllerAddress]);

  const updateStats = async (stakingEngine, swf, aprController, userAddress) => {
    try {
      // Get staking data
      const [
        total, 
        userStake, 
        rewards, 
        aprBasisPoints, 
        rewardRate,
        swfBalance,
        aprInfo
      ] = await Promise.all([
        stakingEngine.totalStaked(),
        stakingEngine.staked(userAddress),
        stakingEngine.earned(userAddress),
        stakingEngine.aprBasisPoints(),
        stakingEngine.rewardRate(),
        swf.balanceOf(userAddress),
        aprController.getAPRInfo()
      ]);

      // Calculate estimated daily rewards for user
      const dailySeconds = 86400; // 24 hours
      const userStakeFloat = parseFloat(formatBigNumber(userStake));
      const aprFloat = aprBasisPoints.toNumber() / BPS_DIVISOR;
      const estimatedDailyRewards = userStakeFloat * aprFloat * dailySeconds / SECONDS_IN_YEAR;
      
      setStats({
        totalStaked: formatBigNumber(total),
        userStaked: formatBigNumber(userStake),
        pendingRewards: formatBigNumber(rewards),
        currentAPR: aprBasisPoints.toNumber() / 100, // Convert basis points to percentage
        rewardRate: formatBigNumber(rewardRate),
        swfBalance: formatBigNumber(swfBalance),
        nextAdjustment: new Date(aprInfo[1].toNumber() * 1000).toLocaleString(),
        estimatedDailyRewards: estimatedDailyRewards.toFixed(6),
        vaultDeposits: formatBigNumber(aprInfo[2])
      });
      
      setError("");
    } catch (err) {
      console.error("Error updating stats:", err);
      setError("Failed to update staking statistics");
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
      setError("Please enter a valid staking amount");
      return;
    }

    try {
      if (!provider || !stakingAddress || !swfAddress) {
        setError("Wallet not connected or contract addresses missing");
        return;
      }
      
      setLoading(true);
      setError("");
      setActiveTx("stake");
      
      const signer = provider.getSigner();
      const stakingEngine = new ethers.Contract(stakingAddress, SOLO_METHOD_ENGINE_ABI, signer);
      const swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
      const aprController = new ethers.Contract(aprControllerAddress, DYNAMIC_APR_CONTROLLER_ABI, signer);
      const userAddress = await signer.getAddress();
      
      const amt = parseBigNumber(stakeAmount);
      
      // First approve the staking contract to spend tokens
      console.log(`Approving staking contract to spend ${stakeAmount} SWF tokens...`);
      const approveTx = await swf.approve(stakingAddress, amt);
      await approveTx.wait();
      
      // Then stake tokens
      console.log(`Staking ${stakeAmount} SWF tokens...`);
      const stakeTx = await stakingEngine.stake(amt);
      await stakeTx.wait();
      
      setStakeAmount("");
      await updateStats(stakingEngine, swf, aprController, userAddress);
      alert("Staking successful!");
    } catch (err) {
      console.error("Error during staking:", err);
      setError(err.message || "Failed to stake tokens");
    } finally {
      setLoading(false);
      setActiveTx(null);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(parseFloat(withdrawAmount)) || parseFloat(withdrawAmount) <= 0) {
      setError("Please enter a valid withdrawal amount");
      return;
    }

    try {
      if (!provider || !stakingAddress) {
        setError("Wallet not connected or contract addresses missing");
        return;
      }
      
      setLoading(true);
      setError("");
      setActiveTx("withdraw");
      
      const signer = provider.getSigner();
      const stakingEngine = new ethers.Contract(stakingAddress, SOLO_METHOD_ENGINE_ABI, signer);
      const swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
      const aprController = new ethers.Contract(aprControllerAddress, DYNAMIC_APR_CONTROLLER_ABI, signer);
      const userAddress = await signer.getAddress();
      
      const amt = parseBigNumber(withdrawAmount);
      
      console.log(`Withdrawing ${withdrawAmount} staked SWF tokens...`);
      const withdrawTx = await stakingEngine.withdraw(amt);
      await withdrawTx.wait();
      
      setWithdrawAmount("");
      await updateStats(stakingEngine, swf, aprController, userAddress);
      alert("Withdrawal successful!");
    } catch (err) {
      console.error("Error during withdrawal:", err);
      setError(err.message || "Failed to withdraw staked tokens");
    } finally {
      setLoading(false);
      setActiveTx(null);
    }
  };

  const handleClaimRewards = async () => {
    try {
      if (!provider || !stakingAddress) {
        setError("Wallet not connected or contract addresses missing");
        return;
      }
      
      setLoading(true);
      setError("");
      setActiveTx("claim");
      
      const signer = provider.getSigner();
      const stakingEngine = new ethers.Contract(stakingAddress, SOLO_METHOD_ENGINE_ABI, signer);
      const swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
      const aprController = new ethers.Contract(aprControllerAddress, DYNAMIC_APR_CONTROLLER_ABI, signer);
      const userAddress = await signer.getAddress();
      
      console.log("Claiming staking rewards...");
      const claimTx = await stakingEngine.getReward();
      await claimTx.wait();
      
      await updateStats(stakingEngine, swf, aprController, userAddress);
      alert("Rewards claimed successfully!");
    } catch (err) {
      console.error("Error claiming rewards:", err);
      setError(err.message || "Failed to claim rewards");
    } finally {
      setLoading(false);
      setActiveTx(null);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-6">SWF Staking</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card>
        <CardContent className="space-y-2 py-4">
          <h2 className="text-lg font-bold">Staking Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p><strong>Current APR:</strong> {stats.currentAPR}%</p>
              <p><strong>Total SWF Staked:</strong> {stats.totalStaked} SWF</p>
              <p><strong>Next APR Adjustment:</strong> {stats.nextAdjustment}</p>
              <p><strong>Vault Deposits:</strong> {stats.vaultDeposits} SWF</p>
            </div>
            <div>
              <p><strong>Your Staked Balance:</strong> {stats.userStaked} SWF</p>
              <p><strong>Available SWF Balance:</strong> {stats.swfBalance} SWF</p>
              <p><strong>Pending Rewards:</strong> {stats.pendingRewards} SWF</p>
              <p><strong>Est. Daily Rewards:</strong> {stats.estimatedDailyRewards} SWF</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            APR adjusts dynamically based on the total amount deposited in the SWF Basket Vault.
            Higher vault deposits lead to lower APR rates, balancing incentives across the ecosystem.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="font-semibold">Stake SWF Tokens</h2>
          <Input
            placeholder="Amount to stake"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            disabled={loading}
            type="number"
            min="0"
            step="0.01"
          />
          <div className="flex justify-between">
            <Button 
              onClick={() => setStakeAmount(stats.swfBalance)}
              disabled={loading || parseFloat(stats.swfBalance) === 0}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Max
            </Button>
            <Button 
              onClick={handleStake} 
              disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > parseFloat(stats.swfBalance)}
            >
              {loading && activeTx === "stake" ? "Processing..." : "Stake SWF Tokens"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="font-semibold">Withdraw Staked Tokens</h2>
          <Input
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={loading}
            type="number"
            min="0"
            step="0.01"
          />
          <div className="flex justify-between">
            <Button 
              onClick={() => setWithdrawAmount(stats.userStaked)}
              disabled={loading || parseFloat(stats.userStaked) === 0}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Max
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(stats.userStaked)}
            >
              {loading && activeTx === "withdraw" ? "Processing..." : "Withdraw Staked Tokens"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="font-semibold">Claim Rewards</h2>
          <p>Pending rewards: {stats.pendingRewards} SWF</p>
          <Button 
            onClick={handleClaimRewards} 
            disabled={loading || parseFloat(stats.pendingRewards) === 0}
          >
            {loading && activeTx === "claim" ? "Processing..." : "Claim Rewards"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}