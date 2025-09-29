function copyEmail() {
    const emailInput = document.getElementById('email');
    emailInput.select();
    emailInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Email copied to clipboard!', 'success');
    } catch (err) {
        navigator.clipboard.writeText(emailInput.value).then(() => {
            showNotification('Email copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Copy error', 'error');
        });
    }
}

function encodeEmail(email) {
    return btoa(email.toLowerCase().trim());
}

function decodeEmail(encoded) {
    try {
        return atob(encoded);
    } catch {
        return null;
    }
}

function getBlockedEmails() {
    const blocked = localStorage.getItem('blockedEmails');
    if (!blocked) return [];
    
    try {
        return JSON.parse(blocked);
    } catch {
        return [];
    }
}

function setBlockedEmail(email) {
    const blocked = getBlockedEmails();
    const encodedEmail = encodeEmail(email);
    const timestamp = Date.now();
    
    blocked.push({ email: encodedEmail, timestamp: timestamp });
    localStorage.setItem('blockedEmails', JSON.stringify(blocked));
}

function canSendEmail(email) {
    const blocked = getBlockedEmails();
    const encodedEmail = encodeEmail(email);
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    
    const userBlock = blocked.find(block => block.email === encodedEmail);
    if (!userBlock) return true;
    
    const timeDiff = now - userBlock.timestamp;
    return timeDiff >= hours24;
}

function getTimeUntilNext(email) {
    const blocked = getBlockedEmails();
    const encodedEmail = encodeEmail(email);
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    
    const userBlock = blocked.find(block => block.email === encodedEmail);
    if (!userBlock) return null;
    
    const timeDiff = now - userBlock.timestamp;
    const remaining = hours24 - timeDiff;
    
    if (remaining <= 0) {
        removeBlockedEmail(email);
        return null;
    }
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hours}h ${minutes}m`;
}

function removeBlockedEmail(email) {
    const blocked = getBlockedEmails();
    const encodedEmail = encodeEmail(email);
    const filtered = blocked.filter(block => block.email !== encodedEmail);
    localStorage.setItem('blockedEmails', JSON.stringify(filtered));
}

function cleanupExpiredEmails() {
    const blocked = getBlockedEmails();
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    
    const active = blocked.filter(block => {
        const timeDiff = now - block.timestamp;
        return timeDiff < hours24;
    });
    
    localStorage.setItem('blockedEmails', JSON.stringify(active));
}

function copyAddress(addressId) {
    const addressInput = document.getElementById(addressId);
    addressInput.select();
    addressInput.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showNotification('Address copied to clipboard!', 'success');
    } catch (err) {
        navigator.clipboard.writeText(addressInput.value).then(() => {
            showNotification('Address copied to clipboard!', 'success');
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
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${type === 'success' ? '#155724' : '#721c24'};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
        setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

document.getElementById('osintForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const requestType = document.getElementById('requestType').value;
    const details = document.getElementById('details').value;
    const clientEmail = document.getElementById('clientEmail').value;
    
    if (!requestType || !details || !clientEmail) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    if (details.length < 20) {
        showNotification('Please provide more details (minimum 20 characters)', 'error');
        return;
    }
    
    if (!canSendEmail(clientEmail)) {
        showBlockedPopup(clientEmail);
        return;
    }
    
    const emailSubject = encodeURIComponent(`OSINT Request - ${requestType}`);
    const emailBody = encodeURIComponent(`
Research Type: ${requestType}
Details: ${details}
Client Email: ${clientEmail}

---
Request sent from OSINT Investigations website
    `);
    
    showDownloadPopup();
    
    function showDownloadPopup() {
        const popup = document.createElement('div');
        popup.id = 'downloadPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
            border: 2px solid #d4af37;
            border-radius: 20px;
            padding: 30px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            font-family: 'Cinzel', serif;
            color: #d4af37;
            min-width: 300px;
            animation: popupFadeIn 0.5s ease-out;
        `;
        
        popup.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 10px;">Preparing Download</div>
                <div style="font-size: 1rem; opacity: 0.8;">Email instructions will be downloaded in:</div>
            </div>
            <div id="countdown" style="font-size: 2.5rem; font-weight: 700; color: #f4d03f; margin: 20px 0;">3</div>
            <div style="font-size: 0.9rem; opacity: 0.7;">Please wait...</div>
        `;
        
        document.body.appendChild(popup);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 9999;
            animation: overlayFadeIn 0.3s ease-out;
        `;
        document.body.appendChild(overlay);
        
        let count = 3;
        const countdownElement = document.getElementById('countdown');
        
        const countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count;
            
            if (count <= 0) {
                clearInterval(countdownInterval);
                popup.remove();
                overlay.remove();
                executeDownload();
            }
        }, 1000);
    }
    
    function executeDownload() {
        const emailLink = `mailto:myosint@tutanota.de?subject=${emailSubject}&body=${emailBody}`;
        
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        if (isMobile) {
            window.open(emailLink);
        } else {
            const emailDomain = clientEmail.split('@')[1].toLowerCase();
            let providerUrl = '';
            
            if (emailDomain.includes('proton.me') || emailDomain.includes('protonmail.com')) {
                providerUrl = 'https://account.proton.me/mail';
            } else if (emailDomain.includes('tuta.io') || emailDomain.includes('tuta.com') || emailDomain.includes('keemail.me')) {
                providerUrl = 'https://app.tuta.com/login';
            } else if (emailDomain.includes('gmail.com')) {
                providerUrl = 'https://mail.google.com/mail/u/0/#inbox?compose=new';
            } else if (emailDomain.includes('outlook.com') || emailDomain.includes('hotmail.com') || emailDomain.includes('live.com')) {
                providerUrl = 'https://outlook.live.com/mail/0/deeplink/compose';
            } else if (emailDomain.includes('yahoo.com') || emailDomain.includes('ymail.com')) {
                providerUrl = 'https://mail.yahoo.com/d/folders/1';
            } else {
                providerUrl = `https://${emailDomain}`;
            }
            
            window.open(providerUrl, '_blank');
            
            setTimeout(() => {
                window.open(emailLink);
            }, 1000);
        }
        
        const instructions = `OSINT INVESTIGATION REQUEST INSTRUCTIONS

STEP 1: Send email to: myosint@tutanota.de
STEP 2: Subject: ${requestType.toUpperCase()} INVESTIGATION REQUEST
STEP 3: Copy and paste this message:

Research Type: ${requestType}
Details: ${details}
Client Email: ${clientEmail}

IMPORTANT:
- Send from your email: ${clientEmail}
- Include all information above
- Wait for response (24-48 hours)
- Payment details will be provided after quote

---
Generated by OSINT Investigations
Timestamp: ${new Date().toLocaleString()}`;

        const blob = new Blob([instructions], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'osint_request_instructions.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        setBlockedEmail(clientEmail);
        showNotification('Instructions downloaded. Email providers opened.', 'success');
    }
    
    function showBlockedPopup(email) {
        const timeLeft = getTimeUntilNext(email);
        
        const popup = document.createElement('div');
        popup.id = 'blockedPopup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a1a, #0f0f0f);
            border: 2px solid #d4af37;
            border-radius: 20px;
            padding: 30px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            font-family: 'Cinzel', serif;
            color: #d4af37;
            min-width: 300px;
            animation: popupFadeIn 0.5s ease-out;
        `;
        
        popup.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; color: #f4d03f;">Rate Limited</div>
                <div style="font-size: 1rem; opacity: 0.8;">You cannot send another request right now</div>
            </div>
            <div style="font-size: 1.2rem; margin: 20px 0; color: #b8860b;">
                But don't worry, you can send again in:
            </div>
            <div style="font-size: 2rem; font-weight: 700; color: #f4d03f; margin: 20px 0;">${timeLeft}</div>
            <div style="font-size: 0.9rem; opacity: 0.7;">Please wait before trying again</div>
        `;
        
        document.body.appendChild(popup);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 9999;
            animation: overlayFadeIn 0.3s ease-out;
        `;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            popup.remove();
            overlay.remove();
        }, 5000);
    }
    
    this.reset();
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

window.addEventListener('load', function() {
    const transition = document.getElementById('pageTransition');
    if (transition) {
        setTimeout(() => {
            transition.classList.add('hidden');
        }, 1800);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    cleanupExpiredEmails();
    
    const pricingCard = document.getElementById('pricingCard');
    pricingCard.addEventListener('mouseenter', function() {
        this.innerHTML = `
            <h3>Pricing</h3>
            <p><strong>Quote Based</strong> - Results dependent</p>
        `;
    });
    
    pricingCard.addEventListener('mouseleave', function() {
        this.innerHTML = `
            <h3>Complete Package</h3>
            <p>Full investigation with all available information</p>
        `;
    });
    
    const animatedElements = document.querySelectorAll('.service-card, .crypto-card, .contact-info, .request-form');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes popupFadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes overlayFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
