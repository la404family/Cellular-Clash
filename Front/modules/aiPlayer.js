// Module pour l'intelligence artificielle
export default class AIPlayer {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.strategy = 'adaptive'; // 'random', 'clustered', 'adaptive'
    }

    // Détermine la stratégie de placement
    getPlacementStrategy() {
        switch (this.strategy) {
            case 'random':
                return 'random';
            case 'clustered':
                return 'adjacent';
            case 'adaptive':
                // Alternance entre aléatoire et groupé
                return Math.random() < 0.5 ? 'random' : 'adjacent';
            default:
                return 'random';
        }
    }

    // Évalue une position pour le placement
    evaluatePosition(row, col, gridManager) {
        let score = 0;

        // Bonus pour être près du centre (zone neutre)
        const distanceToNeutral = Math.abs(row - gridManager.NEUTRAL_ZONE.start);
        score += (8 - distanceToNeutral) * 2;

        // Bonus pour être près d'autres cellules IA (clustering)
        const { count } = gridManager.countLivingNeighbors(row, col);
        score += count * 3;

        // Malus pour être trop près des bords
        const distanceToEdge = Math.min(col, gridManager.GRID_SIZE - 1 - col);
        score += distanceToEdge;

        return score;
    }

    // Place une cellule selon la stratégie choisie
    placeCell(strategy, gridManager) {
        if (strategy === 'random') {
            return this.placeRandomCell(gridManager);
        } else if (strategy === 'adjacent') {
            return this.placeAdjacentCell(gridManager);
        }
        return false;
    }

    // Placement aléatoire intelligent
    placeRandomCell(gridManager) {
        const availablePositions = [];

        // Collecter toutes les positions disponibles dans la zone IA
        for (let row = gridManager.AI_ZONE.start; row <= gridManager.AI_ZONE.end; row++) {
            for (let col = 0; col < gridManager.GRID_SIZE; col++) {
                const cell = gridManager.getCellAt(row, col);
                if (cell && !cell.alive) {
                    availablePositions.push({ row, col });
                }
            }
        }

        if (availablePositions.length === 0) {
            console.warn('Aucune position disponible pour IA placement aléatoire');
            return false;
        }

        // Sélection purement aléatoire
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const selectedPosition = availablePositions[randomIndex];

        console.log(`IA place aléatoirement en (${selectedPosition.row}, ${selectedPosition.col})`);
        return gridManager.placeCellAt(selectedPosition.row, selectedPosition.col, 'ai');
    }

    // Placement adjacent aux cellules existantes
    placeAdjacentCell(gridManager) {
        // Trouver toutes les cellules IA existantes
        const aiCells = [];
        for (let row = gridManager.AI_ZONE.start; row <= gridManager.AI_ZONE.end; row++) {
            for (let col = 0; col < gridManager.GRID_SIZE; col++) {
                const cell = gridManager.getCellAt(row, col);
                if (cell && cell.alive && cell.owner === 'ai') {
                    aiCells.push({ row, col });
                }
            }
        }

        if (aiCells.length === 0) {
            console.log('IA: Aucune cellule existante, placement aléatoire');
            return this.placeRandomCell(gridManager);
        }

        const adjacentPositions = [];

        // Trouver toutes les positions adjacentes disponibles
        for (const aiCell of aiCells) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;

                    const newRow = aiCell.row + dr;
                    const newCol = aiCell.col + dc;

                    // Vérifier que c'est dans la zone IA et dans les limites de la grille
                    if (newRow >= gridManager.AI_ZONE.start &&
                        newRow <= gridManager.AI_ZONE.end &&
                        newCol >= 0 &&
                        newCol < gridManager.GRID_SIZE) {
                        const cell = gridManager.getCellAt(newRow, newCol);
                        if (cell && !cell.alive) {
                            adjacentPositions.push({ row: newRow, col: newCol });
                        }
                    }
                }
            }
        }

        if (adjacentPositions.length === 0) {
            console.log('IA: Aucune position adjacente, placement aléatoire');
            return this.placeRandomCell(gridManager);
        }

        // Sélectionner une position adjacente aléatoire
        const randomIndex = Math.floor(Math.random() * adjacentPositions.length);
        const selectedPosition = adjacentPositions[randomIndex];

        console.log(`IA place adjacent en (${selectedPosition.row}, ${selectedPosition.col})`);
        return gridManager.placeCellAt(selectedPosition.row, selectedPosition.col, 'ai');
    }

    // Analyse de la situation actuelle (pour les coups spéciaux futurs)
    analyzeGameState(gridManager) {
        const counts = gridManager.countCellsByOwner();
        const neutralCounts = gridManager.countNeutralZoneCells();

        return {
            totalCells: counts,
            neutralZoneCells: neutralCounts,
            playerAdvantage: counts.player - counts.ai,
            neutralControl: neutralCounts.ai - neutralCounts.player
        };
    }

    // Ajuste la difficulté pendant le jeu
    adjustDifficulty(gameState) {
        // Logique pour ajuster la difficulté basée sur les performances du joueur
        const analysis = this.analyzeGameState(gameState.gridManager);

        if (analysis.playerAdvantage > 5) {
            this.difficulty = 'hard';
        } else if (analysis.playerAdvantage < -5) {
            this.difficulty = 'easy';
        } else {
            this.difficulty = 'medium';
        }
    }
}
