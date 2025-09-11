// Moteur de jeu principal pour Cellular Clash
export default class GameEngine {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.aiPlayer = null; // Sera assigné par setAIPlayer()
        this.scoreManager = null; // Sera assigné par setScoreManager()

        // État du jeu
        this.gameState = 'placement'; // 'placement', 'combat', 'ended'
        this.currentRound = 1;
        this.maxRounds = 10; // Changé de 5 à 10 manches
        this.currentTurn = 0;
        this.maxTurns = 25; // Changé de 50 à 25 tours par combat

        // Phase de placement
        this.placementTime = 15; // secondes
        this.placementTimer = null;
        this.aiPlacementInterval = null;
        this.combatInterval = null;
        this.playerCellsRemaining = 10;
        this.aiCellsRemaining = 10;
        this.isPlacementMode = false;
        this.placementStarted = false;

        // Éléments DOM
        this.timerDisplay = document.getElementById('timer-display');
        this.roundDisplay = document.getElementById('current-round');
        this.gameStatusDisplay = document.getElementById('game-status');
        this.cellsBadge = document.getElementById('cells-badge');
        this.placeCellsBtn = document.getElementById('place-cells-btn');

        // Scores
        this.scores = {
            player: { total: 0, round: 0 },
            ai: { total: 0, round: 0 }
        };

        this.roundEnded = false;
    }

    // Démarre le jeu
    startGame() {
        this.resetForNewRound();
        this.updateDisplay();
        console.log('Jeu démarré - Phase de placement');
    }

    // Réinitialise pour une nouvelle manche
    resetForNewRound() {
        console.log(`🔄 Réinitialisation pour la manche ${this.currentRound}/10`);
        this.gameState = 'placement';
        this.currentTurn = 0;
        this.playerCellsRemaining = 10;
        this.aiCellsRemaining = 10;
        this.isPlacementMode = false;
        this.placementStarted = false;
        this.roundEnded = false;

        // Effacer la grille
        this.gridManager.clearGrid();
        this.gridManager.clearPlaceableHighlight();
        this.gridManager.setPlacementMode(false);

        // Réinitialiser les scores de la manche
        this.scores.player.round = 0;
        this.scores.ai.round = 0;

        console.log('✅ Grille nettoyée et réinitialisée pour le placement');
        this.updateDisplay();
    }

    // Active/désactive le mode placement
    togglePlacementMode() {
        if (this.gameState !== 'placement') return;

        this.isPlacementMode = !this.isPlacementMode;
        this.gridManager.setPlacementMode(this.isPlacementMode);

        this.updatePlacementButton();
    }

    // Vérifie si une cellule peut être placée à cette position
    canPlaceCell(row, col) {
        if (this.gameState !== 'placement') return false;
        if (!this.isPlacementMode) return false;
        if (this.playerCellsRemaining <= 0) return false;
        if (!this.gridManager.isPlayerZone(row, col)) return false;

        const cell = this.gridManager.getCellAt(row, col);
        return cell && !cell.alive;
    }

    // Place une cellule du joueur
    placePlayerCell(row, col) {
        if (!this.canPlaceCell(row, col)) return false;

        if (this.gridManager.placeCellAt(row, col, 'player')) {
            this.playerCellsRemaining--;
            this.updateDisplay();

            // Déclencher le timer et l'IA après le premier placement du joueur
            if (!this.placementStarted) {
                this.placementStarted = true;
                this.startPlacementTimer();
                this.startAIPlacement();
            }

            return true;
        }

        return false;
    }

    // Démarre le timer de placement
    startPlacementTimer() {
        let timeLeft = this.placementTime;
        this.updateTimerDisplay(timeLeft);

        this.placementTimer = setInterval(() => {
            timeLeft--;
            this.updateTimerDisplay(timeLeft);

            if (timeLeft <= 0) {
                this.endPlacementPhase();
            }
        }, 1000);
    }

    // Définit le joueur IA
    setAIPlayer(aiPlayer) {
        this.aiPlayer = aiPlayer;
    }

    // Définit le gestionnaire de score
    setScoreManager(scoreManager) {
        this.scoreManager = scoreManager;
    }

    // Démarre le placement de l'IA
    startAIPlacement() {
        if (!this.aiPlayer) {
            console.error('AIPlayer n\'est pas défini');
            return;
        }

        // L'IA commencera à placer ses cellules après un court délai
        setTimeout(() => {
            this.placeAICells();
        }, 1000);
    }

    // L'IA place ses cellules
    placeAICells() {
        if (this.gameState !== 'placement' || !this.aiPlayer) return;

        console.log('Démarrage placement IA - cellules restantes:', this.aiCellsRemaining);

        this.aiPlacementInterval = setInterval(() => {
            if (this.aiCellsRemaining <= 0 || this.gameState !== 'placement') {
                clearInterval(this.aiPlacementInterval);
                console.log('Arrêt placement IA');
                return;
            }

            // Stratégie alternée : une fois aléatoire, une fois adjacente
            const useAdjacentStrategy = (10 - this.aiCellsRemaining) % 2 === 1;
            const strategy = useAdjacentStrategy ? 'adjacent' : 'random';

            console.log(`IA place cellule ${11 - this.aiCellsRemaining}/10 avec stratégie: ${strategy}`);
            const placed = this.aiPlayer.placeCell(strategy, this.gridManager);

            if (placed) {
                this.aiCellsRemaining--;
                console.log('IA cellules restantes:', this.aiCellsRemaining);
                this.updateDisplay();
            } else {
                console.warn('IA n\'a pas pu placer de cellule');
            }
        }, 600 + Math.random() * 800); // Placement toutes les 0.6-1.4 secondes
    }

    // Place une cellule IA aléatoirement
    placeAICellRandom() {
        const attempts = 50;
        for (let i = 0; i < attempts; i++) {
            const row = Math.floor(Math.random() * (this.gridManager.AI_ZONE.end - this.gridManager.AI_ZONE.start + 1)) + this.gridManager.AI_ZONE.start;
            const col = Math.floor(Math.random() * this.gridManager.GRID_SIZE);

            const cell = this.gridManager.getCellAt(row, col);
            if (cell && !cell.alive) {
                return this.gridManager.placeCellAt(row, col, 'ai');
            }
        }
        return false;
    }

    // Place une cellule IA adjacente aux cellules existantes
    placeAICellAdjacent() {
        // Trouver toutes les cellules IA existantes
        const aiCells = [];
        for (let row = this.gridManager.AI_ZONE.start; row <= this.gridManager.AI_ZONE.end; row++) {
            for (let col = 0; col < this.gridManager.GRID_SIZE; col++) {
                const cell = this.gridManager.getCellAt(row, col);
                if (cell && cell.alive && cell.owner === 'ai') {
                    aiCells.push({ row, col });
                }
            }
        }

        if (aiCells.length === 0) {
            return this.placeAICellRandom();
        }

        // Essayer de placer adjacent à une cellule existante
        for (const aiCell of aiCells) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;

                    const newRow = aiCell.row + dr;
                    const newCol = aiCell.col + dc;

                    if (this.gridManager.isAIZone(newRow, newCol)) {
                        const cell = this.gridManager.getCellAt(newRow, newCol);
                        if (cell && !cell.alive) {
                            return this.gridManager.placeCellAt(newRow, newCol, 'ai');
                        }
                    }
                }
            }
        }

        // Si aucune position adjacente n'est trouvée, placement aléatoire
        return this.placeAICellRandom();
    }

    // Termine la phase de placement
    endPlacementPhase() {
        console.log('Fin de la phase de placement');

        // Arrêter le timer de placement
        if (this.placementTimer) {
            clearInterval(this.placementTimer);
            this.placementTimer = null;
        }

        // Arrêter le placement IA
        if (this.aiPlacementInterval) {
            clearInterval(this.aiPlacementInterval);
            this.aiPlacementInterval = null;
        }

        this.gameState = 'combat';
        this.isPlacementMode = false;
        this.gridManager.clearPlaceableHighlight();
        this.gridManager.setPlacementMode(false);

        this.updateDisplay();
        this.startCombatPhase();
    }

    // Démarre la phase de combat
    startCombatPhase() {
        console.log('Phase de combat démarrée');
        this.runCombatLoop();
    }

    // Boucle de combat
    runCombatLoop() {
        console.log(`Début du combat - Manche ${this.currentRound}/10 - 25 tours à venir`);
        this.combatInterval = setInterval(() => {
            console.log(`Tour ${this.currentTurn + 1}/25 - Manche ${this.currentRound}/10`);
            this.processCombatTurn();
            this.currentTurn++;

            if (this.currentTurn >= this.maxTurns) {
                clearInterval(this.combatInterval);
                if (!this.roundEnded) {
                    this.endRound();
                }
            }
        }, 400); // Un tour toutes les 400ms pour un rythme plus fluide
    }

    // Traite un tour de combat
    processCombatTurn() {
        console.log(`--- Tour ${this.currentTurn + 1} ---`);

        // 1. Déplacer les cellules vers le centre (tapis roulant)
        console.log('Étape 1: Déplacement des cellules');
        this.gridManager.moveCellsTowardsCenter();

        // 2. Appliquer les règles du jeu de la vie modifié
        console.log('Étape 2: Application des règles du Jeu de la Vie');
        this.applyGameOfLifeRules();

        // 3. Calculer les scores du tour
        console.log('Étape 3: Calcul des scores');
        this.calculateTurnScore();

        // 4. Mettre à jour l'affichage
        this.updateDisplay();

        // 5. Vérifier si le jeu peut continuer (seulement en cas d'extinction totale)
        this.checkGameContinuity();
    }

    // Vérifie uniquement si le jeu peut continuer (pas de victoire anticipée)
    checkGameContinuity() {
        const cellCounts = this.gridManager.countCellsByOwner();

        // Vérifier seulement si les deux joueurs ont encore des cellules
        // Si un joueur n'a plus de cellules, la manche continue quand même jusqu'au bout
        if (cellCounts.player === 0 && cellCounts.ai === 0) {
            if (!this.roundEnded) {
                console.log('⚠️ Toutes les cellules ont disparu - fin de manche anticipée');
                this.endRound();
            }
            return false;
        }

        // Log des statistiques actuelles (pour debug)
        console.log(`📊 Cellules vivantes: Joueur=${cellCounts.player}, IA=${cellCounts.ai}, Neutres=${cellCounts.neutral}`);

        return true; // Le jeu continue
    }

    // Note: Les victoires anticipées ont été supprimées - le jeu va toujours jusqu'aux 10 manches

    // Applique les règles du jeu de la vie modifié
    applyGameOfLifeRules() {
        console.log('Application des règles du Jeu de la Vie - Tour:', this.currentTurn);
        const newStates = [];

        // Calculer les nouveaux états pour toutes les cellules
        for (let row = 0; row < this.gridManager.GRID_SIZE; row++) {
            newStates[row] = [];
            for (let col = 0; col < this.gridManager.GRID_SIZE; col++) {
                const cell = this.gridManager.getCellAt(row, col);
                const neighbors = this.getNeighbors(row, col);
                const count = neighbors.length;
                const neighborCount = this.countNeighborsByColor(row, col);

                let newState = {
                    alive: false,
                    owner: null
                };

                if (cell.alive) {
                    // Logique de survie selon la zone et la couleur
                    if (this.gridManager.isNeutralZone(row, col)) {
                        // ZONE DE COMBAT - Règles spéciales
                        if (cell.owner === 'player' || cell.owner === 'ai') {
                            // Rouge/Bleu : survit avec 2-3 voisins de sa couleur (jaunes ne comptent pas)
                            const sameColorNeighbors = (cell.owner === 'player') ? neighborCount.player : neighborCount.ai;
                            if (sameColorNeighbors >= 2 && sameColorNeighbors <= 3) {
                                newState.alive = true;
                                newState.owner = cell.owner;
                                console.log(`${cell.owner} survit (${row},${col}): ${sameColorNeighbors} voisins de même couleur`);
                            } else {
                                console.log(`${cell.owner} meurt (${row},${col}): ${sameColorNeighbors} voisins de même couleur`);
                            }
                        } else if (cell.owner === 'neutral') {
                            // Jaune : survit avec 2-3 voisins au total (toutes couleurs confondues)
                            // Propriété RÉSISTANCE : survit même avec 1 voisin si isolée
                            if (neighborCount.total >= 2 && neighborCount.total <= 3) {
                                newState.alive = true;
                                newState.owner = 'neutral';
                                console.log(`Jaune survit normalement (${row},${col}): ${neighborCount.total} voisins`);
                            } else if (neighborCount.total === 1) {
                                // RÉSISTANCE : survit avec 1 voisin
                                newState.alive = true;
                                newState.owner = 'neutral';
                                console.log(`Jaune RÉSISTANCE (${row},${col}): survit avec 1 voisin`);
                            } else {
                                console.log(`Jaune meurt (${row},${col}): ${neighborCount.total} voisins`);
                            }
                        }
                    } else {
                        // ZONES JOUEUR/IA - Règles classiques du Jeu de la Vie de Conway
                        if (count === 2 || count === 3) {
                            newState.alive = true;
                            newState.owner = cell.owner;
                        }
                    }
                } else {
                    // Logique de naissance - Propriété CATALYSEUR : 
                    // Les cellules jaunes comptent comme voisins pour toutes les naissances
                    if (count === 3) {
                        newState.alive = true;

                        if (this.gridManager.isNeutralZone(row, col)) {
                            // ZONE DE COMBAT - Naissance par domination
                            // Les 3 voisins (y compris jaunes) déterminent la couleur dominante
                            newState.owner = this.determineOwnerFromThreeNeighbors(neighbors);
                        } else {
                            // ZONES JOUEUR/IA - Nouvelles cellules adoptent la couleur de la zone
                            // Propriété CATALYSEUR : les jaunes facilitent la naissance ici aussi
                            if (this.gridManager.isPlayerZone(row, col)) {
                                newState.owner = 'player';
                            } else if (this.gridManager.isAIZone(row, col)) {
                                newState.owner = 'ai';
                            }
                        }
                    }
                }

                newStates[row][col] = newState;
            }
        }

        // Appliquer les nouveaux états de manière atomique
        let changesCount = 0;
        for (let row = 0; row < this.gridManager.GRID_SIZE; row++) {
            for (let col = 0; col < this.gridManager.GRID_SIZE; col++) {
                const currentCell = this.gridManager.getCellAt(row, col);
                const newState = newStates[row][col];

                // Vérifier s'il y a un changement d'état
                const stateChanged = (currentCell.alive !== newState.alive) ||
                    (currentCell.owner !== newState.owner);

                if (stateChanged) {
                    changesCount++;
                }

                // Appliquer le nouvel état
                if (newState.alive) {
                    this.gridManager.placeCellAt(row, col, newState.owner);
                } else {
                    this.gridManager.removeCellAt(row, col);
                }
            }
        }

        console.log(`Règles du Jeu de la Vie appliquées - ${changesCount} changements d'état`);

        // Phase 2 : Appliquer les propriétés spéciales du jaune (caméléon)
        this.applyYellowSpecialPropertiesToAllCells();
    }

    // Détermine le propriétaire basé sur les 3 voisines vivantes dans la zone de combat
    // Règle: Naissance par domination avec égalité → JAUNE
    determineOwnerFromThreeNeighbors(neighbors) {
        if (neighbors.length !== 3) {
            console.warn('determineOwnerFromThreeNeighbors: attendu 3 voisins, reçu:', neighbors.length);
            return 'neutral'; // Défaut jaune en cas d'erreur
        }

        const counts = { player: 0, ai: 0, neutral: 0 };

        // Compter les voisins par couleur
        neighbors.forEach(neighbor => {
            if (neighbor.owner === 'player') {
                counts.player++;
            } else if (neighbor.owner === 'ai') {
                counts.ai++;
            } else if (neighbor.owner === 'neutral') {
                counts.neutral++;
            }
        });

        console.log(`Zone combat - Naissance: Rouge=${counts.player}, Bleu=${counts.ai}, Jaune=${counts.neutral}`);

        // Logique de domination : couleur majoritaire, égalité → JAUNE
        if (counts.player > counts.ai && counts.player > counts.neutral) {
            return 'player';  // Rouge domine
        } else if (counts.ai > counts.player && counts.ai > counts.neutral) {
            return 'ai';      // Bleu domine
        } else if (counts.neutral > counts.player && counts.neutral > counts.ai) {
            return 'neutral'; // Jaune domine
        } else {
            // Cas d'égalité (ex: 1+1+1, ou 2+1+0) → naît JAUNE
            console.log(`Égalité détectée → naissance JAUNE`);
            return 'neutral';
        }
    }

    // Calcule le score du tour
    calculateTurnScore() {
        console.log(`=== Calcul des scores du tour ${this.currentTurn + 1} ===`);

        if (this.scoreManager) {
            // Utiliser le scoreManager pour calculer les scores du tour
            this.scoreManager.calculateTurnScore(this.gridManager);

            // Récupérer les scores totaux cumulés du ScoreManager
            const totalScores = this.scoreManager.getTotalScores();
            console.log(`Scores totaux du ScoreManager: Joueur=${totalScores.player}, IA=${totalScores.ai}`);

            this.scores.player.total = totalScores.player;
            this.scores.ai.total = totalScores.ai;

            console.log(`Scores mis à jour dans GameEngine: Joueur=${this.scores.player.total}, IA=${this.scores.ai.total}`);
        } else {
            // Méthode simple de fallback
            const counts = this.gridManager.countCellsByOwner();
            this.scores.player.round += counts.player;
            this.scores.ai.round += counts.ai;
            this.scores.player.total = this.scores.player.round;
            this.scores.ai.total = this.scores.ai.round;
            console.log(`Scores fallback: Joueur=${this.scores.player.total}, IA=${this.scores.ai.total}`);
        }
    }

    // Termine une manche
    endRound() {
        if (this.roundEnded) return;
        this.roundEnded = true;
        console.log(`Manche ${this.currentRound} terminée`);

        // Les scores sont déjà cumulés dans calculateTurnScore()
        // Pas besoin de recalculer ici

        console.log(`Scores cumulés après manche ${this.currentRound}:`);
        console.log(`- Joueur: ${this.scores.player.total} points`);
        console.log(`- IA: ${this.scores.ai.total} points`);

        // Remettre à zéro les scores de manche pour la nouvelle manche
        if (this.scoreManager) {
            this.scoreManager.resetRoundScores();
        }

        this.currentRound++;

        if (this.currentRound > this.maxRounds) {
            this.endGame();
        } else {
            console.log(`Préparation de la manche ${this.currentRound}/10`);
            console.log('⏳ Attente de 3 secondes avant réinitialisation...');
            setTimeout(() => {
                console.log('🚀 Lancement de la réinitialisation...');
                this.resetForNewRound();
            }, 3000); // 3 secondes entre les manches
        }
    }

    // Termine le jeu et détermine le vainqueur
    endGame() {
        this.gameState = 'ended';
        console.log('🏁 Fin du jeu - Toutes les 10 manches terminées!');

        // Les scores sont déjà cumulés sur les 10 manches
        const finalScorePlayer = this.scores.player.total;
        const finalScoreAI = this.scores.ai.total;

        // Détermination du vainqueur selon les scores cumulés
        let winner, reason;

        if (finalScorePlayer > finalScoreAI) {
            winner = 'player';
            reason = `Victoire par score cumulé (${finalScorePlayer} vs ${finalScoreAI} points)`;
        } else if (finalScoreAI > finalScorePlayer) {
            winner = 'ai';
            reason = `Défaite par score cumulé (${finalScoreAI} vs ${finalScorePlayer} points)`;
        } else {
            winner = 'draw';
            reason = `Égalité parfaite (${finalScorePlayer} points chacun)`;
        }

        console.log('🏆 RÉSULTATS FINAUX:');
        console.log(`Vainqueur: ${winner === 'player' ? 'JOUEUR' : winner === 'ai' ? 'IA' : 'ÉGALITÉ'}`);
        console.log(`Raison: ${reason}`);
        console.log(`📊 Score final cumulé: Joueur ${finalScorePlayer} vs IA ${finalScoreAI}`);

        // Mettre à jour l'affichage
        if (this.gameStatusDisplay) {
            const winnerText = winner === 'player' ? 'VICTOIRE!' : winner === 'ai' ? 'DÉFAITE!' : 'ÉGALITÉ!';
            this.gameStatusDisplay.textContent = `${winnerText} - ${reason}`;
        }

        this.updateDisplay();

        // Sauvegarder les statistiques si le scoreManager existe
        if (this.scoreManager) {
            this.scoreManager.saveScores();
        }
    }

    // Met à jour l'affichage
    updateDisplay() {
        // Timer
        if (this.gameState === 'placement') {
            // Le timer est géré par startPlacementTimer()
        } else if (this.gameState === 'combat') {
            this.updateTimerDisplay(`${this.currentTurn}/${this.maxTurns}`);
        }

        // Manche
        if (this.roundDisplay) {
            this.roundDisplay.textContent = this.currentRound;
        }

        // Statut du jeu
        if (this.gameStatusDisplay) {
            const translations = {
                'placement': 'status_placement',
                'combat': 'status_combat',
                'ended': 'status_game_over'
            };
            this.gameStatusDisplay.setAttribute('data-translate', translations[this.gameState]);
        }

        // Badge des cellules restantes
        if (this.cellsBadge) {
            this.cellsBadge.textContent = this.playerCellsRemaining;
        }

        // Scores
        const playerScoreElement = document.getElementById('player-score');
        const aiScoreElement = document.getElementById('ai-score');

        console.log(`Affichage scores - Joueur: ${this.scores.player.total}, IA: ${this.scores.ai.total}`);

        if (playerScoreElement) {
            playerScoreElement.textContent = this.scores.player.total;
            console.log(`Score joueur affiché: ${this.scores.player.total}`);
        } else {
            console.error('Élément player-score non trouvé');
        }

        if (aiScoreElement) {
            aiScoreElement.textContent = this.scores.ai.total;
            console.log(`Score IA affiché: ${this.scores.ai.total}`);
        } else {
            console.error('Élément ai-score non trouvé');
        }

        this.updatePlacementButton();
    }

    // Met à jour le bouton de placement
    updatePlacementButton() {
        if (!this.placeCellsBtn) return;

        if (this.gameState === 'placement') {
            this.placeCellsBtn.disabled = false;
            this.placeCellsBtn.style.opacity = this.isPlacementMode ? '1' : '0.8';
        } else {
            this.placeCellsBtn.disabled = true;
            this.placeCellsBtn.style.opacity = '0.5';
        }
    }

    // Met à jour l'affichage du timer
    updateTimerDisplay(value) {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = value;
        }
    }

    // Méthodes utilitaires pour les règles du Jeu de la Vie

    // Retourne les voisins vivants d'une cellule
    getNeighbors(row, col) {
        const neighbors = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (newRow >= 0 && newRow < this.gridManager.GRID_SIZE &&
                newCol >= 0 && newCol < this.gridManager.GRID_SIZE) {
                const neighbor = this.gridManager.getCellAt(newRow, newCol);
                if (neighbor && neighbor.alive) {
                    neighbors.push(neighbor);
                }
            }
        }

        return neighbors;
    }

    // Compte les voisins par couleur (pour les règles spéciales de la zone de combat)
    countNeighborsByColor(row, col) {
        const neighbors = this.getNeighbors(row, col);
        const count = {
            total: neighbors.length,
            player: 0,
            ai: 0,
            neutral: 0
        };

        for (const neighbor of neighbors) {
            if (neighbor.owner === 'player') {
                count.player++;
            } else if (neighbor.owner === 'ai') {
                count.ai++;
            } else if (neighbor.owner === 'neutral') {
                count.neutral++;
            }
        }

        return count;
    }

    // Applique les propriétés spéciales du jaune (caméléon)
    applyYellowSpecialProperties(row, col, neighborCount) {
        const cell = this.gridManager.getCellAt(row, col);

        // Propriété caméléon : devient rouge si 4+ voisins rouges, ou bleue si 4+ voisins bleus
        if (cell.owner === 'neutral') {
            if (neighborCount.player >= 4) {
                return 'player';
            } else if (neighborCount.ai >= 4) {
                return 'ai';
            }
        }

        return cell.owner; // Pas de changement
    }

    // Applique les propriétés spéciales du jaune à toutes les cellules de la zone de combat
    applyYellowSpecialPropertiesToAllCells() {
        let changesCount = 0;

        for (let row = 0; row < this.gridManager.GRID_SIZE; row++) {
            for (let col = 0; col < this.gridManager.GRID_SIZE; col++) {
                const cell = this.gridManager.getCellAt(row, col);
                if (cell.alive && this.gridManager.isNeutralZone(row, col) && cell.owner === 'neutral') {
                    const neighborCount = this.countNeighborsByColor(row, col);
                    const newOwner = this.applyYellowSpecialProperties(row, col, neighborCount);

                    if (newOwner !== cell.owner) {
                        cell.owner = newOwner;
                        this.gridManager.updateCellDisplay(row, col);
                        changesCount++;
                        console.log(`Caméléon: cellule jaune en (${row},${col}) devient ${newOwner}`);
                    }
                }
            }
        }

        if (changesCount > 0) {
            console.log(`Propriétés caméléon appliquées: ${changesCount} transformations`);
        }
    }
}
