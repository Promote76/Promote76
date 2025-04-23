import { useState, useEffect } from "react";
import VaultDashboard from "../components/VaultDashboard";
import StakingDashboard from "../components/StakingDashboard";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { connectWallet, getProvider, switchNetwork, truncateAddress } from "../lib/web3";
import { SUPPORTED_NETWORKS, getContractAddresses } from "../lib/constants";

export default function Dashboard() {
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [networkName, setNetworkName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get contract addresses based on the network
  const contractAddresses = chainId ? getContractAddresses(chainId) : {};

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setError("");
      
      const { accounts, chainId, provider } = await connectWallet();
      
      setProvider(provider);
      setAccounts(accounts);
      setChainId(chainId);
      setConnected(true);
      
      // Set network name
      const network = SUPPORTED_NETWORKS[chainId];
      setNetworkName(network ? network.name : `Chain ID: ${chainId}`);
      
      // Check if we're on a supported network
      if (!SUPPORTED_NETWORKS[chainId]) {
        setError(`Unsupported network. Please switch to Polygon Mainnet or Mumbai Testnet.`);
      }
      
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError("Failed to connect wallet: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchNetwork = async (targetChainId) => {
    try {
      setLoading(true);
      const success = await switchNetwork(targetChainId);
      if (!success) {
        setError(`Failed to switch to ${SUPPORTED_NETWORKS[targetChainId]?.name || 'network'}`);
      }
    } catch (err) {
      console.error("Error switching network:", err);
      setError("Failed to switch network: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Set up event listeners for blockchain events
  useEffect(() => {
    if (connected && window.ethereum) {
      // Listen for account changes
      const handleAccountsChanged = (newAccounts) => {
        setAccounts(newAccounts);
        if (newAccounts.length === 0) {
          setConnected(false);
        }
      };
      
      // Listen for chain changes
      const handleChainChanged = (newChainIdHex) => {
        const newChainId = parseInt(newChainIdHex, 16);
        setChainId(newChainId);
        
        // Update network name
        const network = SUPPORTED_NETWORKS[newChainId];
        setNetworkName(network ? network.name : `Chain ID: ${newChainId}`);
        
        // Check if we're on a supported network
        if (!SUPPORTED_NETWORKS[newChainId]) {
          setError(`Unsupported network. Please switch to Polygon Mainnet or Mumbai Testnet.`);
        } else {
          setError("");
        }
      };
      
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      
      // Clean up event listeners
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [connected]);

  // Check for existing connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getProvider();
      if (provider) {
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const { chainId } = await provider.getNetwork();
            
            setProvider(provider);
            setAccounts(accounts);
            setChainId(chainId);
            setConnected(true);
            
            // Set network name
            const network = SUPPORTED_NETWORKS[chainId];
            setNetworkName(network ? network.name : `Chain ID: ${chainId}`);
            
            // Check if we're on a supported network
            if (!SUPPORTED_NETWORKS[chainId]) {
              setError(`Unsupported network. Please switch to Polygon Mainnet or Mumbai Testnet.`);
            }
          }
        } catch (err) {
          console.error("Error checking existing connection:", err);
        }
      }
    };
    
    checkConnection();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Sovran Wealth Fund</h1>
          <p className="text-gray-600">Stake and Manage Your SWF Tokens</p>
        </div>
        <div className="mt-4 sm:mt-0">
          {!connected ? (
            <Button onClick={handleConnectWallet} disabled={loading}>
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <div className="text-right">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
                Connected: {truncateAddress(accounts[0])}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Network: {networkName}
                {!SUPPORTED_NETWORKS[chainId] && (
                  <Button 
                    className="ml-2 py-0 px-2 text-xs h-6" 
                    onClick={() => handleSwitchNetwork(137)}
                  >
                    Switch to Polygon
                  </Button>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {!connected ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to Sovran Wealth Fund</h2>
            <p className="mb-6">Connect your wallet to access the dashboard and manage your SWF tokens.</p>
            <Button onClick={handleConnectWallet} disabled={loading}>
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <VaultDashboard 
            vaultAddress={contractAddresses.vault} 
            swfAddress={contractAddresses.swfToken} 
            provider={provider} 
          />
          <StakingDashboard 
            stakingAddress={contractAddresses.stakingEngine} 
            swfAddress={contractAddresses.swfToken} 
            aprControllerAddress={contractAddresses.aprController} 
            provider={provider} 
          />
        </div>
      )}
    </div>
  );
}