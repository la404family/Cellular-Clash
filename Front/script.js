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

        // Vous pouvez ajouter d'autres boutons ici quand vous créerez leurs pages
        // const playBtn = document.getElementById('play-btn');
        // if (playBtn) {
        //     pageTransition.attachToButton(playBtn, 'html/play.html');
        // }
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

