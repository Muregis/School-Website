// Gracious Love Academy - Main Interactive Script

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initFAQ();
    initContactAndBooking();
    initDynamicContent();
});

/* ==========================================================================
   NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const closeBtn = document.getElementById('mobile-close');

    // Sticky shadow on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar && navbar.classList.add('scrolled');
        } else {
            navbar && navbar.classList.remove('scrolled');
        }
    });

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('active');
        mobileOverlay && mobileOverlay.classList.add('active');
        hamburger && hamburger.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('active');
        mobileOverlay && mobileOverlay.classList.remove('active');
        hamburger && hamburger.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMobileMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Active nav link highlight on scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`) || 
                         document.querySelector(`.nav-link[href="index.html#${id}"]`);
            if (link) {
                if (scrollY >= top && scrollY < top + height) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });
    });
}

/* ==========================================================================
   SCROLL REVEAL & FADE EFFECTS
   ========================================================================== */
function initScrollEffects() {
    const fadeEls = document.querySelectorAll('.fade-up');

    function checkFade() {
        const trigger = window.innerHeight * 0.88;
        fadeEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < trigger) {
                el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkFade);
    window.addEventListener('load', checkFade);
    setTimeout(checkFade, 100);
}

/* ==========================================================================
   FAQ ACCORDION
   ========================================================================== */
function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');
    questions.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('.faq-item');
            const isActive = item.classList.contains('active');
            const answer = item.querySelector('.faq-answer');

            // Close siblings
            document.querySelectorAll('.faq-item').forEach(other => {
                if (other !== item) {
                    other.classList.remove('active');
                    const otherBtn = other.querySelector('.faq-question');
                    const otherAns = other.querySelector('.faq-answer');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAns) otherAns.style.maxHeight = null;
                }
            });

            if (!isActive) {
                item.classList.add('active');
                button.setAttribute('aria-expanded', 'true');
                if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                button.setAttribute('aria-expanded', 'false');
                if (answer) answer.style.maxHeight = null;
            }
        });
    });
}

/* ==========================================================================
   INTERACTIVE GALLERY & LIGHTBOX MODAL
   ========================================================================== */
let currentGalleryItems = [];
let currentLightboxIndex = 0;

function setupGalleryLightbox(items) {
    currentGalleryItems = items;
    const cards = document.querySelectorAll('.gallery-card');

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            openLightbox(index);
        });
    });
}

function openLightbox(index) {
    if (!currentGalleryItems || !currentGalleryItems.length) return;
    currentLightboxIndex = (index + currentGalleryItems.length) % currentGalleryItems.length;
    const item = currentGalleryItems[currentLightboxIndex];

    let modal = document.getElementById('lightbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.className = 'lightbox-modal';
        modal.innerHTML = `
            <div class="lightbox-content-box">
                <button class="lightbox-close-btn" id="lightbox-close" aria-label="Close Gallery">&times;</button>
                <button class="lightbox-nav-btn lightbox-prev" id="lightbox-prev" aria-label="Previous Photo"><i class="fas fa-chevron-left"></i></button>
                <button class="lightbox-nav-btn lightbox-next" id="lightbox-next" aria-label="Next Photo"><i class="fas fa-chevron-right"></i></button>
                <div class="lightbox-img-wrap">
                    <img id="lightbox-img" src="" alt="">
                </div>
                <div class="lightbox-caption-bar">
                    <div class="lightbox-title" id="lightbox-title"></div>
                    <div class="lightbox-counter" id="lightbox-counter"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Events
        modal.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
        modal.querySelector('#lightbox-prev').addEventListener('click', () => openLightbox(currentLightboxIndex - 1));
        modal.querySelector('#lightbox-next').addEventListener('click', () => openLightbox(currentLightboxIndex + 1));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') openLightbox(currentLightboxIndex - 1);
            if (e.key === 'ArrowRight') openLightbox(currentLightboxIndex + 1);
        });
    }

    const img = modal.querySelector('#lightbox-img');
    const title = modal.querySelector('#lightbox-title');
    const counter = modal.querySelector('#lightbox-counter');

    img.src = item.image;
    img.alt = item.alt || item.caption;
    title.textContent = item.caption || item.alt || 'Gracious Love Academy Life';
    counter.textContent = `${currentLightboxIndex + 1} of ${currentGalleryItems.length}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ==========================================================================
   CONTACT FORM & VISIT BOOKING
   ========================================================================== */
function initContactAndBooking() {
    const form = document.getElementById('contact-form') || document.getElementById('visit-booking-form');
    const successBanner = document.getElementById('form-success');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Your Booking...';

            // Gather inputs
            const name = form.querySelector('#name') ? form.querySelector('#name').value : '';
            const phone = form.querySelector('#phone') ? form.querySelector('#phone').value : '';
            const grade = form.querySelector('#inquiry_type') || form.querySelector('#grade') ? (form.querySelector('#inquiry_type') || form.querySelector('#grade')).value : '';
            const message = form.querySelector('#message') ? form.querySelector('#message').value : '';

            setTimeout(() => {
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                if (successBanner) {
                    successBanner.classList.add('visible');
                    successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // Friendly prompt to also connect on WhatsApp for instant response
                const waConfirmation = confirm("Thank you! Your visit inquiry has been received. Would you also like to open WhatsApp to chat with the Headteacher directly now?");
                if (waConfirmation) {
                    const text = encodeURIComponent(`Hello Gracious Love Academy, I just submitted an inquiry for my child (${grade || 'Admission'}). My name is ${name}. Phone: ${phone}.`);
                    window.open(`https://wa.me/254727345438?text=${text}`, '_blank');
                }
            }, 1000);
        });
    }
}

/* ==========================================================================
   DYNAMIC CONTENT LOADERS (API FIRST -> JSON FALLBACK)
   ========================================================================== */
async function fetchContent(apiEndpoint, fallbackPath) {
    try {
        const res = await fetch(apiEndpoint);
        if (res.ok) return await res.json();
    } catch (e) {
        // Fall back to local json
    }
    try {
        const fallbackRes = await fetch(fallbackPath);
        if (fallbackRes.ok) return await fallbackRes.json();
    } catch (e) {
        console.warn(`Could not load content for ${fallbackPath}`);
    }
    return null;
}

async function initDynamicContent() {
    // 1. Team
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
        const teamData = await fetchContent('/api/content/team', 'content/team/_index.json');
        if (teamData && teamData.length) {
            teamGrid.innerHTML = teamData.map(m => `
                <div class="team-card fade-up visible">
                    <div class="team-photo-wrap">
                        <img src="${m.photo}" alt="${m.name}" loading="lazy" onerror="this.src='images/gallery-1.jpeg'">
                    </div>
                    <div class="team-info-box">
                        <h3 class="team-name">${m.name}</h3>
                        <p class="team-role">${m.role}</p>
                        <p class="team-bio">${m.bio}</p>
                        <div>
                            <span class="team-meta-pill"><i class="fas fa-graduation-cap"></i> ${m.years || 'Certified CBC Educator'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // 2. News
    const newsGrid = document.getElementById('news-grid');
    if (newsGrid) {
        const newsData = await fetchContent('/api/content/news', 'content/news/_index.json');
        if (newsData && newsData.length) {
            newsGrid.innerHTML = newsData.map(post => `
                <article class="news-card fade-up visible">
                    <div class="news-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy" onerror="this.src='images/gallery-4.jpeg'">
                    </div>
                    <div class="news-content">
                        <time class="news-date"><i class="fas fa-calendar-day"></i> ${formatNewsDate(post.date)}</time>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt || post.body.substring(0, 160) + '...'}</p>
                        <a href="news.html#${post.slug}" class="news-link">Read Story <i class="fas fa-arrow-right"></i></a>
                    </div>
                </article>
            `).join('');
        }
    }

    // 3. Gallery
    const galleryGrid = document.getElementById('gallery-grid');
    const filterContainer = document.getElementById('gallery-filters');
    if (galleryGrid) {
        const galleryItems = await fetchContent('/api/content/gallery', 'content/gallery/_index.json');
        if (galleryItems && galleryItems.length) {
            renderGallery(galleryItems, 'All');
            setupGalleryLightbox(galleryItems);

            if (filterContainer) {
                filterContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        filterContainer.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        const cat = btn.getAttribute('data-filter') || 'All';
                        renderGallery(galleryItems, cat);
                    });
                });
            }
        }
    }

    // 4. Calendar
    const calendarGrid = document.getElementById('calendar-grid');
    if (calendarGrid) {
        const calData = await fetchContent('/api/content/events', 'content/events/term-dates.json');
        if (calData) {
            renderCalendar(calendarGrid, calData);
        }
    }
}

function renderGallery(items, filter) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    const filtered = filter === 'All' ? items : items.filter(it => it.category === filter);

    grid.innerHTML = filtered.map((item, idx) => `
        <div class="gallery-card fade-up visible" data-index="${idx}">
            <img src="${item.image}" alt="${item.alt || item.caption}" loading="lazy">
            <div class="gallery-card-overlay">
                <span class="gallery-card-tag">${item.category || 'School Life'}</span>
                <p class="gallery-card-caption">${item.caption}</p>
            </div>
            <div class="gallery-zoom-icon">
                <i class="fas fa-expand"></i>
            </div>
        </div>
    `).join('');

    setupGalleryLightbox(filtered);
}

function renderCalendar(container, data) {
    container.innerHTML = `
        <div class="term-cards-grid">
            <div class="term-banner-card active-term">
                <span class="term-badge-tag">Current Term</span>
                <h3>Term 1 — Academic Year 2026</h3>
                <div class="term-dates-detail">
                    <div class="date-row"><span>Opening Date:</span><strong>${data.term1_start || '5th Jan 2026'}</strong></div>
                    <div class="date-row"><span>Half-Term Break:</span><strong>${data.term1_halfterm || '25th Feb – 1st Mar'}</strong></div>
                    <div class="date-row"><span>Closing Date:</span><strong>${data.term1_end || '1st Apr 2026'}</strong></div>
                </div>
            </div>
            <div class="term-banner-card">
                <span class="term-badge-tag">Upcoming</span>
                <h3>Term 2 — Academic Year 2026</h3>
                <div class="term-dates-detail">
                    <div class="date-row"><span>Opening Date:</span><strong>${data.term2_start || '27th Apr 2026'}</strong></div>
                    <div class="date-row"><span>Half-Term Break:</span><strong>${data.term2_halfterm || '24th Jun – 28th Jun'}</strong></div>
                    <div class="date-row"><span>Closing Date:</span><strong>${data.term2_end || '31st Jul 2026'}</strong></div>
                </div>
            </div>
            <div class="term-banner-card">
                <span class="term-badge-tag">Final Term</span>
                <h3>Term 3 & KPSEA CBC Assessments</h3>
                <div class="term-dates-detail">
                    <div class="date-row"><span>Opening Date:</span><strong>${data.term3_start || '24th Aug 2026'}</strong></div>
                    <div class="date-row"><span>National Assessments:</span><strong>${data.cbc_assessment || '26th Oct – 29th Oct'}</strong></div>
                    <div class="date-row"><span>Closing Date:</span><strong>${data.term3_end || '3rd Oct 2026'}</strong></div>
                </div>
            </div>
        </div>
        <div class="events-list-wrap">
            <h3><i class="fas fa-calendar-star"></i> Key Academy Milestones</h3>
            <div class="events-timeline">
                ${data.events.map(ev => `
                    <div class="event-item">
                        <div class="event-date-badge">
                            <span class="event-date-month">${formatMonth(ev.date)}</span>
                            <span class="event-date-day">${formatDay(ev.date)}</span>
                        </div>
                        <div class="event-text">
                            <strong>${ev.title}</strong>
                            <p>${ev.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 28px; text-align: center;">
                <a href="https://wa.me/254727345438?text=Hello%20Gracious%20Love%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20upcoming%20term%20dates%20and%20enrollment." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-block">
                    <i class="fab fa-whatsapp"></i> Inquire on Term Dates via WhatsApp
                </a>
            </div>
        </div>
    `;
}

function formatNewsDate(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
}

function formatMonth(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-KE', { month: 'short' });
    } catch {
        return '';
    }
}

function formatDay(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.getDate();
    } catch {
        return '';
    }
}
