// Module pour gérer la grille de jeu 20x20
export default class GridManager {
    constructor() {
        this.GRID_SIZE = 20;
        this.grid = [];
        this.gridElement = null;
        this.onCellClick = null;

        // Zones définies
        this.AI_ZONE = { start: 0, end: 7 };        // 8 lignes pour l'IA (0-7) - EN HAUT
        this.NEUTRAL_ZONE = { start: 8, end: 11 };  // 4 lignes neutres (8-11)
        this.PLAYER_ZONE = { start: 12, end: 19 };  // 8 lignes pour le joueur (12-19) - EN BAS
    }

    // Initialise la grille
    initializeGrid() {
        this.gridElement = document.getElementById('game-grid');
        if (!this.gridElement) return;

        // Créer la structure de données de la grille
        this.grid = [];
        for (let row = 0; row < this.GRID_SIZE; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.grid[row][col] = {
                    alive: false,
                    owner: null, // 'player', 'ai', 'neutral'
                    element: null
                };
            }
        }

        // Créer les éléments DOM
        this.gridElement.innerHTML = '';
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                // Ajouter les classes de zone
                if (row >= this.PLAYER_ZONE.start && row <= this.PLAYER_ZONE.end) {
                    cell.classList.add('player-zone');
                } else if (row >= this.NEUTRAL_ZONE.start && row <= this.NEUTRAL_ZONE.end) {
                    cell.classList.add('neutral-zone');
                } else if (row >= this.AI_ZONE.start && row <= this.AI_ZONE.end) {
                    cell.classList.add('ai-zone');
                }

                // Attacher l'événement click
                cell.addEventListener('click', () => {
                    if (this.onCellClick) {
                        this.onCellClick(row, col);
                    }
                });

                this.grid[row][col].element = cell;
                this.gridElement.appendChild(cell);
            }
        }
    }

    // Vérifie si une position est dans la zone du joueur
    isPlayerZone(row, col) {
        return row >= this.PLAYER_ZONE.start && row <= this.PLAYER_ZONE.end;
    }

    // Vérifie si une position est dans la zone de l'IA
    isAIZone(row, col) {
        return row >= this.AI_ZONE.start && row <= this.AI_ZONE.end;
    }

    // Vérifie si une position est dans la zone neutre
    isNeutralZone(row, col) {
        return row >= this.NEUTRAL_ZONE.start && row <= this.NEUTRAL_ZONE.end;
    }

    // Place une cellule sur la grille avec effet visuel
    placeCellAt(row, col, owner) {
        if (!this.isValidPosition(row, col)) return false;

        const cell = this.grid[row][col];
        const element = cell.element;

        // Ajouter effet de prévisualisation avant placement
        element.classList.add('placement-preview');

        // Attendre un peu pour l'effet visuel puis placer
        setTimeout(() => {
            cell.alive = true;
            cell.owner = owner;

            // Enlever l'effet de prévisualisation
            element.classList.remove('placement-preview');

            // Mettre à jour l'affichage
            this.updateCellDisplay(row, col);

            // Ajouter un petit effet de "pop"
            element.style.transform = 'scale(1.2)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        }, 300);

        return true;
    }

    // Met à jour l'affichage d'une cellule
    updateCellDisplay(row, col) {
        const cell = this.grid[row][col];
        const element = cell.element;

        // Enlever TOUTES les classes de cellule pour un nettoyage complet
        element.classList.remove('player-cell', 'ai-cell', 'neutral-cell', 'placeable', 'placement-preview');

        if (cell.alive) {
            switch (cell.owner) {
                case 'player':
                    element.classList.add('player-cell');
                    break;
                case 'ai':
                    element.classList.add('ai-cell');
                    break;
                case 'neutral':
                    element.classList.add('neutral-cell');
                    break;
            }
        }
    }

    // Montre les cellules où le joueur peut placer ses cellules
    showPlaceableCells(forPlayer = true) {
        this.clearPlaceableHighlight();

        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = this.grid[row][col];

                // Vérifier si la cellule est vide et dans la bonne zone
                if (!cell.alive) {
                    if (forPlayer && this.isPlayerZone(row, col)) {
                        cell.element.classList.add('placeable');
                    } else if (!forPlayer && this.isAIZone(row, col)) {
                        cell.element.classList.add('placeable');
                    }
                }
            }
        }
    }

    // Masque les cellules placables
    clearPlaceableHighlight() {
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.grid[row][col].element.classList.remove('placeable');
            }
        }
    }

    // Supprime une cellule
    removeCellAt(row, col) {
        if (!this.isValidPosition(row, col)) return false;

        const cell = this.grid[row][col];
        cell.alive = false;
        cell.owner = null;

        this.updateCellDisplay(row, col);
        return true;
    }

    // Vérifie si une position est valide
    isValidPosition(row, col) {
        return row >= 0 && row < this.GRID_SIZE && col >= 0 && col < this.GRID_SIZE;
    }

    // Obtient une cellule à une position donnée
    getCellAt(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.grid[row][col];
    }

    // Compte les voisines vivantes autour d'une cellule
    countLivingNeighbors(row, col) {
        let count = 0;
        const neighbors = [];

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue; // Ignorer la cellule elle-même

                const newRow = row + dr;
                const newCol = col + dc;

                if (this.isValidPosition(newRow, newCol)) {
                    const neighbor = this.getCellAt(newRow, newCol);
                    if (neighbor && neighbor.alive) {
                        count++;
                        neighbors.push(neighbor);
                    }
                }
            }
        }

        return { count, neighbors };
    }

    // Active le mode placement pour les cellules du joueur
    setPlacementMode(enabled) {
        for (let row = this.PLAYER_ZONE.start; row <= this.PLAYER_ZONE.end; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = this.grid[row][col];
                if (enabled && !cell.alive) {
                    cell.element.classList.add('placeable');
                } else {
                    cell.element.classList.remove('placeable');
                }
            }
        }
    }

    // Déplace toutes les cellules vers le centre (tapis roulant)
    moveCellsTowardsCenter() {
        const newGrid = [];

        // Initialiser la nouvelle grille
        for (let row = 0; row < this.GRID_SIZE; row++) {
            newGrid[row] = [];
            for (let col = 0; col < this.GRID_SIZE; col++) {
                newGrid[row][col] = {
                    alive: false,
                    owner: null,
                    element: this.grid[row][col].element
                };
            }
        }

        // Déplacer les cellules avec gestion des collisions
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = this.grid[row][col];
                if (cell.alive) {
                    let newRow = row;

                    // Cellules du joueur (zone haute) avancent vers le bas (vers le centre)
                    if (row < this.NEUTRAL_ZONE.start) {
                        newRow = row + 1; // Avancer d'une case vers le bas
                    }
                    // Cellules de l'IA (zone basse) avancent vers le haut (vers le centre)
                    else if (row > this.NEUTRAL_ZONE.end) {
                        newRow = row - 1; // Avancer d'une case vers le haut
                    }
                    // Cellules dans la zone neutre ne bougent pas
                    else {
                        newRow = row; // Rester dans la zone neutre
                    }

                    // Vérifier que la nouvelle position est valide
                    if (this.isValidPosition(newRow, col)) {
                        // Si la cellule de destination est déjà occupée, résoudre la collision
                        if (newGrid[newRow][col].alive) {
                            // Règle de collision : la cellule la plus forte survit
                            const existingCell = newGrid[newRow][col];
                            const movingCell = cell;

                            // Priorité : neutral > player = ai (les cellules neutres dominent)
                            if (movingCell.owner === 'neutral' ||
                                (existingCell.owner !== 'neutral' && movingCell.owner !== existingCell.owner)) {
                                // La cellule qui bouge remplace celle qui est là
                                newGrid[newRow][col] = {
                                    alive: true,
                                    owner: movingCell.owner,
                                    element: movingCell.element
                                };
                            }
                            // Sinon, la cellule existante reste
                        } else {
                            // Case libre, placer la cellule
                            newGrid[newRow][col] = {
                                alive: true,
                                owner: cell.owner,
                                element: cell.element
                            };
                        }
                    }
                }
            }
        }

        // Remplacer l'ancienne grille
        this.grid = newGrid;

        // Mettre à jour l'affichage
        this.updateAllCells();
    }

    // Met à jour l'affichage de toutes les cellules
    updateAllCells() {
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                this.updateCellDisplay(row, col);
            }
        }
    }

    // Compte les cellules vivantes par propriétaire
    countCellsByOwner() {
        const counts = { player: 0, ai: 0, neutral: 0 };

        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = this.grid[row][col];
                if (cell.alive && cell.owner) {
                    counts[cell.owner]++;
                }
            }
        }

        return counts;
    }

    // Compte les cellules dans la zone neutre par propriétaire
    countNeutralZoneCells() {
        const counts = { player: 0, ai: 0, neutral: 0 };

        for (let row = this.NEUTRAL_ZONE.start; row <= this.NEUTRAL_ZONE.end; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                const cell = this.grid[row][col];
                if (cell.alive && cell.owner) {
                    counts[cell.owner]++;
                }
            }
        }

        return counts;
    }

    // Efface toute la grille
    clearGrid() {
        console.log('Nettoyage complet de la grille...');
        for (let row = 0; row < this.GRID_SIZE; row++) {
            for (let col = 0; col < this.GRID_SIZE; col++) {
                // Nettoyer complètement l'état de la cellule
                const cell = this.grid[row][col];
                cell.alive = false;
                cell.owner = null;

                // Nettoyer complètement les classes CSS de l'élément DOM
                if (cell.element) {
                    cell.element.classList.remove('player-cell', 'ai-cell', 'neutral-cell', 'placeable', 'placement-preview');
                }
            }
        }
        console.log('Grille nettoyée complètement');
    }
}
