class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('gameUsers') || '[]');
        this.currentUser = null;
        
        this.initializeEventListeners();
        this.checkSavedLogin();
        this.updateQuickLoginButton();
    }
    
    initializeEventListeners() {
        // Modal controls
        document.getElementById('loginBtn').addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'block';
        });
        
        document.getElementById('registerBtn').addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'block';
        });
        
        document.getElementById('quickLoginBtn').addEventListener('click', () => {
            this.quickLogin();
        });
        
        document.getElementById('clearSavedBtn').addEventListener('click', () => {
            this.clearSavedLogin();
        });
        
        // Close modal events
        document.getElementById('closeLoginModal').addEventListener('click', () => {
            document.getElementById('loginModal').style.display = 'none';
        });
        
        document.getElementById('closeRegisterModal').addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'none';
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
        
        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
    }
    
    updateQuickLoginButton() {
        const quickBtn = document.getElementById('quickLoginBtn');
        const hasUsers = this.users.length > 0;
        
        if (hasUsers) {
            quickBtn.disabled = false;
            quickBtn.style.opacity = '1';
            quickBtn.style.cursor = 'pointer';
        } else {
            quickBtn.disabled = true;
            quickBtn.style.opacity = '0.6';
            quickBtn.style.cursor = 'not-allowed';
        }
    }
    
    handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('rememberMe').checked;
        
        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            
            // Save current user session
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                email: user.email,
                loginTime: new Date().toISOString()
            }));
            
            // Handle remember me
            if (remember) {
                localStorage.setItem('rememberedUser', JSON.stringify({
                    username: user.username,
                    password: user.password,
                    loginTime: Date.now()
                }));
                
                document.getElementById('clearSavedBtn').style.display = 'block';
            }
            
            this.loginSuccess();
        } else {
            this.showMessage('Invalid username or password', 'error');
        }
    }
    
    handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (username.length < 3 || username.length > 20) {
            this.showMessage('Username must be 3-20 characters long', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }
        
        if (this.users.find(u => u.username === username)) {
            this.showMessage('Username already exists', 'error');
            return;
        }
        
        if (this.users.find(u => u.email === email)) {
            this.showMessage('Email already registered', 'error');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            level: 1,
            experience: 0
        };
        
        this.users.push(newUser);
        localStorage.setItem('gameUsers', JSON.stringify(this.users));
        
        this.showMessage('Account created successfully! You can now use Quick Login.', 'success');
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('registerForm').reset();
        
        // Update quick login button availability
        this.updateQuickLoginButton();
    }
    
    quickLogin() {
        if (this.users.length === 0) {
            this.showMessage('Please create an account first before using Quick Login', 'error');
            return;
        }
        
        // Check for remembered user first
        const remembered = localStorage.getItem('rememberedUser');
        let userToLogin;
        
        if (remembered) {
            const rememberedData = JSON.parse(remembered);
            const daysSinceLogin = (Date.now() - rememberedData.loginTime) / (1000 * 60 * 60 * 24);
            
            if (daysSinceLogin < 7) {
                // Use remembered user if within 7 days
                userToLogin = this.users.find(u => u.username === rememberedData.username);
            }
        }
        
        // If no remembered user or expired, use most recently created user
        if (!userToLogin) {
            userToLogin = this.users.reduce((latest, user) => {
                return new Date(user.createdAt) > new Date(latest.createdAt) ? user : latest;
            });
        }
        
        this.currentUser = { ...userToLogin, isQuickLogin: true };
        
        // Save current user session
        localStorage.setItem('currentUser', JSON.stringify({
            username: userToLogin.username,
            email: userToLogin.email,
            loginTime: new Date().toISOString()
        }));
        
        this.loginSuccess();
    }
    
    loginSuccess() {
        const loginType = this.currentUser.isQuickLogin ? 'Quick Login' : 'Login';
        this.showMessage(`${loginType} successful! Welcome, ${this.currentUser.username}!`, 'success');
        
        // Close any open modals
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'none';
        
        // Clear form data
        document.getElementById('loginForm').reset();
        
        setTimeout(() => {
            this.enterGame();
        }, 1500);
    }
    
    enterGame() {
        // Navigate to Character Select Screen
        document.getElementById('loginScreen').classList.remove('active');
        
        // Wait for character manager to be available
        if (window.characterManager) {
            window.characterManager.showCharacterSelect();
        } else {
            // If character manager not ready, wait a bit
            setTimeout(() => {
                if (window.characterManager) {
                    window.characterManager.showCharacterSelect();
                } else {
                    console.error('Character manager not available');
                    this.showMessage('Error loading character system', 'error');
                }
            }, 100);
        }
        
        this.showMessage('Loading character selection...', 'info');
    }
    
    checkSavedLogin() {
        const saved = localStorage.getItem('rememberedUser');
        if (saved) {
            const userData = JSON.parse(saved);
            const daysSinceLogin = (Date.now() - userData.loginTime) / (1000 * 60 * 60 * 24);
            
            if (daysSinceLogin < 7) { // Remember for 7 days
                const user = this.users.find(u => u.username === userData.username);
                if (user) {
                    const clearBtn = document.getElementById('clearSavedBtn');
                    clearBtn.style.display = 'block';
                    clearBtn.textContent = 'Clear Saved Login';
                }
            } else {
                localStorage.removeItem('rememberedUser');
            }
        }
    }
    
    clearSavedLogin() {
        localStorage.removeItem('rememberedUser');
        document.getElementById('clearSavedBtn').style.display = 'none';
        this.showMessage('Saved login cleared', 'info');
        
        // Update quick login to use most recent user instead
        this.updateQuickLoginButton();
    }
    
    // Public method to handle logout from character screen
    logout() {
        // Clear current session
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        
        // Hide character screen and show login screen
        document.getElementById('characterSelectScreen').classList.remove('active');
        document.getElementById('characterCreateScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        
        this.showMessage('Logged out successfully', 'info');
    }
    
    // Get current user info
    getCurrentUser() {
        const saved = localStorage.getItem('currentUser');
        return saved ? JSON.parse(saved) : null;
    }
    
    showMessage(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? 'linear-gradient(45deg, #228B22, #32CD32)' : 
                        type === 'error' ? 'linear-gradient(45deg, #DC143C, #FF6347)' : 
                        'linear-gradient(45deg, #4682B4, #87CEEB)'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-family: 'Cinzel', serif;
            font-weight: 600;
        `;
        
        // Add animation styles to document if not exists
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: 10px;
                    padding: 0;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
