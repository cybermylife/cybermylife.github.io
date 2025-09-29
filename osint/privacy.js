document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -40px 0px' };

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
    const cards = document.querySelectorAll('.category-card');
    const panel = document.getElementById('revealPanel');
    const blogTrigger = document.querySelector('.blog-trigger');
    const blogPopup = document.getElementById('blogPopup');

    if (panel) {
        const panelObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    panel.classList.add('open');
                }
            });
        }, { threshold: 0.25 });
        panelObserver.observe(panel);
    }

    if (blogTrigger && blogPopup) {
        let hoverTimeout;
        
        blogTrigger.addEventListener('mouseenter', () => {
            hoverTimeout = setTimeout(() => {
                blogPopup.style.display = 'block';
            }, 1000);
        });
        
        blogTrigger.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
        });
        
        blogTrigger.addEventListener('click', () => {
            clearTimeout(hoverTimeout);
            blogPopup.style.display = 'block';
        });
    }

    cards.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 500ms ease, transform 500ms ease';
        el.style.transitionDelay = `${i * 70}ms`;
        observer.observe(el);
    });
});

function closeBlog() {
    const blogPopup = document.getElementById('blogPopup');
    if (blogPopup) {
        blogPopup.style.display = 'none';
    }
}

function copyAddress(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.select();
        document.execCommand('copy');
        
        const button = input.nextElementSibling;
        const originalText = button.textContent;
        button.textContent = 'COPIED!';
        button.style.background = 'var(--accent-2)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'var(--accent)';
        }, 2000);
    }
}

let countdownInterval;

function showToolPopup(toolName, description, url) {
    const popup = document.getElementById('toolPopup');
    const title = document.getElementById('popupTitle');
    const desc = document.getElementById('popupDescription');
    const visitBtn = document.getElementById('popupVisitBtn');
    
    if (popup && title && desc && visitBtn) {
        title.textContent = toolName;
        desc.textContent = description;
        visitBtn.href = url;
        visitBtn.onclick = function() {
            clearInterval(countdownInterval);
            window.open(url, '_blank');
            closeToolPopup();
            return false;
        };
        popup.style.display = 'block';
        startCountdown(url);
    }
}

function startCountdown(url) {
    let timeLeft = 5;
    const visitBtn = document.getElementById('popupVisitBtn');
    const originalText = visitBtn.textContent;
    
    visitBtn.textContent = `Visit Website (${timeLeft}s)`;
    visitBtn.classList.add('countdown');
    
    countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            visitBtn.textContent = `Visit Website (${timeLeft}s)`;
        } else {
            clearInterval(countdownInterval);
            window.open(url, '_blank');
            closeToolPopup();
            visitBtn.textContent = originalText;
            visitBtn.classList.remove('countdown');
        }
    }, 1000);
}

function closeToolPopup() {
    const popup = document.getElementById('toolPopup');
    const visitBtn = document.getElementById('popupVisitBtn');
    
    if (popup) {
        popup.style.display = 'none';
        clearInterval(countdownInterval);
        if (visitBtn) {
            visitBtn.textContent = 'Visit Website';
            visitBtn.classList.remove('countdown');
        }
    }
}

