/* ========================================
   CampusConnect - Main Application Logic
   "My first vanilla JS project" energy
   ======================================== */

// ============ STORAGE & DATA LAYER ============
const STORAGE_KEY = 'campusconnect_posts';
const SEED_FLAG_KEY = 'campusconnect_seeded';
const MY_POST_IDS_KEY = 'myPostIds';

// Tracking post currently being edited
let editingPostId = null;

// Internal Storage Helpers (Encapsulated)
function _readPostsFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (e) {
        console.error('Failed to read posts from storage:', e);
        return [];
    }
}

function _writePostsToStorage(posts) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        return true;
    } catch (e) {
        console.error('Storage error:', e);
        showToast('Storage is full! Please delete some items to free up space.', 'error');
        return false;
    }
}

// Ownership helpers (myPostIds in localStorage)
function getMyPostIds() {
    try {
        const raw = localStorage.getItem(MY_POST_IDS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function addMyPostId(id) {
    try {
        const ids = getMyPostIds();
        if (!ids.includes(id)) {
            ids.push(id);
            localStorage.setItem(MY_POST_IDS_KEY, JSON.stringify(ids));
        }
    } catch (e) {
        console.error('Failed to save to myPostIds:', e);
    }
}

function removeMyPostId(id) {
    try {
        const ids = getMyPostIds().filter(i => i !== id);
        localStorage.setItem(MY_POST_IDS_KEY, JSON.stringify(ids));
    } catch (e) {
        console.error('Failed to remove from myPostIds:', e);
    }
}

function isMyPost(id) {
    return getMyPostIds().includes(id);
}

// Generate simple SVG placeholder data URLs for realistic previews & seeds
function generatePlaceholderSvg(emoji, label, bg1, bg2) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${bg1}"/>
                <stop offset="100%" stop-color="${bg2}"/>
            </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#g)"/>
        <text x="300" y="180" font-size="96" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
        <text x="300" y="270" font-family="'Comic Neue', cursive, sans-serif" font-weight="bold" font-size="26" fill="#ffffff" text-anchor="middle" opacity="0.95">${label}</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Seed listings for first visit
function getSeedPosts() {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    return [
        // --- 5 Lost & Found Listings (Mix of lost and found) ---
        {
            id: 'seed-lf-1',
            postType: 'lostfound',
            type: 'lost',
            title: 'Casio fx-991EX Scientific Calculator',
            desc: 'Lost on desk 34 in Lecture Hall 2 after the Calculus lecture. Black casing with a blue sticker on the back.',
            location: 'Lecture Hall 2 (LH-2)',
            date: new Date(now - 2 * day).toISOString().split('T')[0],
            contact: 'shivam.math@campus.edu',
            anonymous: false,
            status: 'active',
            image: generatePlaceholderSvg('🔢', 'Casio fx-991EX', '#4f46e5', '#818cf8'),
            createdAt: new Date(now - 2 * day).toISOString()
        },
        {
            id: 'seed-lf-2',
            postType: 'lostfound',
            type: 'found',
            title: 'Campus Student ID Card (Priya Sharma)',
            desc: 'Found near the Library issue counter on the 2nd floor. Kept with the security desk or contact me to collect.',
            location: 'Central Library, 2nd Floor',
            date: new Date(now - 1 * day).toISOString().split('T')[0],
            contact: 'librarian-desk@campus.edu',
            anonymous: false,
            status: 'active',
            image: generatePlaceholderSvg('🪪', 'Student ID Card', '#059669', '#34d399'),
            createdAt: new Date(now - 1 * day).toISOString()
        },
        {
            id: 'seed-lf-3',
            postType: 'lostfound',
            type: 'lost',
            title: 'Milton 1L Stainless Steel Water Bottle',
            desc: 'Matte navy blue finish with anime stickers (One Piece). Left on the bench near the outdoor basketball court.',
            location: 'Outdoor Basketball Court',
            date: new Date(now - 3 * day).toISOString().split('T')[0],
            contact: 'Phone: 9876543210',
            anonymous: false,
            status: 'active',
            image: generatePlaceholderSvg('🍶', 'Milton Water Bottle', '#2563eb', '#60a5fa'),
            createdAt: new Date(now - 3 * day).toISOString()
        },
        {
            id: 'seed-lf-4',
            postType: 'lostfound',
            type: 'found',
            title: 'Boat Rockerz 450 Bluetooth Headphones',
            desc: 'Found on sofa in the Student Union cafeteria. Beige colour, fully working. Describe sticker on ear-cup to claim.',
            location: 'Student Union Cafeteria',
            date: new Date(now - 4 * day).toISOString().split('T')[0],
            contact: 'amit.cse@campus.edu',
            anonymous: false,
            status: 'active',
            image: generatePlaceholderSvg('🎧', 'Boat Rockerz Headphones', '#d97706', '#fbbf24'),
            createdAt: new Date(now - 4 * day).toISOString()
        },
        {
            id: 'seed-lf-5',
            postType: 'lostfound',
            type: 'lost',
            title: 'Hostel Room Keys with Marvel Keychain',
            desc: 'Bundle of 2 brass keys with a miniature Iron Man mask keychain. Dropped somewhere between Hostel Block B and the mess.',
            location: 'Hostel Block B Pathway',
            date: new Date(now - 5 * day).toISOString().split('T')[0],
            contact: 'Block B Room 218',
            anonymous: true,
            status: 'active',
            image: generatePlaceholderSvg('🔑', 'Room Keys + Keychain', '#dc2626', '#f87171'),
            createdAt: new Date(now - 5 * day).toISOString()
        },

        // --- 5 Resell Market Listings ---
        {
            id: 'seed-rs-1',
            postType: 'resell',
            title: 'Haier 50L Single Door Mini Fridge',
            category: 'furniture',
            price: 3400,
            condition: 'good',
            desc: 'Used for 1 year in hostel. Chills drinks quickly, freezer compartment makes ice. Selling because graduating.',
            location: 'Hostel Block C Room 304',
            contact: 'WhatsApp: 9988776655',
            negotiable: true,
            status: 'active',
            images: [
                generatePlaceholderSvg('🧊', 'Mini Fridge 50L', '#0891b2', '#22d3ee'),
                generatePlaceholderSvg('❄️', 'Freezer Compartment', '#0284c7', '#38bdf8')
            ],
            createdAt: new Date(now - 1 * day).toISOString()
        },
        {
            id: 'seed-rs-2',
            postType: 'resell',
            title: 'Thomas\' Calculus (14th Edition) Textbook',
            category: 'books',
            price: 450,
            condition: 'good',
            desc: 'Official textbook for CS/Eng Math 101. Crisp pages, no pen marks or missing pages. CD included.',
            location: 'Hostel Block A Lobby',
            contact: 'rahul.t@campus.edu',
            negotiable: false,
            status: 'active',
            images: [generatePlaceholderSvg('📚', 'Thomas Calculus 14th Ed', '#7c3aed', '#a78bfa')],
            createdAt: new Date(now - 2 * day).toISOString()
        },
        {
            id: 'seed-rs-3',
            postType: 'resell',
            title: 'TI-84 Plus CE Color Graphing Calculator',
            category: 'electronics',
            price: 2400,
            condition: 'new',
            desc: 'Rechargeable color screen graphing calculator. Includes USB charging cable. Essential for statistics and physics labs.',
            location: 'Academic Block B Ground Floor',
            contact: 'Call: 9822334455',
            negotiable: true,
            status: 'active',
            images: [generatePlaceholderSvg('📱', 'TI-84 Plus Graphing Calc', '#4338ca', '#6366f1')],
            createdAt: new Date(now - 3 * day).toISOString()
        },
        {
            id: 'seed-rs-4',
            postType: 'resell',
            title: 'Ergonomic Mesh Study Chair with Lumbar Support',
            category: 'furniture',
            price: 1100,
            condition: 'good',
            desc: 'Hydraulic height adjustment works smoothly, breathable mesh back. Perfect for long study and assignment nights.',
            location: 'Hostel Block D Room 112',
            contact: 'varun.me@campus.edu',
            negotiable: true,
            status: 'active',
            images: [generatePlaceholderSvg('🪑', 'Ergonomic Study Chair', '#059669', '#10b981')],
            createdAt: new Date(now - 4 * day).toISOString()
        },
        {
            id: 'seed-rs-5',
            postType: 'resell',
            title: 'Hero Sprint 21-Speed Mountain Bike',
            category: 'vehicles',
            price: 2900,
            condition: 'fair',
            desc: 'Shimano 21-speed gears, front suspension and dual disc brakes. Rides smoothly across campus. Wire lock included.',
            location: 'Campus Cycle Stand #2',
            contact: 'Call: 9711223344',
            negotiable: true,
            status: 'active',
            images: [generatePlaceholderSvg('🚲', '21-Speed Mountain Bike', '#ea580c', '#fb923c')],
            createdAt: new Date(now - 5 * day).toISOString()
        }
    ];
}

function initStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const seeded = localStorage.getItem(SEED_FLAG_KEY);
        
        // On first visit only when storage is empty
        if (!raw && !seeded) {
            const seedPosts = getSeedPosts();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seedPosts));
            localStorage.setItem(SEED_FLAG_KEY, 'true');
        }
    } catch (e) {
        console.error('Failed to initialize seed storage:', e);
    }
}

// ============ REQUIRED DATA LAYER FUNCTIONS ============
// All reading and writing of posts must go through these functions only.

function getPosts(type) {
    initStorage();
    const posts = _readPostsFromStorage();
    if (!type || type === 'all') {
        return posts;
    }
    if (type === 'lostfound' || type === 'lost_found') {
        return posts.filter(p => p.postType === 'lostfound');
    }
    if (type === 'resell') {
        return posts.filter(p => p.postType === 'resell');
    }
    if (type === 'lost') {
        return posts.filter(p => p.postType === 'lostfound' && p.type === 'lost');
    }
    if (type === 'found') {
        return posts.filter(p => p.postType === 'lostfound' && p.type === 'found');
    }
    // Match specific category or custom filter
    return posts.filter(p => p.postType === type || p.category === type || p.type === type);
}

function addPost(post) {
    if (!post) return null;
    initStorage();
    const posts = _readPostsFromStorage();

    // Ensure every post gets a unique id and a createdAt timestamp
    if (!post.id) {
        post.id = generateId();
    }
    if (!post.createdAt) {
        post.createdAt = new Date().toISOString();
    }
    if (!post.postType) {
        post.postType = (post.category || post.price !== undefined) ? 'resell' : 'lostfound';
    }
    if (!post.status) {
        post.status = 'active';
    }

    posts.unshift(post);
    const success = _writePostsToStorage(posts);
    return success ? post : null;
}

function updatePost(id, changes) {
    if (!id || !changes) return null;
    initStorage();
    const posts = _readPostsFromStorage();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
        return null;
    }

    posts[index] = Object.assign({}, posts[index], changes);
    const success = _writePostsToStorage(posts);
    return success ? posts[index] : null;
}

function deletePost(id) {
    if (!id) return false;
    initStorage();
    const posts = _readPostsFromStorage();
    const initialLen = posts.length;
    const filtered = posts.filter(p => p.id !== id);
    if (filtered.length === initialLen) {
        return false;
    }
    return _writePostsToStorage(filtered);
}

// Make functions accessible on window for compatibility/testing
window.getPosts = getPosts;
window.addPost = addPost;
window.updatePost = updatePost;
window.deletePost = deletePost;

// ============ STATE MANAGEMENT ============
let state = {
    lostFound: [],
    resell: [],
    currentTab: 'lostfound',
    lfFilter: 'all',
    rsFilter: 'all',
    lfSearch: '',
    rsSearch: '',
    lfSort: 'newest',
    rsSort: 'newest'
};

// ============ UTILITY FUNCTIONS ============

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// "posted 2 days ago" style relative time calculation
function formatRelativeTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;

    if (diffMs < 45000) {
        return 'just now';
    }

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 60) {
        return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
    }
    if (diffHours < 24) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays < 7) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    if (diffWeeks < 4) {
        return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    }
    if (diffMonths < 12) {
        return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    }
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
}

function formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Canvas-based image compression: max 800px wide, JPEG at ~0.7 quality
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);

        // Reject files over 5MB
        if (file.size > 5 * 1024 * 1024) {
            showToast(`"${file.name || 'Image'}" is too large! Maximum allowed is 5MB.`, 'error');
            return reject(new Error('File exceeds 5MB limit'));
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                // Fill white background for transparent images converted to JPEG
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                try {
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                } catch (err) {
                    reject(err);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image into canvas'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
    });
}

function validateImageType(file) {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
}

// ============ LOAD DATA (VIA DATA LAYER ONLY) ============

function loadData() {
    state.lostFound = getPosts('lostfound');
    state.resell = getPosts('resell');
}

// ============ FILTER & SORT FUNCTIONS ============

function isLFFiltersActive() {
    return state.lfFilter !== 'all' || 
           (state.lfSearch && state.lfSearch.trim().length > 0) || 
           state.lfSort !== 'newest';
}

function isRSFiltersActive() {
    return state.rsFilter !== 'all' || 
           (state.rsSearch && state.rsSearch.trim().length > 0) || 
           state.rsSort !== 'newest';
}

function clearLFFilters() {
    state.lfFilter = 'all';
    state.lfSearch = '';
    state.lfSort = 'newest';

    const searchInput = document.getElementById('lf-search');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('lf-sort');
    if (sortSelect) sortSelect.value = 'newest';

    document.querySelectorAll('#lostfound .filter-btn').forEach(btn => {
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderLostFound();
    updateEmptyStates();
}

function clearRSFilters() {
    state.rsFilter = 'all';
    state.rsSearch = '';
    state.rsSort = 'newest';

    const searchInput = document.getElementById('rs-search');
    if (searchInput) searchInput.value = '';

    const sortSelect = document.getElementById('rs-sort');
    if (sortSelect) sortSelect.value = 'newest';

    document.querySelectorAll('#resell .filter-btn').forEach(btn => {
        if (btn.dataset.filter === 'all') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    renderResell();
    updateEmptyStates();
}

function getFilteredLFItems() {
    let items = [...state.lostFound];

    // Filter by category/type (All / Lost / Found)
    if (state.lfFilter !== 'all') {
        items = items.filter(item => item.type === state.lfFilter);
    }

    // Working search: matches name (title), description and location live
    if (state.lfSearch && state.lfSearch.trim()) {
        const query = state.lfSearch.trim().toLowerCase();
        items = items.filter(item => {
            const title = (item.title || '').toLowerCase();
            const desc = (item.desc || '').toLowerCase();
            const location = (item.location || '').toLowerCase();
            return title.includes(query) || desc.includes(query) || location.includes(query);
        });
    }

    // Sort: Newest, Oldest
    items.sort((a, b) => {
        const timeA = new Date(a.createdAt || a.date || 0).getTime();
        const timeB = new Date(b.createdAt || b.date || 0).getTime();
        if (state.lfSort === 'oldest') {
            return timeA - timeB;
        }
        return timeB - timeA;
    });

    return items;
}

function getFilteredRSItems() {
    let items = [...state.resell];

    // Filter by category
    if (state.rsFilter !== 'all') {
        items = items.filter(item => item.category === state.rsFilter);
    }

    // Working search: matches name (title), description and location live
    if (state.rsSearch && state.rsSearch.trim()) {
        const query = state.rsSearch.trim().toLowerCase();
        items = items.filter(item => {
            const title = (item.title || '').toLowerCase();
            const desc = (item.desc || '').toLowerCase();
            const location = (item.location || '').toLowerCase();
            return title.includes(query) || desc.includes(query) || location.includes(query);
        });
    }

    // Sort: Newest, Price low to high, Price high to low
    items.sort((a, b) => {
        if (state.rsSort === 'price-asc') {
            return (Number(a.price) || 0) - (Number(b.price) || 0);
        } else if (state.rsSort === 'price-desc') {
            return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
    });

    return items;
}

// ============ RENDER FUNCTIONS ============

function renderAll() {
    renderLostFound();
    renderResell();
    updateEmptyStates();
}

function updateEmptyStates() {
    // --- Lost & Found ---
    const lfGrid = document.getElementById('lf-grid');
    const lfEmpty = document.getElementById('lf-empty');
    const lfEmptyIcon = document.getElementById('lf-empty-icon');
    const lfEmptyTitle = document.getElementById('lf-empty-title');
    const lfEmptyDesc = document.getElementById('lf-empty-desc');
    const lfEmptyClearBtn = document.getElementById('lf-empty-clear-btn');
    const lfClearFiltersBtn = document.getElementById('lf-clear-filters');
    
    const lfTotalCount = state.lostFound.length;
    const lfFilteredItems = getFilteredLFItems();
    const lfFiltersActive = isLFFiltersActive();

    // Toggle filter-row clear button
    if (lfClearFiltersBtn) {
        lfClearFiltersBtn.style.display = lfFiltersActive ? 'inline-flex' : 'none';
    }

    if (lfFilteredItems.length === 0) {
        if (lfGrid) lfGrid.style.display = 'none';
        if (lfEmpty) {
            lfEmpty.style.display = 'block';
            if (lfTotalCount === 0) {
                // "Nothing posted yet" state
                if (lfEmptyIcon) lfEmptyIcon.textContent = '📭';
                if (lfEmptyTitle) lfEmptyTitle.textContent = 'No items yet!';
                if (lfEmptyDesc) lfEmptyDesc.textContent = 'Be the first to post a lost or found item.';
                if (lfEmptyClearBtn) lfEmptyClearBtn.style.display = 'none';
            } else {
                // "No results for your search" state
                if (lfEmptyIcon) lfEmptyIcon.textContent = '🔍';
                if (lfEmptyTitle) lfEmptyTitle.textContent = 'No results for your search';
                if (lfEmptyDesc) lfEmptyDesc.textContent = 'We couldn\'t find any items matching your criteria. Try adjusting your search or clearing filters.';
                if (lfEmptyClearBtn) lfEmptyClearBtn.style.display = 'inline-block';
            }
        }
    } else {
        if (lfGrid) lfGrid.style.display = 'grid';
        if (lfEmpty) lfEmpty.style.display = 'none';
    }

    // --- Resell ---
    const rsGrid = document.getElementById('rs-grid');
    const rsEmpty = document.getElementById('rs-empty');
    const rsEmptyIcon = document.getElementById('rs-empty-icon');
    const rsEmptyTitle = document.getElementById('rs-empty-title');
    const rsEmptyDesc = document.getElementById('rs-empty-desc');
    const rsEmptyClearBtn = document.getElementById('rs-empty-clear-btn');
    const rsClearFiltersBtn = document.getElementById('rs-clear-filters');

    const rsTotalCount = state.resell.length;
    const rsFilteredItems = getFilteredRSItems();
    const rsFiltersActive = isRSFiltersActive();

    // Toggle filter-row clear button
    if (rsClearFiltersBtn) {
        rsClearFiltersBtn.style.display = rsFiltersActive ? 'inline-flex' : 'none';
    }

    if (rsFilteredItems.length === 0) {
        if (rsGrid) rsGrid.style.display = 'none';
        if (rsEmpty) {
            rsEmpty.style.display = 'block';
            if (rsTotalCount === 0) {
                // "Nothing posted yet" state
                if (rsEmptyIcon) rsEmptyIcon.textContent = '🛒';
                if (rsEmptyTitle) rsEmptyTitle.textContent = 'Nothing for sale yet!';
                if (rsEmptyDesc) rsEmptyDesc.textContent = 'List your first item and make some cash 💸';
                if (rsEmptyClearBtn) rsEmptyClearBtn.style.display = 'none';
            } else {
                // "No results for your search" state
                if (rsEmptyIcon) rsEmptyIcon.textContent = '🔍';
                if (rsEmptyTitle) rsEmptyTitle.textContent = 'No results for your search';
                if (rsEmptyDesc) rsEmptyDesc.textContent = 'We couldn\'t find any listings matching your criteria. Try adjusting your search or clearing filters.';
                if (rsEmptyClearBtn) rsEmptyClearBtn.style.display = 'inline-block';
            }
        }
    } else {
        if (rsGrid) rsGrid.style.display = 'grid';
        if (rsEmpty) rsEmpty.style.display = 'none';
    }
}

function renderLostFound() {
    const grid = document.getElementById('lf-grid');
    const items = getFilteredLFItems();
    
    grid.innerHTML = items.map(item => createLFCard(item)).join('');
    
    // Add click handlers for cards
    grid.querySelectorAll('.item-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            const post = state.lostFound.find(p => p.id === id);
            if (post) openDetailModal(post);
        });
    });
}

function renderResell() {
    const grid = document.getElementById('rs-grid');
    const items = getFilteredRSItems();
    
    grid.innerHTML = items.map(item => createRSCard(item)).join('');
    
    // Add click handlers for cards
    grid.querySelectorAll('.item-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            const post = state.resell.find(p => p.id === id);
            if (post) openDetailModal(post);
        });
    });
}

function createLFCard(item) {
    const typeClass = item.type === 'lost' ? 'lost' : 'found';
    const typeLabel = item.type === 'lost' ? 'Lost' : 'Found';
    const isReturned = item.status === 'returned';
    
    const hasImage = item.image && item.image.length > 0;
    const imageHtml = hasImage 
        ? `<img class="item-image" src="${item.image}" alt="${escapeHtml(item.title)}">`
        : `<div class="item-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>`;
    
    const statusBadge = isReturned ? '<span class="item-badge returned">Returned</span>' : '';
    const markedClass = isReturned ? ' is-marked marked-returned' : '';
    
    return `
        <article class="item-card${markedClass}" data-id="${item.id}">
            <div class="item-image-wrap">
                ${imageHtml}
                <span class="item-badge card-badge ${typeClass}">${typeLabel}</span>
                ${statusBadge ? `<span class="item-badge card-badge-status returned">Returned</span>` : ''}
            </div>
            <div class="item-content">
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-meta">
                    <span class="meta-inline">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        ${escapeHtml(item.location)}
                    </span>
                    <span class="meta-dot">·</span>
                    <span class="item-date">${formatRelativeTime(item.createdAt)}</span>
                </div>
                <p class="item-desc">${escapeHtml(item.desc)}</p>
            </div>
        </article>
    `;
}

function createRSCard(item) {
    const conditionLabels = {
        new: 'Like New',
        good: 'Good',
        fair: 'Fair',
        poor: 'Needs Work'
    };
    
    const isSold = item.status === 'sold';
    const categoryName = item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : '';
    
    // Show first image if multiple
    const firstImage = item.images && item.images.length > 0 ? item.images[0] : null;
    const hasImage = firstImage && firstImage.length > 0;
    const imageHtml = hasImage
        ? `<img class="item-image" src="${firstImage}" alt="${escapeHtml(item.title)}">`
        : `<div class="item-image-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
           </div>`;
    
    const negotiableBadge = item.negotiable 
        ? `<span class="item-badge negotiable">Negotiable</span>` 
        : '';
    const soldBadge = isSold ? '<span class="item-badge card-badge-status sold">Sold</span>' : '';
    const markedClass = isSold ? ' is-marked marked-sold' : '';
    
    return `
        <article class="item-card${markedClass}" data-id="${item.id}">
            <div class="item-image-wrap">
                ${imageHtml}
                ${soldBadge}
            </div>
            <div class="item-content">
                <h3 class="item-title">${escapeHtml(item.title)}</h3>
                <div class="item-price-row">
                    <span class="item-price">${formatPrice(item.price)}</span>
                    ${negotiableBadge}
                </div>
                <div class="item-meta">
                    <span class="meta-inline">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        ${conditionLabels[item.condition] || item.condition}
                    </span>
                    <span class="meta-dot">·</span>
                    <span class="meta-inline">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        ${escapeHtml(item.location)}
                    </span>
                    <span class="meta-dot">·</span>
                    <span class="item-date">${formatRelativeTime(item.createdAt)}</span>
                </div>
                <p class="item-desc">${escapeHtml(item.desc)}</p>
            </div>
        </article>
    `;
}

// ============ DETAIL MODAL FUNCTIONS ============

function openDetailModal(item) {
    if (!item) return;
    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('detail-content');
    if (!modal || !container) return;

    const isOwner = isMyPost(item.id);
    const isResell = item.postType === 'resell';
    const isSold = item.status === 'sold';
    const isReturned = item.status === 'returned';

    // Collect gallery images
    let images = [];
    if (isResell) {
        images = (item.images && item.images.length > 0) ? item.images : [];
    } else if (item.image) {
        images = [item.image];
    }

    const defaultImg = images.length > 0 ? images[0] : '';

    // Condition labels
    const conditionLabels = {
        new: '✨ Like New',
        good: '👍 Good',
        fair: '😐 Fair',
        poor: '😅 Needs Work'
    };

    // Category labels
    const categoryIcons = {
        books: '📚 Books',
        electronics: '💻 Electronics',
        furniture: '🪑 Furniture',
        clothing: '👕 Clothing',
        vehicles: '🛵 Vehicles',
        other: '📦 Other'
    };

    // Build Badges
    let badgesHtml = '';
    if (!isResell) {
        badgesHtml += `<span class="item-badge ${item.type === 'lost' ? 'lost' : 'found'}">${item.type === 'lost' ? '😭 LOST' : '🎉 FOUND'}</span>`;
        if (isReturned) badgesHtml += ` <span class="item-badge returned">Returned</span>`;
    } else {
        badgesHtml += `<span class="item-badge category">${categoryIcons[item.category] || item.category}</span>`;
        if (item.negotiable) badgesHtml += ` <span class="item-badge negotiable">Negotiable 💬</span>`;
        if (isSold) badgesHtml += ` <span class="item-badge sold">Sold</span>`;
    }

    // Build Gallery HTML
    let galleryHtml = '';
    if (images.length > 0) {
        let thumbsHtml = '';
        if (images.length > 1) {
            thumbsHtml = `<div class="detail-gallery-thumbs">
                ${images.map((imgSrc, idx) => `
                    <div class="detail-thumb ${idx === 0 ? 'active' : ''}" data-src="${imgSrc}">
                        <img src="${imgSrc}" alt="Thumbnail ${idx + 1}">
                    </div>
                `).join('')}
            </div>`;
        }

        galleryHtml = `
            <div class="detail-gallery">
                <div class="detail-main-img-wrapper">
                    <img id="detail-main-img" class="detail-gallery-main" src="${defaultImg}" alt="${escapeHtml(item.title)}">
                </div>
                ${thumbsHtml}
            </div>
        `;
    } else {
        galleryHtml = `
            <div class="detail-gallery-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>No photos uploaded</span>
            </div>
        `;
    }

    // Price & Condition HTML for Resell
    let resellInfoHtml = '';
    if (isResell) {
        resellInfoHtml = `
            <div class="detail-resell-highlight">
                <div class="detail-price-box">
                    <span class="detail-price-label">Price</span>
                    <span class="detail-price-val">${formatPrice(item.price)}</span>
                </div>
                <div class="detail-condition-box">
                    <span class="detail-condition-label">Condition</span>
                    <span class="detail-condition-val">${conditionLabels[item.condition] || item.condition}</span>
                </div>
            </div>
        `;
    }

    // Contact button / display HTML
    let contactSectionHtml = '';
    if (item.anonymous) {
        contactSectionHtml = `
            <div class="detail-contact-box">
                <span class="contact-hidden-label">🙈 Contact hidden by poster</span>
            </div>
        `;
    } else {
        contactSectionHtml = `
            <div class="detail-contact-box">
                <button type="button" class="btn btn-primary" id="detail-show-contact-btn">📞 Show contact</button>
                <div id="detail-contact-val" class="detail-contact-revealed" style="display: none;">
                    <span class="contact-label">Contact:</span>
                    <strong class="contact-text">${escapeHtml(item.contact)}</strong>
                </div>
            </div>
        `;
    }

    // Owner Actions HTML (Only for posts in myPostIds)
    let ownerActionsHtml = '';
    if (isOwner) {
        let statusBtnText = '';
        if (isResell) {
            statusBtnText = isSold ? '✅ Mark as Available' : '🏷️ Mark as Sold';
        } else {
            statusBtnText = isReturned ? '🔄 Mark as Active' : '🎉 Mark as Returned';
        }

        ownerActionsHtml = `
            <div class="detail-owner-panel">
                <h4 class="owner-panel-title">👤 Poster Controls (You own this post)</h4>
                <div class="owner-panel-btns">
                    <button type="button" class="btn btn-secondary" id="detail-status-btn">${statusBtnText}</button>
                    <button type="button" class="btn btn-secondary" id="detail-edit-btn">✏️ Edit</button>
                    <button type="button" class="btn btn-danger" id="detail-delete-btn">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="detail-header">
            <div class="detail-badges">${badgesHtml}</div>
            <h2 class="detail-title">${escapeHtml(item.title)}</h2>
            <div class="detail-meta-row">
                <span>📍 ${escapeHtml(item.location)}</span>
                <span>📅 ${!isResell ? formatDate(item.date) : formatDate(item.createdAt)}</span>
                <span class="detail-time-relative">🕒 Posted ${formatRelativeTime(item.createdAt)}</span>
            </div>
        </div>

        ${galleryHtml}
        ${resellInfoHtml}

        <div class="detail-desc-section">
            <h3>Description</h3>
            <p class="detail-desc-text">${escapeHtml(item.desc)}</p>
        </div>

        <div class="detail-contact-section">
            ${contactSectionHtml}
        </div>

        ${ownerActionsHtml}
    `;

    // Hook up thumbnail switching
    container.querySelectorAll('.detail-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            const newSrc = thumb.dataset.src;
            const mainImg = container.querySelector('#detail-main-img');
            if (mainImg) mainImg.src = newSrc;
            container.querySelectorAll('.detail-thumb').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });

    // Hook up show contact button
    const showContactBtn = container.querySelector('#detail-show-contact-btn');
    const contactVal = container.querySelector('#detail-contact-val');
    if (showContactBtn && contactVal) {
        showContactBtn.addEventListener('click', () => {
            showContactBtn.style.display = 'none';
            contactVal.style.display = 'flex';
        });
    }

    // Hook up Owner Actions
    if (isOwner) {
        // Toggle Status (Sold / Returned)
        const statusBtn = container.querySelector('#detail-status-btn');
        if (statusBtn) {
            statusBtn.addEventListener('click', () => {
                let newStatus = 'active';
                if (isResell) {
                    newStatus = isSold ? 'active' : 'sold';
                } else {
                    newStatus = isReturned ? 'active' : 'returned';
                }

                updatePost(item.id, { status: newStatus });
                loadData();
                renderAll();

                // Refresh the modal view with updated post
                const updatedPost = getPosts().find(p => p.id === item.id);
                if (updatedPost) {
                    openDetailModal(updatedPost);
                }
                showToast(newStatus === 'sold' ? 'Marked as Sold! 🎉' : (newStatus === 'returned' ? 'Marked as Returned! 🎉' : 'Status set to Active! 👍'), 'success');
            });
        }

        // Delete post
        const deleteBtn = container.querySelector('#detail-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this listing?\n\nThis cannot be undone.')) {
                    deletePost(item.id);
                    removeMyPostId(item.id);
                    closeModal();
                    loadData();
                    renderAll();
                    showToast('Listing deleted successfully! 🗑️', 'info');
                }
            });
        }

        // Edit post (prefill and reuse form modal)
        const editBtn = container.querySelector('#detail-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                closeModal();
                openEditForm(item);
            });
        }
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function openEditForm(item) {
    editingPostId = item.id;
    const isResell = item.postType === 'resell';

    if (!isResell) {
        clearFormErrors('lf-form');
        // Lost & Found form
        const modal = document.getElementById('lf-modal');
        const form = document.getElementById('lf-form');
        document.getElementById('lf-form-title').textContent = '✏️ Edit Item';
        form.querySelector('.btn-text').textContent = 'Save Changes';

        document.getElementById('lf-type').value = item.type;
        document.getElementById('lf-title').value = item.title;
        document.getElementById('lf-desc').value = item.desc;
        document.getElementById('lf-location').value = item.location;
        document.getElementById('lf-date').value = item.date;
        document.getElementById('lf-contact').value = item.contact || '';
        document.getElementById('lf-anonymous').checked = !!item.anonymous;

        // Existing image preview
        const previewContainer = document.getElementById('lf-image-preview');
        previewContainer.innerHTML = '';
        if (item.image) {
            const prevItem = document.createElement('div');
            prevItem.className = 'image-preview-item';
            prevItem.innerHTML = `<img src="${item.image}" alt="Existing photo">`;
            previewContainer.appendChild(prevItem);
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    } else {
        clearFormErrors('rs-form');
        // Resell form
        const modal = document.getElementById('rs-modal');
        const form = document.getElementById('rs-form');
        document.getElementById('rs-form-title').textContent = '✏️ Edit Item for Sale';
        form.querySelector('.btn-text').textContent = 'Save Changes';
        document.getElementById('rs-images').required = false;

        document.getElementById('rs-title').value = item.title;
        document.getElementById('rs-category').value = item.category;
        document.getElementById('rs-price').value = item.price;
        document.getElementById('rs-condition').value = item.condition;
        document.getElementById('rs-desc').value = item.desc;
        document.getElementById('rs-location').value = item.location;
        document.getElementById('rs-contact').value = item.contact || '';
        document.getElementById('rs-negotiable').checked = !!item.negotiable;

        // Existing images preview
        const previewContainer = document.getElementById('rs-images-preview');
        previewContainer.innerHTML = '';
        if (item.images && item.images.length > 0) {
            item.images.forEach(imgSrc => {
                const prevItem = document.createElement('div');
                prevItem.className = 'image-preview-item';
                prevItem.innerHTML = `<img src="${imgSrc}" alt="Existing photo">`;
                previewContainer.appendChild(prevItem);
            });
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Reset form headers and modes back to new post
function resetFormModes() {
    editingPostId = null;
    clearFormErrors('lf-form');
    clearFormErrors('rs-form');
    
    // LF Form
    const lfTitle = document.getElementById('lf-form-title');
    if (lfTitle) lfTitle.textContent = '📝 Post New Item';
    const lfBtn = document.querySelector('#lf-form .btn-text');
    if (lfBtn) lfBtn.textContent = 'Post Item';

    // RS Form
    const rsTitle = document.getElementById('rs-form-title');
    if (rsTitle) rsTitle.textContent = '📝 List Item for Sale';
    const rsBtn = document.querySelector('#rs-form .btn-text');
    if (rsBtn) rsBtn.textContent = 'List for Sale';
    const rsImg = document.getElementById('rs-images');
    if (rsImg) rsImg.required = false;
}

// ============ MODAL FUNCTIONS ============

function openModal(imageSrc) {
    if (!imageSrc) return;
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    modalImg.src = imageSrc;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function openLFModal() {
    resetFormModes();
    clearFormErrors('lf-form');
    const modal = document.getElementById('lf-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function openRSModal() {
    resetFormModes();
    clearFormErrors('rs-form');
    const modal = document.getElementById('rs-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

// ============ FORM PREVIEWS ============

function setupImagePreviews() {
    const lfImageInput = document.getElementById('lf-image');
    const lfPreviewContainer = document.getElementById('lf-image-preview');

    if (lfImageInput && lfPreviewContainer) {
        lfImageInput.addEventListener('change', () => {
            lfPreviewContainer.innerHTML = '';
            const file = lfImageInput.files[0];
            if (!file) return;

            if (file.size > 5 * 1024 * 1024) {
                showToast(`"${file.name}" is too large! Maximum allowed is 5MB.`, 'error');
                lfImageInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'image-preview-item';
                item.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                lfPreviewContainer.appendChild(item);
            };
            reader.readAsDataURL(file);
        });
    }

    const rsImagesInput = document.getElementById('rs-images');
    const rsPreviewContainer = document.getElementById('rs-images-preview');

    if (rsImagesInput && rsPreviewContainer) {
        rsImagesInput.addEventListener('change', () => {
            rsPreviewContainer.innerHTML = '';
            const files = Array.from(rsImagesInput.files);
            if (files.length === 0) return;

            if (files.length > 4) {
                showToast('Maximum 4 photos allowed!', 'error');
                rsImagesInput.value = '';
                return;
            }

            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast(`"${file.name}" exceeds 5MB limit! Max 5MB per photo.`, 'error');
                    rsImagesInput.value = '';
                    rsPreviewContainer.innerHTML = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const item = document.createElement('div');
                    item.className = 'image-preview-item';
                    item.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    rsPreviewContainer.appendChild(item);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function clearFormPreviews() {
    const lfPreview = document.getElementById('lf-image-preview');
    if (lfPreview) lfPreview.innerHTML = '';
    const rsPreview = document.getElementById('rs-images-preview');
    if (rsPreview) rsPreview.innerHTML = '';
}

// ============ FORM VALIDATION HELPERS ============

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById('err-' + fieldId);
    if (field) {
        field.classList.add('input-error');
    }
    if (errEl) {
        errEl.textContent = message;
        errEl.classList.add('visible');
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errEl = document.getElementById('err-' + fieldId);
    if (field) {
        field.classList.remove('input-error');
    }
    if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('visible');
    }
}

function clearFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach(el => {
        el.textContent = '';
        el.classList.remove('visible');
    });
}

function setupFormValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        const handler = () => {
            if (input.id) {
                clearFieldError(input.id);
            }
        };
        input.addEventListener('input', handler);
        input.addEventListener('change', handler);
    });
}

// ============ FORM HANDLERS ============

async function handleLFSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    clearFormErrors('lf-form');

    const submitBtn = form.querySelector('.btn-submit');
    const formData = new FormData(form);
    
    // Extract and trim fields
    const title = (formData.get('title') || '').trim();
    const desc = (formData.get('desc') || '').trim();
    const location = (formData.get('location') || '').trim();
    const date = formData.get('date');
    const contact = (formData.get('contact') || '').trim();
    const type = formData.get('type');
    const anonymous = formData.get('anonymous') === 'on';
    const imageFile = formData.get('image');
    
    let hasErrors = false;
    let firstInvalid = null;

    function reportError(fieldId, msg) {
        setFieldError(fieldId, msg);
        hasErrors = true;
        if (!firstInvalid) {
            firstInvalid = document.getElementById(fieldId);
        }
    }

    // Inline validation checks
    if (!type) {
        reportError('lf-type', 'Please select whether this item was lost or found.');
    }
    if (!title) {
        reportError('lf-title', 'Please enter the item name.');
    }
    if (!desc) {
        reportError('lf-desc', 'Please provide a description.');
    }
    if (!location) {
        reportError('lf-location', 'Please specify the location.');
    }
    if (!date) {
        reportError('lf-date', 'Please select a date.');
    }
    if (!contact) {
        reportError('lf-contact', 'Please provide your contact information.');
    }

    if (imageFile && imageFile.size > 0) {
        if (!validateImageType(imageFile)) {
            reportError('lf-image', 'Invalid file type! Use JPG, PNG, WebP, or GIF.');
        } else if (imageFile.size > 5 * 1024 * 1024) {
            reportError('lf-image', 'Image is too large! Maximum allowed is 5MB.');
        }
    }

    if (hasErrors) {
        if (firstInvalid) firstInvalid.focus();
        showToast('Please fix the errors in the form.', 'error');
        return;
    }
    
    submitBtn.classList.add('loading');
    
    let imageData = null;
    if (imageFile && imageFile.size > 0) {
        try {
            // Compress image via canvas to max 800px wide, 0.7 quality JPEG
            imageData = await compressImage(imageFile, 800, 0.7);
        } catch (err) {
            reportError('lf-image', 'Failed to process image.');
            showToast('Failed to process image.', 'error');
            submitBtn.classList.remove('loading');
            return;
        }
    }
    
    if (editingPostId) {
        // Editing existing post
        const currentPost = getPosts().find(p => p.id === editingPostId);
        const changes = {
            type,
            title,
            desc,
            location,
            date,
            contact: anonymous ? '' : contact,
            anonymous
        };
        if (imageData) {
            changes.image = imageData;
        } else if (currentPost && currentPost.image) {
            changes.image = currentPost.image;
        }

        const updated = updatePost(editingPostId, changes);
        if (!updated) {
            submitBtn.classList.remove('loading');
            return;
        }
        showToast('Item updated successfully! 🎉', 'success');
        editingPostId = null;
    } else {
        // New post
        const newItem = {
            type,
            title,
            desc,
            location,
            date,
            contact: anonymous ? '' : contact,
            anonymous,
            image: imageData,
            postType: 'lostfound'
        };
        
        const saved = addPost(newItem);
        if (!saved) {
            submitBtn.classList.remove('loading');
            return;
        }

        // Record ownership in myPostIds
        addMyPostId(saved.id);
        showToast(`${type === 'lost' ? 'Lost' : 'Found'} item posted successfully! 🎉`, 'success');
    }

    state.lostFound = getPosts('lostfound');
    renderLostFound();
    updateEmptyStates();
    
    form.reset();
    resetFormModes();
    clearFormPreviews();

    // Reset date to today
    const dateInput = document.getElementById('lf-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    
    submitBtn.classList.remove('loading');
    closeModal();
}

async function handleRSSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    clearFormErrors('rs-form');

    const submitBtn = form.querySelector('.btn-submit');
    const formData = new FormData(form);
    
    // Extract and trim fields
    const title = (formData.get('title') || '').trim();
    const category = formData.get('category');
    const priceStr = formData.get('price');
    const condition = formData.get('condition');
    const desc = (formData.get('desc') || '').trim();
    const location = (formData.get('location') || '').trim();
    const contact = (formData.get('contact') || '').trim();
    const negotiable = formData.get('negotiable') === 'on';
    const rawFiles = formData.getAll('images');
    const imageFiles = rawFiles.filter(f => f && f.size > 0);

    let hasErrors = false;
    let firstInvalid = null;

    function reportError(fieldId, msg) {
        setFieldError(fieldId, msg);
        hasErrors = true;
        if (!firstInvalid) {
            firstInvalid = document.getElementById(fieldId);
        }
    }

    // Inline validation checks
    if (!title) {
        reportError('rs-title', 'Please enter the item name.');
    }
    if (!category) {
        reportError('rs-category', 'Please select a category.');
    }
    if (!priceStr || isNaN(priceStr) || Number(priceStr) <= 0) {
        reportError('rs-price', 'Please enter a valid price in ₹ (greater than 0).');
    }
    if (!condition) {
        reportError('rs-condition', 'Please select the condition.');
    }
    if (!desc) {
        reportError('rs-desc', 'Please provide a description.');
    }
    if (!location) {
        reportError('rs-location', 'Please specify the pickup location.');
    }
    if (!contact) {
        reportError('rs-contact', 'Please provide your contact information.');
    }
    
    const currentPost = editingPostId ? getPosts().find(p => p.id === editingPostId) : null;
    const hasExistingImages = currentPost && currentPost.images && currentPost.images.length > 0;

    if (!editingPostId || !hasExistingImages) {
        if (imageFiles.length === 0) {
            reportError('rs-images', 'Please upload at least one photo.');
        }
    }
    
    if (imageFiles.length > 4) {
        reportError('rs-images', 'Maximum 4 photos allowed!');
    }

    for (const file of imageFiles) {
        if (!validateImageType(file)) {
            reportError('rs-images', `"${file.name || 'Image'}" has invalid format! Use JPG, PNG, WebP, or GIF.`);
            break;
        }
        if (file.size > 5 * 1024 * 1024) {
            reportError('rs-images', `"${file.name || 'Image'}" exceeds 5MB limit! Max 5MB per photo.`);
            break;
        }
    }

    if (hasErrors) {
        if (firstInvalid) firstInvalid.focus();
        showToast('Please fix the errors in the form.', 'error');
        return;
    }
    
    submitBtn.classList.add('loading');
    
    const imagesData = [];
    for (const file of imageFiles) {
        try {
            // Compress each image via canvas to max 800px wide, 0.7 quality JPEG
            const compressed = await compressImage(file, 800, 0.7);
            imagesData.push(compressed);
        } catch (err) {
            reportError('rs-images', 'Failed to process one or more images.');
            showToast('Failed to process one or more images.', 'error');
            submitBtn.classList.remove('loading');
            return;
        }
    }
    
    if (editingPostId) {
        // Editing existing post
        const changes = {
            title,
            category,
            price: Number(priceStr),
            condition,
            desc,
            location,
            contact,
            negotiable
        };
        if (imagesData.length > 0) {
            changes.images = imagesData;
        } else if (hasExistingImages) {
            changes.images = currentPost.images;
        }

        const updated = updatePost(editingPostId, changes);
        if (!updated) {
            submitBtn.classList.remove('loading');
            return;
        }
        showToast('Item updated successfully! 💰', 'success');
        editingPostId = null;
    } else {
        // New post
        const newItem = {
            title,
            category,
            price: Number(priceStr),
            condition,
            desc,
            location,
            contact,
            negotiable,
            images: imagesData,
            postType: 'resell'
        };
        
        const saved = addPost(newItem);
        if (!saved) {
            submitBtn.classList.remove('loading');
            return;
        }

        // Record ownership in myPostIds
        addMyPostId(saved.id);
        showToast('Item listed for sale! 💰 Good luck!', 'success');
    }

    state.resell = getPosts('resell');
    renderResell();
    updateEmptyStates();
    
    form.reset();
    resetFormModes();
    clearFormPreviews();
    submitBtn.classList.remove('loading');
    closeModal();
}

// ============ FILTER HANDLERS ============

function setupFilterTabs() {
    // Lost & Found filters
    document.querySelectorAll('#lostfound .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#lostfound .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.lfFilter = btn.dataset.filter;
            renderLostFound();
            updateEmptyStates();
        });
    });
    
    // Resell filters
    document.querySelectorAll('#resell .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#resell .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.rsFilter = btn.dataset.filter;
            renderResell();
            updateEmptyStates();
        });
    });
}

// ============ SEARCH HANDLERS ============

function setupSearch() {
    const lfSearch = document.getElementById('lf-search');
    if (lfSearch) {
        lfSearch.addEventListener('input', (e) => {
            state.lfSearch = e.target.value;
            renderLostFound();
            updateEmptyStates();
        });
    }

    const rsSearch = document.getElementById('rs-search');
    if (rsSearch) {
        rsSearch.addEventListener('input', (e) => {
            state.rsSearch = e.target.value;
            renderResell();
            updateEmptyStates();
        });
    }
}

// ============ SORT HANDLERS ============

function setupSort() {
    const lfSort = document.getElementById('lf-sort');
    if (lfSort) {
        lfSort.addEventListener('change', (e) => {
            state.lfSort = e.target.value;
            renderLostFound();
            updateEmptyStates();
        });
    }

    const rsSort = document.getElementById('rs-sort');
    if (rsSort) {
        rsSort.addEventListener('change', (e) => {
            state.rsSort = e.target.value;
            renderResell();
            updateEmptyStates();
        });
    }
}

// ============ CLEAR FILTERS HANDLERS ============

function setupClearFilters() {
    const lfClearBtn = document.getElementById('lf-clear-filters');
    const lfEmptyClearBtn = document.getElementById('lf-empty-clear-btn');
    if (lfClearBtn) lfClearBtn.addEventListener('click', clearLFFilters);
    if (lfEmptyClearBtn) lfEmptyClearBtn.addEventListener('click', clearLFFilters);

    const rsClearBtn = document.getElementById('rs-clear-filters');
    const rsEmptyClearBtn = document.getElementById('rs-empty-clear-btn');
    if (rsClearBtn) rsClearBtn.addEventListener('click', clearRSFilters);
    if (rsEmptyClearBtn) rsEmptyClearBtn.addEventListener('click', clearRSFilters);
}

// ============ TAB SWITCHING ============

function setupTabSwitching() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update nav buttons
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
            
            state.currentTab = tab;
        });
    });
}

// ============ MODAL EVENT LISTENERS ============

function setupModals() {
    // Open post modals
    const lfPostBtn = document.getElementById('lf-post-btn');
    if (lfPostBtn) {
        lfPostBtn.addEventListener('click', openLFModal);
    }

    const rsPostBtn = document.getElementById('rs-post-btn');
    if (rsPostBtn) {
        rsPostBtn.addEventListener('click', openRSModal);
    }

    // Close on X button click
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
            clearFormPreviews();
            resetFormModes();
        });
    });

    // Close on click outside (backdrop)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
                clearFormPreviews();
                resetFormModes();
            }
        });
    });

    // Keyboard shortcuts: Escape to close modals, Ctrl+1/2 for tabs
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            clearFormPreviews();
            resetFormModes();
        }
        // Ctrl/Cmd + 1 for Lost & Found, 2 for Resell
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
            e.preventDefault();
            document.querySelector('[data-tab="lostfound"]').click();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
            e.preventDefault();
            document.querySelector('[data-tab="resell"]').click();
        }
    });
}

// ============ GLOBAL FUNCTIONS (for onclick handlers) ============

function showCredits() {
    alert(`🎓 CampusConnect v1.0.0

Built by a sleep-deprived 1st year CS student
for CS101 "Web Development" final project.

Tech stack:
• HTML5 (semantic-ish)
• CSS3 (too many gradients)
• Vanilla JS (data layer architecture + ownership)
• Storage (localStorage adapter)
• Google Fonts (Comic Neue & Patrick Hand)

Special thanks to:
☕ Coffee (lots of it)
🌙 3 AM debugging sessions
📚 Stack Overflow
🎓 My professor (hopefully this passes)

"Code works on my machine" © 2026`);
}

function clearAllData() {
    if (confirm('⚠️ This will DELETE ALL DATA permanently!\n\nLost & Found items + Resell listings + Ownership.\n\nAre you sure?')) {
        if (confirm('❗ LAST CHANCE!\n\nThis cannot be undone.\n\nReally delete everything?')) {
            // Remove items only through data layer deletePost
            const allPosts = getPosts();
            allPosts.forEach(post => deletePost(post.id));
            try {
                localStorage.removeItem(MY_POST_IDS_KEY);
            } catch (e) {}
            state.lostFound = [];
            state.resell = [];
            renderAll();
            showToast('All data cleared! 🗑️', 'warning');
        }
    }
}

// ============ INITIALIZATION ============

function init() {
    // Load data from data layer
    loadData();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('lf-date');
    if (dateInput) {
        dateInput.value = today;
        dateInput.max = today;
    }
    
    // Setup event listeners
    document.getElementById('lf-form').addEventListener('submit', handleLFSubmit);
    document.getElementById('rs-form').addEventListener('submit', handleRSSubmit);
    
    setupTabSwitching();
    setupFilterTabs();
    setupSearch();
    setupSort();
    setupClearFilters();
    setupModals();
    setupImagePreviews();
    setupFormValidation('lf-form');
    setupFormValidation('rs-form');
    
    // Initial render
    renderAll();
    
    // Fun console message
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  🎓 CampusConnect - Dev Console                          ║
║  Data Layer Active: getPosts, addPost, updatePost,       ║
║  deletePost. Ownership via myPostIds. Detail modal on.  ║
╠══════════════════════════════════════════════════════════╣
║  Lost & Found: ${state.lostFound.length} items                                    ║
║  Resell: ${state.resell.length} items                                        ║
║  My Posts: ${getMyPostIds().length} items                                      ║
║                                                          ║
║  Shortcuts:                                              ║
║  Ctrl+1 → Lost & Found    Ctrl+2 → Resell Market        ║
║  ESC → Close modals                                      ║
╚══════════════════════════════════════════════════════════╝
    `);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}