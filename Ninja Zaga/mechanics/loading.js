class LoadingManager {
    constructor() {
        this.loadingProgress = 0;
        this.loadingBar = document.getElementById('loadingProgress');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        this.init();
    }
    
    init() {
        this.startLoading();
    }
    
    startLoading() {
        const loadingInterval = setInterval(() => {
            this.loadingProgress += Math.random() * 15 + 5;
            
            if (this.loadingProgress >= 100) {
                this.loadingProgress = 100;
                clearInterval(loadingInterval);
                setTimeout(() => this.finishLoading(), 800);
            }
            
            this.updateProgressBar();
        }, 200);
    }
    
    updateProgressBar() {
        if (this.loadingBar) {
            this.loadingBar.style.width = this.loadingProgress + '%';
        }
    }
    
    finishLoading() {
        this.loadingScreen.classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
    }
}

// Initialize loading when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoadingManager();
});
