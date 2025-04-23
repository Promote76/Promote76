/**
 * Sovran Wealth Fund (SWF) - Database Initialization
 * 
 * This script initializes the database tables and creates default values
 * for the SWF token project.
 */

const { 
  initializeDatabase, 
  userDb, 
  vaultDb, 
  roleDb 
} = require('../shared/schema');

// Admin wallet addresses from the project
const ADMIN_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Deployer
const TREASURY_ADDRESS = '0x26a8401287ce33cc4AEb5a106cD6D282a9c2f51D'; // Treasury
const RECIPIENT_ADDRESS = '0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6'; // Main recipient

// Role allocation percentages (should sum to 100%)
const ROLE_ALLOCATIONS = [
  { name: 'Treasury', percentage: 20.00, wallet: TREASURY_ADDRESS, description: 'Main treasury for asset backing' },
  { name: 'Staking', percentage: 30.00, wallet: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db', description: 'Staking rewards pool' },
  { name: 'Development', percentage: 15.00, wallet: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB', description: 'Development and technical improvements' },
  { name: 'Marketing', percentage: 10.00, wallet: '0x617F2E2fD72FD9D5503197092aC168c91465E7f2', description: 'Marketing and partnership efforts' },
  { name: 'Community', percentage: 10.00, wallet: '0x17F6AD8Ef982297579C203069C1DbfFE4348c372', description: 'Community initiatives and rewards' },
  { name: 'Team', percentage: 10.00, wallet: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', description: 'Team compensation and incentives' },
  { name: 'Reserve', percentage: 5.00, wallet: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', description: 'Emergency reserves and future projects' }
];

// Create default vault with dynamic APR settings
async function createDefaultVault() {
  try {
    // Check if vault already exists
    const vaults = await vaultDb.getAllVaults();
    if (vaults && vaults.length > 0) {
      console.log('Vault already exists, skipping creation...');
      return vaults[0];
    }
    
    return await vaultDb.createVault(
      'SWF Main Vault',
      10.00, // minApr (10%)
      30.00, // maxApr (30%)
      15.00, // currentApr (15%)
      '1000000000000000000000000', // thresholdLow (1M tokens in wei)
      '5000000000000000000000000', // thresholdMedium (5M tokens in wei)
      '10000000000000000000000000' // thresholdHigh (10M tokens in wei)
    );
  } catch (error) {
    console.error('Error creating default vault:', error);
    throw error;
  }
}

// Create default role allocations
async function createDefaultRoleAllocations() {
  try {
    // Check if role allocations already exist
    const existingAllocations = await roleDb.getRoleAllocations();
    if (existingAllocations && existingAllocations.length > 0) {
      console.log('Role allocations already exist, skipping creation...');
      return existingAllocations;
    }
    
    const allocations = [];
    
    for (const role of ROLE_ALLOCATIONS) {
      const allocation = await roleDb.createRoleAllocation(
        role.name,
        role.percentage,
        role.wallet,
        role.description
      );
      allocations.push(allocation);
    }
    
    return allocations;
  } catch (error) {
    console.error('Error creating default role allocations:', error);
    throw error;
  }
}

// Create admin user
async function createAdminUser() {
  try {
    // First check if user already exists
    const existingUser = await userDb.getUserByAddress(ADMIN_ADDRESS);
    if (existingUser) {
      console.log('Admin user already exists, skipping...');
      return existingUser;
    }
    
    // Create if doesn't exist
    return await userDb.createUser(
      ADMIN_ADDRESS,
      'admin',
      null,
      'admin'
    );
  } catch (error) {
    console.error('Error creating admin user:', error);
    // If error is duplicate key, it's ok - user already exists
    if (error.code === '23505') {
      console.log('Admin user already exists, skipping...');
      return await userDb.getUserByAddress(ADMIN_ADDRESS);
    }
    throw error;
  }
}

// Main initialization function
async function initializeDbWithDefaults() {
  try {
    console.log('Initializing database schema...');
    const schemaInitialized = await initializeDatabase();
    
    if (!schemaInitialized) {
      throw new Error('Failed to initialize database schema');
    }
    
    console.log('Creating admin user...');
    const admin = await createAdminUser();
    console.log('Admin user created:', admin.id);
    
    console.log('Creating default vault...');
    const vault = await createDefaultVault();
    console.log('Default vault created:', vault.id);
    
    console.log('Creating default role allocations...');
    const allocations = await createDefaultRoleAllocations();
    console.log(`Created ${allocations.length} role allocations`);
    
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Execute initialization if this script is run directly
if (require.main === module) {
  initializeDbWithDefaults()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = { 
    initializeDbWithDefaults,
    createDefaultVault,
    createDefaultRoleAllocations,
    createAdminUser
  };
}