// SWF Token Balance Tracker
// This script periodically checks the token balance and updates the UI

// Configuration
const CHECK_INTERVAL = 30000; // Check every 30 seconds
const SWF_TOKEN_ADDRESS = '0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7';
const SWF_RECIPIENT_ADDRESS = '0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6';
const SUCCESSFUL_TX_HASH = '0x715ae5cbd0cea8955a93230d28170a7549f3317712dfe20a7d305a6671a151d8';

// Minimal ABI for token balance checking
const SWF_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

// Store previous balance to detect changes
let previousBalance = null;
let previousTotalSupply = null;
let trackerInterval = null;

// Initialize the tracker
async function initBalanceTracker() {
  try {
    if (!window.ethereum) {
      console.error("No Web3 provider detected");
      updateTrackerStatus("No Web3 provider detected. Please install MetaMask.");
      return;
    }

    updateTrackerStatus("Initializing tracker...");
    
    // Create provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get network info
    const network = await provider.getNetwork();
    console.log(`Connected to network: ${network.name} (${network.chainId})`);
    
    // Initialize contract
    const tokenContract = new ethers.Contract(SWF_TOKEN_ADDRESS, SWF_TOKEN_ABI, provider);
    
    // Get token info
    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals()
    ]);
    
    console.log(`Tracking ${name} (${symbol}) with ${decimals} decimals`);
    updateTrackerStatus(`Tracking ${name} (${symbol}) token...`);
    
    // Start periodic checking
    if (trackerInterval) {
      clearInterval(trackerInterval);
    }
    
    // Perform initial check
    await checkBalance(tokenContract, decimals, symbol);
    
    // Set up interval for periodic checks
    trackerInterval = setInterval(() => {
      checkBalance(tokenContract, decimals, symbol);
    }, CHECK_INTERVAL);
    
  } catch (error) {
    console.error("Error initializing balance tracker:", error);
    updateTrackerStatus(`Error: ${error.message}`);
  }
}

// Check token balance
async function checkBalance(tokenContract, decimals, symbol) {
  try {
    // Get balance
    const balance = await tokenContract.balanceOf(SWF_RECIPIENT_ADDRESS);
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    // Update status
    const balanceDisplay = document.getElementById("tokenBalance");
    if (balanceDisplay) {
      balanceDisplay.textContent = `${parseFloat(formattedBalance).toLocaleString()} ${symbol}`;
    }
    
    // Notify if balance has changed
    if (previousBalance !== null && !balance.eq(previousBalance)) {
      const difference = balance.sub(previousBalance);
      const formattedDifference = ethers.utils.formatUnits(difference, decimals);
      
      if (difference.gt(0)) {
        notifyUser(`Received ${parseFloat(formattedDifference).toLocaleString()} ${symbol}!`, "success");
      } else {
        notifyUser(`Sent ${parseFloat(formattedDifference.replace("-", "")).toLocaleString()} ${symbol}`, "info");
      }
    }
    
    // Update previous balance
    previousBalance = balance;
    
    // Update status message
    if (balance.gt(0)) {
      updateTrackerStatus(`Last checked: ${new Date().toLocaleTimeString()}`);
    } else {
      updateTrackerStatus(`Waiting for tokens to be minted...`);
    }
    
    // Update transaction status section
    const transactionStatus = document.getElementById("transactionStatus");
    if (transactionStatus) {
      // Always show the status, but update it when balance is available
      if (balance.gt(0)) {
        transactionStatus.querySelector('.text-xs.text-green-400').style.display = "flex"; // Show success message
      }
    }
    
    return formattedBalance;
  } catch (error) {
    console.error("Error checking balance:", error);
    updateTrackerStatus(`Error: ${error.message}`);
    return "0";
  }
}

// Update tracker status in the UI
function updateTrackerStatus(message) {
  console.log("Tracker status:", message);
  const statusElement = document.getElementById("trackerStatus");
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Display notification to the user
function notifyUser(message, type = "info") {
  console.log(`Notification (${type}):`, message);
  
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Add to notifications container
  const container = document.getElementById("notificationsContainer");
  if (container) {
    container.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 5000);
  }
}

// Handle Deploy Staking Engine button click
async function deployStakingEngine() {
  try {
    if (!window.ethereum) {
      notifyUser("MetaMask not detected. Please install MetaMask to deploy staking.", "error");
      return;
    }
    
    notifyUser("Preparing to deploy staking engine...", "info");
    
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Check if connected to Polygon
    const network = await provider.getNetwork();
    if (network.chainId !== 137) {
      notifyUser("Please connect to Polygon Mainnet to deploy staking.", "error");
      return;
    }
    
    // Show deployment in progress UI
    const deployBtn = document.getElementById("deployStaking");
    const originalText = deployBtn.textContent;
    deployBtn.innerHTML = '<span class="spinner"></span> Deploying...';
    deployBtn.disabled = true;
    
    // Simulate deployment with timeout (in real app, this would call a deployment script)
    setTimeout(() => {
      notifyUser("Staking engine deployment simulation complete.", "success");
      
      // Update button
      deployBtn.innerHTML = '✓ Deployment Ready';
      deployBtn.classList.remove('from-pink-500', 'to-rose-600');
      deployBtn.classList.add('from-green-500', 'to-emerald-600');
      
      // Show deployment info
      const transactionStatus = document.getElementById("transactionStatus");
      const deploymentInfo = document.createElement('p');
      deploymentInfo.className = 'text-xs mt-1 text-green-400';
      deploymentInfo.textContent = '✓ Staking engine deployment ready';
      transactionStatus.appendChild(deploymentInfo);
    }, 3000);
    
  } catch (error) {
    console.error("Error deploying staking engine:", error);
    notifyUser(`Error: ${error.message}`, "error");
  }
}

// Start tracker when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener to start tracker button
  const startTrackerButton = document.getElementById("startTracker");
  if (startTrackerButton) {
    startTrackerButton.addEventListener("click", () => {
      initBalanceTracker();
    });
  }
  
  // Add event listener to deploy staking engine button
  const deployStakingButton = document.getElementById("deployStaking");
  if (deployStakingButton) {
    deployStakingButton.addEventListener("click", deployStakingEngine);
  }
  
  // Start automatically if page parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("autostart") === "true") {
    initBalanceTracker();
  }
});