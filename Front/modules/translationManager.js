// Module pour la gestion des traductions dynamiques
import { getConfigManager } from './configManager.js';

export class TranslationManager {
    constructor() {
        this.configManager = getConfigManager();
        this.currentLanguage = this.configManager.getLanguage();
        this.translations = null;
        this.elements = new Map(); // Cache des éléments à traduire
    }

    // Initialise le gestionnaire de traductions
    async init() {
        // Charger la langue sauvegardée
        this.currentLanguage = this.configManager.getLanguage();

        // Charger les traductions
        await this.loadTranslations();

        // Appliquer les traductions
        this.applyTranslations();

        // Observer les changements de DOM pour les nouveaux éléments
        this.observeDOMChanges();
    }

    // Charge la langue sauvegardée depuis la configuration
    loadSavedLanguage() {
        this.currentLanguage = this.configManager.getLanguage();
    }

    // Sauvegarde la langue choisie
    saveLanguage(languageCode) {
        this.currentLanguage = languageCode;
        this.configManager.setLanguage(languageCode);

        // Recharger et appliquer les nouvelles traductions
        this.applyTranslations();
    }

    // Charge les traductions depuis le fichier JSON
    async loadTranslations() {
        const possiblePaths = [
            './data/languages.json',     // Depuis la racine Front
            '../data/languages.json',    // Depuis un sous-dossier de Front
            '../../data/languages.json'  // Depuis un sous-dossier de sous-dossier
        ];

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    this.translations = await response.json();
                    return;
                }
            } catch (error) {
                // Continue avec le prochain chemin
            }
        }

        console.error('Impossible de charger le fichier languages.json depuis tous les chemins possibles');
    }

    // Obtient une traduction pour une clé donnée
    getTranslation(key) {
        if (!this.translations || !this.translations[this.currentLanguage]) {
            return key; // Retourne la clé si pas de traduction
        }

        return this.translations[this.currentLanguage][key] || key;
    }

    // Applique les traductions à tous les éléments marqués
    applyTranslations() {
        if (!this.translations) return;

        // Rechercher tous les éléments avec data-translate
        const elements = document.querySelectorAll('[data-translate]');

        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);

            // Appliquer la traduction selon le type d'élément
            if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                element.value = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Mettre à jour le titre de la page si nécessaire
        this.updatePageTitle();
    }

    // Met à jour le titre de la page
    updatePageTitle() {
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.hasAttribute('data-translate')) {
            const key = titleElement.getAttribute('data-translate');
            titleElement.textContent = this.getTranslation(key);
        }
    }

    // Observe les changements du DOM pour traduire les nouveaux éléments
    observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Vérifier si le nouvel élément ou ses enfants ont besoin de traduction
                            const elementsToTranslate = node.querySelectorAll ?
                                node.querySelectorAll('[data-translate]') : [];

                            if (node.hasAttribute && node.hasAttribute('data-translate')) {
                                this.translateElement(node);
                            }

                            elementsToTranslate.forEach(element => {
                                this.translateElement(element);
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Traduit un élément spécifique
    translateElement(element) {
        const key = element.getAttribute('data-translate');
        if (key) {
            const translation = this.getTranslation(key);

            if (element.tagName === 'INPUT' && (element.type === 'submit' || element.type === 'button')) {
                element.value = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    }

    // Obtient la langue actuelle
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Obtient le nom de la langue actuelle
    getCurrentLanguageName() {
        return this.getTranslation('subtitle_language');
    }

    // Méthode pour changer de langue
    async changeLanguage(languageCode) {
        this.saveLanguage(languageCode);
        await this.loadTranslations();
        this.applyTranslations();
    }

    // Obtient toutes les langues disponibles
    getAvailableLanguages() {
        return this.translations ? Object.keys(this.translations) : [];
    }
}

// Instance globale du gestionnaire de traductions
let translationManager = null;

// Fonction pour obtenir l'instance du gestionnaire
export function getTranslationManager() {
    if (!translationManager) {
        translationManager = new TranslationManager();
    }
    return translationManager;
}

// Export par défaut
export default TranslationManager;
