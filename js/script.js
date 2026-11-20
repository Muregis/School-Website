// Gracious Love Academy - Ultra-Smooth, Network-Resilient Interactive Script

// 1. Register Service Worker for Offline / Bad Internet Caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
            // Silently fallback if SW is blocked or unsupported
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initFAQ();
    initContactAndBooking();
    initPreRenderedGallery();
    initDynamicContent();
});

/* ==========================================================================
   NAVIGATION & MOBILE MENU (TOUCH OPTIMIZED)
   ========================================================================== */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const closeBtn = document.getElementById('mobile-close');

    let ticking = false;

    // Smooth, passive scroll listener
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 40) {
                    navbar && navbar.classList.add('scrolled');
                } else {
                    navbar && navbar.classList.remove('scrolled');
                }
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

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
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
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

    // Active nav link highlight
    const sections = document.querySelectorAll('section[id]');
    function updateActiveLink() {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const top = section.offsetTop - 140;
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
    }
}

/* ==========================================================================
   SCROLL REVEAL & FADE EFFECTS (HARDWARE ACCELERATED)
   ========================================================================== */
function initScrollEffects() {
    const fadeEls = document.querySelectorAll('.fade-up');
    if (!fadeEls.length) return;

    // Use IntersectionObserver when available for 60fps buttery-smooth scroll
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -40px 0px',
            threshold: 0.1
        });

        fadeEls.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        function checkFade() {
            const trigger = window.innerHeight * 0.9;
            fadeEls.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < trigger) {
                    el.classList.add('visible');
                }
            });
        }
        window.addEventListener('scroll', checkFade, { passive: true });
        setTimeout(checkFade, 100);
    }
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

function initPreRenderedGallery() {
    const cards = document.querySelectorAll('.gallery-card');
    if (cards && cards.length) {
        currentGalleryItems = Array.from(cards).map(card => ({
            image: card.querySelector('img')?.getAttribute('src') || '',
            caption: card.querySelector('.gallery-card-caption')?.textContent?.trim() || '',
            category: card.querySelector('.gallery-card-tag')?.textContent?.trim() || 'School Life',
            alt: card.querySelector('img')?.getAttribute('alt') || ''
        }));
        cards.forEach((card, idx) => {
            card.onclick = () => openLightbox(idx);
        });
    }

    const filterContainer = document.getElementById('gallery-filters');
    if (filterContainer) {
        filterContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                filterContainer.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const cat = btn.getAttribute('data-filter') || 'All';
                filterGalleryDOM(cat);
            });
        });
    }
}

function filterGalleryDOM(cat) {
    const cards = document.querySelectorAll('.gallery-card');
    let visibleIndex = 0;
    const visibleItems = [];
    cards.forEach(card => {
        const tag = card.querySelector('.gallery-card-tag')?.textContent?.trim() || '';
        if (cat === 'All' || tag === cat) {
            card.style.display = '';
            const thisIdx = visibleIndex++;
            card.onclick = () => openLightbox(thisIdx);
            visibleItems.push({
                image: card.querySelector('img')?.getAttribute('src') || '',
                caption: card.querySelector('.gallery-card-caption')?.textContent?.trim() || '',
                category: tag,
                alt: card.querySelector('img')?.getAttribute('alt') || ''
            });
        } else {
            card.style.display = 'none';
        }
    });
    currentGalleryItems = visibleItems;
}

function setupGalleryLightbox(items) {
    currentGalleryItems = items;
    const cards = document.querySelectorAll('.gallery-card');

    cards.forEach((card, index) => {
        card.onclick = () => {
            openLightbox(index);
        };
    });
}

function openLightbox(index) {
    if (!currentGalleryItems || !currentGalleryItems.length) {
        const cards = Array.from(document.querySelectorAll('.gallery-card')).filter(c => c.style.display !== 'none');
        currentGalleryItems = cards.map(c => ({
            image: c.querySelector('img')?.getAttribute('src') || '',
            caption: c.querySelector('.gallery-card-caption')?.textContent?.trim() || '',
            category: c.querySelector('.gallery-card-tag')?.textContent?.trim() || 'School Life',
            alt: c.querySelector('img')?.getAttribute('alt') || ''
        }));
    }
    if (!currentGalleryItems || !currentGalleryItems.length) return;
    currentLightboxIndex = ((index % currentGalleryItems.length) + currentGalleryItems.length) % currentGalleryItems.length;
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
                    <img id="lightbox-img" src="" alt="" decoding="async">
                </div>
                <div class="lightbox-caption-bar">
                    <div class="lightbox-title" id="lightbox-title"></div>
                    <div class="lightbox-counter" id="lightbox-counter"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('#lightbox-close').addEventListener('click', closeLightbox);
        modal.querySelector('#lightbox-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(currentLightboxIndex - 1);
        });
        modal.querySelector('#lightbox-next').addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(currentLightboxIndex + 1);
        });
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

            const name = form.querySelector('#name') ? form.querySelector('#name').value : '';
            const phone = form.querySelector('#phone') ? form.querySelector('#phone').value : '';
            const grade = form.querySelector('#inquiry_type') || form.querySelector('#grade') ? (form.querySelector('#inquiry_type') || form.querySelector('#grade')).value : '';

            setTimeout(() => {
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                if (successBanner) {
                    successBanner.classList.add('visible');
                    successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                const waConfirmation = confirm("Thank you! Your 2027 visit inquiry has been received. Would you like to open WhatsApp to chat with the Headteacher directly now?");
                if (waConfirmation) {
                    const text = encodeURIComponent(`Hello Gracious Love Academy, I just submitted a 2027 visit inquiry for my child (${grade || '2027 Admission'}). My name is ${name}. Phone: ${phone}.`);
                    window.open(`https://wa.me/254727345438?text=${text}`, '_blank');
                }
            }, 800);
        });
    }
}

/* ==========================================================================
   NETWORK-RESILIENT FAST CONTENT FETCHER WITH TIMEOUT & LOCAL STORAGE CACHING
   ========================================================================== */
async function fetchWithTimeout(url, timeoutMs = 1800) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.ok) return await response.json();
    } catch (e) {
        clearTimeout(timeoutId);
    }
    return null;
}

async function fetchContent(filePath) {
    const cacheKey = 'gla_v2027_team_' + filePath;
    
    // 1. Instant return from local cache if available (zero-delay on bad networks)
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Trigger background update without blocking UI
            backgroundSync(filePath, cacheKey);
            return parsed;
        }
    } catch (e) {}

    // 2. Fast network attempt directly to static json file
    const data = await fetchWithTimeout(filePath, 2000);

    if (data) {
        try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch (e) {}
    }
    return data;
}

// Background sync to keep cache fresh without freezing mobile thread
function backgroundSync(filePath, cacheKey) {
    setTimeout(async () => {
        try {
            const fresh = await fetchWithTimeout(filePath, 3000);
            if (fresh) {
                localStorage.setItem(cacheKey, JSON.stringify(fresh));
            }
        } catch (e) {}
    }, 2000);
}

/* ==========================================================================
   DYNAMIC CONTENT INITIALIZATION
   ========================================================================== */
async function initDynamicContent() {
    // 1. Team
    const teamGrid = document.getElementById('team-grid');
    if (teamGrid) {
        const teamData = await fetchContent('content/team/_index.json');
        if (teamData && teamData.length) {
            teamGrid.innerHTML = teamData.map(m => `
                <div class="team-card fade-up visible">
                    <div class="team-photo-wrap">
                        <img src="${m.photo}" alt="${m.name}" loading="lazy" decoding="async" onerror="this.src='images/gallery-1.jpeg'">
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
        const newsData = await fetchContent('content/news/_index.json');
        if (newsData && newsData.length) {
            newsGrid.innerHTML = newsData.map(post => `
                <article class="news-card fade-up visible">
                    <div class="news-image">
                        <img src="${post.image}" alt="${post.title}" loading="lazy" decoding="async" onerror="this.src='images/gallery/pp2-graduates-certificates.jpg'">
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
        const galleryItems = await fetchContent('content/gallery/_index.json');
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
        const calData = await fetchContent('content/events/term-dates.json');
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
            <img src="${item.image}" alt="${item.alt || item.caption}" loading="lazy" decoding="async">
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
    const year = data.academic_year || '2027';
    container.innerHTML = `
        <div class="term-cards-grid">
            <div class="term-banner-card active-term">
                <span class="term-badge-tag"><i class="fas fa-flag-checkered"></i> Upcoming Intake</span>
                <h3>Term 1 — Academic Year ${year}</h3>
                <div class="term-dates-detail">
                    <div class="date-row"><span>Opening Date:</span><strong>${data.term1_start || '4th Jan 2027'}</strong></div>
                    <div class="date-row"><span>Half-Term Break:</span><strong>${data.term1_halfterm || '24th Feb – 28th Feb 2027'}</strong></div>
                    <div class="date-row"><span>Closing Date:</span><strong>${data.term1_end || '2nd Apr 2027'}</strong></div>
                </div>
            </div>
            <div class="term-banner-card">
                <span class="term-badge-tag">Term 2</span>
                <h3>Term 2 — Academic Year ${year}</h3>
                <div class="term-dates-detail">
                    <div class="date-row"><span>Opening Date:</span><strong>${data.term2_start || '26th Apr 2027'}</strong></div>
                    <div class="date-row"><span>Half-Term Break:</span><strong>${data.term2_halfterm || '23rd Jun – 27th Jun 2027'}</strong></div>
                    <div class="date-row"><span>Closing Date:</span><strong>${data.term2_end || '30th Jul 2027'}</strong></div>
                </div>
            </div>
            <div class="term-banner-card">
                <span class="term-badge-tag">Term 3 &amp; KPSEA</span>
                <h3>Term 3 &amp; National Assessments</h3>
                <div class="term-dates-detail">
                    <div class="date-row"><span>Opening Date:</span><strong>${data.term3_start || '23rd Aug 2027'}</strong></div>
                    <div class="date-row"><span>National Assessments:</span><strong>${data.cbc_assessment || '25th Oct – 29th Oct 2027'}</strong></div>
                    <div class="date-row"><span>Closing Date:</span><strong>${data.term3_end || '22nd Oct 2027'}</strong></div>
                </div>
            </div>
        </div>
        <div class="events-list-wrap">
            <h3><i class="fas fa-calendar-star"></i> Key Academy Milestones &bull; ${year}</h3>
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
                <a href="https://wa.me/254727345438?text=Hello%20Gracious%20Love%20Academy%2C%20I%20would%20like%20to%20inquire%20about%202027%20term%20dates%20and%20enrollment." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-block">
                    <i class="fab fa-whatsapp"></i> Inquire on 2027 Term Dates via WhatsApp
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
