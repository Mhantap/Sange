// Elements
const videoPlayer = document.getElementById('videoPlayer');
const videoSource = document.getElementById('videoSource');
const videoOverlay = document.getElementById('videoOverlay');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const loopBtn = document.getElementById('loopBtn');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const bufferProgress = document.getElementById('bufferProgress');
const progressTooltip = document.getElementById('progressTooltip');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const speedBtn = document.getElementById('speedBtn');
const speedMenu = document.getElementById('speedMenu');
const pipBtn = document.getElementById('pipBtn');
const pipIndicator = document.getElementById('pipIndicator');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const currentTitle = document.getElementById('currentTitle');
const totalVideos = document.getElementById('totalVideos');
const searchInput = document.getElementById('searchInput');
const playlistContainer = document.getElementById('playlistContainer');
const shuffleToggle = document.getElementById('shuffleToggle');
const shuffleStatus = document.getElementById('shuffleStatus');
const loopStatus = document.getElementById('loopStatus');
const autoplayStatus = document.getElementById('autoplayStatus');
const autoStartStatus = document.getElementById('autoStartStatus');
const autoplayToggle = document.getElementById('autoplayToggle');
const autoStartToggle = document.getElementById('autoStartToggle');
const rememberVolumeToggle = document.getElementById('rememberVolumeToggle');
const rememberPositionToggle = document.getElementById('rememberPositionToggle');
const sortBtn = document.getElementById('sortBtn');
const sortDropdown = document.getElementById('sortDropdown');
const themeToggle = document.getElementById('themeToggle');
const helpBtn = document.getElementById('helpBtn');
const shortcutsHelp = document.getElementById('shortcutsHelp');
const shortcutsClose = document.getElementById('shortcutsClose');

let videos = [];
let currentVideoIndex = 0;
let filteredVideos = [];
let shuffleMode = false;
let loopMode = false;
let autoplayMode = true;
let autoStartMode = true;
let shuffledIndices = [];
let shufflePosition = 0;
let currentSort = 'number-asc';
let favorites = JSON.parse(localStorage.getItem('videoFavorites') || '[]');

// Initialize - Load saved preferences
function loadPreferences() {
    // Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.textContent = '☀️ Light';
    }

    // Volume
    if (rememberVolumeToggle.checked) {
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume !== null) {
            videoPlayer.volume = parseFloat(savedVolume);
            volumeSlider.value = parseFloat(savedVolume) * 100;
        }
    } else {
        videoPlayer.volume = 0.7;
        volumeSlider.value = 70;
    }
    videoPlayer.muted = false;

    // Autoplay
    const savedAutoplay = localStorage.getItem('autoplay');
    if (savedAutoplay !== null) {
        autoplayMode = savedAutoplay === 'true';
        autoplayToggle.checked = autoplayMode;
    }

    // Auto Start
    const savedAutoStart = localStorage.getItem('autoStart');
    if (savedAutoStart !== null) {
        autoStartMode = savedAutoStart === 'true';
        autoStartToggle.checked = autoStartMode;
    }

    // Remember checkboxes state
    const rememberVolume = localStorage.getItem('rememberVolume');
    if (rememberVolume !== null) {
        rememberVolumeToggle.checked = rememberVolume === 'true';
    }

    const rememberPosition = localStorage.getItem('rememberPosition');
    if (rememberPosition !== null) {
        rememberPositionToggle.checked = rememberPosition === 'true';
    }
}

loadPreferences();

// Shuffle array function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Generate shuffled indices
function generateShuffledIndices() {
    const indices = Array.from({length: videos.length}, (_, i) => i);
    shuffledIndices = shuffleArray(indices);
    
    // Pastikan video current ada di posisi pertama
    const currentIndex = shuffledIndices.indexOf(currentVideoIndex);
    if (currentIndex > 0) {
        [shuffledIndices[0], shuffledIndices[currentIndex]] = [shuffledIndices[currentIndex], shuffledIndices[0]];
    }
    shufflePosition = 0;
}

// Toggle shuffle mode
function toggleShuffle() {
    shuffleMode = !shuffleMode;
    
    if (shuffleMode) {
        generateShuffledIndices();
        shuffleBtn.classList.add('active');
        shuffleToggle.classList.add('active');
        shuffleStatus.textContent = 'Shuffle: ON';
        shuffleStatus.classList.add('active');
    } else {
        shuffleBtn.classList.remove('active');
        shuffleToggle.classList.remove('active');
        shuffleStatus.textContent = 'Shuffle: OFF';
        shuffleStatus.classList.remove('active');
    }
}

// Toggle loop mode
function toggleLoop() {
    loopMode = !loopMode;
    
    if (loopMode) {
        loopBtn.classList.add('active');
        loopStatus.textContent = 'Loop: ON';
        loopStatus.classList.add('active');
    } else {
        loopBtn.classList.remove('active');
        loopStatus.textContent = 'Loop: OFF';
        loopStatus.classList.remove('active');
    }
}

// Toggle autoplay
autoplayToggle.onchange = () => {
    autoplayMode = autoplayToggle.checked;
    localStorage.setItem('autoplay', autoplayMode);
    autoplayStatus.textContent = autoplayMode ? 'Autoplay: ON' : 'Autoplay: OFF';
    autoplayStatus.classList.toggle('active', autoplayMode);
};

// Toggle auto start
autoStartToggle.onchange = () => {
    autoStartMode = autoStartToggle.checked;
    localStorage.setItem('autoStart', autoStartMode);
    autoStartStatus.textContent = autoStartMode ? 'Auto Start: ON' : 'Auto Start: OFF';
    autoStartStatus.classList.toggle('active', autoStartMode);
};

// Remember volume toggle
rememberVolumeToggle.onchange = () => {
    localStorage.setItem('rememberVolume', rememberVolumeToggle.checked);
    if (rememberVolumeToggle.checked) {
        localStorage.setItem('volume', videoPlayer.volume);
    }
};

// Remember position toggle
rememberPositionToggle.onchange = () => {
    localStorage.setItem('rememberPosition', rememberPositionToggle.checked);
};

// Get next video index
function getNextVideoIndex() {
    if (loopMode) {
        return currentVideoIndex;
    }
    
    if (shuffleMode) {
        shufflePosition = (shufflePosition + 1) % shuffledIndices.length;
        return shuffledIndices[shufflePosition];
    } else {
        return (currentVideoIndex + 1) % videos.length;
    }
}

// Get previous video index
function getPrevVideoIndex() {
    if (shuffleMode) {
        shufflePosition = (shufflePosition - 1 + shuffledIndices.length) % shuffledIndices.length;
        return shuffledIndices[shufflePosition];
    } else {
        return (currentVideoIndex - 1 + videos.length) % videos.length;
    }
}

// Deteksi video yang benar-benar ada
async function detectAvailableVideos() {
    const availableVideos = [];
    
    for (const num of VIDEO_CONFIG.numbers) {
        const videoPath = `${VIDEO_CONFIG.folder}${num}${VIDEO_CONFIG.extension}`;
        
        try {
            const response = await fetch(videoPath, { method: 'HEAD' });
            if (response.ok) {
                availableVideos.push({
                    number: num,
                    title: `Video ${num}`,
                    src: videoPath,
                    isFavorite: favorites.includes(num)
                });
            }
        } catch (error) {
            console.log(`Video ${num} tidak ditemukan`);
            continue;
        }
    }
    
    return availableVideos;
}

// Sort videos
function sortVideos(videos, sortType) {
    const sorted = [...videos];
    
    switch(sortType) {
        case 'number-asc':
            sorted.sort((a, b) => a.number - b.number);
            break;
        case 'number-desc':
            sorted.sort((a, b) => b.number - a.number);
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'favorites':
            sorted.sort((a, b) => {
                if (a.isFavorite && !b.isFavorite) return -1;
                if (!a.isFavorite && b.isFavorite) return 1;
                return a.number - b.number;
            });
            break;
    }
    
    return sorted;
}

// Initialize videos
async function initializePlayer() {
    try {
        videos = await detectAvailableVideos();
        videos = sortVideos(videos, currentSort);
        filteredVideos = [...videos];
        
        totalVideos.textContent = videos.length;
        renderPlaylist();
        
        if (videos.length > 0) {
            // Mulai dengan video acak atau video terakhir dimainkan
            const lastPlayed = localStorage.getItem('lastPlayedVideo');
            if (lastPlayed && rememberPositionToggle.checked) {
                const lastIndex = videos.findIndex(v => v.number === parseInt(lastPlayed));
                currentVideoIndex = lastIndex >= 0 ? lastIndex : Math.floor(Math.random() * videos.length);
            } else {
                currentVideoIndex = Math.floor(Math.random() * videos.length);
            }
            
            loadVideo(currentVideoIndex);
            
            // Auto start video jika diaktifkan
            if (autoStartMode) {
                // Tunggu sebentar untuk memastikan video sudah siap
                setTimeout(() => {
                    videoPlayer.play().catch(error => {
                        console.log('Auto-play prevented by browser:', error);
                        // Browser mencegah autoplay, tampilkan pesan atau biarkan user klik play
                    });
                }, 500);
            } else {
                videoPlayer.pause();
            }
            updatePlayPauseIcon();
        } else {
            playlistContainer.innerHTML = '<div class="no-results">Tidak ada video ditemukan di folder assets/video/</div>';
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        playlistContainer.innerHTML = '<div class="no-results">Error memuat video</div>';
    }
}

// Toggle favorite
function toggleFavorite(videoNumber) {
    const index = favorites.indexOf(videoNumber);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(videoNumber);
    }
    
    localStorage.setItem('videoFavorites', JSON.stringify(favorites));
    
    // Update video data
    const video = videos.find(v => v.number === videoNumber);
    if (video) {
        video.isFavorite = !video.isFavorite;
    }
    
    renderPlaylist();
}

// Render playlist
function renderPlaylist() {
    playlistContainer.innerHTML = '';
    
    if (filteredVideos.length === 0) {
        playlistContainer.innerHTML = '<div class="no-results">Tidak ada video ditemukan</div>';
        return;
    }
    
    filteredVideos.forEach((video, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        if (videos[currentVideoIndex] === video) {
            item.classList.add('active');
        }
        item.innerHTML = `
            <div class="playlist-item-number">${video.number}</div>
            <div class="playlist-item-title">${video.title}</div>
            <button class="favorite-btn icon-favorite ${video.isFavorite ? 'active' : ''}" data-number="${video.number}"></button>
        `;
        
        item.onclick = (e) => {
            if (!e.target.classList.contains('favorite-btn')) {
                const videoIndex = videos.indexOf(video);
                loadVideo(videoIndex);
                
                // Update shuffle position jika shuffle mode aktif
                if (shuffleMode) {
                    shufflePosition = shuffledIndices.indexOf(videoIndex);
                }
                
                // Auto play video yang dipilih
                videoPlayer.play();
            }
        };
        
        // Favorite button
        const favBtn = item.querySelector('.favorite-btn');
        favBtn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(video.number);
        };
        
        playlistContainer.appendChild(item);
    });
}

// Load video dengan frame pertama
function loadVideo(index) {
    if (index < 0 || index >= videos.length) return;
    
    currentVideoIndex = index;
    const video = videos[index];
    
    // Show loading overlay
    videoOverlay.classList.add('show');
    
    videoSource.src = video.src;
    videoPlayer.load();
    
    // Pastikan suara aktif setiap kali load video baru
    videoPlayer.muted = false;
    videoPlayer.volume = volumeSlider.value / 100;
    
    // Load saved position
    if (rememberPositionToggle.checked) {
        const savedPosition = localStorage.getItem(`videoPosition_${video.number}`);
        if (savedPosition) {
            videoPlayer.currentTime = parseFloat(savedPosition);
        }
    }
    
    // Event listener untuk menampilkan frame pertama
    videoPlayer.addEventListener('loadeddata', function showFirstFrame() {
        if (!rememberPositionToggle.checked || !localStorage.getItem(`videoPosition_${video.number}`)) {
            videoPlayer.currentTime = 0.1;
        }
        videoOverlay.classList.remove('show');
        videoPlayer.removeEventListener('loadeddata', showFirstFrame);
    });

    videoPlayer.addEventListener('error', function(e) {
        console.error('Error loading video:', e);
        currentTitle.textContent = `Error: ${video.title}`;
        videoOverlay.classList.remove('show');
    });

    currentTitle.textContent = video.title;
    
    // Save last played video
    localStorage.setItem('lastPlayedVideo', video.number);
    
    updateMuteIcon();
    renderPlaylist();
}

// Update play/pause icon
function updatePlayPauseIcon() {
    if (videoPlayer.paused) {
        playPauseBtn.className = 'btn icon-play';
    } else {
        playPauseBtn.className = 'btn icon-pause';
    }
}

// Play/Pause
playPauseBtn.onclick = () => {
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
};

videoPlayer.onplay = updatePlayPauseIcon;
videoPlayer.onpause = updatePlayPauseIcon;

// Save video position
videoPlayer.ontimeupdate = () => {
    if (videoPlayer.duration) {
        const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
        progress.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
        
        // Save position every 5 seconds
        if (rememberPositionToggle.checked && Math.floor(videoPlayer.currentTime) % 5 === 0) {
            const video = videos[currentVideoIndex];
            localStorage.setItem(`videoPosition_${video.number}`, videoPlayer.currentTime);
        }
    }
};

// Previous
prevBtn.onclick = () => {
    const prevIndex = getPrevVideoIndex();
    loadVideo(prevIndex);
    videoPlayer.play();
};

// Next
nextBtn.onclick = () => {
    const nextIndex = getNextVideoIndex();
    loadVideo(nextIndex);
    videoPlayer.play();
};

// Shuffle button
shuffleBtn.onclick = toggleShuffle;
shuffleToggle.onclick = toggleShuffle;

// Loop button
loopBtn.onclick = toggleLoop;

// Auto play next
videoPlayer.onended = () => {
    if (autoplayMode && !loopMode) {
        nextBtn.click();
    } else if (loopMode) {
        videoPlayer.currentTime = 0;
        videoPlayer.play();
    }
};

// Progress bar
videoPlayer.onloadedmetadata = () => {
    durationEl.textContent = formatTime(videoPlayer.duration);
};

// Buffer progress
videoPlayer.onprogress = () => {
    if (videoPlayer.buffered.length > 0) {
        const buffered = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
        const duration = videoPlayer.duration;
        if (duration > 0) {
            bufferProgress.style.width = (buffered / duration * 100) + '%';
        }
    }
};

// Progress bar click and hover
progressBar.onclick = (e) => {
    if (videoPlayer.duration) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoPlayer.currentTime = percent * videoPlayer.duration;
    }
};

progressBar.onmousemove = (e) => {
    if (videoPlayer.duration) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * videoPlayer.duration;
        progressTooltip.textContent = formatTime(time);
        progressTooltip.style.left = `${e.clientX - rect.left}px`;
    }
};

// Volume
volumeSlider.oninput = () => {
    videoPlayer.volume = volumeSlider.value / 100;
    videoPlayer.muted = false;
    updateMuteIcon();
    
    if (rememberVolumeToggle.checked) {
        localStorage.setItem('volume', videoPlayer.volume);
    }
};

muteBtn.onclick = () => {
    videoPlayer.muted = !videoPlayer.muted;
    updateMuteIcon();
};

function updateMuteIcon() {
    if (videoPlayer.muted || videoPlayer.volume === 0) {
        muteBtn.className = 'btn icon-volume-mute';
    } else if (videoPlayer.volume < 0.5) {
        muteBtn.className = 'btn icon-volume-low';
    } else {
        muteBtn.className = 'btn icon-volume-high';
    }
}

// Playback speed
speedBtn.onclick = () => {
    speedMenu.classList.toggle('show');
};

document.querySelectorAll('.speed-option').forEach(option => {
    option.onclick = () => {
        const speed = parseFloat(option.dataset.speed);
        videoPlayer.playbackRate = speed;
        speedBtn.textContent = `${speed}x`;
        // Update active state
        document.querySelectorAll('.speed-option').forEach(opt => {
            opt.classList.remove('active');
        });
        option.classList.add('active');
        
        speedMenu.classList.remove('show');
    };
});

// Close speed menu when clicking outside
document.addEventListener('click', (e) => {
    if (!speedBtn.contains(e.target) && !speedMenu.contains(e.target)) {
        speedMenu.classList.remove('show');
    }
});

// Picture in Picture
pipBtn.onclick = async () => {
    try {
        if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
        } else {
            await videoPlayer.requestPictureInPicture();
        }
    } catch (error) {
        console.error('PiP error:', error);
        alert('Browser Anda tidak mendukung Picture-in-Picture');
    }
};

videoPlayer.addEventListener('enterpictureinpicture', () => {
    pipIndicator.classList.add('show');
    pipBtn.classList.add('active');
});

videoPlayer.addEventListener('leavepictureinpicture', () => {
    pipIndicator.classList.remove('show');
    pipBtn.classList.remove('active');
});

// Fullscreen
fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
        videoPlayer.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
};

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.style.transform = 'rotate(45deg)';
    } else {
        fullscreenBtn.style.transform = 'rotate(0deg)';
    }
});

// Search
searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();
    filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.number.toString().includes(query)
    );
    renderPlaylist();
};

// Sort functionality
sortBtn.onclick = () => {
    sortDropdown.classList.toggle('show');
};

document.querySelectorAll('.sort-option').forEach(option => {
    option.onclick = () => {
        currentSort = option.dataset.sort;
        
        // Update active state
        document.querySelectorAll('.sort-option').forEach(opt => {
            opt.classList.remove('active');
        });
        option.classList.add('active');
        
        // Sort videos
        videos = sortVideos(videos, currentSort);
        
        // Apply search filter if active
        const query = searchInput.value.toLowerCase();
        if (query) {
            filteredVideos = videos.filter(video => 
                video.title.toLowerCase().includes(query) ||
                video.number.toString().includes(query)
            );
        } else {
            filteredVideos = [...videos];
        }
        
        renderPlaylist();
        sortDropdown.classList.remove('show');
    };
});

// Close sort dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
        sortDropdown.classList.remove('show');
    }
});

// Theme toggle
themeToggle.onclick = () => {
    document.body.classList.toggle('light-theme');
    
    if (document.body.classList.contains('light-theme')) {
        themeToggle.textContent = '☀️ Light';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.textContent = '🌙 Dark';
        localStorage.setItem('theme', 'dark');
    }
};

// Help/Shortcuts
helpBtn.onclick = () => {
    shortcutsHelp.classList.add('show');
};

shortcutsClose.onclick = () => {
    shortcutsHelp.classList.remove('show');
};

// Close shortcuts help when clicking outside
shortcutsHelp.onclick = (e) => {
    if (e.target === shortcutsHelp) {
        shortcutsHelp.classList.remove('show');
    }
};

// Format time
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Keyboard shortcuts
document.onkeydown = (e) => {
    // Ignore if typing in search box
    if (e.target === searchInput) return;
    
    // Ignore if shortcuts help is open and pressing Escape
    if (shortcutsHelp.classList.contains('show') && e.key === 'Escape') {
        shortcutsHelp.classList.remove('show');
        return;
    }
    
    switch(e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            playPauseBtn.click();
            break;
            
        case 'arrowright':
            e.preventDefault();
            videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 5);
            break;
            
        case 'arrowleft':
            e.preventDefault();
            videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 5);
            break;
            
        case 'arrowup':
            e.preventDefault();
            videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
            volumeSlider.value = videoPlayer.volume * 100;
            videoPlayer.muted = false;
            updateMuteIcon();
            if (rememberVolumeToggle.checked) {
                localStorage.setItem('volume', videoPlayer.volume);
            }
            break;
            
        case 'arrowdown':
            e.preventDefault();
            videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
            volumeSlider.value = videoPlayer.volume * 100;
            updateMuteIcon();
            if (rememberVolumeToggle.checked) {
                localStorage.setItem('volume', videoPlayer.volume);
            }
            break;
            
        case 'm':
            e.preventDefault();
            muteBtn.click();
            break;
            
        case 'f':
            e.preventDefault();
            fullscreenBtn.click();
            break;
            
        case 'i':
            e.preventDefault();
            pipBtn.click();
            break;
            
        case 'n':
            e.preventDefault();
            nextBtn.click();
            break;
            
        case 'p':
            e.preventDefault();
            prevBtn.click();
            break;
            
        case 's':
            e.preventDefault();
            toggleShuffle();
            break;
            
        case 'l':
            e.preventDefault();
            toggleLoop();
            break;
            
        case '?':
            e.preventDefault();
            shortcutsHelp.classList.toggle('show');
            break;
            
        case 'escape':
            e.preventDefault();
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            if (speedMenu.classList.contains('show')) {
                speedMenu.classList.remove('show');
            }
            if (sortDropdown.classList.contains('show')) {
                sortDropdown.classList.remove('show');
            }
            break;
            
        // Number keys for speed control
        case '1':
            e.preventDefault();
            videoPlayer.playbackRate = 1;
            speedBtn.textContent = '1x';
            document.querySelectorAll('.speed-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.speed === '1');
            });
            break;
            
        case '2':
            e.preventDefault();
            videoPlayer.playbackRate = 2;
            speedBtn.textContent = '2x';
            document.querySelectorAll('.speed-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.speed === '2');
            });
            break;
            
        case '0':
            e.preventDefault();
            videoPlayer.currentTime = 0;
            break;
    }
};

// Double click to fullscreen
videoPlayer.ondblclick = () => {
    fullscreenBtn.click();
};

// Prevent context menu on video
videoPlayer.oncontextmenu = (e) => {
    e.preventDefault();
    return false;
};

// Show loading overlay when video is loading
videoPlayer.addEventListener('waiting', () => {
    videoOverlay.classList.add('show');
});

videoPlayer.addEventListener('canplay', () => {
    videoOverlay.classList.remove('show');
});

// Handle video errors
videoPlayer.addEventListener('error', (e) => {
    console.error('Video error:', e);
    videoOverlay.classList.remove('show');
    
    // Try to skip to next video if current fails
    if (autoplayMode) {
        setTimeout(() => {
            nextBtn.click();
        }, 2000);
    }
});

// Prevent video from being downloaded easily
videoPlayer.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Update status badges on load
autoplayStatus.textContent = autoplayMode ? 'Autoplay: ON' : 'Autoplay: OFF';
autoplayStatus.classList.toggle('active', autoplayMode);

autoStartStatus.textContent = autoStartMode ? 'Auto Start: ON' : 'Auto Start: OFF';
autoStartStatus.classList.toggle('active', autoStartMode);

// Media Session API for media controls
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
        videoPlayer.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
        videoPlayer.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevBtn.click();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextBtn.click();
    });

    navigator.mediaSession.setActionHandler('seekbackward', () => {
        videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 10);
    });

    navigator.mediaSession.setActionHandler('seekforward', () => {
        videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 10);
    });

    // Update metadata when video changes
    videoPlayer.addEventListener('loadedmetadata', () => {
        const video = videos[currentVideoIndex];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: video.title,
            artist: 'Video Player',
            album: 'My Videos',
        });
    });
}

// Visibility change - pause when tab is hidden (optional)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Optionally pause video when tab is hidden
        // videoPlayer.pause();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Save current video position
    if (rememberPositionToggle.checked) {
        const video = videos[currentVideoIndex];
        localStorage.setItem(`videoPosition_${video.number}`, videoPlayer.currentTime);
    }
});

// Start the app
initializePlayer();

// Show welcome message
console.log('%c🎬 Video Player', 'font-size: 20px; font-weight: bold; color: #ff0000;');
console.log('%cTekan ? untuk melihat keyboard shortcuts', 'font-size: 12px; color: #666;');
