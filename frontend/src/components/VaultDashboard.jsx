import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { formatBigNumber, parseBigNumber } from "../lib/web3";
import { SWF_TOKEN_ABI, SWF_BASKET_VAULT_ABI } from "../lib/constants";

export default function VaultDashboard({ vaultAddress, swfAddress, provider }) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [stats, setStats] = useState({ 
    totalDeposited: 0, 
    userDeposit: 0,
    basketBalance: 0,
    swfBalance: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTx, setActiveTx] = useState(null);

  useEffect(() => {
    if (!provider || !vaultAddress || !swfAddress) {
      return;
    }
    
    let vault, swf, userAddress;
    
    const fetchContracts = async () => {
      try {
        const signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        vault = new ethers.Contract(vaultAddress, SWF_BASKET_VAULT_ABI, signer);
        swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
        
        await updateStats(vault, swf, userAddress);
      } catch (err) {
        console.error("Error initializing contracts:", err);
        setError("Error connecting to contracts. Please check your network connection.");
      }
    };
    
    fetchContracts();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      if (vault && swf && userAddress) {
        updateStats(vault, swf, userAddress);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [provider, vaultAddress, swfAddress]);

  const updateStats = async (vault, swf, userAddress) => {
    try {
      const [total, userDeposit, swfBalance, basketBalance] = await Promise.all([
        vault.totalDeposited(),
        vault.deposits(userAddress),
        swf.balanceOf(userAddress),
        vault.balanceOf(userAddress)
      ]);
      
      setStats({
        totalDeposited: formatBigNumber(total),
        userDeposit: formatBigNumber(userDeposit),
        swfBalance: formatBigNumber(swfBalance),
        basketBalance: formatBigNumber(basketBalance)
      });
      
      setError("");
    } catch (err) {
      console.error("Error updating stats:", err);
      setError("Failed to update vault statistics");
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(parseFloat(depositAmount)) || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid deposit amount");
      return;
    }

    try {
      if (!provider || !vaultAddress || !swfAddress) {
        setError("Wallet not connected or contract addresses missing");
        return;
      }
      
      setLoading(true);
      setError("");
      setActiveTx("deposit");
      
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, SWF_BASKET_VAULT_ABI, signer);
      const swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
      const userAddress = await signer.getAddress();
      
      const amt = parseBigNumber(depositAmount);
      
      // First approve the vault to spend tokens
      console.log(`Approving vault to spend ${depositAmount} SWF tokens...`);
      const approveTx = await swf.approve(vaultAddress, amt);
      await approveTx.wait();
      
      // Then deposit tokens
      console.log(`Depositing ${depositAmount} SWF tokens into vault...`);
      const depositTx = await vault.deposit(amt);
      await depositTx.wait();
      
      setDepositAmount("");
      await updateStats(vault, swf, userAddress);
      alert("Deposit successful!");
    } catch (err) {
      console.error("Error during deposit:", err);
      setError(err.message || "Failed to deposit tokens");
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
      if (!provider || !vaultAddress) {
        setError("Wallet not connected or contract addresses missing");
        return;
      }
      
      setLoading(true);
      setError("");
      setActiveTx("withdraw");
      
      const signer = provider.getSigner();
      const vault = new ethers.Contract(vaultAddress, SWF_BASKET_VAULT_ABI, signer);
      const swf = new ethers.Contract(swfAddress, SWF_TOKEN_ABI, signer);
      const userAddress = await signer.getAddress();
      
      const amt = parseBigNumber(withdrawAmount);
      
      console.log(`Withdrawing ${withdrawAmount} SWF tokens from vault...`);
      const withdrawTx = await vault.withdraw(amt);
      await withdrawTx.wait();
      
      setWithdrawAmount("");
      await updateStats(vault, swf, userAddress);
      alert("Withdrawal successful!");
    } catch (err) {
      console.error("Error during withdrawal:", err);
      setError(err.message || "Failed to withdraw tokens");
    } finally {
      setLoading(false);
      setActiveTx(null);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold mb-6">SWF Basket Vault</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card>
        <CardContent className="space-y-2 py-4">
          <h2 className="text-lg font-bold">Vault Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <p><strong>Total Deposited:</strong> {stats.totalDeposited} SWF</p>
              <p><strong>Your Contribution:</strong> {stats.userDeposit} SWF</p>
            </div>
            <div>
              <p><strong>SWF Balance:</strong> {stats.swfBalance} SWF</p>
              <p><strong>SWF-BASKET Balance:</strong> {stats.basketBalance}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Depositing into the vault influences the dynamic APR rate for staking rewards.
            Higher vault deposits lead to lower APR rates, balancing incentives across the ecosystem.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="font-semibold">Deposit SWF Tokens</h2>
          <Input
            placeholder="Amount in SWF"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={loading}
            type="number"
            min="0"
            step="0.01"
          />
          <div className="flex justify-between">
            <Button 
              onClick={() => setDepositAmount(stats.swfBalance)}
              disabled={loading || parseFloat(stats.swfBalance) === 0}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Max
            </Button>
            <Button 
              onClick={handleDeposit} 
              disabled={loading || !depositAmount || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) > parseFloat(stats.swfBalance)}
            >
              {loading && activeTx === "deposit" ? "Processing..." : "Deposit to Vault"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 py-4">
          <h2 className="font-semibold">Withdraw SWF Tokens</h2>
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
              onClick={() => setWithdrawAmount(stats.userDeposit)}
              disabled={loading || parseFloat(stats.userDeposit) === 0}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Max
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > parseFloat(stats.userDeposit)}
            >
              {loading && activeTx === "withdraw" ? "Processing..." : "Withdraw from Vault"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}