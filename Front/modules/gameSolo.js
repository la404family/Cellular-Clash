// Script principal pour le jeu solo
import PageTransition from './pageTransition.js';
import { getTranslationManager } from './translationManager.js';
import GameEngine from './gameEngine.js';
import GridManager from './gridManager.js';
import AIPlayer from './aiPlayer.js';
import ScoreManager from './scoreManager.js';

// Initialiser les gestionnaires
const pageTransition = new PageTransition();
const translationManager = getTranslationManager();

// Initialiser le système de traductions
translationManager.init();

// Variables de jeu
let gameEngine;
let gridManager;
let aiPlayer;
let scoreManager;

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les gestionnaires de jeu
    gridManager = new GridManager();
    gameEngine = new GameEngine(gridManager);
    aiPlayer = new AIPlayer(gameEngine);
    scoreManager = new ScoreManager();

    // Connecter l'AIPlayer et le scoreManager au gameEngine
    gameEngine.setAIPlayer(aiPlayer);
    gameEngine.setScoreManager(scoreManager);

    // Initialiser la grille
    gridManager.initializeGrid();

    // Attacher les événements
    setupEventListeners();

    // Démarrer le jeu
    gameEngine.startGame();
});

function setupEventListeners() {
    // Bouton de placement des cellules
    const placeCellsBtn = document.getElementById('place-cells-btn');
    if (placeCellsBtn) {
        placeCellsBtn.addEventListener('click', () => {
            // Montrer les cellules plaçables
            gridManager.showPlaceableCells(true);
            gameEngine.togglePlacementMode();
        });
    }

    // Gestion des clics sur les cellules avec feedback visuel
    gridManager.onCellClick = (row, col) => {
        // Utiliser la méthode du gameEngine pour placer les cellules
        if (gameEngine.placePlayerCell(row, col)) {
            // Mettre à jour le badge des cellules restantes
            updateCellsBadge();
            console.log(`Joueur place cellule en (${row}, ${col})`);
        }
    };

    // Boutons spéciaux (désactivés pour l'instant)
    const specialButtons = document.querySelectorAll('.special-button');
    specialButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Bouton spécial cliqué:', button.id);
            // À implémenter plus tard
        });
    });

    // Bouton retour
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            pageTransition.navigateToPage('html/game.html');
        });
    }
}

// Fonction pour mettre à jour le badge des cellules restantes
function updateCellsBadge() {
    const badge = document.getElementById('cells-badge');
    if (badge && gameEngine) {
        // Utiliser directement le compteur du gameEngine
        badge.textContent = gameEngine.playerCellsRemaining;

        // Désactiver le mode placement si plus de cellules disponibles
        if (gameEngine.playerCellsRemaining === 0) {
            gameEngine.isPlacementMode = false;
            gridManager.setPlacementMode(false);
        }
    }
}
