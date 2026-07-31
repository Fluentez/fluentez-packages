// ==========================================================================
// Fluentez Documentation — Single Page Client Router & Interactive JS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initRouter();
    initCopyButtons();
    initTabSwitchers();
    initSearchModal();
    initMobileMenu();
});

/* ==========================================================================
   1. Light / Dark Theme Management
   ========================================================================== */
function initThemeToggle() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

    // 1. Determine initial theme: localStorage > system preference > default 'light'
    const storedTheme = localStorage.getItem('bun-docs-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(initialTheme, false);

    // 2. Add click handlers to theme toggle buttons
    themeToggleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            const newTheme = isDark ? 'light' : 'dark';
            setTheme(newTheme, true);
        });
    });
}

function setTheme(theme, withTransition) {
    if (withTransition) {
        document.body.classList.add('disable-transitions');
    }

    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('bun-docs-theme', theme);

    // Update icons on toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
        btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });

    if (withTransition) {
        setTimeout(() => {
            document.body.classList.remove('disable-transitions');
        }, 100);
    }
}

/* ==========================================================================
   2. Client-Side Hash Router
   ========================================================================== */
function initRouter() {
    function handleRoute() {
        const hash = window.location.hash || '#/overview';
        
        let routeKey = hash.replace(/^#\/?/, '').replace(/^\//, '');
        if (!routeKey || routeKey === 'overview' || routeKey === 'docs') {
            routeKey = 'overview';
        }

        const views = document.querySelectorAll('.route-view');
        let matchedView = document.querySelector(`.route-view[data-route="${routeKey}"]`);

        if (!matchedView) {
            matchedView = document.querySelector(`#${routeKey}`) || document.querySelector('.route-view[data-route="overview"]');
        }

        views.forEach((view) => view.classList.remove('active'));
        if (matchedView) {
            matchedView.classList.add('active');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });

        updateActiveNavLinks(routeKey);
        updateTableOfContents(matchedView);

        const sidebar = document.querySelector('#sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

function updateActiveNavLinks(routeKey) {
    const navLinks = document.querySelectorAll('.nav-link, .header-nav a');
    navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const linkKey = href.replace(/^#\/?/, '').replace(/^\//, '');
        
        const isActive = linkKey === routeKey || (routeKey === 'overview' && (linkKey === '' || linkKey === 'overview'));
        link.classList.toggle('active', isActive);
        link.classList.toggle('current', isActive);
    });
}

function updateTableOfContents(activeView) {
    const tocContainer = document.querySelector('#toc-links');
    if (!tocContainer || !activeView) return;

    tocContainer.innerHTML = '';
    const headings = activeView.querySelectorAll('h1, h2, h3');

    headings.forEach((heading, idx) => {
        if (!heading.id) {
            heading.id = `heading-${idx}`;
        }
        const a = document.createElement('a');
        a.className = 'toc-link';
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent.replace(/^#\s*/, '');
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            heading.scrollIntoView({ behavior: 'smooth' });
        });

        tocContainer.appendChild(a);
    });
}

/* ==========================================================================
   3. Interactive Code Copy Button
   ========================================================================== */
function initCopyButtons() {
    document.querySelectorAll('.copy-button').forEach((button) => {
        button.addEventListener('click', async () => {
            const codeBlock = button.parentElement.querySelector('code');
            if (!codeBlock) return;
            
            const text = codeBlock.innerText.replace(/^\$\s*/gm, '');
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.append(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
            }

            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#22c55e';
            button.style.color = '#fff';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.style.color = '';
            }, 1500);
        });
    });
}

/* ==========================================================================
   4. Package Manager Command Tab Switcher
   ========================================================================== */
function initTabSwitchers() {
    document.querySelectorAll('.tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            const parent = tab.closest('.tabs');
            if (!parent) return;

            parent.querySelectorAll('.tab').forEach((item) => {
                const isSelected = item === tab;
                item.classList.toggle('active', isSelected);
                item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            });

            const codePrompt = parent.nextElementSibling?.querySelector('#install-command');
            if (codePrompt && tab.dataset.command) {
                codePrompt.textContent = tab.dataset.command;
            }
        });
    });
}

/* ==========================================================================
   5. Search Modal (⌘K & Instant Search)
   ========================================================================== */
function initSearchModal() {
    const modalOverlay = document.querySelector('#search-modal');
    const searchInput = document.querySelector('#modal-search-input');
    const resultsContainer = document.querySelector('#modal-search-results');
    const triggers = document.querySelectorAll('.search-trigger');
    const closeBtn = document.querySelector('#modal-search-close');

    if (!modalOverlay || !searchInput || !resultsContainer) return;

    const searchIndex = [
        { title: 'Overview & Getting Started', route: '#/overview', snippet: 'Welcome to @fluentez/hooks documentation and ecosystem overview.' },
        { title: 'Installation Guide', route: '#/installation', snippet: 'Install via npm, pnpm, bun, or yarn and subpath import instructions.' },
        { title: 'Fluentez Ecosystem', route: '#/ecosystem', snippet: 'Explore @fluentez/hooks, @fluentez/ui, @fluentez/utils packages.' },
        { title: 'useInfiniteScrollTop', route: '#/hooks/use-infinite-scroll-top', snippet: 'Reverse scroll container offset restoration for chat feeds and logs.' },
        { title: 'useScrollRestoration', route: '#/hooks/use-scroll-restoration', snippet: 'Persist and restore scroll coordinates across SPA client route changes.' },
        { title: 'useAvailableHeight', route: '#/hooks/use-available-height', snippet: 'Dynamically compute remaining vertical height below header/navbar in O(1).' }
    ];

    function openModal() {
        modalOverlay.classList.add('open');
        searchInput.value = '';
        renderResults('');
        setTimeout(() => searchInput.focus(), 50);
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
    }

    triggers.forEach((btn) => btn.addEventListener('click', openModal));
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openModal();
        } else if (e.key === '/' && document.activeElement !== searchInput) {
            e.preventDefault();
            openModal();
        } else if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

    searchInput.addEventListener('input', () => {
        renderResults(searchInput.value.trim().toLowerCase());
    });

    function renderResults(query) {
        resultsContainer.innerHTML = '';
        const filtered = searchIndex.filter((item) => 
            !query || item.title.toLowerCase().includes(query) || item.snippet.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--bun-text-muted);">No results found</div>';
            return;
        }

        filtered.forEach((item) => {
            const a = document.createElement('a');
            a.className = 'search-result-item';
            a.href = item.route;
            a.innerHTML = `
                <div class="search-result-title">${item.title}</div>
                <div class="search-result-snippet">${item.snippet}</div>
            `;
            a.addEventListener('click', () => {
                closeModal();
            });
            resultsContainer.appendChild(a);
        });
    }
}

/* ==========================================================================
   6. Mobile Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
    const sidebar = document.querySelector('#sidebar');
    const menuToggle = document.querySelector('#menu-toggle');

    if (!sidebar || !menuToggle) return;

    menuToggle.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });
}
