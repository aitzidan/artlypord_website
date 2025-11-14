document.addEventListener('DOMContentLoaded', () => {
    
    let currentLanguage = localStorage.getItem('artly-lang') || 'fr';

    // Helper to safely get nested properties from translations
    const getTranslation = (key) => {
        return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), translations[currentLanguage]);
    };

    const translatePage = () => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key);
            if (translation) {
                element.innerHTML = translation;
            }
        });
        document.documentElement.lang = currentLanguage;
        document.documentElement.setAttribute('data-lang', currentLanguage);

        // Update active language button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
        });
    };

    const setLanguage = (lang) => {
        currentLanguage = lang;
        localStorage.setItem('artly-lang', lang);
        translatePage();
        // After translating, re-run page specific content generators
        if (document.body.id === 'page-services') populateTeam();
        if (document.body.id === 'page-portfolio') populatePortfolio();
        if (document.body.id === 'page-filming-guide') populateFaq();
        if (document.body.id === 'page-locations') populateLocations();
        if (document.body.id === 'page-blog') populateBlog();

    };

    const initLanguageSwitcher = () => {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.lang !== currentLanguage) {
                    setLanguage(btn.dataset.lang);
                }
            });
        });
    };

    const initMobileNav = () => {
        const toggleBtn = document.getElementById('mobile-nav-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('mobile-nav-open');
            });
        }
    };
    
    const setActiveNavLink = () => {
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    };

    const initScrollAnimations = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });
    };

    // --- Page-specific initializers ---

    const populateTeam = () => {
        const container = document.querySelector('.team-section .grid');
        if (!container) return;
        container.innerHTML = ''; // Clear existing
        Object.keys(translations[currentLanguage].teamData).forEach((key, index) => {
            const member = translations[currentLanguage].teamData[key];
            const memberEl = document.createElement('div');
            memberEl.className = 'scroll-animate animate-in';
            memberEl.style.setProperty('--delay', `${(index % 4) * 0.1}s`);
            memberEl.innerHTML = `
                <div class="team-member-card">
                    <img src="https://picsum.photos/seed/${member.name.toLowerCase().split(' ')[0]}/400/400" alt="${member.name}">
                    <h3>${member.name}</h3>
                    <p class="role">${member.role}</p>
                    <p class="description">${member.description}</p>
                </div>`;
            container.appendChild(memberEl);
        });
        initScrollAnimations();
    };

    const populatePortfolio = () => {
        const container = document.getElementById('portfolio-items-container');
        if (!container) return;
        container.innerHTML = '';
        Object.keys(translations[currentLanguage].portfolioData).forEach((key, index) => {
            const project = translations[currentLanguage].portfolioData[key];
            const card = document.createElement('div');
            card.className = 'scroll-animate animate-in portfolio-card-clickable';
            card.style.setProperty('--delay', `${(index % 3) * 0.1}s`);
            card.dataset.projectKey = key;
            card.innerHTML = `
                <a class="portfolio-card">
                    <img src="https://picsum.photos/seed/${key}/800/600" alt="${project.title}">
                    <div class="portfolio-card-overlay">
                        <span class="tag tag-red">${project.type}</span>
                        <h3>${project.title}</h3>
                    </div>
                </a>
            `;
            container.appendChild(card);
        });
        initPortfolioModal();
        initScrollAnimations();
    };
    
    const initPortfolioModal = () => {
        const modal = document.getElementById('portfolio-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        if (!modal || !closeBtn) return;

        document.querySelectorAll('.portfolio-card-clickable').forEach(card => {
            card.addEventListener('click', () => {
                const projectKey = card.dataset.projectKey;
                const project = getTranslation(`portfolioData.${projectKey}`);
                if(project) {
                    document.getElementById('modal-image').src = `https://picsum.photos/seed/${projectKey}/800/600`;
                    document.getElementById('modal-type').textContent = project.type;
                    document.getElementById('modal-title').textContent = project.title;
                    document.getElementById('modal-synopsis').textContent = project.synopsis;
                    document.getElementById('modal-services').textContent = project.services;
                    document.getElementById('modal-locations').textContent = project.locations;
                    modal.classList.add('is-open');
                }
            });
        });
        
        const closeModal = () => modal.classList.remove('is-open');
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    };

    const populateFaq = () => {
        const container = document.querySelector('.faq-container');
        if(!container) return;
        container.innerHTML = '';
        Object.keys(getTranslation('faqData')).forEach(key => {
            const item = getTranslation(`faqData.${key}`);
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <button class="faq-question">
                    <span>${item.question}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div class="faq-answer">
                    <p>${item.answer}</p>
                </div>
            `;
            container.appendChild(faqItem);
        });
        initFaqAccordion();
    };

    const initFaqAccordion = () => {
        document.querySelectorAll('.faq-question').forEach(button => {
            button.addEventListener('click', () => {
                const item = button.parentElement;
                const wasOpen = item.classList.contains('is-open');

                // Close all items
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
                
                // If it wasn't open, open it
                if (!wasOpen) {
                    item.classList.add('is-open');
                }
            });
        });
    };

    const populateLocations = () => {
        const container = document.getElementById('locations-container');
        if(!container) return;
        container.innerHTML = '';
        Object.keys(getTranslation('locationsData')).forEach((key, index) => {
            const location = getTranslation(`locationsData.${key}`);
            const card = document.createElement('div');
            card.className = 'location-card-item scroll-animate animate-in';
            card.style.setProperty('--delay', `${(index % 3) * 0.1}s`);
            card.dataset.tags = location.tags.join(',');
            card.innerHTML = `
                <div class="location-card">
                    <img src="https://picsum.photos/seed/${key}/600/400" alt="${location.name}">
                    <div class="location-card-content">
                        <h3>${location.name}</h3>
                        <div class="location-card-tags">
                            ${location.tags.map(tag => `<span class="tag tag-green">${tag}</span>`).join('')}
                        </div>
                        <p>${location.description}</p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        initScrollAnimations();
    }
    
    const initLocationFilter = () => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                document.querySelectorAll('.location-card-item').forEach(card => {
                    if (filter === 'All' || card.dataset.tags.includes(filter)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    };

    const populateBlog = () => {
        const container = document.getElementById('blog-posts-container');
        if(!container) return;
        container.innerHTML = '';
        Object.keys(getTranslation('blogData')).forEach((key, index) => {
            const post = getTranslation(`blogData.${key}`);
            const card = document.createElement('div');
            card.className = 'scroll-animate animate-in';
            card.style.setProperty('--delay', `${(index % 3) * 0.1}s`);
            card.innerHTML = `
                <div class="blog-card">
                    <div class="blog-card-image">
                        <img src="https://picsum.photos/seed/blog${key}/600/400" alt="${post.title}">
                    </div>
                    <div class="blog-card-content">
                        <div class="blog-card-meta">
                            <span>${post.category}</span>
                            <span>${post.date}</span>
                        </div>
                        <h3>${post.title}</h3>
                        <p>${post.excerpt}</p>
                        <a href="#" class="blog-card-readmore">${getTranslation('blogPage.readMore')} &rarr;</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
        initScrollAnimations();
    };

    const initContactForm = () => {
        const form = document.getElementById('contact-form');
        const statusEl = document.getElementById('form-status');
        if(!form || !statusEl) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;
            const subject = form.querySelector('#subject').value;
            const message = form.querySelector('#message').value;

            statusEl.textContent = '';
            statusEl.className = 'form-status';

            if (!name || !email || !subject || !message) {
                statusEl.textContent = getTranslation('contactPage.formError');
                statusEl.classList.add('error');
                return;
            }
            
            // Mock submission
            statusEl.textContent = getTranslation('contactPage.formSuccess');
            statusEl.classList.add('success');
            form.reset();

            setTimeout(() => {
                statusEl.textContent = '';
                statusEl.className = 'form-status';
            }, 5000);
        });
    };

    // --- GLOBAL INITIALIZATION ---
    initMobileNav();
    initLanguageSwitcher();
    setActiveNavLink();
    
    // Initial translation and page setup
    setLanguage(currentLanguage);

    // Page-specific setup after initial translation
    const bodyId = document.body.id;
    if (bodyId === 'page-services') populateTeam();
    if (bodyId === 'page-portfolio') populatePortfolio();
    if (bodyId === 'page-filming-guide') populateFaq();
    if (bodyId === 'page-locations') { populateLocations(); initLocationFilter(); }
    if (bodyId === 'page-blog') populateBlog();
    if (bodyId === 'page-contact') initContactForm();
    
    // Init scroll animations last
    initScrollAnimations();
});
