import React, { useState } from 'react';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [network, setNetwork] = useState('');
  const [account, setAccount] = useState('');
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setAccount(accounts[0]);
        setNetwork(parseInt(chainId, 16).toString());
        setConnected(true);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      alert("Please install MetaMask or another Ethereum wallet");
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sovran Wealth Fund</h1>
        <p>Advanced Token Staking & Vault System</p>
        
        {!connected ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <div className="connected-badge">Connected</div>
            <p>Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            <p>Network: {network === '137' ? 'Polygon' : 
                        network === '80001' ? 'Mumbai Testnet' : 
                        network === '31337' ? 'Hardhat Local' : 
                        `Chain ID: ${network}`}</p>
          </div>
        )}
      </header>

      <main className="app-main">
        {!connected ? (
          <div className="welcome-card">
            <h2>Welcome to Sovran Wealth Fund</h2>
            <p>
              Connect your wallet to access the dashboard and manage your SWF tokens.
              Deposit tokens to the vault, stake to earn rewards, and more.
            </p>
            <button onClick={connectWallet} className="connect-button">
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="card">
              <h2>SWF Basket Vault</h2>
              <div className="card-content">
                <p>Total Deposited: 0 SWF</p>
                <p>Your Deposit: 0 SWF</p>
                <p>Available Balance: 0 SWF</p>
                
                <div className="form-group">
                  <label>Deposit Amount:</label>
                  <input type="number" placeholder="Amount in SWF" min="0" step="0.01" />
                  <button className="action-button">Deposit to Vault</button>
                </div>
                
                <div className="form-group">
                  <label>Withdraw Amount:</label>
                  <input type="number" placeholder="Amount to withdraw" min="0" step="0.01" />
                  <button className="action-button">Withdraw from Vault</button>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2>SWF Staking</h2>
              <div className="card-content">
                <p>Current APR: 20%</p>
                <p>Total Staked: 0 SWF</p>
                <p>Your Staked: 0 SWF</p>
                <p>Pending Rewards: 0 SWF</p>
                
                <div className="form-group">
                  <label>Stake Amount:</label>
                  <input type="number" placeholder="Amount to stake" min="0" step="0.01" />
                  <button className="action-button">Stake Tokens</button>
                </div>
                
                <div className="form-group">
                  <label>Unstake Amount:</label>
                  <input type="number" placeholder="Amount to unstake" min="0" step="0.01" />
                  <button className="action-button">Unstake Tokens</button>
                </div>
                
                <button className="action-button">Claim Rewards</button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Sovran Wealth Fund. All rights reserved.</p>
        <p>Deployed on Polygon Network</p>
      </footer>
    </div>
  );
}

export default App;