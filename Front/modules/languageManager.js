// Module pour la gestion de la page des langues
export class LanguageManager {
    constructor() {
        this.languages = null;
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
            'ua': 'ua'
        };
    }

    // Initialise le gestionnaire de langues
    async init() {
        await this.loadLanguages();
        this.displayLanguages();
    }

    // Charge les langues depuis le fichier JSON
    async loadLanguages() {
        try {
            const response = await fetch('../languages.json');
            this.languages = await response.json();
        } catch (error) {
            console.error('Erreur lors du chargement des langues:', error);
        }
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
            languageItem.onclick = () => this.selectLanguage(langCode);

            languageItem.innerHTML = `
              <img src="../flags/${flagCode}.png" alt="${language.subtitle_language}" class="flag" />
              <span class="language-name">${language.subtitle_language}</span>
            `;

            grid.appendChild(languageItem);
        });
    }

    // Sélectionne une langue
    selectLanguage(langCode) {
        // Sauvegarder la langue sélectionnée
        localStorage.setItem('selectedLanguage', langCode);
        console.log(`Langue sélectionnée: ${langCode}`);

        // Effet visuel de sélection
        const selectedItem = event.currentTarget;
        selectedItem.style.transform = 'scale(0.95)';
        selectedItem.style.boxShadow = '0 0 20px var(--color-accent)';

        // Retourner à la page principale après un court délai
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 300);
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

        try {
            const response = await fetch('../languages.json');
            const languages = await response.json();
            return languages[langCode] || languages['us'];
        } catch (error) {
            console.error('Erreur lors du chargement des traductions:', error);
            return null;
        }
    }
}

// Export par défaut
export default LanguageManager;
