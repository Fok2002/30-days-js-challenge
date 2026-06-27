// Day 27 - Premium Lens Gallery & Filter Logic

// Default Curated Images Dataset
const DEFAULT_IMAGES = [
    {
        id: "img-1",
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
        title: "Misty Pine Forest",
        author: "Sebastian Unrau",
        category: "nature",
        tags: ["forest", "nature", "green", "mist"],
        description: "A quiet dirt path leading through a dense, foggy pine forest in the early morning light. Captured in Germany.",
        likesCount: 142
    },
    {
        id: "img-2",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        title: "Golden Hour Peaks",
        author: "Kal Vis",
        category: "nature",
        tags: ["mountain", "snow", "sunset", "landscape"],
        description: "Alpenglow hitting the snow-covered peak of a majestic mountain range in Chamonix, France.",
        likesCount: 98
    },
    {
        id: "img-3",
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        title: "Minimal Spiral Staircase",
        author: "Jared Rice",
        category: "architecture",
        tags: ["minimal", "geometry", "spiral", "white"],
        description: "An elegant, clean looking spiral staircase shot from directly above, highlighting perfect symmetry and geometry.",
        likesCount: 76
    },
    {
        id: "img-4",
        url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
        title: "Neon Tokyo Alley",
        author: "Sora Sagano",
        category: "architecture",
        tags: ["tokyo", "city", "neon", "night"],
        description: "A rain-slicked narrow alleyway in Shinjuku, Tokyo, illuminated by glowing neon storefronts and signs.",
        likesCount: 215
    },
    {
        id: "img-5",
        url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80",
        title: "Majestic Male Lion",
        author: "Ivan Carter",
        category: "animals",
        tags: ["lion", "wildlife", "predator", "safari"],
        description: "An intense close-up portrait of a male African lion, showcasing its powerful gaze and detailed mane.",
        likesCount: 189
    },
    {
        id: "img-6",
        url: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80",
        title: "Posing Arctic Fox",
        author: "Jonatan Pie",
        category: "animals",
        tags: ["fox", "snow", "wildlife", "arctic"],
        description: "A beautiful white Arctic fox sitting on a snow field in Iceland, looking curious and alert.",
        likesCount: 124
    },
    {
        id: "img-7",
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
        title: "Lake Braies Boat",
        author: "Dino Reichmuth",
        category: "travel",
        tags: ["lake", "boat", "italy", "mountains"],
        description: "A classic wooden rowboat moored on the crystal clear turquoise water of Lago di Braies in South Tyrol, Italy.",
        likesCount: 167
    },
    {
        id: "img-8",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        title: "Tropical Sunrise Beach",
        author: "Sean O.",
        category: "travel",
        tags: ["beach", "ocean", "sunrise", "palm"],
        description: "A serene sunrise over a white sand beach in the Maldives, featuring leaning palm trees and calm waves.",
        likesCount: 153
    },
    {
        id: "img-9",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        title: "Golden Hour Portrait",
        author: "Christopher Campbell",
        category: "people",
        tags: ["portrait", "woman", "smile", "sunlight"],
        description: "A warm, natural light portrait of a smiling woman captured in the late afternoon sun with a shallow depth of field.",
        likesCount: 231
    },
    {
        id: "img-10",
        url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
        title: "Surfer at Sunset",
        author: "Benjamin Voros",
        category: "people",
        tags: ["surf", "beach", "sunset", "silhouette"],
        description: "A surfer standing with a surfboard on a wet sandy beach, silhouetted against a golden-pink sunset sky.",
        likesCount: 112
    }
];

// App State
let images = [];
let likedIds = [];
let activeCategory = "all";
let searchQuery = "";
let activeSort = "default";
let activeTheme = "dark";
let currentLightboxIndex = -1;
let filteredImagesList = [];

// Lightbox Zoom & Pan State
let zoomScale = 1;
let zoomTranslateX = 0;
let zoomTranslateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

// Lightbox Slideshow State
let isSlideshowPlaying = false;
let slideshowIntervalId = null;
let slideshowProgressIntervalId = null;
const SLIDESHOW_DURATION = 4000; // 4 seconds per slide
let slideshowTimeRemaining = SLIDESHOW_DURATION;

// DOM Elements
const galleryGrid = document.getElementById("gallery-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const sortSelect = document.getElementById("sort-select");
const categoriesContainer = document.getElementById("categories-container");
const resetFiltersBtn = document.getElementById("reset-filters-btn");
const openUploadBtn = document.getElementById("open-upload-modal-btn");
const themeToggleBtn = document.getElementById("theme-toggle");

// Stats Elements
const statsTotal = document.getElementById("stats-total");
const statsLiked = document.getElementById("stats-liked");
const statsActiveFilter = document.getElementById("stats-active-filter");

// Lightbox Elements
const lightboxModal = document.getElementById("lightbox-modal");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxZoomContainer = document.getElementById("lightbox-zoom-container");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPlay = document.getElementById("lightbox-play");
const lightboxZoomIn = document.getElementById("lightbox-zoom-in");
const lightboxZoomOut = document.getElementById("lightbox-zoom-out");
const lightboxShare = document.getElementById("lightbox-share");
const lightboxDownload = document.getElementById("lightbox-download");
const lightboxCategory = document.getElementById("lightbox-category");
const lightboxTitle = document.getElementById("lightbox-title");
const lightboxAuthor = document.getElementById("lightbox-author");
const lightboxDesc = document.getElementById("lightbox-desc");
const lightboxTags = document.getElementById("lightbox-tags");
const lightboxLikeBtn = document.getElementById("lightbox-like-btn");
const lightboxViewport = document.getElementById("lightbox-viewport");
const slideshowStatus = document.getElementById("slideshow-status");
const slideshowProgress = document.getElementById("slideshow-progress");

// Upload Modal Elements
const uploadModal = document.getElementById("upload-modal");
const uploadModalClose = document.getElementById("upload-modal-close");
const uploadModalOverlay = document.getElementById("upload-modal-overlay");
const uploadForm = document.getElementById("upload-form");
const cancelUploadBtn = document.getElementById("btn-cancel-upload");
const inputUrl = document.getElementById("input-url");
const inputTitle = document.getElementById("input-title");
const inputCategory = document.getElementById("input-category");
const inputTags = document.getElementById("input-tags");
const inputDesc = document.getElementById("input-desc");
const charCountSpan = document.getElementById("char-count");

// Live Preview Elements
const previewCard = document.getElementById("preview-card");
const previewImg = document.getElementById("preview-img");
const previewPlaceholder = document.querySelector(".preview-placeholder");
const previewCategory = document.querySelector(".preview-category");
const previewTitle = document.querySelector(".preview-title");

// Toast Container
const toastContainer = document.getElementById("toast-container");

/* --- Initialization --- */
function init() {
    // 1. Load data from Local Storage or set defaults
    const storedImages = localStorage.getItem("lens_gallery_images");
    if (storedImages) {
        images = JSON.parse(storedImages);
    } else {
        images = [...DEFAULT_IMAGES];
        localStorage.setItem("lens_gallery_images", JSON.stringify(images));
    }

    const storedLikes = localStorage.getItem("lens_gallery_likes");
    if (storedLikes) {
        likedIds = JSON.parse(storedLikes);
    } else {
        likedIds = ["img-1", "img-9"]; // default liked photos
        localStorage.setItem("lens_gallery_likes", JSON.stringify(likedIds));
    }

    // 2. Set Theme
    const storedTheme = localStorage.getItem("lens_gallery_theme") || "dark";
    activeTheme = storedTheme;
    document.documentElement.setAttribute("data-theme", activeTheme);

    // 3. Register Event Listeners
    registerEventListeners();

    // 4. Initial Render
    renderGallery();
}

/* --- Event Listeners --- */
function registerEventListeners() {
    // Search input
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderGallery();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        renderGallery();
        searchInput.focus();
    });

    // Sorting select
    sortSelect.addEventListener("change", (e) => {
        activeSort = e.target.value;
        renderGallery();
    });

    // Category filter pills
    categoriesContainer.addEventListener("click", (e) => {
        const pill = e.target.closest(".category-pill");
        if (!pill) return;

        // Update active class on DOM
        document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");

        activeCategory = pill.dataset.category;
        renderGallery();
    });

    // Reset Filters button (empty state)
    resetFiltersBtn.addEventListener("click", resetAllFilters);

    // Upload Modal toggle
    openUploadBtn.addEventListener("click", openUploadModal);
    uploadModalClose.addEventListener("click", closeUploadModal);
    uploadModalOverlay.addEventListener("click", closeUploadModal);
    cancelUploadBtn.addEventListener("click", closeUploadModal);
    uploadForm.addEventListener("submit", handleFormSubmit);

    // Form inputs live preview
    inputUrl.addEventListener("input", handleUrlInput);
    inputTitle.addEventListener("input", (e) => {
        previewTitle.textContent = e.target.value.trim() || "Title Placeholder";
        if (e.target.value.trim()) {
            previewCard.style.opacity = "1";
        }
    });
    inputCategory.addEventListener("change", (e) => {
        previewCategory.textContent = e.target.value.toUpperCase();
        previewCard.style.opacity = "1";
    });
    inputDesc.addEventListener("input", (e) => {
        charCountSpan.textContent = e.target.value.length;
    });

    // Lightbox Controls
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", () => navigateLightbox(-1));
    lightboxNext.addEventListener("click", () => navigateLightbox(1));
    lightboxPlay.addEventListener("click", toggleSlideshow);
    lightboxZoomIn.addEventListener("click", () => zoomLightbox(1.25));
    lightboxZoomOut.addEventListener("click", () => zoomLightbox(0.8));
    lightboxLikeBtn.addEventListener("click", handleLightboxLike);
    lightboxShare.addEventListener("click", handleLightboxShare);

    // Keyboard navigation for Lightbox
    document.addEventListener("keydown", (e) => {
        if (currentLightboxIndex === -1) return;
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        if (e.key === "ArrowRight") navigateLightbox(1);
        if (e.key === "Escape") closeLightbox();
    });

    // Zoom container Pan dragging logic
    lightboxZoomContainer.addEventListener("mousedown", handleDragStart);
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);

    lightboxZoomContainer.addEventListener("touchstart", handleDragStart, { passive: true });
    document.addEventListener("touchmove", handleDragMove, { passive: false });
    document.addEventListener("touchend", handleDragEnd);

    // Theme Toggle click
    themeToggleBtn.addEventListener("click", toggleTheme);
}

/* --- Theme Toggle --- */
function toggleTheme() {
    activeTheme = activeTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", activeTheme);
    localStorage.setItem("lens_gallery_theme", activeTheme);
    showToast(`Switched to ${activeTheme === 'dark' ? 'Dark' : 'Light'} Mode`, "info");
}

/* --- Render Gallery --- */
function renderGallery() {
    // Apply grid opacity fade-out before loading new set
    galleryGrid.classList.add("filtering-out");

    setTimeout(() => {
        // Filter images
        filteredImagesList = images.filter(img => {
            // Category check
            const matchesCategory = activeCategory === "all" ||
                (activeCategory === "favorites" && likedIds.includes(img.id)) ||
                img.category === activeCategory;

            // Search query check (matches Title, Description, Author, or Tags)
            const matchesSearch = searchQuery === "" ||
                img.title.toLowerCase().includes(searchQuery) ||
                img.author.toLowerCase().includes(searchQuery) ||
                img.description.toLowerCase().includes(searchQuery) ||
                img.tags.some(t => t.toLowerCase().includes(searchQuery));

            return matchesCategory && matchesSearch;
        });

        // Sort images
        if (activeSort === "title-asc") {
            filteredImagesList.sort((a, b) => a.title.localeCompare(b.title));
        } else if (activeSort === "title-desc") {
            filteredImagesList.sort((a, b) => b.title.localeCompare(a.title));
        } else if (activeSort === "likes-desc") {
            filteredImagesList.sort((a, b) => b.likesCount - a.likesCount);
        }

        // Empty state trigger
        if (filteredImagesList.length === 0) {
            galleryGrid.style.display = "none";
            emptyState.style.display = "flex";
        } else {
            galleryGrid.style.display = "grid";
            emptyState.style.display = "none";
            
            // Build elements
            galleryGrid.innerHTML = filteredImagesList.map(img => {
                const isLiked = likedIds.includes(img.id);
                const likedClass = isLiked ? "liked" : "";
                
                return `
                    <article class="image-card" data-id="${img.id}">
                        <div class="image-wrapper skeleton">
                            <img src="${img.url}" alt="${img.title}" loading="lazy" onload="this.parentElement.classList.remove('skeleton')">
                            <div class="card-overlay">
                                <div class="card-actions">
                                    <button class="action-btn like-action-btn ${likedClass}" data-action="like" aria-label="Add to favorites">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    </button>
                                    <button class="action-btn" data-action="expand" aria-label="Expand image">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                                    </button>
                                </div>
                                <div class="card-meta">
                                    <span class="card-category">${img.category}</span>
                                    <h3>${img.title}</h3>
                                    <p class="author">By ${img.author}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                `;
            }).join("");

            // Add click events to gallery cards
            addCardClickHandlers();
        }

        // Update Stats Dashboard
        statsTotal.textContent = images.length;
        statsLiked.textContent = likedIds.length;
        statsActiveFilter.textContent = activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1);

        // Remove filter-out transition class
        galleryGrid.classList.remove("filtering-out");
    }, 250);
}

function addCardClickHandlers() {
    const cards = galleryGrid.querySelectorAll(".image-card");
    cards.forEach(card => {
        const id = card.dataset.id;
        
        // General click triggers expansion
        card.addEventListener("click", (e) => {
            const likeBtn = e.target.closest('.like-action-btn');
            if (likeBtn) {
                e.stopPropagation();
                toggleLike(id);
                return;
            }
            openLightbox(id);
        });
    });
}

/* --- Likes Management --- */
function toggleLike(id) {
    const imgObj = images.find(img => img.id === id);
    if (!imgObj) return;

    const index = likedIds.indexOf(id);
    if (index > -1) {
        likedIds.splice(index, 1);
        imgObj.likesCount = Math.max(0, imgObj.likesCount - 1);
        showToast(`Removed "${imgObj.title}" from favorites`, "info");
    } else {
        likedIds.push(id);
        imgObj.likesCount += 1;
        showToast(`Added "${imgObj.title}" to favorites!`, "success");
    }

    // Save to local storage
    localStorage.setItem("lens_gallery_likes", JSON.stringify(likedIds));
    localStorage.setItem("lens_gallery_images", JSON.stringify(images));

    // Re-render
    renderGallery();
}

/* --- Filter Resets --- */
function resetAllFilters() {
    searchInput.value = "";
    searchQuery = "";
    activeCategory = "all";
    activeSort = "default";
    sortSelect.value = "default";

    // Set active pill back to "All"
    document.querySelectorAll(".category-pill").forEach(p => {
        p.classList.remove("active");
        if (p.dataset.category === "all") p.classList.add("active");
    });

    renderGallery();
    showToast("Filters and search cleared", "info");
}

/* --- Lightbox Modal Logic --- */
function openLightbox(id) {
    currentLightboxIndex = filteredImagesList.findIndex(img => img.id === id);
    if (currentLightboxIndex === -1) return;

    // Load photo details into lightbox
    updateLightboxContent();

    // Reset Zoom
    resetZoom();

    // Show modal
    lightboxModal.classList.add("active");
    document.body.style.overflow = "hidden"; // disable background scrolling
}

function closeLightbox() {
    lightboxModal.classList.remove("active");
    document.body.style.overflow = ""; // enable scrolling
    currentLightboxIndex = -1;
    stopSlideshow();
}

function updateLightboxContent() {
    const imgObj = filteredImagesList[currentLightboxIndex];
    if (!imgObj) return;

    lightboxImg.src = imgObj.url;
    lightboxImg.alt = imgObj.title;
    lightboxTitle.textContent = imgObj.title;
    lightboxAuthor.textContent = imgObj.author;
    lightboxCategory.textContent = imgObj.category;
    lightboxDesc.textContent = imgObj.description;
    
    // Set tags
    lightboxTags.innerHTML = imgObj.tags.map(t => `<span class="lightbox-tag">#${t}</span>`).join("");
    
    // Add click event to tags
    lightboxTags.querySelectorAll(".lightbox-tag").forEach(tagElement => {
        tagElement.addEventListener("click", () => {
            const rawTag = tagElement.textContent.replace("#", "");
            closeLightbox();
            searchInput.value = rawTag;
            searchQuery = rawTag.toLowerCase();
            renderGallery();
        });
    });

    // Set liked button state
    const isLiked = likedIds.includes(imgObj.id);
    if (isLiked) {
        lightboxLikeBtn.classList.add("liked");
        lightboxLikeBtn.setAttribute("aria-label", "Remove from favorites");
    } else {
        lightboxLikeBtn.classList.remove("liked");
        lightboxLikeBtn.setAttribute("aria-label", "Add to favorites");
    }

    // Set download attributes
    lightboxDownload.href = imgObj.url;
}

function navigateLightbox(direction) {
    if (filteredImagesList.length <= 1) return;

    // Fade out viewport slightly before swap
    lightboxImg.style.opacity = "0.3";

    setTimeout(() => {
        currentLightboxIndex = (currentLightboxIndex + direction + filteredImagesList.length) % filteredImagesList.length;
        updateLightboxContent();
        resetZoom();
        lightboxImg.style.opacity = "1";

        // Reset slideshow interval to give full time for the new slide
        if (isSlideshowPlaying) {
            resetSlideshowTimer();
        }
    }, 150);
}

function handleLightboxLike() {
    const imgObj = filteredImagesList[currentLightboxIndex];
    if (!imgObj) return;

    toggleLike(imgObj.id);
    // Sync the lightbox's like button state
    const isLiked = likedIds.includes(imgObj.id);
    if (isLiked) {
        lightboxLikeBtn.classList.add("liked");
    } else {
        lightboxLikeBtn.classList.remove("liked");
    }
}

function handleLightboxShare() {
    const imgObj = filteredImagesList[currentLightboxIndex];
    if (!imgObj) return;

    // Simulate link copy using current location + image id
    const mockShareLink = `${window.location.origin}${window.location.pathname}?photo=${imgObj.id}`;
    
    navigator.clipboard.writeText(mockShareLink)
        .then(() => {
            showToast("Share link copied to clipboard!", "success");
        })
        .catch(() => {
            // Fallback
            showToast("Failed to copy link.", "error");
        });
}

/* --- Slideshow Control --- */
function toggleSlideshow() {
    if (isSlideshowPlaying) {
        stopSlideshow();
        showToast("Slideshow paused", "info");
    } else {
        startSlideshow();
        showToast("Slideshow started", "success");
    }
}

function startSlideshow() {
    isSlideshowPlaying = true;
    lightboxPlay.classList.add("active");
    lightboxPlay.querySelector(".play-svg").style.display = "none";
    lightboxPlay.querySelector(".pause-svg").style.display = "block";
    slideshowStatus.classList.add("active");

    resetSlideshowTimer();
}

function stopSlideshow() {
    isSlideshowPlaying = false;
    lightboxPlay.classList.remove("active");
    lightboxPlay.querySelector(".play-svg").style.display = "block";
    lightboxPlay.querySelector(".pause-svg").style.display = "none";
    slideshowStatus.classList.remove("active");

    clearInterval(slideshowIntervalId);
    clearInterval(slideshowProgressIntervalId);
}

function resetSlideshowTimer() {
    clearInterval(slideshowIntervalId);
    clearInterval(slideshowProgressIntervalId);

    // Set visual progress bar to 0% and animate it
    slideshowProgress.style.transition = "none";
    slideshowProgress.style.width = "0%";
    
    // Force DOM reflow
    void slideshowProgress.offsetWidth;

    // Apply linear transition over SLIDESHOW_DURATION
    slideshowProgress.style.transition = `width ${SLIDESHOW_DURATION}ms linear`;
    slideshowProgress.style.width = "100%";

    // Set interval for switching slide
    slideshowIntervalId = setInterval(() => {
        navigateLightbox(1);
    }, SLIDESHOW_DURATION);
}

/* --- Zoom & Pan Logic --- */
function zoomLightbox(factor) {
    const prevScale = zoomScale;
    
    if (factor > 1) {
        // Zooming in
        zoomScale = Math.min(4, zoomScale * factor);
    } else {
        // Zooming out
        zoomScale = Math.max(1, zoomScale * factor);
    }

    if (zoomScale === 1) {
        // Reset translation completely on zoom out
        zoomTranslateX = 0;
        zoomTranslateY = 0;
        lightboxZoomContainer.style.transition = "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";
    } else {
        lightboxZoomContainer.style.transition = "transform 0.2s ease-out";
    }

    applyZoomTransform();
}

function resetZoom() {
    zoomScale = 1;
    zoomTranslateX = 0;
    zoomTranslateY = 0;
    lightboxZoomContainer.style.transition = "none";
    applyZoomTransform();
}

function applyZoomTransform() {
    lightboxZoomContainer.style.transform = `translate(${zoomTranslateX}px, ${zoomTranslateY}px) scale(${zoomScale})`;
}

// Drag & Pan handlers
function handleDragStart(e) {
    if (zoomScale <= 1) return; // Only allow panning when zoomed in
    isDragging = true;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    startX = clientX - zoomTranslateX;
    startY = clientY - zoomTranslateY;
    lightboxZoomContainer.style.transition = "none";
}

function handleDragMove(e) {
    if (!isDragging) return;
    
    // Prevent default touch scrolling when dragging inside lightbox
    if (e.cancelable) e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    zoomTranslateX = clientX - startX;
    zoomTranslateY = clientY - startY;

    // Apply viewport bounds (optional, but makes panning feel more anchored)
    // Here we'll just apply direct translation
    applyZoomTransform();
}

function handleDragEnd() {
    isDragging = false;
}

/* --- Upload Modal Handlers --- */
function openUploadModal() {
    uploadModal.classList.add("active");
    document.body.style.overflow = "hidden";
    // Reset Live Preview
    resetFormPreview();
}

function closeUploadModal() {
    uploadModal.classList.remove("active");
    document.body.style.overflow = "";
    uploadForm.reset();
    resetValidationMessages();
}

function resetFormPreview() {
    previewImg.src = "";
    previewImg.style.display = "none";
    previewPlaceholder.style.display = "flex";
    previewTitle.textContent = "Title Placeholder";
    previewCategory.textContent = "Category";
    previewCard.style.opacity = "0.7";
    charCountSpan.textContent = "0";
}

function handleUrlInput(e) {
    const url = e.target.value.trim();
    const isValid = /^https?:\/\/.+/.test(url);

    if (isValid) {
        previewImg.src = url;
        previewImg.style.display = "block";
        previewPlaceholder.style.display = "none";
        previewCard.style.opacity = "1";
        
        // Hide error message if typing valid URL
        document.getElementById("url-error").style.display = "none";
        inputUrl.classList.remove("invalid");
    } else {
        previewImg.src = "";
        previewImg.style.display = "none";
        previewPlaceholder.style.display = "flex";
        previewCard.style.opacity = "0.7";
    }
}

function resetValidationMessages() {
    document.querySelectorAll(".error-message").forEach(el => el.style.display = "none");
    document.querySelectorAll("input, select, textarea").forEach(el => el.classList.remove("invalid"));
}

function handleFormSubmit(e) {
    e.preventDefault();
    resetValidationMessages();

    let isValid = true;

    // URL Validation
    const url = inputUrl.value.trim();
    if (!/^https?:\/\/.+/.test(url)) {
        document.getElementById("url-error").style.display = "block";
        inputUrl.classList.add("invalid");
        isValid = false;
    }

    // Title Validation
    const title = inputTitle.value.trim();
    if (title.length < 3 || title.length > 40) {
        document.getElementById("title-error").style.display = "block";
        inputTitle.classList.add("invalid");
        isValid = false;
    }

    // Category Validation
    const category = inputCategory.value;
    if (!category) {
        document.getElementById("category-error").style.display = "block";
        inputCategory.classList.add("invalid");
        isValid = false;
    }

    if (!isValid) {
        showToast("Please fix form errors before publishing.", "error");
        return;
    }

    // Process tag inputs
    const rawTags = inputTags.value.trim();
    const tags = rawTags ? rawTags.split(",")
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0)
        .slice(0, 5) : [];

    // Create image object
    const newImage = {
        id: `img-custom-${Date.now()}`,
        url: url,
        title: title,
        category: category,
        author: "You",
        tags: tags.length > 0 ? tags : [category],
        description: inputDesc.value.trim() || `A beautiful photograph representing the beauty of ${category}.`,
        likesCount: 0
    };

    // Save to State
    images.unshift(newImage); // Add to beginning of grid

    // Save to Local Storage
    localStorage.setItem("lens_gallery_images", JSON.stringify(images));

    // Close Modal & Reset Form
    closeUploadModal();

    // Re-render
    renderGallery();

    showToast(`Successfully published "${title}"!`, "success");
}

/* --- Toast Notification System --- */
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast`;
    
    let iconSvg = "";
    let iconClass = "";

    switch (type) {
        case "success":
            iconClass = "toast-icon-success";
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            break;
        case "error":
            iconClass = "toast-icon-error";
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            break;
        case "info":
        default:
            iconClass = "toast-icon-info";
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            break;
    }

    toast.innerHTML = `
        <div class="toast-icon ${iconClass}">
            ${iconSvg}
        </div>
        <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.add("removing");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    }, 3000);
}

// Start Application
window.addEventListener("DOMContentLoaded", init);
