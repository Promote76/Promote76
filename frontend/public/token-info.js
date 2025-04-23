// Token information and contract interactions
const TOKEN_ADDRESS = '0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7';
const LOCAL_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Minimal ABI for token interactions
const TOKEN_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

// Initialize web3 when the page loads
let provider;
let signer;
let tokenContract;
let currentAccount;

// Check if MetaMask is installed
function isMetaMaskInstalled() {
  return window.ethereum && window.ethereum.isMetaMask;
}

// Initialize web3 connection
async function initWeb3() {
  try {
    if (!isMetaMaskInstalled()) {
      console.error("MetaMask is not installed");
      updateConnectionStatus("MetaMask not detected. Please install MetaMask to continue.");
      return false;
    }

    // Request access to the user's MetaMask accounts
    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get network
    const network = await provider.getNetwork();
    const networkName = getNetworkName(network.chainId);
    updateNetworkStatus(networkName);
    
    // Check if we're on the correct network
    if (network.chainId !== 137 && network.chainId !== 31337) {
      // Not Polygon Mainnet or Hardhat Local
      updateConnectionStatus(`Wrong network detected: ${networkName}. Please switch to Polygon Mainnet.`);
      return false;
    }
    
    // Initialize the token contract based on network
    const tokenAddress = network.chainId === 137 ? TOKEN_ADDRESS : LOCAL_TOKEN_ADDRESS;
    tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
    
    // Set signer
    signer = provider.getSigner();
    
    try {
      currentAccount = await signer.getAddress();
      updateConnectionStatus(`Connected to ${networkName}`);
      displayAccountInfo(currentAccount);
      
      // Get and display token info
      await updateTokenInfo();
      
      // Update UI
      document.getElementById('connectPrompt').style.display = 'none';
      document.getElementById('dashboard').style.display = 'block';
      
      return true;
    } catch (error) {
      console.error("Error getting address:", error);
      updateConnectionStatus("Connected, but couldn't get address. Please refresh and try again.");
      return false;
    }
  } catch (error) {
    console.error("Error initializing web3:", error);
    updateConnectionStatus("Error connecting. Please refresh and try again.");
    return false;
  }
}

// Get human-readable network name
function getNetworkName(chainId) {
  const networks = {
    1: "Ethereum Mainnet",
    137: "Polygon Mainnet",
    80001: "Polygon Mumbai Testnet",
    31337: "Hardhat Local"
  };
  return networks[chainId] || `Unknown Network (${chainId})`;
}

// Update network status UI
function updateNetworkStatus(networkName) {
  const networkStatus = document.querySelector('.network-status');
  if (networkStatus) {
    networkStatus.textContent = networkName;
    
    // Change color based on network
    if (networkName === "Polygon Mainnet") {
      networkStatus.style.backgroundColor = "#8247e5"; // Polygon purple
    } else if (networkName === "Hardhat Local") {
      networkStatus.style.backgroundColor = "#f6c343"; // Hardhat yellow
      networkStatus.style.color = "#000";
    } else {
      networkStatus.style.backgroundColor = "#ef4444"; // Error red
    }
  }
}

// Display user account info
function displayAccountInfo(account) {
  const accountDisplay = document.getElementById('accountDisplay');
  const fullAccountDisplay = document.getElementById('fullAccountDisplay');
  const walletInfo = document.getElementById('walletInfo');
  
  if (accountDisplay && fullAccountDisplay) {
    accountDisplay.textContent = formatAddress(account);
    fullAccountDisplay.textContent = account;
    walletInfo.style.display = 'block';
  }
}

// Format address to shorter version
function formatAddress(address) {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Update connection status
function updateConnectionStatus(message) {
  console.log("Connection status:", message);
  // You can add UI elements to display this if needed
}

// Get and display token info
async function updateTokenInfo() {
  try {
    if (!tokenContract) return;
    
    // Get token basic info
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);
    
    // Update token metric boxes
    document.querySelector('.metric-box:nth-child(1) .metric-value').textContent = 
      parseFloat(ethers.utils.formatUnits(totalSupply, decimals)).toLocaleString();
    
    // If user is connected, get their balance
    if (currentAccount) {
      const balance = await tokenContract.balanceOf(currentAccount);
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);
      
      // Update user's token balance in the staking card
      const userBalanceElements = document.querySelectorAll('.stat:contains("Your Staked Balance") .stat-value');
      userBalanceElements.forEach(element => {
        element.textContent = `${parseFloat(formattedBalance).toFixed(2)} ${symbol}`;
      });
    }
    
  } catch (error) {
    console.error("Error updating token info:", error);
  }
}

// Connect wallet button click handler
async function connectWalletHandler() {
  if (isMetaMaskInstalled()) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initWeb3();
    } catch (error) {
      console.error("User denied account access:", error);
      updateConnectionStatus("Connection rejected. Please connect your wallet to continue.");
    }
  } else {
    console.error("MetaMask is not installed");
    updateConnectionStatus("MetaMask not detected. Please install MetaMask to continue.");
  }
}

// Listen for account changes
function setupEventListeners() {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
      console.log("Account changed to:", accounts[0]);
      if (accounts.length > 0) {
        currentAccount = accounts[0];
        displayAccountInfo(currentAccount);
        await updateTokenInfo();
      } else {
        // User disconnected all accounts
        currentAccount = null;
        document.getElementById('connectPrompt').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('walletInfo').style.display = 'none';
      }
    });
    
    window.ethereum.on('chainChanged', async (chainId) => {
      console.log("Network changed to:", parseInt(chainId, 16));
      // Reload the page when the network changes
      window.location.reload();
    });
  }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
  // Set up connect wallet button handlers
  const connectButtons = document.querySelectorAll('.connect-btn');
  connectButtons.forEach(button => {
    button.addEventListener('click', connectWalletHandler);
  });
  
  // Set up event listeners for account/network changes
  setupEventListeners();
  
  // Check if MetaMask is already connected and initialize if it is
  if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
    await initWeb3();
  }
});