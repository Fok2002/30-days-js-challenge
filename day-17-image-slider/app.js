class ImageSlider {
    constructor() {
        // Elements
        this.slider = document.querySelector('.slider');
        this.slides = document.querySelectorAll('.slide');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        this.indicators = document.querySelectorAll('.indicator');
        this.pausePlayBtn = document.querySelector('.pause-play-btn');
        this.currentSlideSpan = document.querySelector('.current-slide');
        this.pauseIcon = document.querySelector('.pause-icon');
        this.playIcon = document.querySelector('.play-icon');

        // State
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoSlideInterval = null;
        this.isAutoSliding = true;
        this.autoSlideDelay = 4000; // 4 seconds

        this.init();
    }

    init() {
        this.addEventListeners();
        this.startAutoSlide();
    }

    addEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });

        // Pause/Play button
        this.pausePlayBtn.addEventListener('click', () => this.toggleAutoSlide());

        // Pause on hover
        this.slider.parentElement.addEventListener('mouseenter', () => {
            if (this.isAutoSliding) {
                this.stopAutoSlide();
            }
        });

        // Resume on mouse leave
        this.slider.parentElement.addEventListener('mouseleave', () => {
            if (this.isAutoSliding) {
                this.startAutoSlide();
            }
        });
    }

    updateSlider() {
        // Update slider position
        const translateValue = -this.currentIndex * 100;
        this.slider.style.transform = `translateX(${translateValue}%)`;

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // Update slide counter
        this.currentSlideSpan.textContent = this.currentIndex + 1;
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
        // Restart auto-slide timer when manually navigating
        if (this.isAutoSliding) {
            this.stopAutoSlide();
            this.startAutoSlide();
        }
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    toggleAutoSlide() {
        this.isAutoSliding = !this.isAutoSliding;

        if (this.isAutoSliding) {
            // Resume auto-slide
            this.pauseIcon.style.display = 'inline';
            this.playIcon.style.display = 'none';
            this.startAutoSlide();
        } else {
            // Pause auto-slide
            this.pauseIcon.style.display = 'none';
            this.playIcon.style.display = 'inline';
            this.stopAutoSlide();
        }
    }
}

// Initialize the slider when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ImageSlider();
});
