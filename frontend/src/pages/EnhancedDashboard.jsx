import { useState, useEffect, useCallback } from "react";
import VaultDashboard from "../components/VaultDashboard";
import StakingDashboard from "../components/StakingDashboard";
import TransactionHistory from "../components/TransactionHistory";
import APRVisualization from "../components/APRVisualization";
import TransactionModal from "../components/TransactionModal";
import ErrorHandler from "../components/ErrorHandler";
import LoadingIndicator, { LOADING_TYPES } from "../components/LoadingIndicator";
import NetworkStatus from "../components/NetworkStatus";
import TokenMetrics from "../components/TokenMetrics";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { connectWallet, getProvider, switchNetwork, truncateAddress, getContracts } from "../lib/web3";
import { SUPPORTED_NETWORKS, getContractAddresses, TX_TYPES } from "../lib/constants";

export default function EnhancedDashboard() {
  // Wallet & network state
  const [provider, setProvider] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [networkName, setNetworkName] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initializing, setInitializing] = useState(true);
  
  // Transaction state
  const [transactions, setTransactions] = useState([]);
  const [currentTx, setCurrentTx] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
    txHash: null
  });
  
  // Contract state
  const [contracts, setContracts] = useState(null);
  const [aprInfo, setAprInfo] = useState({
    currentAPR: 0,
    vaultDeposits: 0,
    nextAdjustmentTime: null
  });
  
  // Get contract addresses based on the network
  const contractAddresses = chainId ? getContractAddresses(chainId) : {};

  // Connect wallet
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
      } else {
        // Initialize contracts
        const contractInstances = getContracts(provider, chainId);
        setContracts(contractInstances);
        
        // Fetch APR info
        try {
          const aprInfo = await contractInstances.aprController.getAPRInfo();
          setAprInfo({
            currentAPR: aprInfo[0].toNumber() / 100, // Convert basis points to percentage
            nextAdjustmentTime: new Date(aprInfo[1].toNumber() * 1000),
            vaultDeposits: aprInfo[2].toString()
          });
        } catch (err) {
          console.error("Error fetching APR info:", err);
        }
      }
      
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  // Switch network
  const handleSwitchNetwork = async (targetChainId) => {
    try {
      setLoading(true);
      const success = await switchNetwork(targetChainId);
      if (!success) {
        setError(`Failed to switch to ${SUPPORTED_NETWORKS[targetChainId]?.name || 'network'}`);
      }
    } catch (err) {
      console.error("Error switching network:", err);
      setError(err.message || "Failed to switch network");
    } finally {
      setLoading(false);
    }
  };

  // Add transaction to history
  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  // Handle transaction confirmation modal
  const openModal = (type, title, message, txHash = null) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      txHash
    });
  };

  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
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
          
          // Re-initialize contracts for the new network
          if (provider) {
            const contractInstances = getContracts(provider, newChainId);
            setContracts(contractInstances);
          }
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
  }, [connected, provider]);

  // Check for existing connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      setInitializing(true);
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
            
            // Initialize contracts
            const contractInstances = getContracts(provider, chainId);
            setContracts(contractInstances);
            
            // Fetch APR info
            try {
              const aprInfo = await contractInstances.aprController.getAPRInfo();
              setAprInfo({
                currentAPR: aprInfo[0].toNumber() / 100, // Convert basis points to percentage
                nextAdjustmentTime: new Date(aprInfo[1].toNumber() * 1000),
                vaultDeposits: aprInfo[2].toString()
              });
            } catch (err) {
              console.error("Error fetching APR info:", err);
            }
            
            // Check if we're on a supported network
            if (!SUPPORTED_NETWORKS[chainId]) {
              setError(`Unsupported network. Please switch to Polygon Mainnet or Mumbai Testnet.`);
            }
          }
        } catch (err) {
          console.error("Error checking existing connection:", err);
        }
      }
      setInitializing(false);
    };
    
    checkConnection();
  }, []);

  // If initializing, show loading screen
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator 
          type={LOADING_TYPES.SPINNER} 
          message="Initializing Sovran Wealth Fund App..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Transaction Modal */}
      <TransactionModal 
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        txHash={modalState.txHash}
        chainId={chainId}
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sovran Wealth Fund</h1>
              <p className="text-gray-600">Advanced Token Staking & Vault System</p>
            </div>
            <div className="mt-4 sm:mt-0">
              {!connected ? (
                <Button 
                  onClick={handleConnectWallet} 
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <div className="text-right">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
                    Connected: {truncateAddress(accounts[0])}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 flex items-center justify-end">
                    <span>Network: {networkName}</span>
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
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <ErrorHandler 
              error={error} 
              onRetry={() => setError("")}
            />
          </div>
        )}
        
        {/* Main Content */}
        {!connected ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mx-auto w-24 h-24 mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-4">Welcome to Sovran Wealth Fund</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                Connect your wallet to access the dashboard and manage your SWF tokens.
                Deposit tokens to the vault, stake to earn rewards, and more.
              </p>
              <Button 
                onClick={handleConnectWallet} 
                disabled={loading}
                className="px-6 py-3"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Main Dashboards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <VaultDashboard 
                vaultAddress={contractAddresses.vault} 
                swfAddress={contractAddresses.swfToken} 
                provider={provider}
                addTransaction={addTransaction}
                openModal={openModal}
              />
              <StakingDashboard 
                stakingAddress={contractAddresses.stakingEngine} 
                swfAddress={contractAddresses.swfToken} 
                aprControllerAddress={contractAddresses.aprController} 
                provider={provider}
                addTransaction={addTransaction}
                openModal={openModal}
              />
            </div>
            
            {/* Token Metrics & Network Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <TokenMetrics
                  swfToken={contracts?.swfToken}
                  vault={contracts?.vault}
                  stakingEngine={contracts?.stakingEngine}
                />
              </div>
              <div>
                <NetworkStatus
                  chainId={chainId}
                  connected={connected}
                  onSwitchNetwork={handleSwitchNetwork}
                />
              </div>
            </div>
            
            {/* APR Visualization & Transaction History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* APR Visualization */}
              <APRVisualization 
                aprController={contracts?.aprController}
                currentVaultDeposits={aprInfo.vaultDeposits}
                currentAPR={aprInfo.currentAPR}
              />
              
              {/* Transaction History */}
              <TransactionHistory 
                transactions={transactions} 
                chainId={chainId}
              />
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Sovran Wealth Fund. All rights reserved.</p>
            <p className="mt-2">
              Deployed on Polygon Network. View contracts on{" "}
              <a 
                href={`https://polygonscan.com/address/${contractAddresses.swfToken}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                PolygonScan
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}