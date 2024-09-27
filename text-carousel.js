class TextCarousel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Default properties
        this.textItems = [];
        this.duration = 3000;
        this.loop = true;
        this.autoplay = true;
        this.currentIndex = 0;
        this.numOfSlides = 1;
        this.intervalId = null;
        this.animationType = 'slide'; // Default animation

        // Create elements
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'carousel-container');

        this.content = document.createElement('div');
        this.content.setAttribute('class', 'carousel-content');

        this.settings = document.createElement('div');
        this.settings.setAttribute('class', 'settings-menu');

        this.createSettingsMenu();

        // Append elements
        this.container.appendChild(this.content);
        this.shadowRoot.appendChild(this.settings);
        this.shadowRoot.appendChild(this.container);

        // Add styles
        this.addStyles();
    }

    connectedCallback() {
        if (this.autoplay) {
            this.startAutoplay();
        }
    }

    disconnectedCallback() {
        this.stopAutoplay();
    }

    createSettingsMenu() {
        // Textarea for input
        const textArea = document.createElement('textarea');
        textArea.placeholder = "Enter text items separated by '&&'";
        textArea.addEventListener('change', () => {
            this.textItems = textArea.value.split('&&').map(item => item.trim());
            this.updateContent();
        });

        // Input for duration
        const durationInput = document.createElement('input');
        durationInput.type = 'number';
        durationInput.placeholder = 'Set duration (ms)';
        durationInput.addEventListener('change', () => {
            this.duration = parseInt(durationInput.value, 10);
            this.restartAutoplay();
        });

        // Checkbox for loop
        const loopCheckbox = document.createElement('input');
        loopCheckbox.type = 'checkbox';
        loopCheckbox.checked = this.loop;
        loopCheckbox.addEventListener('change', () => {
            this.loop = loopCheckbox.checked;
        });

        // Checkbox for autoplay
        const autoplayCheckbox = document.createElement('input');
        autoplayCheckbox.type = 'checkbox';
        autoplayCheckbox.checked = this.autoplay;
        autoplayCheckbox.addEventListener('change', () => {
            this.autoplay = autoplayCheckbox.checked;
            this.autoplay ? this.startAutoplay() : this.stopAutoplay();
        });

        // Select for animation type
        const animationSelect = document.createElement('select');
        ['slide', 'fade', 'slide-up', 'zoom', 'flip', 'none'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            animationSelect.appendChild(option);
        });
        animationSelect.addEventListener('change', () => {
            this.animationType = animationSelect.value;
            this.updateContent();
        });

        // Number of slides to show
        const slidesInput = document.createElement('input');
        slidesInput.type = 'number';
        slidesInput.placeholder = 'Slides to show';
        slidesInput.addEventListener('change', () => {
            this.numOfSlides = parseInt(slidesInput.value, 10);
            this.updateContent();
        });

        // Control buttons
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => this.showPrevious());

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => this.showNext());

        const pauseButton = document.createElement('button');
        pauseButton.textContent = 'Pause';
        pauseButton.addEventListener('click', () => this.stopAutoplay());

        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.addEventListener('click', () => this.startAutoplay());

        // Append all controls to settings menu
        this.settings.append(
            textArea, durationInput, loopCheckbox, autoplayCheckbox,
            animationSelect, slidesInput, prevButton, nextButton,
            pauseButton, playButton
        );
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .carousel-container {
                width: 300px;
                height: 100px;
                border: 1px solid #ccc;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                position: relative;
                background-color: #f9f9f9;
            }

            .carousel-content {
                display: inline-block;
                white-space: nowrap;
                transition: transform 0.5s ease, opacity 0.5s ease;
                padding: 5px;
                text-align: center;
            }

            .fade {
                opacity: 0;
                transition: opacity 0.5s ease;
            }

            .slide-up {
                transform: translateY(100%);
                transition: transform 0.5s ease;
            }

            .zoom {
                transform: scale(0);
                transition: transform 0.5s ease;
            }

            .flip {
                transform: rotateY(90deg);
                transition: transform 0.5s ease;
            }

            .settings-menu {
                display: flex;
                flex-direction: column;
                margin-bottom: 10px;
            }

            textarea, input, select, button {
                margin: 2px 0;
                padding: 5px;
                font-size: 14px;
            }
        `;
        this.shadowRoot.appendChild(style);
    }

    applyAnimation() {
        // Clear existing animation classes
        this.content.classList.remove('fade', 'slide-up', 'zoom', 'flip');

        // Apply the selected animation type
        switch (this.animationType) {
            case 'fade':
                this.content.classList.add('fade');
                break;
            case 'slide-up':
                this.content.classList.add('slide-up');
                break;
            case 'zoom':
                this.content.classList.add('zoom');
                break;
            case 'flip':
                this.content.classList.add('flip');
                break;
        }

        // Force reflow to restart the animation
        this.content.offsetHeight; 
    }

    showNext() {
        this.applyAnimation();
        if (this.currentIndex < this.textItems.length - this.numOfSlides) {
            this.currentIndex++;
            this.updateContent();
        } else if (this.loop) {
            this.currentIndex = 0;
            this.updateContent();
        }
    }

    showPrevious() {
        this.applyAnimation();
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateContent();
        } else if (this.loop) {
            this.currentIndex = this.textItems.length - this.numOfSlides;
            this.updateContent();
        }
    }

    updateContent() {
        const visibleItems = this.textItems.slice(this.currentIndex, this.currentIndex + this.numOfSlides);
        this.content.textContent = visibleItems.join(' && ');
        
        // Ensure the animation applies correctly
        setTimeout(() => {
            this.content.classList.remove('fade', 'slide-up', 'zoom', 'flip');
        }, 500);
    }

    startAutoplay() {
        this.stopAutoplay(); // Stop any existing interval first
        this.intervalId = setInterval(() => this.showNext(), this.duration);
    }

    stopAutoplay() {
        clearInterval(this.intervalId);
    }

    restartAutoplay() {
        if (this.autoplay) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }
}

// Define the custom element
customElements.define('text-carousel', TextCarousel);
