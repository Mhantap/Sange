class GameMain {
    constructor() {
        this.gameState = 'loading'; // loading, login, game
        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            fullscreen: false
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.setupKeyboardShortcuts();
        this.handleResize();
        
        window.addEventListener('resize', () => this.handleResize());
    }
    
    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    this.handleEscapeKey();
                    break;
                case 'Enter':
                    if (e.target.tagName === 'INPUT') return;
                    this.handleEnterKey();
                    break;
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        });
    }
    
    handleEscapeKey() {
        // Close any open modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
    
    handleEnterKey() {
        if (this.gameState === 'login') {
            // Quick login on enter
            document.getElementById('quickLoginBtn').click();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.settings.fullscreen = true;
        } else {
            document.exitFullscreen();
            this.settings.fullscreen = false;
        }
        this.saveSettings();
    }
    
    handleResize() {
        // Handle responsive adjustments
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setGameState(state) {
        this.gameState = state;
        console.log('Game state changed to:', state);
    }
    
    // Utility methods
    generateRandomId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }
    
    debugLog(message, data = null) {
        if (console && typeof console.log === 'function') {
            console.log(`[Game Debug] ${message}`, data || '');
        }
    }
}

// Initialize main game controller
document.addEventListener('DOMContentLoaded', () => {
    window.gameMain = new GameMain();
});

// Handle page visibility changes (for pausing/resuming)
document.addEventListener('visibilitychange', () => {
    if (window.gameMain) {
        if (document.hidden) {
            window.gameMain.debugLog('Game paused (tab hidden)');
        } else {
            window.gameMain.debugLog('Game resumed (tab visible)');
        }
    }
});
