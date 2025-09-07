// Module pour l'effet de lumière douce sur les boutons
export class LightEffect {
    constructor() {
        this.buttons = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        this.animationDuration = 1500; // Durée de l'effet de lumière en ms
        this.cycleDuration = 3000; // Cycle complet toutes les 3 secondes
    }

    // Initialise l'effet avec les boutons du menu
    init() {
        this.buttons = document.querySelectorAll('.menu-button');
        if (this.buttons.length > 0) {
            this.startLightCycle();
        }
    }

    // Démarre le cycle de lumière
    startLightCycle() {

        // Démarre immédiatement puis répète toutes les 3 secondes
        this.runLightSequence();
        setInterval(() => {

            this.runLightSequence();
        }, this.cycleDuration);
    }

    // Exécute la séquence de lumière sur tous les boutons
    runLightSequence() {
        if (this.isAnimating) {

            return;
        }


        this.isAnimating = true;
        this.currentIndex = 0;

        this.lightNextButton();
    }

    // Applique l'effet de lumière au bouton suivant
    lightNextButton() {
        if (this.currentIndex >= this.buttons.length) {

            this.isAnimating = false;
            return;
        }

        const button = this.buttons[this.currentIndex];

        this.applyLightEffect(button);

        // Incrémente l'index pour le prochain bouton
        this.currentIndex++;

        // Passe au bouton suivant après un délai
        setTimeout(() => {
            this.lightNextButton();
        }, this.animationDuration); // Délai complet entre chaque bouton
    }

    // Applique l'effet de lumière à un bouton spécifique
    applyLightEffect(button) {
        // Crée l'élément de lumière
        const light = document.createElement('div');
        light.className = 'light-sweep';
        light.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(255, 255, 255, 0.4) 20%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0.4) 80%,
                transparent 100%
            );
            pointer-events: none;
            z-index: 10;
            transition: left ${this.animationDuration}ms ease-out;
            border-radius: 8px;
        `;

        // S'assure que le bouton a une position relative
        const originalPosition = getComputedStyle(button).position;
        if (originalPosition === 'static') {
            button.style.position = 'relative';
        }

        // Ajoute l'effet de surbrillance au bouton
        const originalBoxShadow = button.style.boxShadow;
        const buttonId = button.id;
        let glowColor = 'rgba(255, 255, 255, 0.6)';

        // Adapte la couleur de la lueur selon le bouton
        switch (buttonId) {
            case 'play-btn':
                glowColor = 'rgba(255, 62, 109, 0.8)';
                break;
            case 'stats-btn':
                glowColor = 'rgba(255, 215, 0, 0.8)';
                break;
            case 'options-btn':
                glowColor = 'rgba(255, 147, 0, 0.8)';
                break;
            case 'languages-btn':
                glowColor = 'rgba(62, 193, 211, 0.8)';
                break;
            case 'credits-btn':
                glowColor = 'rgba(138, 43, 226, 0.8)';
                break;
        }

        // Ajoute l'élément de lumière au bouton
        button.appendChild(light);

        // Anime la lumière et la lueur
        requestAnimationFrame(() => {
            light.style.left = '100%';
            button.style.boxShadow = `${originalBoxShadow}, 0 0 25px ${glowColor}`;

            // Anime l'intensité de la lueur
            setTimeout(() => {
                button.style.boxShadow = `${originalBoxShadow}, 0 0 40px ${glowColor}`;
            }, this.animationDuration * 0.3);
        });

        // Nettoie après l'animation
        setTimeout(() => {
            if (light.parentNode) {
                light.remove();
            }
            button.style.boxShadow = originalBoxShadow;

            // Restaure la position si elle était statique
            if (originalPosition === 'static') {
                button.style.position = originalPosition;
            }
        }, this.animationDuration + 100);
    }

    // Méthode pour arrêter l'effet si nécessaire
    stop() {
        this.isAnimating = false;
        // Nettoie tous les effets en cours
        this.buttons.forEach(button => {
            const lights = button.querySelectorAll('.light-sweep');
            lights.forEach(light => light.remove());
        });
    }
}

// Export par défaut pour faciliter l'import
export default LightEffect;
