// Module pour la gestion des scores
export default class ScoreManager {
    constructor() {
        this.scores = {
            player: {
                total: 0,
                round: 0,
                cellsSurvived: 0,
                cellsDestroyed: 0,
                cellsCreated: 0
            },
            ai: {
                total: 0,
                round: 0,
                cellsSurvived: 0,
                cellsDestroyed: 0,
                cellsCreated: 0
            }
        };

        this.previousCellCounts = { player: 0, ai: 0, neutral: 0 };
    }

    // Remet à zéro les scores de la manche (mais garde les totaux cumulés)
    resetRoundScores() {
        // Remettre à zéro les scores de manche (pour recommencer le calcul de la nouvelle manche)
        this.scores.player.round = 0;
        this.scores.ai.round = 0;

        // Garder les compteurs de statistiques pour la manche
        this.scores.player.cellsSurvived = 0;
        this.scores.player.cellsDestroyed = 0;
        this.scores.player.cellsCreated = 0;

        this.scores.ai.cellsSurvived = 0;
        this.scores.ai.cellsDestroyed = 0;
        this.scores.ai.cellsCreated = 0;

        this.previousCellCounts = { player: 0, ai: 0, neutral: 0 };
    }

    // Calcule les scores pour un tour
    calculateTurnScore(gridManager) {
        const currentCounts = gridManager.countCellsByOwner();
        console.log(`ScoreManager - Cellules actuelles: Joueur=${currentCounts.player}, IA=${currentCounts.ai}, Neutres=${currentCounts.neutral}`);

        // Calculer les changements
        const changes = {
            player: {
                survived: 0,
                destroyed: 0,
                created: 0
            },
            ai: {
                survived: 0,
                destroyed: 0,
                created: 0
            }
        };

        // Analyser les changements de cellules
        this.analyzeCellChanges(gridManager, changes);

        // Calculer les points pour ce tour seulement
        const turnPoints = {
            player: currentCounts.player + (changes.player.survived * 2) - changes.player.destroyed,
            ai: currentCounts.ai + (changes.ai.survived * 2) - changes.ai.destroyed
        };

        console.log(`ScoreManager - Points du tour: Joueur=${turnPoints.player}, IA=${turnPoints.ai}`);

        // Ajouter les points du tour aux scores de manche
        this.scores.player.round += turnPoints.player;
        this.scores.ai.round += turnPoints.ai;

        // Ajouter les points du tour aux scores totaux (cumulés)
        this.scores.player.total += turnPoints.player;
        this.scores.ai.total += turnPoints.ai;

        console.log(`ScoreManager - Scores de manche: Joueur=${this.scores.player.round}, IA=${this.scores.ai.round}`);
        console.log(`ScoreManager - Scores totaux: Joueur=${this.scores.player.total}, IA=${this.scores.ai.total}`);

        // Mettre à jour les statistiques
        this.scores.player.cellsSurvived += changes.player.survived;
        this.scores.player.cellsDestroyed += changes.player.destroyed;
        this.scores.player.cellsCreated += changes.player.created;

        this.scores.ai.cellsSurvived += changes.ai.survived;
        this.scores.ai.cellsDestroyed += changes.ai.destroyed;
        this.scores.ai.cellsCreated += changes.ai.created;

        // Sauvegarder les comptes actuels pour le prochain tour
        this.previousCellCounts = currentCounts;

        return {
            player: this.scores.player.round,
            ai: this.scores.ai.round
        };
    }

    // Analyse les changements de cellules entre les tours
    analyzeCellChanges(gridManager, changes) {
        const currentCounts = gridManager.countCellsByOwner();

        // Pour les cellules survivantes : on considère que toutes les cellules actuelles ont survécu
        // (simplification - dans un système plus avancé, on trackerait individuellement)
        changes.player.survived = currentCounts.player;
        changes.ai.survived = currentCounts.ai;

        // Pour les cellules créées/détruites : différence par rapport au tour précédent
        if (currentCounts.player > this.previousCellCounts.player) {
            changes.player.created = currentCounts.player - this.previousCellCounts.player;
            changes.player.destroyed = 0;
        } else if (currentCounts.player < this.previousCellCounts.player) {
            changes.player.destroyed = this.previousCellCounts.player - currentCounts.player;
            changes.player.created = 0;
        } else {
            changes.player.created = 0;
            changes.player.destroyed = 0;
        }

        if (currentCounts.ai > this.previousCellCounts.ai) {
            changes.ai.created = currentCounts.ai - this.previousCellCounts.ai;
            changes.ai.destroyed = 0;
        } else if (currentCounts.ai < this.previousCellCounts.ai) {
            changes.ai.destroyed = this.previousCellCounts.ai - currentCounts.ai;
            changes.ai.created = 0;
        } else {
            changes.ai.created = 0;
            changes.ai.destroyed = 0;
        }

        console.log(`Changements détectés - Joueur: +${changes.player.created} créées, -${changes.player.destroyed} détruites, ${changes.player.survived} survivantes`);
        console.log(`Changements détectés - IA: +${changes.ai.created} créées, -${changes.ai.destroyed} détruites, ${changes.ai.survived} survivantes`);
    }

    // Calcule le score de contrôle de la zone neutre
    calculateNeutralZoneControl(gridManager) {
        const neutralCounts = gridManager.countNeutralZoneCells();

        // Bonus pour le contrôle de la zone neutre
        if (neutralCounts.player > neutralCounts.ai) {
            this.scores.player.round += 5; // Bonus de contrôle
        } else if (neutralCounts.ai > neutralCounts.player) {
            this.scores.ai.round += 5; // Bonus de contrôle
        }

        return {
            player: neutralCounts.player,
            ai: neutralCounts.ai,
            neutral: neutralCounts.neutral
        };
    }

    // Détermine le gagnant de la manche
    getRoundWinner() {
        if (this.scores.player.round > this.scores.ai.round) {
            return 'player';
        } else if (this.scores.ai.round > this.scores.player.round) {
            return 'ai';
        } else {
            return 'tie';
        }
    }

    // Détermine le gagnant final
    getFinalWinner() {
        if (this.scores.player.total > this.scores.ai.total) {
            return 'player';
        } else if (this.scores.ai.total > this.scores.player.total) {
            return 'ai';
        } else {
            return 'tie';
        }
    }

    // Obtient les statistiques détaillées
    getDetailedStats() {
        return {
            player: {
                totalScore: this.scores.player.total,
                roundScore: this.scores.player.round,
                cellsSurvived: this.scores.player.cellsSurvived,
                cellsDestroyed: this.scores.player.cellsDestroyed,
                cellsCreated: this.scores.player.cellsCreated,
                efficiency: this.calculateEfficiency('player')
            },
            ai: {
                totalScore: this.scores.ai.total,
                roundScore: this.scores.ai.round,
                cellsSurvived: this.scores.ai.cellsSurvived,
                cellsDestroyed: this.scores.ai.cellsDestroyed,
                cellsCreated: this.scores.ai.cellsCreated,
                efficiency: this.calculateEfficiency('ai')
            }
        };
    }

    // Calcule l'efficacité d'un joueur
    calculateEfficiency(player) {
        const stats = this.scores[player];
        const totalActions = stats.cellsSurvived + stats.cellsDestroyed + stats.cellsCreated;

        if (totalActions === 0) return 0;

        // Efficacité basée sur le ratio survie/destruction
        const survivalRate = stats.cellsSurvived / totalActions;
        const destructionRate = stats.cellsDestroyed / totalActions;

        return Math.round((survivalRate - destructionRate) * 100);
    }

    // Remet à zéro tous les scores
    reset() {
        this.scores = {
            player: {
                total: 0,
                round: 0,
                cellsSurvived: 0,
                cellsDestroyed: 0,
                cellsCreated: 0
            },
            ai: {
                total: 0,
                round: 0,
                cellsSurvived: 0,
                cellsDestroyed: 0,
                cellsCreated: 0
            }
        };

        this.previousCellCounts = { player: 0, ai: 0, neutral: 0 };
    }

    // Retourne les scores actuels
    getScores() {
        return {
            player: { ...this.scores.player },
            ai: { ...this.scores.ai }
        };
    }

    // Retourne les scores totaux uniquement
    getTotalScores() {
        return {
            player: this.scores.player.total,
            ai: this.scores.ai.total
        };
    }

    // Sauvegarde les scores (pour les statistiques globales)
    saveScores() {
        const gameStats = {
            timestamp: new Date().toISOString(),
            finalWinner: this.getFinalWinner(),
            playerScore: this.scores.player.total,
            aiScore: this.scores.ai.total,
            detailedStats: this.getDetailedStats()
        };

        // Sauvegarder dans localStorage pour les statistiques
        const savedGames = JSON.parse(localStorage.getItem('cellularClashStats') || '[]');
        savedGames.push(gameStats);

        // Garder seulement les 100 dernières parties
        if (savedGames.length > 100) {
            savedGames.splice(0, savedGames.length - 100);
        }

        localStorage.setItem('cellularClashStats', JSON.stringify(savedGames));

        return gameStats;
    }
}
