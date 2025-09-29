const contactData = {
    signal: {
        title: 'Signal',
        value: 'rsa40.96'
    },
    session: {
        title: 'Session',
        value: '05c66da5046fd0d003475ecb612ca60f6cc9e6467a2c0390547e23c9593d00eb60'
    },
    mail: {
        title: 'Email',
        value: 'myosint@tutanota.de'
    }
};

let currentViews = 0;
let hasIncrementedView = false;

function detectLogo() {
    const logoExtensions = ['png', 'jpg', 'jpeg'];
    const logoPaths = ['/profile/logo', './profile/logo', 'profile/logo'];
    
    for (const path of logoPaths) {
        for (const ext of logoExtensions) {
            const fullPath = `${path}.${ext}`;
            const img = new Image();
            img.onload = function() {
                document.getElementById('profileImg').src = fullPath;
                console.log('Logo found:', fullPath);
            };
            img.onerror = function() {
                console.log('Logo not found:', fullPath);
            };
            img.src = fullPath;
        }
    }
}

function detectMusic() {
    const musicExtensions = ['mp3', 'wav', 'ogg'];
    const musicPaths = ['/profile/music', './profile/music', 'profile/music'];
    let musicFound = false;
    
    for (const path of musicPaths) {
        for (const ext of musicExtensions) {
            const fullPath = `${path}.${ext}`;
            const audio = new Audio();
            audio.oncanplaythrough = function() {
                if (!musicFound) {
                    document.getElementById('backgroundMusic').src = fullPath;
                    document.getElementById('backgroundMusic').volume = 0.5;
                    document.getElementById('backgroundMusic').play().then(() => {
                        console.log('Music started:', fullPath);
                    }).catch((error) => {
                        console.log('Music autoplay blocked:', error);
                    });
                    musicFound = true;
                }
            };
            audio.onerror = function() {
                console.log('Music not found:', fullPath);
            };
            audio.src = fullPath;
        }
    }
    
    if (!musicFound) {
        setTimeout(() => {
            console.log('No music file found, continuing without music');
        }, 1000);
    }
}

function setupVolumeControl() {
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const volumeIcon = document.getElementById('volumeIcon');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    volumeSlider.addEventListener('input', function() {
        const volume = this.value / 100;
        backgroundMusic.volume = volume;
        volumeValue.textContent = this.value + '%';
        
        if (volume === 0) {
            volumeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
        } else if (volume < 0.5) {
            volumeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>';
        } else {
            volumeIcon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        }
    });
    
    backgroundMusic.volume = 0.5;
}

function incrementView() {
    if (hasIncrementedView) return;
    
    const viewKey = 'profile_view_' + getDateString();
    const hasViewedToday = localStorage.getItem(viewKey);
    
    if (!hasViewedToday) {
        currentViews++;
        localStorage.setItem(viewKey, 'true');
        hasIncrementedView = true;
        updateViewCounter();
        saveViews();
    }
}

function getDateString() {
    const today = new Date();
    return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
}

function updateViewCounter() {
    document.getElementById('viewCount').textContent = currentViews.toLocaleString();
}

function loadViews() {
    const savedViews = localStorage.getItem('profile_views');
    if (savedViews) {
        currentViews = parseInt(savedViews);
    }
    updateViewCounter();
}

function saveViews() {
    localStorage.setItem('profile_views', currentViews.toString());
}

function openContactPopup(type) {
    console.log('Opening popup for:', type);
    const modal = document.getElementById('contactModal');
    const title = document.getElementById('modalTitle');
    const value = document.getElementById('contactValue');
    
    if (!modal || !title || !value) {
        console.error('Modal elements not found');
        return;
    }
    
    title.textContent = contactData[type].title;
    value.value = contactData[type].value;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    console.log('Popup opened');
}

function closeContactPopup() {
    const modal = document.getElementById('contactModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function copyContact() {
    const input = document.getElementById('contactValue');
    input.select();
    input.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        navigator.clipboard.writeText(input.value).then(() => {
            showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Copy error', 'error');
        });
    }
}

function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: ${type === 'success' ? 'rgba(78, 205, 196, 0.9)' : 'rgba(255, 107, 107, 0.9)'};
        color: ${type === 'success' ? '#000000' : '#ffffff'};
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        font-size: 0.9rem;
        animation: slideInRight 0.3s ease-out;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const touchScreen = document.getElementById('touchScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            touchScreen.style.display = 'flex';
        }, 500);
    }, 2000);
}

function enterSite() {
    const touchScreen = document.getElementById('touchScreen');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    touchScreen.classList.add('hidden');
    
    setTimeout(() => {
        touchScreen.style.display = 'none';
        
        if (backgroundMusic.src) {
            backgroundMusic.play().then(() => {
                console.log('Music started after touch');
            }).catch((error) => {
                console.log('Music still blocked:', error);
            });
        }
    }, 500);
}

function createHackerParticles() {
    const particlesContainer = document.getElementById('hackerParticles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
        particlesContainer.appendChild(particle);
    }
}

function setupCustomCursor() {
    const cursor = document.getElementById('customCursor');
    const ring = document.getElementById('customCursorRing');
    
    let cursorX = 0, cursorY = 0;
    let targetX = 0, targetY = 0;
    let rafActive = false;

    function animateCursor() {
        const dx = targetX - cursorX;
        const dy = targetY - cursorY;
        cursorX += dx * 0.2;
        cursorY += dy * 0.2;
        cursor.style.transform = `translate3d(${cursorX - 9}px, ${cursorY - 9}px, 0)`;
        ring.style.transform = `translate3d(${cursorX - 18}px, ${cursorY - 18}px, 0)`;
        rafActive = true;
        requestAnimationFrame(animateCursor);
    }

    document.addEventListener('mousemove', function(e) {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!rafActive) animateCursor();
    });
    
    document.addEventListener('mouseenter', function() {
        cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', function() {
        cursor.style.opacity = '0';
    });
    
    const hoverElements = document.querySelectorAll('a, button, input, textarea, select, .social-link, .nav-link');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            cursor.classList.add('hover');
            ring.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', function() {
            cursor.classList.remove('hover');
            ring.classList.remove('hover');
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    detectLogo();
    detectMusic();
    setupVolumeControl();
    loadViews();
    incrementView();
    hideLoadingScreen();
    createHackerParticles();
    setupCustomCursor();
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('contactModal');
        if (event.target === modal) {
            closeContactPopup();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeContactPopup();
        }
    });
    
    document.addEventListener('click', function() {
        const backgroundMusic = document.getElementById('backgroundMusic');
        if (backgroundMusic.paused && backgroundMusic.src) {
            backgroundMusic.play().catch(() => {
                console.log('Music autoplay blocked by browser');
            });
        }
    });
    
    document.addEventListener('touchstart', function() {
        const backgroundMusic = document.getElementById('backgroundMusic');
        if (backgroundMusic.paused && backgroundMusic.src) {
            backgroundMusic.play().catch(() => {
                console.log('Music autoplay blocked by browser');
            });
        }
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);