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
    initSkeletonDemo();
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

const SUN_SVG = `<svg class="theme-icon sun-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
</svg>`;

const MOON_SVG = `<svg class="theme-icon moon-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
</svg>`;

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
        btn.innerHTML = theme === 'dark' ? SUN_SVG : MOON_SVG;
        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    });

    if (withTransition) {
        setTimeout(() => {
            document.body.classList.remove('disable-transitions');
        }, 100);
    }
}

const routeCache = new Map();

/* ==========================================================================
   2. Client-Side Hash Router
   ========================================================================== */
function initRouter() {
    async function handleRoute() {
        const hash = window.location.hash || '#/overview';
        
        let routeKey = hash.replace(/^#\/?/, '').replace(/^\//, '');
        if (!routeKey || routeKey === 'overview' || routeKey === 'docs') {
            routeKey = 'overview';
        }

        const contentContainer = document.querySelector('#content');
        if (!contentContainer) return;

        const routeFileName = (routeKey.replace(/^hooks\//, '') || 'overview') + '.html';

        try {
            let html = routeCache.get(routeFileName);
            if (!html) {
                const res = await fetch(`./routes/${routeFileName}`);
                if (!res.ok) throw new Error(`Route file not found: ${routeFileName}`);
                html = await res.text();
                routeCache.set(routeFileName, html);
            }

            contentContainer.innerHTML = html;
            const activeView = contentContainer.querySelector('.route-view') || contentContainer.firstElementChild;
            if (activeView) {
                activeView.classList.add('active');
            }

            window.scrollTo({ top: 0, behavior: 'instant' });

            updateActiveNavLinks(routeKey);
            updateTableOfContents(activeView);
            initCopyButtons();
            initTabSwitchers();
            initSkeletonDemo();
        } catch (err) {
            console.error('[Fluentez Docs Router]', err);
        }

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

let currentTocObserver = null;

function updateTableOfContents(activeView) {
    const tocContainer = document.querySelector('#toc-links');
    if (!tocContainer || !activeView) return;

    if (currentTocObserver) {
        currentTocObserver.disconnect();
        currentTocObserver = null;
    }

    tocContainer.innerHTML = '';
    const headings = Array.from(activeView.querySelectorAll('h1, h2, h3'));
    if (headings.length === 0) return;

    const linkMap = new Map();

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
        linkMap.set(heading.id, a);
    });

    if (headings[0]) {
        const firstLink = linkMap.get(headings[0].id);
        if (firstLink) firstLink.classList.add('active');
    }

    if (typeof IntersectionObserver !== 'undefined') {
        currentTocObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    tocContainer.querySelectorAll('.toc-link').forEach((l) => l.classList.remove('active'));
                    const activeLink = linkMap.get(id);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            rootMargin: '-60px 0px -50% 0px',
            threshold: 0.1
        });

        headings.forEach((heading) => currentTocObserver.observe(heading));
    }
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

/* ==========================================================================
   7. Interactive UI Skeleton Demo
   ========================================================================== */
function initSkeletonDemo() {
    const btnToggle = document.getElementById('btn-toggle-demo-skeleton');
    const demoCard = document.getElementById('demo-skeleton-card');
    if (!btnToggle || !demoCard) return;

    let overlayEl = null;
    const hiddenNodes = [];

    btnToggle.addEventListener('click', () => {
        if (overlayEl) {
            overlayEl.style.opacity = '0';
            setTimeout(() => {
                if (overlayEl && overlayEl.parentNode) {
                    overlayEl.parentNode.removeChild(overlayEl);
                }
                overlayEl = null;
                hiddenNodes.forEach(({ el, vis }) => { el.style.visibility = vis; });
                hiddenNodes.length = 0;
            }, 250);
            return;
        }

        const cardRect = demoCard.getBoundingClientRect();
        if (window.getComputedStyle(demoCard).position === 'static') {
            demoCard.style.position = 'relative';
        }

        overlayEl = document.createElement('div');
        overlayEl.style.position = 'absolute';
        overlayEl.style.top = '0';
        overlayEl.style.left = '0';
        overlayEl.style.width = '100%';
        overlayEl.style.height = '100%';
        overlayEl.style.borderRadius = window.getComputedStyle(demoCard).borderRadius || '12px';
        overlayEl.style.background = 'var(--bun-bg)';
        overlayEl.style.zIndex = '10';
        overlayEl.style.transition = 'opacity 250ms ease';

        // Traverse leaf content elements in demo card
        const targets = [];
        function collectLeafs(node) {
            const style = window.getComputedStyle(node);
            if (style.display === 'none' || style.visibility === 'hidden') return;

            const isLeaf = node.children.length === 0 || 
                           ['BUTTON', 'IMG', 'INPUT', 'H4', 'P'].includes(node.tagName) ||
                           node.hasAttribute('data-demo-avatar');

            if (isLeaf) {
                targets.push(node);
            } else {
                Array.from(node.children).forEach(collectLeafs);
            }
        }

        Array.from(demoCard.children).forEach(collectLeafs);

        targets.forEach((target) => {
            const rect = target.getBoundingClientRect();
            const computed = window.getComputedStyle(target);
            if (rect.width <= 0 || rect.height <= 0) return;

            const block = document.createElement('div');
            block.style.position = 'absolute';
            block.style.top = `${rect.top - cardRect.top}px`;
            block.style.left = `${rect.left - cardRect.left}px`;
            block.style.width = `${rect.width}px`;
            block.style.height = `${rect.height}px`;
            block.style.borderRadius = computed.borderRadius;
            block.style.background = 'var(--bun-border)';
            block.style.animation = 'skelPulse 1.5s infinite ease-in-out';

            overlayEl.appendChild(block);

            hiddenNodes.push({ el: target, vis: target.style.visibility });
            target.style.visibility = 'hidden';
        });

        demoCard.appendChild(overlayEl);
    });
}
