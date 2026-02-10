// Account Type Management System
class AccountManager {
    constructor() {
        this.accountData = null;
        this.currentUserType = 'free_user';
        this.loadAccountData();
    }

    async loadAccountData() {
        try {
            const response = await fetch('data/account_type_data.json');
            this.accountData = await response.json();
        } catch (error) {
            console.error('Failed to load account data:', error);
            // Fallback data
            this.accountData = {
                account_types: {
                    free_user: { max_characters: 1, name: "Free User" },
                    premium_user: { max_characters: 6, name: "Premium User" }
                },
                user_accounts: {},
                default_account_type: "free_user"
            };
        }
    }

    // Helper method for case-insensitive username matching
    normalizeUsername(username) {
        return username.toLowerCase().trim();
    }

    getUserAccountType(username) {
        if (!this.accountData) return 'free_user';
        
        const normalized = this.normalizeUsername(username);
        const userAccounts = this.accountData.user_accounts;
        
        // Check with normalized keys (case-insensitive)
        for (const [key, value] of Object.entries(userAccounts)) {
            if (this.normalizeUsername(key) === normalized) {
                return value;
            }
        }
        
        return this.accountData.default_account_type;
    }

    getAccountTypeData(accountType) {
        if (!this.accountData) return { max_characters: 1, name: "Free User" };
        
        return this.accountData.account_types[accountType] || this.accountData.account_types.free_user;
    }

    getMaxCharacters(username) {
        const accountType = this.getUserAccountType(username);
        const typeData = this.getAccountTypeData(accountType);
        return typeData.max_characters;
    }

    getAccountTypeName(username) {
        const accountType = this.getUserAccountType(username);
        const typeData = this.getAccountTypeData(accountType);
        return typeData.name;
    }

    isPremiumUser(username) {
        const accountType = this.getUserAccountType(username);
        return accountType === 'premium_user';
    }

    // Method to upgrade user (for future use)
    upgradeUserToPremium(username) {
        if (!this.accountData) return false;
        
        // Store with lowercase for consistency
        const normalized = this.normalizeUsername(username);
        this.accountData.user_accounts[normalized] = 'premium_user';
        
        // Save to localStorage (since we can't write to JSON file)
        localStorage.setItem('userAccountTypes', JSON.stringify(this.accountData.user_accounts));
        
        return true;
    }

    // Load user account types from localStorage
    loadUserAccountTypes() {
        const saved = localStorage.getItem('userAccountTypes');
        if (saved && this.accountData) {
            const userTypes = JSON.parse(saved);
            // Merge with existing, localStorage takes priority
            this.accountData.user_accounts = { 
                ...this.accountData.user_accounts, 
                ...userTypes 
            };
        }
    }

    // Check if account is in premium list (from JSON or localStorage)
    checkPremiumStatus(username) {
        const accountType = this.getUserAccountType(username);
        console.log(`User: ${username} | Account Type: ${accountType}`);
        return accountType === 'premium_user';
    }
}

// Initialize Account Manager
const accountManager = new AccountManager();
window.accountManager = accountManager;
