/**
 * ============================================================================
 * TAVANT PRESENTATION SLIDES - SCRIPT
 * ============================================================================
 * 
 * This script handles:
 * - Multi-slide navigation (← → keys, buttons)
 * - Responsive scaling of the 16:9 slide stage
 * - Timeline-based entrance animations
 * - Keyboard controls (Arrows, Space, R, O, P, F)
 * - Dev controls (prev/next, replay, overlay, present mode, fullscreen)
 * 
 * ============================================================================
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // Slide dimensions
    stage: {
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9
    }
};

// ============================================================================
// ANIMATION CONFIGURATION
// ============================================================================

const ANIMATION_CONFIG = {
    initialDelay: 300,
    staggerDelay: 150,
    transitionDuration: 600
};

// ============================================================================
// SLIDE CONTROLLER CLASS
// ============================================================================

class SlideController {
    constructor() {
        // State
        this.currentSlide = 1;
        this.totalSlides = 0;
        this.isOverlayActive = false;
        this.isPresentMode = false;
        this.isAnimating = false;
        
        // DOM Elements
        this.slidesContainer = document.querySelector('.slides-container');
        this.stageContainers = document.querySelectorAll('.stage-container');
        this.devControls = document.getElementById('devControls');
        
        // Control buttons
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.slideIndicator = document.getElementById('slideIndicator');
        this.replayBtn = document.getElementById('replayBtn');
        this.overlayBtn = document.getElementById('overlayBtn');
        this.presentBtn = document.getElementById('presentBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Initialize
        this.init();
    }
    
    init() {
        this.totalSlides = this.stageContainers.length;
        this.setupResponsiveScaling();
        this.setupEventListeners();
        this.updateSlideIndicator();
        this.showSlide(1);
        
        console.log(`🎬 Slide Controller Initialized (${this.totalSlides} slides)`);
        console.log('Keyboard shortcuts: ←/→ = Navigate, Space/R = Replay, O = Overlay, P = Present, F = Fullscreen');
    }
    
    /**
     * Set up responsive scaling for all stages
     */
    setupResponsiveScaling() {
        const resize = () => {
            this.stageContainers.forEach(container => {
                const stage = container.querySelector('.stage');
                if (!container || !stage) return;
                
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                
                const scaleX = containerWidth / CONFIG.stage.width;
                const scaleY = containerHeight / CONFIG.stage.height;
                const scale = Math.min(scaleX, scaleY, 1);
                
                stage.style.transform = `scale(${scale})`;
            });
        };
        
        resize();
        window.addEventListener('resize', resize);
        document.addEventListener('fullscreenchange', resize);
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.replayBtn?.addEventListener('click', () => this.playAnimation());
        this.overlayBtn?.addEventListener('click', () => this.toggleOverlay());
        this.presentBtn?.addEventListener('click', () => this.togglePresentMode());
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case ' ':
            case 'r':
            case 'R':
                e.preventDefault();
                this.playAnimation();
                break;
            case 'o':
            case 'O':
                e.preventDefault();
                this.toggleOverlay();
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePresentMode();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
        }
    }
    
    /**
     * Show a specific slide
     */
    showSlide(slideNum) {
        if (slideNum < 1 || slideNum > this.totalSlides) return;
        
        this.currentSlide = slideNum;
        
        // Hide all slides, show current
        this.stageContainers.forEach((container, index) => {
            const isActive = (index + 1) === slideNum;
            container.style.display = isActive ? 'flex' : 'none';
        });
        
        this.updateSlideIndicator();
        
        // Re-apply scaling for the newly visible slide
        setTimeout(() => {
            this.applyScalingToSlide(slideNum);
            this.playAnimation();
        }, 10);
    }
    
    /**
     * Apply scaling to a specific slide
     */
    applyScalingToSlide(slideNum) {
        const container = this.stageContainers[slideNum - 1];
        if (!container) return;
        
        const stage = container.querySelector('.stage');
        if (!stage) return;
        
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const scaleX = containerWidth / CONFIG.stage.width;
        const scaleY = containerHeight / CONFIG.stage.height;
        const scale = Math.min(scaleX, scaleY, 1);
        
        stage.style.transform = `scale(${scale})`;
    }
    
    /**
     * Navigate to previous slide
     */
    prevSlide() {
        if (this.currentSlide > 1) {
            this.showSlide(this.currentSlide - 1);
        }
    }
    
    /**
     * Navigate to next slide
     */
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.showSlide(this.currentSlide + 1);
        }
    }
    
    /**
     * Update the slide indicator text
     */
    updateSlideIndicator() {
        if (this.slideIndicator) {
            this.slideIndicator.textContent = `${this.currentSlide} / ${this.totalSlides}`;
        }
    }
    
    /**
     * Play the entrance animation for current slide
     */
    playAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const currentContainer = this.stageContainers[this.currentSlide - 1];
        if (!currentContainer) return;
        
        const animatedElements = currentContainer.querySelectorAll('.animate-element');
        
        // Reset all elements
        animatedElements.forEach(el => el.classList.remove('animated'));
        
        // Reset SVG elements if present (Slide 2 lifecycle)
        this.resetSVGAnimations(currentContainer);
        
        // Force reflow
        void currentContainer.offsetWidth;
        
        // Animate each element with stagger
        animatedElements.forEach((el, index) => {
            const delay = ANIMATION_CONFIG.initialDelay + (index * ANIMATION_CONFIG.staggerDelay);
            setTimeout(() => el.classList.add('animated'), delay);
        });
        
        // Animate SVG curve if present (Slide 2)
        this.animateSVGCurve(currentContainer);
        
        // Animate pipeline steps if present (Slide 3)
        this.animatePipelineSteps(currentContainer);
        
        // Reset animating flag
        const totalTime = ANIMATION_CONFIG.initialDelay + 
            (animatedElements.length * ANIMATION_CONFIG.staggerDelay) + 
            ANIMATION_CONFIG.transitionDuration;
        
        setTimeout(() => { this.isAnimating = false; }, totalTime);
    }
    
    /**
     * Reset SVG animations (for replay)
     */
    resetSVGAnimations(container) {
        const curvePath = container.querySelector('.curve-path');
        const markers = container.querySelectorAll('.stage-marker');
        const labels = container.querySelectorAll('.stage-label');
        
        if (curvePath) {
            curvePath.classList.remove('animated');
            curvePath.style.strokeDashoffset = '1000';
        }
        
        markers.forEach(m => m.classList.remove('animated'));
        labels.forEach(l => l.classList.remove('animated'));
    }
    
    /**
     * Animate SVG lifecycle curve (Slide 2)
     */
    animateSVGCurve(container) {
        const curvePath = container.querySelector('.curve-path');
        const markers = container.querySelectorAll('.stage-marker');
        const labels = container.querySelectorAll('.stage-label');
        
        if (!curvePath) return;
        
        // Animate curve drawing after lifecycle container appears
        setTimeout(() => {
            curvePath.classList.add('animated');
            curvePath.style.strokeDashoffset = '0';
        }, 600);
        
        // Animate markers with stagger
        markers.forEach((marker, i) => {
            setTimeout(() => {
                marker.classList.add('animated');
            }, 1200 + (i * 200));
        });
        
        // Animate labels after markers
        labels.forEach((label, i) => {
            setTimeout(() => {
                label.classList.add('animated');
            }, 1400 + (i * 150));
        });
    }
    
    /**
     * Animate pipeline steps (Slide 3)
     */
    animatePipelineSteps(container) {
        const pipelineSteps = container.querySelectorAll('.pipeline-step');
        const pipelineArrows = container.querySelectorAll('.pipeline-arrow');
        const toolkitCards = container.querySelectorAll('.toolkit-card');
        
        if (pipelineSteps.length === 0 && toolkitCards.length === 0) return;
        
        // Reset elements
        pipelineSteps.forEach(step => step.classList.remove('animated'));
        pipelineArrows.forEach(arrow => arrow.classList.remove('animated'));
        toolkitCards.forEach(card => card.classList.remove('animated'));
        
        // Wait for container to become visible first (data-animate="3" = ~600ms)
        let delay = 900;
        
        // Animate steps and arrows in sequence
        pipelineSteps.forEach((step, i) => {
            setTimeout(() => step.classList.add('animated'), delay);
            delay += 250;
            
            // Animate arrow after step (if exists)
            if (pipelineArrows[i]) {
                setTimeout(() => pipelineArrows[i].classList.add('animated'), delay);
                delay += 150;
            }
        });
        
        // Animate toolkit cards with stagger
        delay += 200;
        toolkitCards.forEach((card, i) => {
            setTimeout(() => card.classList.add('animated'), delay + (i * 150));
        });
    }
    
    /**
     * Toggle reference overlay for current slide
     */
    toggleOverlay() {
        this.isOverlayActive = !this.isOverlayActive;
        
        // Toggle overlay on current slide
        const currentContainer = this.stageContainers[this.currentSlide - 1];
        const overlay = currentContainer?.querySelector('.reference-overlay');
        if (overlay) {
            overlay.classList.toggle('active', this.isOverlayActive);
        }
        
        if (this.overlayBtn) {
            this.overlayBtn.textContent = this.isOverlayActive ? '📐 Hide Overlay' : '📐 Overlay';
        }
    }
    
    /**
     * Toggle present mode
     */
    togglePresentMode() {
        this.isPresentMode = !this.isPresentMode;
        document.body.classList.toggle('present-mode', this.isPresentMode);
        
        if (this.presentBtn) {
            this.presentBtn.textContent = this.isPresentMode ? '🎬 Exit Present' : '🎬 Present';
        }
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.() || 
            document.documentElement.webkitRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    window.slideController = new SlideController();
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function goToSlide(num) {
    window.slideController?.showSlide(num);
}

function nextSlide() {
    window.slideController?.nextSlide();
}

function prevSlide() {
    window.slideController?.prevSlide();
}

function replayAnimation() {
    window.slideController?.playAnimation();
}