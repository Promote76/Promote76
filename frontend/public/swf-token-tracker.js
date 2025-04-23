// SWF Token Balance Tracker
// This script periodically checks the token balance and updates the UI

// Configuration
const CHECK_INTERVAL = 30000; // Check every 30 seconds
const TOKEN_ADDRESS = '0x15AD65Fb62CD9147Aa4443dA89828A693228b5F7';
const RECIPIENT_ADDRESS = '0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6';

// Minimal ABI for token balance checking
const TOKEN_ABI = [
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
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
    
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
    const balance = await tokenContract.balanceOf(RECIPIENT_ADDRESS);
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
    
    // Show or hide transaction status section
    const transactionStatus = document.getElementById("transactionStatus");
    if (transactionStatus) {
      transactionStatus.style.display = balance.gt(0) ? "none" : "block";
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

// Start tracker when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // Add event listener to start tracker button
  const startTrackerButton = document.getElementById("startTracker");
  if (startTrackerButton) {
    startTrackerButton.addEventListener("click", () => {
      initBalanceTracker();
    });
  }
  
  // Start automatically if page parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("autostart") === "true") {
    initBalanceTracker();
  }
});