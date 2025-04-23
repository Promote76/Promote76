import { useState, useEffect } from "react";
import { ethers } from "ethers";

/**
 * SWFBasketVault Component
 * 
 * This component provides a UI for users to interact with the SWFBasketVault contract,
 * allowing them to deposit SWF tokens into the vault and withdraw them.
 * 
 * @param {Object} props Component props
 * @param {string} props.vaultAddress Address of the SWFBasketVault contract
 * @param {string} props.swfAddress Address of the SWF token contract
 * @param {Object} props.provider Ethers.js provider instance
 */
export default function VaultDeposit({ vaultAddress, swfAddress, provider }) {
  // State variables
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [swfBalance, setSWFBalance] = useState("0");
  const [basketBalance, setBasketBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get signer from provider
  const signer = provider.getSigner();

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const address = await signer.getAddress();
        
        // Initialize contract instances
        const swfToken = new ethers.Contract(swfAddress, [
          "function balanceOf(address account) public view returns (uint256)"
        ], signer);
        
        const vault = new ethers.Contract(vaultAddress, [
          "function balanceOf(address account) public view returns (uint256)"
        ], signer);
        
        // Get balances
        const swfBal = await swfToken.balanceOf(address);
        setSWFBalance(ethers.utils.formatEther(swfBal));
        
        const basketBal = await vault.balanceOf(address);
        setBasketBalance(ethers.utils.formatEther(basketBal));
      } catch (error) {
        console.error("Error fetching balances:", error);
        setMessage("Failed to load balances");
      }
    };

    if (provider && signer) {
      fetchBalances();
    }
  }, [provider, signer, swfAddress, vaultAddress]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Initialize contracts
      const swfToken = new ethers.Contract(swfAddress, [
        "function approve(address spender, uint256 amount) public returns (bool)"
      ], signer);
      
      const vault = new ethers.Contract(vaultAddress, [
        "function deposit(uint256 amount) public",
      ], signer);
      
      // Convert amount to Wei
      const amount = ethers.utils.parseEther(depositAmount);
      
      // First approve the vault to spend tokens
      const approveTx = await swfToken.approve(vaultAddress, amount);
      await approveTx.wait();
      
      // Then deposit tokens into the vault
      const depositTx = await vault.deposit(amount);
      await depositTx.wait();
      
      setMessage(`Successfully deposited ${depositAmount} SWF tokens`);
      setDepositAmount("");
      
      // Refresh balances
      const address = await signer.getAddress();
      const swfContract = new ethers.Contract(swfAddress, [
        "function balanceOf(address account) public view returns (uint256)"
      ], signer);
      const vaultContract = new ethers.Contract(vaultAddress, [
        "function balanceOf(address account) public view returns (uint256)"
      ], signer);
      
      const newSwfBal = await swfContract.balanceOf(address);
      setSWFBalance(ethers.utils.formatEther(newSwfBal));
      
      const newBasketBal = await vaultContract.balanceOf(address);
      setBasketBalance(ethers.utils.formatEther(newBasketBal));
    } catch (error) {
      console.error("Deposit error:", error);
      setMessage(`Deposit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Initialize contract
      const vault = new ethers.Contract(vaultAddress, [
        "function withdraw(uint256 amount) public",
      ], signer);
      
      // Convert amount to Wei
      const amount = ethers.utils.parseEther(withdrawAmount);
      
      // Withdraw tokens from the vault
      const withdrawTx = await vault.withdraw(amount);
      await withdrawTx.wait();
      
      setMessage(`Successfully withdrew ${withdrawAmount} SWF tokens`);
      setWithdrawAmount("");
      
      // Refresh balances
      const address = await signer.getAddress();
      const swfContract = new ethers.Contract(swfAddress, [
        "function balanceOf(address account) public view returns (uint256)"
      ], signer);
      const vaultContract = new ethers.Contract(vaultAddress, [
        "function balanceOf(address account) public view returns (uint256)"
      ], signer);
      
      const newSwfBal = await swfContract.balanceOf(address);
      setSWFBalance(ethers.utils.formatEther(newSwfBal));
      
      const newBasketBal = await vaultContract.balanceOf(address);
      setBasketBalance(ethers.utils.formatEther(newBasketBal));
    } catch (error) {
      console.error("Withdrawal error:", error);
      setMessage(`Withdrawal failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-bold">SWF Basket Vault</h2>
      
      <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded">
        <div>Your SWF Balance:</div>
        <div className="text-right font-medium">{parseFloat(swfBalance).toFixed(4)} SWF</div>
        
        <div>Your Basket Balance:</div>
        <div className="text-right font-medium">{parseFloat(basketBalance).toFixed(4)} SWF-BASKET</div>
      </div>
      
      <div className="border-t pt-3">
        <h3 className="font-medium mb-2">Deposit SWF Tokens</h3>
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="SWF amount" 
            value={depositAmount} 
            onChange={(e) => setDepositAmount(e.target.value)}
            disabled={loading}
            className="flex-1 p-2 border rounded"
          />
          <button 
            onClick={handleDeposit} 
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Deposit"}
          </button>
        </div>
      </div>
      
      <div className="border-t pt-3">
        <h3 className="font-medium mb-2">Withdraw SWF Tokens</h3>
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="SWF amount" 
            value={withdrawAmount} 
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={loading}
            className="flex-1 p-2 border rounded"
          />
          <button 
            onClick={handleWithdraw} 
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`p-3 rounded ${message.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}
      
      <div className="text-xs text-gray-500 border-t pt-3">
        Note: SWF-BASKET tokens represent your share of the vault's assets
      </div>
    </div>
  );
}