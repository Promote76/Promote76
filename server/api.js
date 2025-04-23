/**
 * Sovran Wealth Fund (SWF) - API Server
 * 
 * This file implements the API endpoints for the SWF token project.
 */

const express = require('express');
const cors = require('cors');
const { 
  userDb, 
  stakingDb, 
  transactionDb, 
  vaultDb, 
  roleDb 
} = require('../shared/schema');
const { initializeDbWithDefaults } = require('./db-init');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for demonstration
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// User endpoints
app.post('/api/users', async (req, res) => {
  try {
    const { address, username, email, role } = req.body;
    
    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }
    
    const user = await userDb.createUser(address, username, email, role);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users/:address', async (req, res) => {
  try {
    const user = await userDb.getUserByAddress(req.params.address);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Staking endpoints
app.post('/api/staking', async (req, res) => {
  try {
    const { userId, walletAddress, amount, aprRate } = req.body;
    
    if (!userId || !walletAddress || !amount || !aprRate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const stake = await stakingDb.createStake(userId, walletAddress, amount, aprRate);
    res.status(201).json(stake);
  } catch (error) {
    console.error('Error creating stake:', error);
    res.status(500).json({ error: 'Failed to create stake' });
  }
});

app.get('/api/staking/:walletAddress', async (req, res) => {
  try {
    const stakes = await stakingDb.getActiveStakes(req.params.walletAddress);
    res.json(stakes);
  } catch (error) {
    console.error('Error getting stakes:', error);
    res.status(500).json({ error: 'Failed to get stakes' });
  }
});

app.put('/api/staking/:id/end', async (req, res) => {
  try {
    const stake = await stakingDb.endStake(req.params.id);
    
    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }
    
    res.json(stake);
  } catch (error) {
    console.error('Error ending stake:', error);
    res.status(500).json({ error: 'Failed to end stake' });
  }
});

app.put('/api/staking/:id/claim', async (req, res) => {
  try {
    const { rewardsAmount } = req.body;
    
    if (!rewardsAmount) {
      return res.status(400).json({ error: 'Rewards amount is required' });
    }
    
    const stake = await stakingDb.claimRewards(req.params.id, rewardsAmount);
    
    if (!stake) {
      return res.status(404).json({ error: 'Stake not found' });
    }
    
    res.json(stake);
  } catch (error) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

// Transaction endpoints
app.post('/api/transactions', async (req, res) => {
  try {
    const { txHash, fromAddress, toAddress, amount, type, status, gasUsed, gasPrice } = req.body;
    
    if (!txHash || !fromAddress || !toAddress || !amount || !type || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const transaction = await transactionDb.recordTransaction(
      txHash, fromAddress, toAddress, amount, type, status, gasUsed, gasPrice
    );
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

app.get('/api/transactions/:txHash', async (req, res) => {
  try {
    const transaction = await transactionDb.getTransactionByHash(req.params.txHash);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

app.get('/api/transactions/address/:address', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const transactions = await transactionDb.getTransactionsByAddress(req.params.address, limit);
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions by address:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

app.put('/api/transactions/:txHash/status', async (req, res) => {
  try {
    const { status, gasUsed, gasPrice } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const transaction = await transactionDb.updateTransactionStatus(
      req.params.txHash, status, gasUsed, gasPrice
    );
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// Vault endpoints
app.get('/api/vaults', async (req, res) => {
  try {
    const vaults = await vaultDb.getAllVaults();
    res.json(vaults);
  } catch (error) {
    console.error('Error getting vaults:', error);
    res.status(500).json({ error: 'Failed to get vaults' });
  }
});

app.get('/api/vaults/:id', async (req, res) => {
  try {
    const vault = await vaultDb.getVault(req.params.id);
    
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }
    
    res.json(vault);
  } catch (error) {
    console.error('Error getting vault:', error);
    res.status(500).json({ error: 'Failed to get vault' });
  }
});

app.put('/api/vaults/:id/deposit', async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    const vault = await vaultDb.updateVaultDeposit(req.params.id, amount);
    
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }
    
    res.json(vault);
  } catch (error) {
    console.error('Error updating vault deposit:', error);
    res.status(500).json({ error: 'Failed to update vault deposit' });
  }
});

app.put('/api/vaults/:id/apr', async (req, res) => {
  try {
    const { apr } = req.body;
    
    if (!apr) {
      return res.status(400).json({ error: 'APR is required' });
    }
    
    const vault = await vaultDb.updateVaultApr(req.params.id, apr);
    
    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' });
    }
    
    res.json(vault);
  } catch (error) {
    console.error('Error updating vault APR:', error);
    res.status(500).json({ error: 'Failed to update vault APR' });
  }
});

// Role allocation endpoints
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await roleDb.getRoleAllocations();
    res.json(roles);
  } catch (error) {
    console.error('Error getting role allocations:', error);
    res.status(500).json({ error: 'Failed to get role allocations' });
  }
});

app.post('/api/roles', async (req, res) => {
  try {
    const { roleName, percentage, walletAddress, description } = req.body;
    
    if (!roleName || !percentage || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const role = await roleDb.createRoleAllocation(roleName, percentage, walletAddress, description);
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role allocation:', error);
    res.status(500).json({ error: 'Failed to create role allocation' });
  }
});

app.put('/api/roles/:id', async (req, res) => {
  try {
    const { percentage, walletAddress } = req.body;
    
    if (!percentage || !walletAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const role = await roleDb.updateRoleAllocation(req.params.id, percentage, walletAddress);
    
    if (!role) {
      return res.status(404).json({ error: 'Role allocation not found' });
    }
    
    res.json(role);
  } catch (error) {
    console.error('Error updating role allocation:', error);
    res.status(500).json({ error: 'Failed to update role allocation' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database with default values
    await initializeDbWithDefaults();
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`SWF API server running on http://0.0.0.0:${PORT}`);
    });

    // Add error handling for the server
    server.on('error', (error) => {
      console.error('Server error:', error);
    });

    // Return the server instance
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    throw error;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
} else {
  // Export for use in other modules
  module.exports = { app, startServer };
}