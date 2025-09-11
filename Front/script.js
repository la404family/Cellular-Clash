// Import des modules d'effet
import LightEffect from './modules/lightEffect.js';
import PageTransition from './modules/pageTransition.js';
import LanguageManager from './modules/languageManager.js';
import { getTranslationManager } from './modules/translationManager.js';
import { getConfigManager } from './modules/configManager.js';

// Initialiser les gestionnaires
const configManager = getConfigManager();
const pageTransition = new PageTransition();
const translationManager = getTranslationManager();

// Initialiser le système de traductions
translationManager.init();

// Vérifier si on est sur la page index
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    const lightEffect = new LightEffect();
    lightEffect.init();

    // Attacher les transitions aux boutons du menu principal
    document.addEventListener('DOMContentLoaded', () => {
        const languagesBtn = document.getElementById('languages-btn');
        if (languagesBtn) {
            pageTransition.attachToButton(languagesBtn, 'html/languages.html');
        }

        // Attacher la transition au bouton Play vers game.html
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            pageTransition.attachToButton(playBtn, 'html/game.html');
        }
    });
}

// Vérifier si on est sur la page des langues
if (window.location.pathname.endsWith('languages.html')) {
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialiser le gestionnaire de langues
        const languageManager = new LanguageManager();
        await languageManager.init();

        // Attacher la transition au bouton Back
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            pageTransition.attachToButton(backBtn, '../index.html');
        }
    });
}

// Vérifier si on est sur la page des modes de jeu
if (window.location.pathname.includes('game.html')) {
    const lightEffect = new LightEffect();
    lightEffect.init();

    document.addEventListener('DOMContentLoaded', () => {
        // Attacher les transitions aux boutons des modes de jeu
        const soloBtn = document.getElementById('solo-btn');
        const multiBtn = document.getElementById('multi-btn');
        const challengeBtn = document.getElementById('challenge-btn');
        const backBtn = document.getElementById('back-btn');

        // Navigation vers les différents modes de jeu
        if (soloBtn) {
            pageTransition.attachToButton(soloBtn, 'html/gameSolo.html');
        }

        if (multiBtn) {
            multiBtn.addEventListener('click', () => {
                console.log('Mode Multijoueur sélectionné');
                // Ici vous pourrez ajouter la logique pour démarrer le mode multijoueur
            });
        }

        if (challengeBtn) {
            challengeBtn.addEventListener('click', () => {
                console.log('Mode Défi sélectionné');
                // Ici vous pourrez ajouter la logique pour démarrer le mode défi
            });
        }

        // Retour à la page principale
        if (backBtn) {
            pageTransition.attachToButton(backBtn, 'index.html');
        }
    });
}

