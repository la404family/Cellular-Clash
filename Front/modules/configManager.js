// Module pour la gestion de la configuration utilisateur
export class ConfigManager {
    constructor() {
        this.config = {
            language: 'us',
            volume: 1.0,
            theme: 'dark',
            // Autres préférences peuvent être ajoutées ici
        };
        this.storageKey = 'cellularClashConfig';
        this.loadConfig();
    }

    // Charge la configuration depuis localStorage
    loadConfig() {
        try {
            const savedConfig = localStorage.getItem(this.storageKey);
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la configuration:', error);
        }
    }

    // Sauvegarde la configuration dans localStorage
    saveConfig() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la configuration:', error);
        }
    }

    // Obtient une valeur de configuration
    get(key) {
        return this.config[key];
    }

    // Définit une valeur de configuration
    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }

    // Obtient toute la configuration
    getAll() {
        return { ...this.config };
    }

    // Réinitialise la configuration aux valeurs par défaut
    reset() {
        this.config = {
            language: 'us',
            volume: 1.0,
            theme: 'dark',
        };
        this.saveConfig();
    }

    // Méthodes spécifiques pour la langue
    getLanguage() {
        return this.config.language;
    }

    setLanguage(languageCode) {
        this.set('language', languageCode);
    }

    // Méthodes spécifiques pour le volume
    getVolume() {
        return this.config.volume;
    }

    setVolume(volume) {
        this.set('volume', Math.max(0, Math.min(1, volume))); // Clamp entre 0 et 1
    }

    // Méthodes spécifiques pour le thème
    getTheme() {
        return this.config.theme;
    }

    setTheme(theme) {
        this.set('theme', theme);
    }
}

// Instance globale du gestionnaire de configuration
let configManager = null;

// Fonction pour obtenir l'instance du gestionnaire
export function getConfigManager() {
    if (!configManager) {
        configManager = new ConfigManager();
    }
    return configManager;
}

// Export par défaut
export default ConfigManager;
