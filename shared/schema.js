/**
 * Sovran Wealth Fund (SWF) Database Schema
 * 
 * This file defines the database schema for the SWF token project.
 * It contains tables for:
 * - Users: Basic user information
 * - Staking: Records of token staking activities
 * - Transactions: History of token transactions
 * - Vaults: Information about token vaults that influence APR
 */

const { Pool } = require('pg');

// Get database connection string from environment variable
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
});

// Create tables if they don't exist
async function initializeDatabase() {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        username VARCHAR(100),
        email VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Staking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS staking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        wallet_address VARCHAR(42) NOT NULL,
        amount NUMERIC(78, 0) NOT NULL,
        apr_rate NUMERIC(5, 2) NOT NULL,
        start_time TIMESTAMPTZ DEFAULT NOW(),
        end_time TIMESTAMPTZ,
        is_active BOOLEAN DEFAULT TRUE,
        rewards_claimed NUMERIC(78, 0) DEFAULT 0,
        last_claim_time TIMESTAMPTZ
      );
    `);

    // Transactions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        tx_hash VARCHAR(66) UNIQUE NOT NULL,
        from_address VARCHAR(42) NOT NULL,
        to_address VARCHAR(42) NOT NULL,
        amount NUMERIC(78, 0) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        gas_used NUMERIC,
        gas_price NUMERIC
      );
    `);

    // Vaults table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vaults (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        total_deposit NUMERIC(78, 0) DEFAULT 0,
        min_apr NUMERIC(5, 2) NOT NULL,
        max_apr NUMERIC(5, 2) NOT NULL,
        current_apr NUMERIC(5, 2) NOT NULL,
        threshold_low NUMERIC(78, 0) NOT NULL,
        threshold_medium NUMERIC(78, 0) NOT NULL,
        threshold_high NUMERIC(78, 0) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_updated TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Role allocations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_allocations (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(50) NOT NULL,
        allocation_percentage NUMERIC(5, 2) NOT NULL,
        wallet_address VARCHAR(42) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);

    console.log('Database tables created successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// User-related database functions
const userDb = {
  async createUser(address, username = null, email = null, role = 'user') {
    try {
      const result = await pool.query(
        'INSERT INTO users (address, username, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [address, username, email, role]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUserByAddress(address) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE address = $1', [address]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by address:', error);
      throw error;
    }
  },

  async getUserById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
};

// Staking-related database functions
const stakingDb = {
  async createStake(userId, walletAddress, amount, aprRate) {
    try {
      const result = await pool.query(
        'INSERT INTO staking (user_id, wallet_address, amount, apr_rate) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, walletAddress, amount, aprRate]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating stake:', error);
      throw error;
    }
  },

  async getActiveStakes(walletAddress) {
    try {
      const result = await pool.query(
        'SELECT * FROM staking WHERE wallet_address = $1 AND is_active = TRUE',
        [walletAddress]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting active stakes:', error);
      throw error;
    }
  },

  async updateStake(id, amount, isActive = true) {
    try {
      const result = await pool.query(
        'UPDATE staking SET amount = $2, is_active = $3, last_claim_time = NOW() WHERE id = $1 RETURNING *',
        [id, amount, isActive]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating stake:', error);
      throw error;
    }
  },

  async endStake(id) {
    try {
      const result = await pool.query(
        'UPDATE staking SET is_active = FALSE, end_time = NOW() WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error ending stake:', error);
      throw error;
    }
  },

  async claimRewards(id, rewardsAmount) {
    try {
      const result = await pool.query(
        'UPDATE staking SET rewards_claimed = rewards_claimed + $2, last_claim_time = NOW() WHERE id = $1 RETURNING *',
        [id, rewardsAmount]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }
};

// Transaction-related database functions
const transactionDb = {
  async recordTransaction(txHash, fromAddress, toAddress, amount, type, status, gasUsed = null, gasPrice = null) {
    try {
      const result = await pool.query(
        `INSERT INTO transactions 
        (tx_hash, from_address, to_address, amount, transaction_type, status, gas_used, gas_price) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [txHash, fromAddress, toAddress, amount, type, status, gasUsed, gasPrice]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  },

  async getTransactionByHash(txHash) {
    try {
      const result = await pool.query('SELECT * FROM transactions WHERE tx_hash = $1', [txHash]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting transaction by hash:', error);
      throw error;
    }
  },

  async getTransactionsByAddress(address, limit = 10) {
    try {
      const result = await pool.query(
        'SELECT * FROM transactions WHERE from_address = $1 OR to_address = $1 ORDER BY timestamp DESC LIMIT $2',
        [address, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting transactions by address:', error);
      throw error;
    }
  },

  async updateTransactionStatus(txHash, status, gasUsed = null, gasPrice = null) {
    try {
      const result = await pool.query(
        'UPDATE transactions SET status = $2, gas_used = $3, gas_price = $4 WHERE tx_hash = $1 RETURNING *',
        [txHash, status, gasUsed, gasPrice]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }
};

// Vault-related database functions
const vaultDb = {
  async createVault(name, minApr, maxApr, currentApr, thresholdLow, thresholdMedium, thresholdHigh) {
    try {
      const result = await pool.query(
        `INSERT INTO vaults 
        (name, min_apr, max_apr, current_apr, threshold_low, threshold_medium, threshold_high) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, minApr, maxApr, currentApr, thresholdLow, thresholdMedium, thresholdHigh]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating vault:', error);
      throw error;
    }
  },

  async updateVaultDeposit(id, depositAmount) {
    try {
      const result = await pool.query(
        'UPDATE vaults SET total_deposit = total_deposit + $2, last_updated = NOW() WHERE id = $1 RETURNING *',
        [id, depositAmount]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating vault deposit:', error);
      throw error;
    }
  },

  async updateVaultApr(id, newApr) {
    try {
      const result = await pool.query(
        'UPDATE vaults SET current_apr = $2, last_updated = NOW() WHERE id = $1 RETURNING *',
        [id, newApr]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating vault APR:', error);
      throw error;
    }
  },

  async getVault(id) {
    try {
      const result = await pool.query('SELECT * FROM vaults WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting vault:', error);
      throw error;
    }
  },

  async getAllVaults() {
    try {
      const result = await pool.query('SELECT * FROM vaults ORDER BY id');
      return result.rows;
    } catch (error) {
      console.error('Error getting all vaults:', error);
      throw error;
    }
  }
};

// Role allocation-related database functions
const roleDb = {
  async createRoleAllocation(roleName, percentage, walletAddress, description = null) {
    try {
      const result = await pool.query(
        'INSERT INTO role_allocations (role_name, allocation_percentage, wallet_address, description) VALUES ($1, $2, $3, $4) RETURNING *',
        [roleName, percentage, walletAddress, description]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating role allocation:', error);
      throw error;
    }
  },

  async getRoleAllocations() {
    try {
      const result = await pool.query('SELECT * FROM role_allocations WHERE is_active = TRUE');
      return result.rows;
    } catch (error) {
      console.error('Error getting role allocations:', error);
      throw error;
    }
  },

  async updateRoleAllocation(id, percentage, walletAddress) {
    try {
      const result = await pool.query(
        'UPDATE role_allocations SET allocation_percentage = $2, wallet_address = $3 WHERE id = $1 RETURNING *',
        [id, percentage, walletAddress]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating role allocation:', error);
      throw error;
    }
  }
};

module.exports = {
  pool,
  initializeDatabase,
  userDb,
  stakingDb,
  transactionDb,
  vaultDb,
  roleDb
};