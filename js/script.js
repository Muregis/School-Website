// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');

function openMenu() {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileOverlay.addEventListener('click', closeMenu);

    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

// Active nav on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveLink() {
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector('.nav-link[href="#' + id + '"]');
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveLink);

// FAQ accordion
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isActive = item.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('active');
            faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
        
        if (!isActive) {
            item.classList.add('active');
            button.setAttribute('aria-expanded', 'true');
        }
    });
});

// Gallery lightbox
function initGalleryLightbox() {
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;
            
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = '<img src="' + img.src + '" alt="' + img.alt + '"><button class="lightbox-close" aria-label="Close"><i class="fas fa-times"></i></button>';
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            
            const closeBtn = lightbox.querySelector('.lightbox-close');
            closeBtn.addEventListener('click', () => {
                lightbox.remove();
                document.body.style.overflow = '';
            });
            
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.remove();
                    document.body.style.overflow = '';
                }
            });
            
            document.addEventListener('keydown', function esc(e) {
                if (e.key === 'Escape') {
                    lightbox.remove();
                    document.body.style.overflow = '';
                    document.removeEventListener('keydown', esc);
                }
            });
        });
    });
}

initGalleryLightbox();

// Contact form
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;
        
        setTimeout(() => {
            contactForm.reset();
            btn.innerHTML = 'Send Message';
            btn.disabled = false;
            formSuccess.classList.add('visible');
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => formSuccess.classList.remove('visible'), 8000);
        }, 1000);
    });
}

// Fade-up on scroll
const fadeEls = document.querySelectorAll('.program-card, .testimonial-card, .about-image, .fees-card, .gallery-item');

function checkFade() {
    fadeEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            el.classList.add('visible');
        }
    });
}

fadeEls.forEach(el => el.classList.add('fade-up'));
window.addEventListener('scroll', checkFade);
window.addEventListener('load', checkFade);

// Dynamic content loaders
async function loadJSON(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn('Could not load ' + path);
        return null;
    }
}

async function initTeam() {
    const grid = document.getElementById('team-grid');
    if (!grid) return;
    const team = await loadJSON('content/team/_index.json');
    if (!team || !team.length) {
        grid.innerHTML = '<p style="text-align:center; color: var(--muted);">Team information coming soon.</p>';
        return;
    }
    grid.innerHTML = team.map(member => `
        <div class="team-card">
            <div class="team-photo">
                <img src="${member.photo}" alt="${member.name}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--cream);color:var(--muted);font-size:3rem;\\'><i class=\\'fas fa-user\\'></i></div>'">
            </div>
            <div class="team-info">
                <h3>${member.name}</h3>
                <p class="team-role">${member.role}</p>
                <p class="team-bio">${member.bio}</p>
                ${member.years ? `<p class="team-years"><i class="fas fa-clock"></i> ${member.years}</p>` : ''}
            </div>
        </div>
    `).join('');
}

async function initNews() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;
    const posts = await loadJSON('content/news/_index.json');
    if (!posts || !posts.length) {
        grid.innerHTML = '<p style="text-align:center; color: var(--muted);">No news posts yet. Check back soon.</p>';
        return;
    }
    grid.innerHTML = posts.map(post => `
        <article class="news-card">
            ${post.image ? `<div class="news-image"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>` : ''}
            <div class="news-content">
                <time class="news-date">${post.date}</time>
                <h3>${post.title}</h3>
                <p>${post.excerpt || post.body.substring(0, 180) + '...'}</p>
                <a href="news.html#${post.slug}" class="news-link">Read more <i class="fas fa-arrow-right"></i></a>
            </div>
        </article>
    `).join('');
}

async function initGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    const items = await loadJSON('content/gallery/_index.json');
    if (!items || !items.length) {
        grid.innerHTML = '<p style="text-align:center; color: var(--muted);">Gallery coming soon.</p>';
        return;
    }
    grid.innerHTML = items.map(item => `
        <div class="gallery-item">
            <img src="${item.image}" alt="${item.alt || ''}" loading="lazy">
            <div class="gallery-overlay"><i class="fas fa-search-plus"></i><span>${item.caption || ''}</span></div>
        </div>
    `).join('');
    initGalleryLightbox();
}

async function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    const data = await loadJSON('content/events/term-dates.json');
    if (!data) return;
    let html = `
        <div class="terms-card">
            <h3>Term Dates</h3>
            <div class="term-row"><span>Term 1</span><span>${data.term1_start} — ${data.term1_end}</span></div>
            <div class="term-row"><span>Term 2</span><span>${data.term2_start} — ${data.term2_end}</span></div>
            <div class="term-row"><span>Term 3</span><span>${data.term3_start} — ${data.term3_end}</span></div>
        </div>
        <div class="events-card">
            <h3>Key Events</h3>
            ${data.events.map(ev => `
                <div class="event-row">
                    <time>${ev.date}</time>
                    <div>
                        <strong>${ev.title}</strong>
                        <p>${ev.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="info-card">
            <h3>Admissions</h3>
            <p><strong>Open Day:</strong> ${data.open_day}</p>
            <p><strong>Registration:</strong> ${data.registration}</p>
            <p style="margin-top: 16px;"><a href="index.html#contact" class="btn btn-primary">Book a Visit</a></p>
        </div>
    `;
    grid.innerHTML = html;
}

// Initialize dynamic content on page load
document.addEventListener('DOMContentLoaded', () => {
    initTeam();
    initNews();
    initGallery();
    initCalendar();
});

