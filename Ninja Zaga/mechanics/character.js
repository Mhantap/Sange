// Character Management System
class CharacterManager {
    constructor() {
        this.characters = [];
        this.selectedCharacter = null;
        this.maxCharacters = 6; // Default max, will be overridden by account type
        this.currentUser = null;
        this.currentAccountType = 'free_user';
        
        this.init();
    }

    init() {
        // Wait for account manager to load
        setTimeout(() => {
            this.loadCharacters();
            this.bindEvents();
            this.renderCharacterGrid();
        }, 100);
    }

    bindEvents() {
        // Create Character Button
        document.getElementById('createCharBtn')?.addEventListener('click', () => {
            this.showCreateScreen();
        });

        // Logout Button
        document.getElementById('logoutCharBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Play Button
        document.getElementById('playBtn')?.addEventListener('click', () => {
            this.startGame();
        });

        // Delete Button
        document.getElementById('deleteCharBtn')?.addEventListener('click', () => {
            this.deleteCharacter();
        });

        // Character Create Form
        document.getElementById('characterCreateForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCharacter();
        });

        // Cancel Create Button
        document.getElementById('cancelCreateBtn')?.addEventListener('click', () => {
            this.cancelCreate();
        });

        // Close Create Button (X)
        document.getElementById('closeCreateBtn')?.addEventListener('click', () => {
            this.cancelCreate();
        });

        // Element Selection
        document.querySelectorAll('.element-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectElement(card);
            });
        });
    }

    loadCharacters() {
        const user = JSON.parse(localStorage.getItem('currentUser')) || {};
        this.currentUser = user.username;
        
        if (!this.currentUser) return;

        // Get user account type and max characters
        if (window.accountManager) {
            window.accountManager.loadUserAccountTypes();
            this.currentAccountType = window.accountManager.getUserAccountType(this.currentUser);
            this.maxCharacters = window.accountManager.getMaxCharacters(this.currentUser);
            
            // Update user badge in header
            this.updateUserBadge();
        }

        const saved = localStorage.getItem(`characters_${this.currentUser}`);
        this.characters = saved ? JSON.parse(saved) : [];
    }

    updateUserBadge() {
        const userBadge = document.querySelector('.user-badge');
        if (userBadge && window.accountManager) {
            const accountTypeName = window.accountManager.getAccountTypeName(this.currentUser);
            userBadge.textContent = accountTypeName;
            
            // Add premium styling if premium user
            if (this.currentAccountType === 'premium_user') {
                userBadge.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
                userBadge.style.color = '#8B4513';
                userBadge.style.borderColor = '#FF8C00';
            }
        }
    }

    saveCharacters() {
        if (!this.currentUser) return;
        localStorage.setItem(`characters_${this.currentUser}`, JSON.stringify(this.characters));
    }

    renderCharacterGrid() {
        const grid = document.getElementById('characterGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Render slots based on account type
        const maxSlots = this.maxCharacters;
        
        for (let i = 0; i < maxSlots; i++) {
            const character = this.characters[i];
            const slot = this.createCharacterSlot(character, i);
            grid.appendChild(slot);
        }
        
        // Add locked slots for free users
        if (this.currentAccountType === 'free_user' && maxSlots < 6) {
            for (let i = maxSlots; i < 6; i++) {
                const lockedSlot = this.createLockedSlot(i);
                grid.appendChild(lockedSlot);
            }
        }
    }

    createCharacterSlot(character, index) {
        const slot = document.createElement('div');
        slot.className = `character-slot ${character ? 'filled' : 'empty'}`;
        slot.dataset.index = index;

        if (character) {
            slot.innerHTML = `
                <div class="character-info">
                    <div class="character-name">${character.name}</div>
                    <div class="character-details">
                        <span class="character-level">Level ${character.level}</span>
                        <span class="character-gender">${character.gender}</span>
                    </div>
                    <div class="character-element element-${character.element}">
                        ${this.getElementIcon(character.element)} ${character.element}
                    </div>
                </div>
            `;

            slot.addEventListener('click', () => {
                this.selectCharacter(index);
            });
        } else {
            slot.innerHTML = `
                <div class="empty-icon">➕</div>
                <div class="empty-text">Empty Slot</div>
            `;

            slot.addEventListener('click', () => {
                this.showCreateScreen();
            });
        }

        return slot;
    }

    createLockedSlot(index) {
        const slot = document.createElement('div');
        slot.className = 'character-slot locked';
        slot.dataset.index = index;
        slot.innerHTML = `
            <div class="locked-icon">🔒</div>
            <div class="locked-text">Premium Only</div>
        `;
        
        slot.addEventListener('click', () => {
            this.showUpgradeModal();
        });

        return slot;
    }

    getElementIcon(element) {
        const icons = {
            fire: '🔥',
            water: '💧',
            earth: '🌍',
            wind: '💨',
            lightning: '⚡'
        };
        return icons[element] || '❓';
    }

    selectCharacter(index) {
        const character = this.characters[index];
        if (!character) return;

        // Remove previous selection
        document.querySelectorAll('.character-slot').forEach(slot => {
            slot.classList.remove('selected');
        });

        // Add selection to clicked slot
        const slot = document.querySelector(`[data-index="${index}"]`);
        slot?.classList.add('selected');

        this.selectedCharacter = index;

        // Show Play and Delete buttons
        document.getElementById('playBtn').style.display = 'inline-block';
        document.getElementById('deleteCharBtn').style.display = 'inline-block';
    }

    showCreateScreen() {
        // Check account type limits
        if (this.characters.length >= this.maxCharacters) {
            const accountTypeName = window.accountManager ? 
                window.accountManager.getAccountTypeName(this.currentUser) : 'Free User';
            
            if (this.currentAccountType === 'free_user') {
                this.showUpgradeModal();
                return;
            } else {
                alert(`Maximum characters reached! (${this.maxCharacters} characters for ${accountTypeName})`);
                return;
            }
        }

        document.getElementById('characterSelectScreen').classList.remove('active');
        document.getElementById('characterCreateScreen').classList.add('active');

        // Reset form
        document.getElementById('characterCreateForm').reset();
        document.getElementById('selectedElement').value = '';
        document.querySelectorAll('.element-card').forEach(card => {
            card.classList.remove('selected');
        });
    }

    showUpgradeModal() {
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal';
    modal.innerHTML = `
        <div class="upgrade-content">
            <div class="upgrade-header">
                <h3>🚀 Upgrade to Premium</h3>
                <button class="close-upgrade" onclick="this.closest('.upgrade-modal').remove()">&times;</button>
            </div>
            <div class="upgrade-body">
                <div class="upgrade-icon">👑</div>
                <p>You've reached the character limit for <strong>Free Users</strong> (1 character).</p>
                <p>Upgrade to <strong>Premium User</strong> to unlock all features!</p>
                
                <div class="upgrade-benefits">
                    <h4>✨ Premium Benefits:</h4>
                    <ul>
                        <li>✅ Create up to <strong>6 characters</strong></li>
                        <li>✅ Daily login rewards</li>
                        <li>✅ Exclusive premium items</li>
                        <li>✅ Advanced game features</li>
                        <li>✅ Priority customer support</li>
                        <li>✅ No advertisements</li>
                    </ul>
                </div>

                <div class="upgrade-pricing">
                    <div class="price-tag">
                        <span class="currency">IDR</span>
                        <span class="price">30,000</span>
                        <span class="period">One-time payment</span>
                    </div>
                    <div class="price-note">💡 Lifetime premium access!</div>
                </div>
                
                <div class="payment-methods">
                    <h4>💳 Payment Methods:</h4>
                    <div class="payment-options">
                        <div class="payment-option">🏦 Bank Transfer</div>
                        <div class="payment-option">💳 Credit Card</div>
                        <div class="payment-option">📱 E-Wallet</div>
                    </div>
                </div>
                
                <div class="upgrade-buttons">
                    <button class="btn-upgrade-cancel" onclick="this.closest('.upgrade-modal').remove()">
                        Maybe Later
                    </button>
                    <button class="btn-upgrade-confirm" onclick="window.characterManager.showPaymentOptions()">
                        💰 Buy Premium - IDR 30,000
                    </button>
                </div>

                <div class="upgrade-footer">
                    <small>🔒 Secure payment • 💯 Money-back guarantee</small>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 15px;
    `;
    
    document.body.appendChild(modal);
    this.addUpgradeModalStyles();
}


    addUpgradeModalStyles() {
    if (document.querySelector('#upgrade-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'upgrade-modal-styles';
    style.textContent = `
        .upgrade-content {
            background: linear-gradient(145deg, rgba(222, 184, 135, 0.98), rgba(210, 180, 140, 0.98));
            border: 4px solid #8B4513;
            border-radius: 15px;
            padding: 25px;
            max-width: 500px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
            position: relative;
        }
        
        .upgrade-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #8B4513;
        }
        
        .upgrade-header h3 {
            font-family: 'Orbitron', monospace;
            color: #8B0000;
            font-size: 1.6em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .close-upgrade {
            width: 35px;
            height: 35px;
            background: linear-gradient(45deg, #DC143C, #FF6347);
            border: 3px solid #8B0000;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .close-upgrade:hover {
            transform: rotate(90deg) scale(1.1);
        }
        
        .upgrade-icon {
            text-align: center;
            font-size: 4.5em;
            margin-bottom: 15px;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        
        .upgrade-body p {
            font-family: 'Cinzel', serif;
            color: #654321;
            text-align: center;
            margin-bottom: 15px;
            font-size: 1.05em;
            line-height: 1.4;
        }
        
        .upgrade-benefits {
            background: linear-gradient(145deg, rgba(139, 69, 19, 0.2), rgba(160, 82, 45, 0.1));
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 2px solid rgba(139, 69, 19, 0.3);
        }
        
        .upgrade-benefits h4 {
            font-family: 'Orbitron', monospace;
            color: #8B4513;
            margin-bottom: 15px;
            font-size: 1.2em;
            text-align: center;
        }
        
        .upgrade-benefits ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .upgrade-benefits li {
            font-family: 'Cinzel', serif;
            color: #654321;
            margin-bottom: 8px;
            padding-left: 10px;
            font-weight: 600;
            font-size: 0.95em;
        }
        
        .upgrade-pricing {
            text-align: center;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border: 3px solid #FF8C00;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        }
        
        .price-tag {
            display: flex;
            align-items: baseline;
            justify-content: center;
            gap: 5px;
            margin-bottom: 8px;
        }
        
        .currency {
            font-family: 'Orbitron', monospace;
            font-size: 1.2em;
            font-weight: 700;
            color: #8B4513;
        }
        
        .price {
            font-family: 'Orbitron', monospace;
            font-size: 2.2em;
            font-weight: 900;
            color: #8B0000;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .period {
            font-family: 'Cinzel', serif;
            font-size: 0.9em;
            color: #8B4513;
            font-weight: 600;
        }
        
        .price-note {
            font-family: 'Cinzel', serif;
            color: #8B4513;
            font-weight: 700;
            font-size: 1em;
        }
        
        .payment-methods {
            margin: 20px 0;
        }
        
        .payment-methods h4 {
            font-family: 'Orbitron', monospace;
            color: #8B4513;
            margin-bottom: 12px;
            text-align: center;
        }
        
        .payment-options {
            display: flex;
            justify-content: space-around;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .payment-option {
            background: rgba(139, 69, 19, 0.2);
            padding: 8px 12px;
            border-radius: 8px;
            font-family: 'Cinzel', serif;
            color: #654321;
            font-size: 0.85em;
            font-weight: 600;
            border: 2px solid rgba(139, 69, 19, 0.3);
        }
        
        .upgrade-buttons {
            display: flex;
            gap: 12px;
            margin-top: 25px;
        }
        
        .btn-upgrade-cancel,
        .btn-upgrade-confirm {
            flex: 1;
            padding: 15px 20px;
            border: 3px solid;
            border-radius: 10px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.95em;
        }
        
        .btn-upgrade-cancel {
            background: linear-gradient(45deg, #808080, #A9A9A9);
            border-color: #696969;
            color: white;
        }
        
        .btn-upgrade-confirm {
            background: linear-gradient(45deg, #228B22, #32CD32);
            border-color: #006400;
            color: white;
            font-weight: 800;
        }
        
        .btn-upgrade-cancel:hover {
            background: linear-gradient(45deg, #696969, #808080);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .btn-upgrade-confirm:hover {
            background: linear-gradient(45deg, #32CD32, #228B22);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(34, 139, 34, 0.4);
        }
        
        .upgrade-footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid rgba(139, 69, 19, 0.3);
        }
        
        .upgrade-footer small {
            font-family: 'Cinzel', serif;
            color: #8B4513;
            font-weight: 600;
        }
        
        /* Mobile Responsive */
        @media (max-width: 480px) {
            .upgrade-content {
                padding: 20px;
                max-width: 95%;
            }
            
            .upgrade-header h3 {
                font-size: 1.4em;
            }
            
            .price {
                font-size: 1.8em;
            }
            
            .payment-options {
                flex-direction: column;
                align-items: center;
            }
            
            .payment-option {
                width: 100%;
                text-align: center;
            }
            
            .upgrade-buttons {
                flex-direction: column;
                gap: 10px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

showPaymentOptions() {
    // Close upgrade modal
    document.querySelector('.upgrade-modal')?.remove();
    
    // Show payment modal
    const paymentModal = document.createElement('div');
    paymentModal.className = 'payment-modal';
    paymentModal.innerHTML = `
        <div class="payment-content">
            <div class="payment-header">
                <h3>💳 Premium Payment</h3>
                <button class="close-payment" onclick="this.closest('.payment-modal').remove()">&times;</button>
            </div>
            <div class="payment-body">
                <div class="payment-summary">
                    <h4>Order Summary</h4>
                    <div class="order-item">
                        <span>Ninja Zaga - Premium Upgrade</span>
                        <span>IDR 30,000</span>
                    </div>
                    <div class="order-total">
                        <span>Total</span>
                        <span>IDR 30,000</span>
                    </div>
                </div>

                <div class="payment-instructions">
                    <h4>📞 How to Purchase:</h4>
                    <ol>
                        <li>Contact our admin via WhatsApp</li>
                        <li>Send your username: <strong>"${this.currentUser}"</strong></li>
                        <li>Make payment via your preferred method</li>
                        <li>Send payment proof to admin</li>
                        <li>Your account will be upgraded within 24 hours</li>
                    </ol>
                </div>

                <div class="contact-admin">
                    <h4>💬 Contact Admin:</h4>
                    <button class="btn-whatsapp" onclick="window.characterManager.contactAdmin()">
                        📱 WhatsApp Admin
                    </button>
                    <p class="admin-note">
                        💡 Include your username: <strong>"${this.currentUser}"</strong> in your message
                    </p>
                </div>

                <div class="payment-buttons">
                    <button class="btn-payment-cancel" onclick="this.closest('.payment-modal').remove()">
                        Back
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add styles
    paymentModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1100;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 15px;
    `;
    
    document.body.appendChild(paymentModal);
    this.addPaymentModalStyles();
}

contactAdmin() {
    const username = this.currentUser;
    const message = `Hi! I want to upgrade to Premium User.%0A%0AUsername: ${username}%0APackage: Premium Upgrade%0APrice: IDR 30,000%0A%0APlease guide me through the payment process. Thank you!`;
    const whatsappUrl = `https://wa.me/6282220573388?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

addPaymentModalStyles() {
    if (document.querySelector('#payment-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'payment-modal-styles';
    style.textContent = `
        .payment-content {
            background: linear-gradient(145deg, rgba(222, 184, 135, 0.98), rgba(210, 180, 140, 0.98));
            border: 4px solid #8B4513;
            border-radius: 15px;
            padding: 25px;
            max-width: 480px;
            width: 100%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
            position: relative;
        }
        
        .payment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #8B4513;
        }
        
        .payment-header h3 {
            font-family: 'Orbitron', monospace;
            color: #8B0000;
            font-size: 1.5em;
            margin: 0;
        }
        
        .close-payment {
            width: 35px;
            height: 35px;
            background: linear-gradient(45deg, #DC143C, #FF6347);
            border: 3px solid #8B0000;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .payment-summary {
            background: rgba(139, 69, 19, 0.2);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 2px solid rgba(139, 69, 19, 0.3);
        }
        
        .payment-summary h4 {
            font-family: 'Orbitron', monospace;
            color: #8B4513;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .order-item,
        .order-total {
            display: flex;
            justify-content: space-between;
            font-family: 'Cinzel', serif;
            color: #654321;
            margin-bottom: 10px;
        }
        
        .order-total {
            border-top: 2px solid #8B4513;
            padding-top: 10px;
            font-weight: 700;
            font-size: 1.1em;
        }
        
        .payment-instructions {
            margin-bottom: 20px;
        }
        
        .payment-instructions h4 {
            font-family: 'Orbitron', monospace;
            color: #8B4513;
            margin-bottom: 15px;
        }
        
        .payment-instructions ol {
            font-family: 'Cinzel', serif;
            color: #654321;
            padding-left: 20px;
        }
        
        .payment-instructions li {
            margin-bottom: 8px;
            line-height: 1.4;
        }
        
        .contact-admin {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .contact-admin h4 {
            font-family: 'Orbitron', monospace;
            color: #8B4513;
            margin-bottom: 15px;
        }
        
        .btn-whatsapp {
            background: linear-gradient(45deg, #25D366, #128C7E);
            border: 3px solid #075E54;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
            width: 100%;
            margin-bottom: 10px;
        }
        
        .btn-whatsapp:hover {
            background: linear-gradient(45deg, #128C7E, #25D366);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
        }
        
        .admin-note {
            font-family: 'Cinzel', serif;
            color: #654321;
            font-size: 0.9em;
            margin: 10px 0;
        }
        
        .payment-buttons {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }
        
        .btn-payment-cancel {
            background: linear-gradient(45deg, #808080, #A9A9A9);
            border: 3px solid #696969;
            color: white;
            padding: 12px 30px;
            border-radius: 10px;
            font-family: 'Cinzel', serif;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-payment-cancel:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        /* Mobile Responsive */
        @media (max-width: 480px) {
            .payment-content {
                padding: 20px;
                max-width: 95%;
            }
            
            .payment-header h3 {
                font-size: 1.3em;
            }
        }
    `;
    
    document.head.appendChild(style);
}


    

    selectElement(card) {
        // Remove previous selection
        document.querySelectorAll('.element-card').forEach(c => {
            c.classList.remove('selected');
        });

        // Add selection
        card.classList.add('selected');
        
        // Set hidden input
        const element = card.dataset.element;
        document.getElementById('selectedElement').value = element;
    }

    createCharacter() {
        const formData = new FormData(document.getElementById('characterCreateForm'));
        const name = formData.get('charName').trim();
        const element = formData.get('element');

        // Validation
        if (!name) {
            alert('Please enter a character name!');
            return;
        }

        if (name.length < 3 || name.length > 16) {
            alert('Character name must be 3-16 characters long!');
            return;
        }

        if (!element) {
            alert('Please select an element!');
            return;
        }

        // Check if name already exists
        const nameExists = this.characters.some(char => 
            char && char.name.toLowerCase() === name.toLowerCase()
        );

        if (nameExists) {
            alert('Character name already exists!');
            return;
        }

        // Create new character
        const newCharacter = {
            name: name,
            element: element,
            level: 1,
            gender: this.getRandomGender(),
            exp: 0,
            stats: {
                hp: 100,
                mp: 50,
                attack: 10,
                defense: 5,
                speed: 8
            },
            createdAt: new Date().toISOString()
        };

        // Add to characters array
        this.characters.push(newCharacter);
        this.saveCharacters();

        // Show success message
        alert(`Character "${name}" created successfully!`);

        // Return to character select
        this.cancelCreate();
        this.renderCharacterGrid();
    }

    getRandomGender() {
        return Math.random() > 0.5 ? 'Male' : 'Female';
    }

    cancelCreate() {
        document.getElementById('characterCreateScreen').classList.remove('active');
        document.getElementById('characterSelectScreen').classList.add('active');
    }

    deleteCharacter() {
        if (this.selectedCharacter === null) return;

        const character = this.characters[this.selectedCharacter];
        if (!character) return;

        const confirm = window.confirm(`Are you sure you want to delete "${character.name}"? This action cannot be undone!`);
        
        if (confirm) {
            // Remove character
            this.characters.splice(this.selectedCharacter, 1);
            this.saveCharacters();
            
            // Reset selection
            this.selectedCharacter = null;
            document.getElementById('playBtn').style.display = 'none';
            document.getElementById('deleteCharBtn').style.display = 'none';
            
            // Re-render grid
            this.renderCharacterGrid();
            
            alert('Character deleted successfully!');
        }
    }

    startGame() {
        if (this.selectedCharacter === null) return;

        const character = this.characters[this.selectedCharacter];
        if (!character) return;

        // Save selected character for game
        localStorage.setItem('selectedCharacter', JSON.stringify({
            index: this.selectedCharacter,
            character: character
        }));

        alert(`Starting game with ${character.name}!\n\nThis feature will be implemented soon...`);
        
        // TODO: Navigate to game screen
        // document.getElementById('characterSelectScreen').classList.remove('active');
        // document.getElementById('gameScreen').classList.add('active');
    }

    logout() {
        const confirm = window.confirm('Are you sure you want to logout?');
        
        if (confirm) {
            // Use auth manager logout method
            if (window.authManager) {
                window.authManager.logout();
            } else {
                // Fallback if auth manager not available
                localStorage.removeItem('currentUser');
                document.getElementById('characterSelectScreen').classList.remove('active');
                document.getElementById('loginScreen').classList.add('active');
            }
            
            // Reset selection
            this.selectedCharacter = null;
            document.getElementById('playBtn').style.display = 'none';
            document.getElementById('deleteCharBtn').style.display = 'none';
        }
    }

    // Public method to show character select (called from auth.js)
    showCharacterSelect() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('characterSelectScreen').classList.add('active');
        
        // Reload characters for current user
        this.loadCharacters();
        this.renderCharacterGrid();
        
        // Reset selection
        this.selectedCharacter = null;
        document.getElementById('playBtn').style.display = 'none';
        document.getElementById('deleteCharBtn').style.display = 'none';
    }
}

// Initialize Character Manager
const characterManager = new CharacterManager();

// Export for use in other files
window.characterManager = characterManager;