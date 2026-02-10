// Character Management System
class CharacterManager {
    constructor() {
        this.characters = [];
        this.selectedCharacter = null;
        this.maxCharacters = 6;
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.loadCharacters();
        this.bindEvents();
        this.renderCharacterGrid();
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

        const saved = localStorage.getItem(`characters_${this.currentUser}`);
        this.characters = saved ? JSON.parse(saved) : [];
    }

    saveCharacters() {
        if (!this.currentUser) return;
        localStorage.setItem(`characters_${this.currentUser}`, JSON.stringify(this.characters));
    }

    renderCharacterGrid() {
        const grid = document.getElementById('characterGrid');
        if (!grid) return;

        grid.innerHTML = '';

        // Render existing characters
        for (let i = 0; i < this.maxCharacters; i++) {
            const character = this.characters[i];
            const slot = this.createCharacterSlot(character, i);
            grid.appendChild(slot);
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
        if (this.characters.length >= this.maxCharacters) {
            alert('Maximum characters reached! Delete a character first.');
            return;
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
