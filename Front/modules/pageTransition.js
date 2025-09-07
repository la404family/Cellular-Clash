// Module pour les transitions entre pages
export class PageTransition {
    constructor() {
        this.isTransitioning = false;
        this.overlay = null;
        this.init();
    }

    // Initialise le module de transition
    init() {
        this.createOverlay();
        this.setupPageLoadTransition();
    }

    // Crée l'overlay de transition
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease-in-out;
        `;
        document.body.appendChild(this.overlay);
    }

    // Configure la transition d'entrée de page
    setupPageLoadTransition() {
        // Démarrer avec l'overlay visible
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';

        // Attendre que la page soit chargée puis faire le fade-in
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.fadeIn();
            }, 100);
        });

        // Fallback si l'événement load ne se déclenche pas
        if (document.readyState === 'complete') {
            setTimeout(() => {
                this.fadeIn();
            }, 100);
        }
    }

    // Transition de fade-in (du noir vers la page)
    fadeIn() {
        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
    }

    // Transition de fade-out (de la page vers le noir)
    fadeOut() {
        return new Promise((resolve) => {
            this.overlay.style.opacity = '1';
            this.overlay.style.pointerEvents = 'auto';

            setTimeout(() => {
                resolve();
            }, 700); // Durée de la transition
        });
    }

    // Effet de clignotement sur un bouton
    blinkButton(button) {
        return new Promise((resolve) => {
            if (!button) {
                resolve();
                return;
            }

            let blinkCount = 0;
            const maxBlinks = 2; // Nombre de clignotements
            const blinkInterval = 80; // Durée entre chaque clignotement

            const originalBoxShadow = button.style.boxShadow;
            const originalTransform = button.style.transform;

            const blink = () => {
                if (blinkCount < maxBlinks * 2) {
                    if (blinkCount % 2 === 0) {
                        // Allumer
                        button.style.boxShadow = '0 0 20px var(--color-accent), 0 0 40px var(--color-accent)';
                        button.style.transform = 'scale(1.05)';
                    } else {
                        // Éteindre
                        button.style.boxShadow = originalBoxShadow;
                        button.style.transform = originalTransform;
                    }
                    blinkCount++;
                    setTimeout(blink, blinkInterval);
                } else {
                    // Restaurer l'état original
                    button.style.boxShadow = originalBoxShadow;
                    button.style.transform = originalTransform;
                    resolve();
                }
            };

            blink();
        });
    }

    // Transition complète vers une nouvelle page
    async transitionToPage(url, button = null) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        try {
            // 1. Faire clignoter le bouton
            if (button) {
                await this.blinkButton(button);
            }

            // 2. Fade out vers le noir
            await this.fadeOut();

            // 3. Naviguer vers la nouvelle page
            window.location.href = url;

        } catch (error) {
            console.error('Erreur lors de la transition:', error);
            this.isTransitioning = false;
        }
    }

    // Méthode pour attacher les événements aux boutons
    attachToButton(button, url) {
        if (!button) return;

        // Supprimer les anciens événements onclick
        button.removeAttribute('onclick');

        // Ajouter le nouvel événement
        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.transitionToPage(url, button);
        });
    }

    // Méthode pour attacher aux éléments de langue
    attachToLanguageItem(item, callback) {
        if (!item) return;

        const originalCallback = callback;

        item.addEventListener('click', async (e) => {
            e.preventDefault();

            // Faire clignoter l'élément
            await this.blinkButton(item);

            // Fade out
            await this.fadeOut();

            // Exécuter le callback original (sélection de langue + navigation)
            if (originalCallback) {
                originalCallback();
            }
        });
    }
}

// Export par défaut
export default PageTransition;
