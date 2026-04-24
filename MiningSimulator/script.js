// script.js
const screens = {
    loading: document.getElementById('loading-screen'),
    auth: document.getElementById('auth-screen'),
    lobby: document.getElementById('lobby-screen'),
    tutorial: document.getElementById('tutorial-screen'),
    game: document.getElementById('game-screen')
};

let isLoginMode = true;
let currentUser = null;
// ---- NEW STATE ----
let inventory = { stone: 0, dirt: 0, log: 0, planks: 0, stick: 0 };
let blockHealth = 100;
const MAX_HEALTH = 100;
let isMiningCooldown = false;
let autoMiningInterval = null;

let settings = { grid: true, volume: 30, autoRepair: false, autoMining: false, textSpeed: 800 };

const TOOL_TIERS = {
    wooden: { damage: 20, maxDur: 60, cooldown: 600, speedMod: 1 },
    stone: { damage: 34, maxDur: 80, cooldown: 400, speedMod: 0.8 }
};
const TOOL_DUR_OVERRIDES = {
    pickaxe_wooden: 60, pickaxe_stone: 80,
    shovel_wooden: 30, shovel_stone: 60,
    axe_wooden: 20, axe_stone: 40
};

let ownedTools = { pickaxe: ['wooden'], shovel: ['wooden'], axe: ['wooden'] };
let activeTools = { pickaxe: 'wooden', shovel: 'wooden', axe: 'wooden' };
let toolDurability = { pickaxe: 60, shovel: 30, axe: 20 };

let currentBlockType = 'cobblestone'; // 'cobblestone', 'grass', 'oak_log'

// Menu Pagination & Auto-reset
let currentMenuPage = 1;
const MAX_MENU_PAGES = 5;
let menuInactivityTimer = null;

let currentLang = localStorage.getItem('miningLang') || 'id';

const translations = {
    id: {
        start_mining: "Mulai Menambang",
        tutorial: "Cara Bermain",
        logout: "Keluar",
        tutorial_title: "Cara Bermain",
        tut_1: "Klik blok untuk menambang. Blok akan berganti secara acak antara Cobblestone dan Grass Block.",
        tut_2: "Alat akan otomatis menyesuaikan! Pickaxe untuk menambang batu (Stone) dan Shovel untuk tanah (Dirt).",
        tut_3: "Hasil tambang akan masuk ke Inventaris di menu titik empat.",
        tut_4: "Setiap alat memiliki ketahanan. Gunakan menu Repair di Anvil untuk memperbaikinya menggunakan hasil tambangmu.",
        understand: "Mengerti!",
        status: "Status",
        durability: "Durability",
        cost: "Biaya",
        repair_btn: "Perbaiki",
        cancel: "Batal",
        good: "Baik",
        damaged: "Rusak",
        broken: "Hancur",
        no_stone: "Stone tidak cukup untuk perbaikan!",
        max_dur: "Pickaxe masih dalam kondisi maksimal!",
        repaired: "Pickaxe berhasil diperbaiki!",
        broken_alert: "Pickaxe Anda hancur! Silakan perbaiki di menu Repair.",
        pickaxe_name: "Wooden Pickaxe",
        pickaxe_desc: "Alat penambang dasar yang terbuat dari kayu. Tidak terlalu kuat tapi berguna untuk memulai.",
        shovel_name: "Wooden Shovel",
        shovel_desc: "Alat penggali dasar yang terbuat dari kayu. Cocok untuk menggali tanah dan rumput."
    },
    en: {
        start_mining: "Start Mining",
        tutorial: "How to Play",
        logout: "Logout",
        tutorial_title: "How to Play",
        tut_1: "Click blocks to mine. Blocks will randomly switch between Cobblestone and Grass Block.",
        tut_2: "Tools auto-switch! Use Pickaxe to mine Stone and Shovel to dig Dirt.",
        tut_3: "Mined resources will go to the Inventory in the four-dot menu.",
        tut_4: "Each tool has durability. Use the Repair menu at the Anvil to fix them using your mined resources.",
        understand: "Got it!",
        status: "Status",
        durability: "Durability",
        cost: "Cost",
        repair_btn: "Repair",
        cancel: "Cancel",
        good: "Good",
        damaged: "Damaged",
        broken: "Broken",
        no_stone: "Not enough Stone for repair!",
        max_dur: "Pickaxe is already at max durability!",
        repaired: "Pickaxe successfully repaired!",
        broken_alert: "Your pickaxe is broken! Please fix it in the Repair menu.",
        pickaxe_name: "Wooden Pickaxe",
        pickaxe_desc: "A basic mining tool made of wood. Not very strong but useful to start with.",
        shovel_name: "Wooden Shovel",
        shovel_desc: "A basic digging tool made of wood. Good for digging dirt and grass."
    },
    ms: {
        start_mining: "Mula Melombong",
        tutorial: "Cara Bermain",
        logout: "Log Keluar",
        tutorial_title: "Cara Bermain",
        tut_1: "Klik blok untuk melombong. Blok akan bertukar secara rawak antara Cobblestone dan Grass Block.",
        tut_2: "Alat akan bertukar automatik! Pickaxe untuk melombong batu (Stone) dan Shovel untuk tanah (Dirt).",
        tut_3: "Hasil lombong akan masuk ke Inventori di menu titik empat.",
        tut_4: "Setiap alat mempunyai ketahanan. Gunakan menu Repair di Anvil untuk membaikinya menggunakan hasil lombong anda.",
        understand: "Faham!",
        status: "Status",
        durability: "Ketahanan",
        cost: "Kos",
        repair_btn: "Baiki",
        cancel: "Batal",
        good: "Baik",
        damaged: "Rosak",
        broken: "Hancur",
        no_stone: "Stone tidak cukup untuk pembaikan!",
        max_dur: "Pickaxe masih dalam keadaan maksimum!",
        repaired: "Pickaxe berjaya dibaiki!",
        broken_alert: "Pickaxe anda hancur! Sila baiki di menu Repair.",
        pickaxe_name: "Wooden Pickaxe",
        pickaxe_desc: "Alat melombong asas yang diperbuat daripada kayu. Tidak begitu kuat tetapi berguna untuk bermula.",
        shovel_name: "Wooden Shovel",
        shovel_desc: "Alat penggali asas yang diperbuat daripada kayu. Sesuai untuk menggali tanah dan rumput."
    },
    kr: {
        start_mining: "채굴 시작",
        tutorial: "게임 방법",
        logout: "로그아웃",
        tutorial_title: "게임 방법",
        tut_1: "블록을 클릭하여 채굴하세요. 조약돌과 잔디 블록이 무작위로 번갈아 나타납니다.",
        tut_2: "도구가 자동으로 전환됩니다! 돌을 캘 때는 곡괭이를, 흙을 팔 때는 삽을 사용합니다.",
        tut_3: "채굴 결과물은 4점 메뉴의 인벤토리로 들어갑니다.",
        tut_4: "각 도구에는 내구도가 있습니다. 모루의 수리 메뉴에서 캔 자원을 이용해 수리하세요.",
        understand: "이해했습니다!",
        status: "상태",
        durability: "내구도",
        cost: "비용",
        repair_btn: "수리하기",
        cancel: "취소",
        good: "좋음",
        damaged: "손상됨",
        broken: "파손됨",
        no_stone: "수리에 필요한 돌이 부족합니다!",
        max_dur: "곡괭이 내구도가 이미 최대입니다!",
        repaired: "곡괭이가 성공적으로 수리되었습니다!",
        broken_alert: "곡괭이가 파손되었습니다! 수리 메뉴에서 수리해주세요.",
        pickaxe_name: "나무 곡괭이",
        pickaxe_desc: "나무로 만든 기본적인 채굴 도구입니다. 아주 튼튼하지는 않지만 시작할 때 유용합니다.",
        shovel_name: "나무 삽",
        shovel_desc: "나무로 만든 기본적인 굴착 도구입니다. 흙과 풀을 파는 데 좋습니다."
    }
};

// Initialize
window.onload = () => {
    setLanguage(currentLang);
    initItemInfoListeners();
    // Check for remembered credentials
    const remembered = localStorage.getItem('rememberedCreds');
    if (remembered) {
        const { username, password } = JSON.parse(remembered);
        document.getElementById('username').value = username;
        document.getElementById('password').value = password;
        document.getElementById('remember').checked = true;
    }

    setTimeout(() => {
        try {
            // Load settings
            const savedSettings = localStorage.getItem('miningSettings');
            if(savedSettings) {
                settings = JSON.parse(savedSettings);
            }
            applySettingsUI();
            
            const savedUser = localStorage.getItem('miningUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                
                // Load state from user profile or fallback to global for migration
                if (currentUser.inventory) inventory = { ...inventory, ...currentUser.inventory };
                else if (localStorage.getItem('miningInventory')) inventory = { ...inventory, ...JSON.parse(localStorage.getItem('miningInventory')) };
                else {
                    inventory.stone = currentUser.stones || 0;
                    inventory.dirt = currentUser.dirts || 0;
                }
                
                if (currentUser.ownedTools) ownedTools = { ...ownedTools, ...currentUser.ownedTools };
                else if (localStorage.getItem('ownedTools')) ownedTools = { ...ownedTools, ...JSON.parse(localStorage.getItem('ownedTools')) };
                
                if (currentUser.activeTools) activeTools = { ...activeTools, ...currentUser.activeTools };
                else if (localStorage.getItem('activeTools')) activeTools = { ...activeTools, ...JSON.parse(localStorage.getItem('activeTools')) };
                
                if (currentUser.toolDurability) toolDurability = { ...toolDurability, ...currentUser.toolDurability };
                else if (localStorage.getItem('toolDurability')) toolDurability = { ...toolDurability, ...JSON.parse(localStorage.getItem('toolDurability')) };
                
                currentBlockType = currentUser.currentBlockType || localStorage.getItem('currentBlockType') || 'cobblestone';
                
                updateBlockAndToolVisuals();
                updateSettingsToolSelects();
                
                updateLobby();
                switchScreen('lobby');
            } else {
                switchScreen('auth');
            }
        } catch (e) {
            alert("Error saat memuat data: " + e.message + "\n\nStack:\n" + e.stack);
            console.error(e);
        }
    }, 2000); // 2 second loading simulation
};

function switchScreen(screenName) {
    const bgContainer = document.querySelector('.background-container');
    if (screenName === 'game') {
        bgContainer.classList.add('mining-mode');
    } else {
        bgContainer.classList.remove('mining-mode');
    }

    Object.values(screens).forEach(s => s.classList.remove('active'));
    setTimeout(() => {
        Object.values(screens).forEach(s => s.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                screens[screenName].classList.add('active');
            });
        });
    }, 500);
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Masuk' : 'Daftar';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Masuk' : 'Daftar';
    const toggleText = isLoginMode ? "Belum punya akun? <span onclick='toggleAuthMode()'>Daftar</span>" : "Sudah punya akun? <span onclick='toggleAuthMode()'>Masuk</span>";
    document.querySelector('.toggle-auth').innerHTML = toggleText;
}

function handleAuth() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        alert('Silakan masukkan username dan password');
        return;
    }

    requestFullscreen();
    
    const users = JSON.parse(localStorage.getItem('usersDB')) || {};
    
    if (isLoginMode) {
        if (users[username] && users[username].password === password) {
            currentUser = users[username];
            // Sync state for this user
            if (currentUser.inventory) inventory = { ...inventory, ...currentUser.inventory };
            if (currentUser.ownedTools) ownedTools = { ...ownedTools, ...currentUser.ownedTools };
            if (currentUser.activeTools) activeTools = { ...activeTools, ...currentUser.activeTools };
            if (currentUser.toolDurability) toolDurability = { ...toolDurability, ...currentUser.toolDurability };
            currentBlockType = currentUser.currentBlockType || 'cobblestone';
        } else {
            alert('Username atau password salah. Silakan coba lagi atau daftar.');
            return;
        }
    } else {
        if (users[username]) {
            alert('Username sudah digunakan. Silakan pilih username lain.');
            return;
        }
        currentUser = { username: username, password: password };
        
        // Reset state for new user
        inventory = { stone: 0, dirt: 0, log: 0, planks: 0, stick: 0 };
        ownedTools = { pickaxe: ['wooden'], shovel: ['wooden'], axe: ['wooden'] };
        activeTools = { pickaxe: 'wooden', shovel: 'wooden', axe: 'wooden' };
        toolDurability = { pickaxe: 60, shovel: 30, axe: 20 };
        currentBlockType = 'cobblestone';
        
        users[username] = currentUser;
        localStorage.setItem('usersDB', JSON.stringify(users));
    }
    
    if (rememberCheckbox.checked) {
        localStorage.setItem('miningUser', JSON.stringify(currentUser));
        localStorage.setItem('rememberedCreds', JSON.stringify({ username, password }));
    } else {
        localStorage.removeItem('rememberedCreds');
    }
    
    updateLobby();
    switchScreen('lobby');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('miningUser');
    switchScreen('auth');
}

function startGame() {
    switchScreen('game');
    const bgm = document.getElementById('game-bgm');
    if (bgm) {
        bgm.volume = settings.volume / 100;
        bgm.currentTime = 0;
        bgm.play().catch(err => console.log("BGM play failed:", err));
    }
    
    updateBlockAndToolVisuals();
    updateLobby();
    
    if (settings.autoMining) {
        startAutoMining();
    }
}

function returnToLobby() {
    stopAutoMining();
    const menuBar = document.getElementById('game-menu-bar');
    if (menuBar) {
        menuBar.classList.add('hidden');
    }
    const bgm = document.getElementById('game-bgm');
    if (bgm) {
        bgm.pause();
        bgm.currentTime = 0;
    }
    switchScreen('lobby');
}

function saveProgress() {
    if(currentUser) {
        currentUser.inventory = inventory;
        currentUser.ownedTools = ownedTools;
        currentUser.activeTools = activeTools;
        currentUser.toolDurability = toolDurability;
        currentUser.currentBlockType = currentBlockType;
        
        // Legacy
        currentUser.stones = inventory.stone;
        currentUser.dirts = inventory.dirt;
        
        const users = JSON.parse(localStorage.getItem('usersDB')) || {};
        users[currentUser.username] = currentUser;
        localStorage.setItem('usersDB', JSON.stringify(users));
        
        // Refresh local session
        if (localStorage.getItem('miningUser')) {
            localStorage.setItem('miningUser', JSON.stringify(currentUser));
        }
    }
}

function updateLobby() {
    document.getElementById('player-stones').innerText = inventory.stone || 0;
    
    const el = (id) => document.getElementById(id);
    if(el('modal-stone-count')) el('modal-stone-count').innerText = inventory.stone || 0;
    if(el('modal-dirt-count')) el('modal-dirt-count').innerText = inventory.dirt || 0;
    if(el('modal-log-count')) el('modal-log-count').innerText = inventory.log || 0;
    if(el('modal-planks-count')) el('modal-planks-count').innerText = inventory.planks || 0;
    if(el('modal-stick-count')) el('modal-stick-count').innerText = inventory.stick || 0;
    
    updateDurabilityUI();
    
    const craftModal = document.getElementById('crafting-modal');
    if(craftModal && craftModal.classList.contains('active')) updateCraftingMaterials();
}

function getCurrentToolCategory() {
    if (currentBlockType === 'cobblestone') return 'pickaxe';
    if (currentBlockType === 'grass') return 'shovel';
    if (currentBlockType === 'oak_log') return 'axe';
    return 'pickaxe';
}

function getToolMaxDurability(cat, tier) {
    return TOOL_DUR_OVERRIDES[`${cat}_${tier}`] || TOOL_TIERS[tier].maxDur;
}

function updateBlockAndToolVisuals() {
    const blockImg = document.getElementById('current-block');
    const toolImg = document.querySelector('.pickaxe-container img');
    if(!blockImg || !toolImg) return;
    
    blockImg.referrerPolicy = "no-referrer";
    toolImg.referrerPolicy = "no-referrer";
    
    if (currentBlockType === 'cobblestone') {
        blockImg.src = 'https://minecraft.wiki/images/Cobblestone_JE5_BE3.png';
        toolImg.src = activeTools.pickaxe === 'stone' ? 'https://minecraft.wiki/images/Stone_Pickaxe_JE2_BE2.png' : 'https://minecraft.wiki/images/Wooden_Pickaxe_JE3_BE3.png';
    } else if (currentBlockType === 'grass') {
        blockImg.src = 'https://minecraft.wiki/images/thumb/Grass_Block_JE7_BE6.png/150px-Grass_Block_JE7_BE6.png';
        toolImg.src = activeTools.shovel === 'stone' ? 'https://minecraft.wiki/images/Stone_Shovel_JE2_BE2.png' : 'https://minecraft.wiki/images/Wooden_Shovel_JE2_BE2.png';
    } else if (currentBlockType === 'oak_log') {
        blockImg.src = 'https://minecraft.wiki/images/Oak_Log_%28UD%29_JE8_BE3.png';
        toolImg.src = activeTools.axe === 'stone' ? 'https://minecraft.wiki/images/Stone_Axe_JE2_BE2.png' : 'https://minecraft.wiki/images/Wooden_Axe_JE2_BE2.png';
    }
}

// ---- GAMEPLAY LOGIC ----
const blockContainer = document.querySelector('.block-container');
const toolCursor = document.querySelector('.pickaxe-container');
const mineSound = new Audio('https://www.myinstants.com/media/sounds/minecraft-pickaxe-sound.mp3');
const shovelSound = new Audio('https://minecraft.wiki/images/Shovel_flatten2.ogg?27e2d');
const axeSound = new Audio('https://minecraft.wiki/images/transcoded/Axe_strip1.ogg/Axe_strip1.ogg.mp3');

document.addEventListener('mousemove', (e) => {
    if (screens.game.classList.contains('active')) {
        toolCursor.style.left = e.clientX + 'px';
        toolCursor.style.top = e.clientY + 'px';
    }
});

// Mobile Touch Support for Tool Cursor
document.addEventListener('touchstart', (e) => {
    if (screens.game.classList.contains('active')) {
        const touch = e.touches[0];
        toolCursor.style.left = touch.clientX + 'px';
        toolCursor.style.top = touch.clientY + 'px';
    }
}, {passive: true});

document.addEventListener('touchmove', (e) => {
    if (screens.game.classList.contains('active')) {
        const touch = e.touches[0];
        toolCursor.style.left = touch.clientX + 'px';
        toolCursor.style.top = touch.clientY + 'px';
    }
}, {passive: true});

blockContainer.addEventListener('click', (e) => {
    if (isMiningCooldown) return;
    
    const cat = getCurrentToolCategory();
    const tier = activeTools[cat];
    const maxDur = getToolMaxDurability(cat, tier);
    const dmg = TOOL_TIERS[tier].damage;
    const cd = TOOL_TIERS[tier].cooldown;
    
    if (toolDurability[cat] <= 0) {
        if (settings.autoRepair) {
            const cost = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
            let repaired = false;
            
            if (tier === 'wooden') {
                if (cat === 'pickaxe' && inventory.stone >= cost) { inventory.stone -= cost; repaired = true; createFloatingText('-' + cost + ' Stone', e.clientX, e.clientY - 60, '#facc15'); }
                else if (cat === 'shovel' && inventory.dirt >= cost) { inventory.dirt -= cost; repaired = true; createFloatingText('-' + cost + ' Dirt', e.clientX, e.clientY - 60, '#facc15'); }
                else if (cat === 'axe' && inventory.log >= cost) { inventory.log -= cost; repaired = true; createFloatingText('-' + cost + ' Log', e.clientX, e.clientY - 60, '#facc15'); }
            } else if (tier === 'stone') {
                if (inventory.stone >= cost) { inventory.stone -= cost; repaired = true; createFloatingText('-' + cost + ' Stone', e.clientX, e.clientY - 60, '#facc15'); }
            }
            if(repaired) {
                toolDurability[cat] = maxDur;
                updateLobby();
                saveProgress();
            } else {
                alert(translations[currentLang].no_stone);
                return;
            }
        } else {
            alert(translations[currentLang].broken_alert);
            return;
        }
    }

    isMiningCooldown = true;
    
    let currentSound;
    if (currentBlockType === 'cobblestone') currentSound = mineSound;
    else if (currentBlockType === 'grass') currentSound = shovelSound;
    else if (currentBlockType === 'oak_log') currentSound = axeSound;
    else currentSound = mineSound;
    currentSound.currentTime = 0;
    currentSound.play().catch(err => {});
    const loudSound = currentSound.cloneNode();
    loudSound.play().catch(err => {});

    toolCursor.classList.remove('mine-anim');
    void toolCursor.offsetWidth;
    toolCursor.classList.add('mine-anim');
    
    const rect = blockContainer.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    
    blockHealth -= dmg;
    createFloatingText('-' + dmg, x, y, '#facc15');
    
    if (blockHealth <= 0) {
        breakBlock(x, y);
    } else {
        updateHealthBar();
    }
    
    setTimeout(() => {
        isMiningCooldown = false;
    }, cd);
});

function breakBlock(x, y) {
    const cat = getCurrentToolCategory();
    let durLoss = 1;
    toolDurability[cat] = Math.max(0, toolDurability[cat] - durLoss);
    
    if (currentBlockType === 'cobblestone') {
        inventory.stone += 1;
        createFloatingText('+1 Stone', x, y - 40, '#4ade80');
    } else if (currentBlockType === 'grass') {
        inventory.dirt += 1;
        createFloatingText('+1 Dirt', x, y - 40, '#ffa500');
    } else if (currentBlockType === 'oak_log') {
        inventory.log += 1;
        createFloatingText('+1 Oak Log', x, y - 40, '#d2b48c');
    }
    
    const r = Math.random();
    if (r < 0.33) currentBlockType = 'cobblestone';
    else if (r < 0.66) currentBlockType = 'grass';
    else currentBlockType = 'oak_log';
    
    updateBlockAndToolVisuals();
    updateLobby();
    saveProgress();
    
    blockHealth = MAX_HEALTH;
    updateHealthBar();
}

function updateHealthBar() {
    const healthBarFill = document.querySelector('.health-bar-fill');
    if(!healthBarFill) return;
    const percentage = Math.max(0, (blockHealth / MAX_HEALTH) * 100);
    healthBarFill.style.width = percentage + '%';
    
    if (percentage > 50) {
        healthBarFill.style.background = 'linear-gradient(90deg, #22c55e, #4ade80)';
    } else if (percentage > 20) {
        healthBarFill.style.background = 'linear-gradient(90deg, #eab308, #facc15)';
    } else {
        healthBarFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }
}

function updateDurabilityUI() {
    const durBg = document.querySelector('.durability-bar-bg');
    const durFill = document.querySelector('.durability-bar-fill');
    const durText = document.querySelector('.durability-text');
    const toolLabel = document.getElementById('tool-label');
    if(!durBg || !durFill || !durText || !toolLabel) return;
    
    const cat = getCurrentToolCategory();
    const tier = activeTools[cat];
    const dur = toolDurability[cat];
    const maxDur = getToolMaxDurability(cat, tier);
    
    toolLabel.innerText = tier.charAt(0).toUpperCase() + tier.slice(1) + ' ' + cat.charAt(0).toUpperCase() + cat.slice(1);
    durFill.style.background = '#00f3ff';
    durBg.style.borderColor = 'rgba(0, 243, 255, 0.2)';
    
    const pct = Math.max(0, (dur / maxDur) * 100);
    durFill.style.width = pct + '%';
    durText.innerText = `${dur}/${maxDur}`;
    
    if (dur <= 0) durFill.style.background = '#ef4444';
}

function createFloatingText(text, x, y, color) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color;
    
    const speed = settings.textSpeed || 800;
    el.style.animationDuration = (speed / 1000) + 's';
    
    document.body.appendChild(el);
    
    setTimeout(() => {
        el.remove();
    }, speed);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('miningLang', lang);
    
    document.querySelectorAll('.language-switcher button').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.language-switcher button[onclick="setLanguage('${lang}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
}

// Modals
function toggleMenuBar() {
    const menuBar = document.getElementById('game-menu-bar');
    if (menuBar.classList.contains('hidden')) {
        menuBar.classList.remove('hidden');
        currentMenuPage = 1;
        updateMenuPage();
        resetMenuInactivityTimer();
    } else {
        menuBar.classList.add('hidden');
        clearTimeout(menuInactivityTimer);
    }
}

function resetMenuInactivityTimer() {
    clearTimeout(menuInactivityTimer);
    menuInactivityTimer = setTimeout(() => {
        const menuBar = document.getElementById('game-menu-bar');
        if (menuBar && !menuBar.classList.contains('hidden')) {
            menuBar.classList.add('hidden');
        }
    }, 5000);
}

// Menu Pagination Logic
function nextMenuPage() {
    const items = document.querySelectorAll('#menu-items-container .menu-item');
    const itemsPerPage = 2;
    const maxPages = Math.ceil(items.length / itemsPerPage);
    
    currentMenuPage++;
    if (currentMenuPage > maxPages) currentMenuPage = 1;
    updateMenuPage();
}

function prevMenuPage() {
    const items = document.querySelectorAll('#menu-items-container .menu-item');
    const itemsPerPage = 2;
    const maxPages = Math.ceil(items.length / itemsPerPage);
    
    currentMenuPage--;
    if (currentMenuPage < 1) currentMenuPage = maxPages;
    updateMenuPage();
}

function updateMenuPage() {
    const container = document.getElementById('menu-items-container');
    if (!container) return;
    
    const items = container.querySelectorAll('.menu-item');
    const itemsPerPage = 2; // Show 2 items at a time on mobile
    
    container.style.opacity = '0';
    setTimeout(() => {
        items.forEach((item, index) => {
            if (index >= (currentMenuPage - 1) * itemsPerPage && index < currentMenuPage * itemsPerPage) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        container.style.opacity = '1';
    }, 150);
}

// Swipe Support for Menu Bar
let menuTouchStartX = 0;
let menuTouchEndX = 0;

window.addEventListener('load', () => {
    const menuBar = document.getElementById('game-menu-bar');
    if (menuBar) {
        menuBar.addEventListener('touchstart', e => {
            menuTouchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        menuBar.addEventListener('touchend', e => {
            menuTouchEndX = e.changedTouches[0].screenX;
            const diff = menuTouchEndX - menuTouchStartX;
            if (Math.abs(diff) > 50) {
                if (diff < 0) nextMenuPage();
                else prevMenuPage();
            }
        }, {passive: true});
    }
});

function showTutorial() {
    document.getElementById('tutorial-screen').classList.remove('hidden');
    setTimeout(() => document.getElementById('tutorial-screen').classList.add('active'), 10);
}

function closeTutorial() {
    document.getElementById('tutorial-screen').classList.remove('active');
    setTimeout(() => document.getElementById('tutorial-screen').classList.add('hidden'), 500);
}

function openInventoryModal() {
    resetMenuInactivityTimer();
    const modal = document.getElementById('inventory-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    document.getElementById('game-menu-bar').classList.add('hidden');
}

function closeInventoryModal() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 500);
}

function openRepairModal() {
    resetMenuInactivityTimer();
    const modal = document.getElementById('repair-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('active'), 10);
    document.getElementById('game-menu-bar').classList.add('hidden');
    
    const cat = getCurrentToolCategory();
    const tier = activeTools[cat];
    const dur = toolDurability[cat];
    const maxDur = getToolMaxDurability(cat, tier);
    
    const repairTitle = document.getElementById('repair-title');
    const repairDur = document.getElementById('repair-durability');
    const repairCostText = document.getElementById('repair-cost-text');
    
    repairTitle.innerText = tier.charAt(0).toUpperCase() + tier.slice(1) + ' ' + cat.charAt(0).toUpperCase() + cat.slice(1);
    repairDur.innerText = `${dur}/${maxDur}`;
    
    let costType = 'Stone';
    if(tier === 'wooden') {
        if(cat === 'pickaxe') costType = 'Stone';
        else if(cat === 'shovel') costType = 'Dirt';
        else if(cat === 'axe') costType = 'Oak Log';
    } else {
        costType = 'Stone';
    }
    
    window.currentRepairCostAmount = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
    repairCostText.innerText = `${window.currentRepairCostAmount} ${costType}`;
}

function closeRepairModal() {
    const modal = document.getElementById('repair-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.classList.add('hidden'), 500);
}

function repairPickaxe() {
    const cat = getCurrentToolCategory();
    const tier = activeTools[cat];
    const dur = toolDurability[cat];
    const maxDur = getToolMaxDurability(cat, tier);
    
    if (dur >= maxDur) {
        alert(translations[currentLang].max_dur);
        return;
    }
    
    let costType = 'stone';
    if(tier === 'wooden') {
        if(cat === 'shovel') costType = 'dirt';
        else if(cat === 'axe') costType = 'log';
    }
    
    if (inventory[costType] >= window.currentRepairCostAmount) {
        inventory[costType] -= window.currentRepairCostAmount;
        toolDurability[cat] = maxDur;
        updateLobby();
        saveProgress();
        alert(translations[currentLang].repaired);
        closeRepairModal();
    } else {
        alert(`Bahan (${costType}) tidak cukup untuk perbaikan!`);
    }
}

// Fullscreen
function requestFullscreen() {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
    } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Item Info Box
function initItemInfoListeners() {
    const infoModal = document.getElementById('item-info-modal');
    const infoName = document.getElementById('info-name');
    const infoDesc = document.getElementById('info-desc');
    const infoDur = document.getElementById('info-durability');
    const durContainer = document.getElementById('durability-trigger');

    let pressTimer;

    const showInfo = (e) => {
        if (e && e.cancelable) e.preventDefault();
        const cat = getCurrentToolCategory();
        const tier = activeTools[cat];
        const dur = toolDurability[cat];
        const maxDur = getToolMaxDurability(cat, tier);

        infoName.innerText = translations[currentLang][`${cat}_name`] || (tier + ' ' + cat);
        infoDesc.innerText = translations[currentLang][`${cat}_desc`] || 'A useful tool.';
        infoDur.innerText = `${dur}/${maxDur}`;
        
        infoModal.classList.remove('hidden');
        setTimeout(() => infoModal.classList.add('active'), 10);
    };

    const hideInfo = () => {
        infoModal.classList.remove('active');
        setTimeout(() => infoModal.classList.add('hidden'), 500);
    };

    if(durContainer) {
        // Desktop
        durContainer.addEventListener('mousedown', (e) => {
            if(e.button === 0) pressTimer = window.setTimeout(showInfo, 500);
        });
        durContainer.addEventListener('mouseup', () => clearTimeout(pressTimer));
        durContainer.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        durContainer.addEventListener('contextmenu', (e) => {
            showInfo(e);
        });

        // Mobile
        durContainer.addEventListener('touchstart', (e) => {
            pressTimer = window.setTimeout(() => showInfo(e), 500);
        }, {passive: false});
        durContainer.addEventListener('touchend', () => clearTimeout(pressTimer));
        durContainer.addEventListener('touchmove', () => clearTimeout(pressTimer));
        
        // Direct click on question mark
        const qMark = durContainer.querySelector('.info-icon-trigger');
        if(qMark) qMark.addEventListener('click', (e) => {
            e.stopPropagation();
            showInfo(e);
        });
    }

    window.closeItemInfo = hideInfo;
}

// Settings
function applySettingsUI() {
    const elGrid = document.getElementById('setting-grid');
    if(elGrid) elGrid.checked = settings.grid;
    const elVol = document.getElementById('setting-volume');
    if(elVol) elVol.value = settings.volume;
    const elVolVal = document.getElementById('vol-val');
    if(elVolVal) elVolVal.innerText = settings.volume + '%';
    const elRepair = document.getElementById('setting-autorepair');
    if(elRepair) elRepair.checked = settings.autoRepair;
    const elMining = document.getElementById('setting-automining');
    if(elMining) elMining.checked = settings.autoMining;
    const elSpeed = document.getElementById('setting-text-speed');
    if(elSpeed) elSpeed.value = settings.textSpeed || 800;
    
    toggleGrid(true);
    changeVolume(true);
    changeTextSpeed(true);
}

function openSettingsModal() {
    resetMenuInactivityTimer();
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
    const menuBar = document.getElementById('game-menu-bar');
    if (menuBar) menuBar.classList.add('hidden');
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 500);
    }
    localStorage.setItem('miningSettings', JSON.stringify(settings));
}

function toggleGrid(isInit = false) {
    const cb = document.getElementById('setting-grid');
    if(cb && !isInit) settings.grid = cb.checked;
    if (settings.grid) document.body.classList.remove('hide-grid');
    else document.body.classList.add('hide-grid');
    if(!isInit) localStorage.setItem('miningSettings', JSON.stringify(settings));
}

function changeVolume(isInit = false) {
    const vol = document.getElementById('setting-volume');
    if(vol && !isInit) settings.volume = vol.value;
    const vval = document.getElementById('vol-val');
    if(vval) vval.innerText = settings.volume + '%';
    const bgm = document.getElementById('game-bgm');
    if(bgm) bgm.volume = settings.volume / 100;
    if(!isInit) localStorage.setItem('miningSettings', JSON.stringify(settings));
}

function changeTextSpeed(isInit = false) {
    const speed = document.getElementById('setting-text-speed');
    if(speed && !isInit) settings.textSpeed = parseInt(speed.value);
    const speedVal = document.getElementById('text-speed-val');
    if(speedVal) speedVal.innerText = ((settings.textSpeed || 800) / 1000) + 's';
    if(!isInit) localStorage.setItem('miningSettings', JSON.stringify(settings));
}

function toggleAutoRepair() {
    const cb = document.getElementById('setting-autorepair');
    if(cb) settings.autoRepair = cb.checked;
    localStorage.setItem('miningSettings', JSON.stringify(settings));
}

function toggleAutoMining() {
    const cb = document.getElementById('setting-automining');
    if(cb) settings.autoMining = cb.checked;
    localStorage.setItem('miningSettings', JSON.stringify(settings));
    if (settings.autoMining && screens.game.classList.contains('active')) startAutoMining();
    else stopAutoMining();
}

function startAutoMining() {
    if (autoMiningInterval) clearInterval(autoMiningInterval);
    const cat = getCurrentToolCategory();
    const tier = activeTools[cat];
    const speedMod = TOOL_TIERS[tier]?.speedMod || 1;
    
    autoMiningInterval = setInterval(() => {
        if (!screens.game.classList.contains('active') || !settings.autoMining) {
            stopAutoMining();
            return;
        }
        
        const cat = getCurrentToolCategory();
        const tier = activeTools[cat];
        const maxDur = getToolMaxDurability(cat, tier);
        
        if (toolDurability[cat] <= 0) {
            if (settings.autoRepair) {
                const cost = Math.floor(Math.random() * (8 - 5 + 1)) + 5;
                let repaired = false;
                if (tier === 'wooden') {
                    if (cat === 'pickaxe' && inventory.stone >= cost) { inventory.stone -= cost; repaired = true; createFloatingText('-' + cost + ' Stone', window.innerWidth/2, window.innerHeight/2 - 100, '#facc15'); }
                    else if (cat === 'shovel' && inventory.dirt >= cost) { inventory.dirt -= cost; repaired = true; createFloatingText('-' + cost + ' Dirt', window.innerWidth/2, window.innerHeight/2 - 100, '#facc15'); }
                    else if (cat === 'axe' && inventory.log >= cost) { inventory.log -= cost; repaired = true; createFloatingText('-' + cost + ' Log', window.innerWidth/2, window.innerHeight/2 - 100, '#facc15'); }
                } else if (tier === 'stone') {
                    if (inventory.stone >= cost) { inventory.stone -= cost; repaired = true; createFloatingText('-' + cost + ' Stone', window.innerWidth/2, window.innerHeight/2 - 100, '#facc15'); }
                }
                if(repaired) {
                    toolDurability[cat] = maxDur;
                    updateLobby();
                } else return;
            } else return;
        }
        
        const rect = blockContainer.getBoundingClientRect();
        const ev = new MouseEvent('click', { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, bubbles: true, cancelable: true });
        blockContainer.dispatchEvent(ev);
        
    }, 1500 * speedMod);
}

function stopAutoMining() {
    if (autoMiningInterval) {
        clearInterval(autoMiningInterval);
        autoMiningInterval = null;
    }
}

// Crafting
let craftGrid = [null, null, null, null, null, null, null, null, null];
let selectedMaterial = null;

const ASSETS = {
    stone: 'https://minecraft.wiki/images/Stone_JE5_BE3.png',
    dirt: 'https://minecraft.wiki/images/thumb/Dirt_JE2_BE2.png/150px-Dirt_JE2_BE2.png',
    log: 'https://minecraft.wiki/images/Oak_Log_%28UD%29_JE8_BE3.png',
    planks: 'https://minecraft.wiki/images/thumb/Oak_Planks.png/150px-Oak_Planks.png',
    stick: 'https://minecraft.wiki/images/Stick_JE1_BE1.png',
    pickaxe_stone: 'https://minecraft.wiki/images/Stone_Pickaxe_JE2_BE2.png',
    shovel_stone: 'https://minecraft.wiki/images/Stone_Shovel_JE2_BE2.png',
    axe_stone: 'https://minecraft.wiki/images/Stone_Axe_JE2_BE2.png'
};

function openCraftingModal() {
    resetMenuInactivityTimer();
    const modal = document.getElementById('crafting-modal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('active'), 10);
    }
    const menuBar = document.getElementById('game-menu-bar');
    if (menuBar) menuBar.classList.add('hidden');
    updateCraftingMaterials();
}

function closeCraftingModal() {
    const modal = document.getElementById('crafting-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.classList.add('hidden'), 500);
    }
    clearCrafting();
}

function updateCraftingMaterials() {
    const container = document.getElementById('crafting-materials');
    if(!container) return;
    container.innerHTML = '';
    
    ['stone', 'dirt', 'log', 'planks', 'stick'].forEach(item => {
        if(inventory[item] > 0) {
            const div = document.createElement('div');
            div.className = 'material-item' + (selectedMaterial === item ? ' selected' : '');
            div.innerHTML = `<img src="${ASSETS[item]}" referrerpolicy="no-referrer"><span style="color:white; font-size:10px; position:absolute; bottom:2px; right:2px;">${inventory[item]}</span>`;
            div.onclick = () => selectMaterial(item);
            container.appendChild(div);
        }
    });
}

function selectMaterial(item) {
    selectedMaterial = selectedMaterial === item ? null : item;
    updateCraftingMaterials();
}

function slotClick(slotIndex) {
    const idx = slotIndex - 1;
    const amountInput = document.getElementById('craft-amount');
    let takeAmount = 1;
    if(amountInput) takeAmount = parseInt(amountInput.value) || 1;
    
    if (selectedMaterial) {
        if (inventory[selectedMaterial] >= takeAmount) {
            inventory[selectedMaterial] -= takeAmount;
            if (craftGrid[idx] && craftGrid[idx].item === selectedMaterial) {
                craftGrid[idx].amount += takeAmount;
            } else if (!craftGrid[idx]) {
                craftGrid[idx] = { item: selectedMaterial, amount: takeAmount };
            } else {
                inventory[craftGrid[idx].item] += craftGrid[idx].amount;
                craftGrid[idx] = { item: selectedMaterial, amount: takeAmount };
            }
        }
    } else {
        if (craftGrid[idx]) {
            inventory[craftGrid[idx].item] += craftGrid[idx].amount;
            craftGrid[idx] = null;
        }
    }
    renderCraftGrid();
    checkRecipe();
}

function renderCraftGrid() {
    for (let i = 0; i < 9; i++) {
        const slotEl = document.querySelector(`.craft-slot[data-slot="${i+1}"]`);
        if(slotEl) {
            slotEl.innerHTML = '';
            if (craftGrid[i]) {
                slotEl.innerHTML = `<img src="${ASSETS[craftGrid[i].item]}"><span class="item-count" style="color:white; font-size:10px; position:absolute; bottom:2px; right:2px;">${craftGrid[i].amount}</span>`;
            }
        }
    }
    updateCraftingMaterials();
    updateLobby();
    saveProgress();
}

function clearCrafting() {
    for (let i = 0; i < 9; i++) {
        if (craftGrid[i]) {
            inventory[craftGrid[i].item] += craftGrid[i].amount;
            craftGrid[i] = null;
        }
    }
    const resSlot = document.getElementById('craft-result-slot');
    if(resSlot) resSlot.innerHTML = '';
    currentRecipeOutput = null;
    renderCraftGrid();
}

let currentRecipeOutput = null;

function checkRecipe() {
    currentRecipeOutput = null;
    const g = craftGrid.map(s => s ? s.item : null);
    
    const logCount = g.filter(i => i === 'log').length;
    if (logCount === 1 && g.filter(i => i).length === 1) {
        const amt = craftGrid[g.indexOf('log')].amount;
        currentRecipeOutput = { id: 'planks', count: 4 * amt, type: 'item', consume: amt };
    }
    else if (g[1] === 'planks' && g[4] === 'planks' && g.filter(i => i).length === 2) {
        const amt = Math.min(craftGrid[1].amount, craftGrid[4].amount);
        currentRecipeOutput = { id: 'stick', count: 4 * amt, type: 'item', consume: amt };
    }
    else if (g[0]==='stone' && g[1]==='stone' && g[2]==='stone' && g[4]==='stick' && g[7]==='stick' && g.filter(i => i).length === 5) {
        const amt = Math.min(craftGrid[0].amount, craftGrid[1].amount, craftGrid[2].amount, craftGrid[4].amount, craftGrid[7].amount);
        currentRecipeOutput = { id: 'pickaxe_stone', count: amt, type: 'tool', consume: amt };
    }
    else if (g[1]==='stone' && g[4]==='stone' && g[7]==='stick' && g.filter(i => i).length === 3) {
        const amt = Math.min(craftGrid[1].amount, craftGrid[4].amount, craftGrid[7].amount);
        currentRecipeOutput = { id: 'shovel_stone', count: amt, type: 'tool', consume: amt };
    }
    else if (g[0]==='stone' && g[1]==='stone' && g[3]==='stone' && g[4]==='stick' && g[7]==='stick' && g.filter(i => i).length === 5) {
        const amt = Math.min(craftGrid[0].amount, craftGrid[1].amount, craftGrid[3].amount, craftGrid[4].amount, craftGrid[7].amount);
        currentRecipeOutput = { id: 'axe_stone', count: amt, type: 'tool', consume: amt };
    }

    const resSlot = document.getElementById('craft-result-slot');
    if(resSlot) {
        if (currentRecipeOutput) {
            resSlot.innerHTML = `<img src="${ASSETS[currentRecipeOutput.id] || ASSETS[currentRecipeOutput.id.replace('_stone','')]}" referrerpolicy="no-referrer"><span class="item-count" style="color:white; font-size:10px; position:absolute; bottom:2px; right:2px;">${currentRecipeOutput.count}</span>`;
        } else {
            resSlot.innerHTML = '';
        }
    }
}

function claimCraft() {
    if (!currentRecipeOutput) return;
    
    if (currentRecipeOutput.type === 'item') {
        inventory[currentRecipeOutput.id] += currentRecipeOutput.count;
    } else if (currentRecipeOutput.type === 'tool') {
        const [cat, tier] = currentRecipeOutput.id.split('_');
        if (!ownedTools[cat].includes(tier)) {
            ownedTools[cat].push(tier);
        }
        activeTools[cat] = tier;
        toolDurability[cat] = getToolMaxDurability(cat, tier);
        updateSettingsToolSelects();
        updateBlockAndToolVisuals();
    }
    
    const c = currentRecipeOutput.consume || 1;
    for (let i = 0; i < 9; i++) {
        if (craftGrid[i]) {
            craftGrid[i].amount -= c;
            if (craftGrid[i].amount <= 0) craftGrid[i] = null;
        }
    }
    
    renderCraftGrid();
    checkRecipe();
}

function updateSettingsToolSelects() {
    const sPick = document.getElementById('setting-tool-pickaxe');
    const sShovel = document.getElementById('setting-tool-shovel');
    const sAxe = document.getElementById('setting-tool-axe');
    
    if(sPick && ownedTools.pickaxe) sPick.innerHTML = ownedTools.pickaxe.map(t => `<option value="${t}" ${activeTools.pickaxe===t?'selected':''}>${t.toUpperCase()}</option>`).join('');
    if(sShovel && ownedTools.shovel) sShovel.innerHTML = ownedTools.shovel.map(t => `<option value="${t}" ${activeTools.shovel===t?'selected':''}>${t.toUpperCase()}</option>`).join('');
    if(sAxe && ownedTools.axe) sAxe.innerHTML = ownedTools.axe.map(t => `<option value="${t}" ${activeTools.axe===t?'selected':''}>${t.toUpperCase()}</option>`).join('');
}

function changeActiveTool(cat) {
    const val = document.getElementById(`setting-tool-${cat}`).value;
    activeTools[cat] = val;
    updateBlockAndToolVisuals();
    updateLobby();
    saveProgress();
}
