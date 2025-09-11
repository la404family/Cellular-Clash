// Module pour la gestion de la page des langues
import PageTransition from './pageTransition.js';
import { getTranslationManager } from './translationManager.js';

export class LanguageManager {
    constructor() {
        this.languages = null;
        this.pageTransition = new PageTransition();
        this.translationManager = getTranslationManager();
        this.flagMapping = {
            'us': 'us',
            'fr': 'fr',
            'es': 'es',
            'de': 'de',
            'it': 'it',
            'tr': 'tr',
            'pt': 'pt',
            'al': 'al',
            'bg': 'bg',
            'dk': 'dk',
            'gr': 'gr',
            'nl': 'nl',
            'hu': 'hu',
            'id': 'id',
            'kz': 'kz',
            'mk': 'mk',
            'mg': 'mg',
            'mn': 'mn',
            'ph': 'ph',
            'pl': 'pl',
            'ro': 'ro',
            'sk': 'sk',
            'cz': 'cz',
            'rs': 'rs',
            'hr': 'hr',
            'ua': 'ua',
            'arabic': 'arabic',
            'hebrew': 'hebrew'
        };
    }

    // Initialise le gestionnaire de langues
    async init() {
        await this.loadLanguages();
        this.displayLanguages();
    }

    // Charge les langues depuis le fichier JSON
    async loadLanguages() {
        const possiblePaths = [
            './data/languages.json',     // Depuis la racine Front
            '../data/languages.json',    // Depuis un sous-dossier de Front
            '../../data/languages.json'  // Depuis un sous-dossier de sous-dossier
        ];

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    this.languages = await response.json();
                    return;
                }
            } catch (error) {
                // Continue avec le prochain chemin
            }
        }

        console.error('Impossible de charger le fichier languages.json depuis tous les chemins possibles');
    }

    // Affiche toutes les langues
    displayLanguages() {
        if (!this.languages) return;

        const grid = document.getElementById('languages-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Vider la grille

        const languagesArray = Object.keys(this.languages);

        // Afficher toutes les langues
        languagesArray.forEach(langCode => {
            const language = this.languages[langCode];
            const flagCode = this.flagMapping[langCode] || langCode;

            const languageItem = document.createElement('div');
            languageItem.className = 'language-item';

            languageItem.innerHTML = `
              <img src="../flags/${flagCode}.png" alt="${language.subtitle_language}" class="flag" />
              <span class="language-name">${language.subtitle_language}</span>
            `;

            // Attacher l'événement avec transition
            this.pageTransition.attachToLanguageItem(languageItem, () => {
                this.selectLanguage(langCode);
            });

            grid.appendChild(languageItem);
        });
    }

    // Sélectionne une langue
    selectLanguage(langCode) {
        // Sauvegarder la langue sélectionnée et mettre à jour les traductions
        this.translationManager.changeLanguage(langCode);
        console.log(`Langue sélectionnée: ${langCode}`);

        // Naviguer vers la page principale (la transition est gérée par pageTransition)
        window.location.href = '../index.html';
    }

    // Obtient la langue actuellement sélectionnée
    static getSelectedLanguage() {
        return localStorage.getItem('selectedLanguage') || 'us';
    }

    // Obtient les traductions pour une langue donnée
    static async getTranslations(langCode = null) {
        if (!langCode) {
            langCode = LanguageManager.getSelectedLanguage();
        }

        const possiblePaths = [
            './data/languages.json',     // Depuis la racine Front
            '../data/languages.json',    // Depuis un sous-dossier de Front
            '../../data/languages.json'  // Depuis un sous-dossier de sous-dossier
        ];

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const languages = await response.json();
                    return languages[langCode] || languages['us'];
                }
            } catch (error) {
                // Continue avec le prochain chemin
            }
        }

        console.error('Impossible de charger le fichier languages.json depuis tous les chemins possibles');
        return null;
    }
}

// Export par défaut
export default LanguageManager;
