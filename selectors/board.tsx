import {
    Cell,
    CellAttribute,
    cellHelpers,
    CellType,
    hasCity,
    PlacementRequirement,
    RESERVED_LOCATIONS,
    SpecialLocation,
    TilePlacement,
    TileType,
} from 'constants/board';
import {GameState, PlayerState} from 'reducer';

export function getAdjacentCellsForCell(
    state: GameState,
    cell: Cell | undefined
) {
    if (!cell?.coords) {
        return [];
    }
    const [rowIndex, cellIndex] = cell.coords;

    // Ganymede, etc. live on row 9 and have no neighbors.
    if (rowIndex === 9) return [];

    let neighborCoords: [number, number][] = [];
    if (rowIndex < 4) {
        // top half of board
        neighborCoords.push(
            [rowIndex - 1, cellIndex - 1], // top left
            [rowIndex - 1, cellIndex], // top right
            [rowIndex + 1, cellIndex], // bottom left
            [rowIndex + 1, cellIndex + 1] // bottom right
        );
    } else if (rowIndex === 4) {
        // middle row
        neighborCoords.push(
            [rowIndex - 1, cellIndex - 1], // top left
            [rowIndex - 1, cellIndex], // top right
            [rowIndex + 1, cellIndex - 1], // bottom left
            [rowIndex + 1, cellIndex] // bottom right
        );
    } else {
        // bottom half of board
        neighborCoords.push(
            [rowIndex - 1, cellIndex], // top left
            [rowIndex - 1, cellIndex + 1], // top right
            [rowIndex + 1, cellIndex - 1], // bottom left
            [rowIndex + 1, cellIndex] // bottom right
        );
    }
    neighborCoords.push(
        [rowIndex, cellIndex - 1], // left
        [rowIndex, cellIndex + 1] // right
    );

    // We hackishly put ganymede, etc. on row 9 -- remove those
    neighborCoords = neighborCoords.filter(([rowIndex, colIndex]) => {
        return rowIndex >= 0 && rowIndex <= 8 && colIndex >= 0;
    });

    const validNeighborCells: Array<Cell> = [];
    neighborCoords.forEach(([neighborRowIndex, neighborCellIndex]) => {
        if (
            state.common.board[neighborRowIndex] &&
            state.common.board[neighborRowIndex][neighborCellIndex]
        ) {
            validNeighborCells.push(
                state.common.board[neighborRowIndex][neighborCellIndex]
            );
        }
    });

    return validNeighborCells;
}

function isAvailable(state: GameState, cell: Cell, player: PlayerState) {
    if (
        cell.specialLocation &&
        RESERVED_LOCATIONS.includes(cell.specialLocation)
    )
        return false;
    return (
        !cell.tile ||
        (cell.tile.type === TileType.LAND_CLAIM &&
            cell.tile.ownerPlayerIndex === player.index)
    );
}

// This is used by greenery placement, Mining Area, and Landlord
export function isOwnedByCurrentPlayerExcludingLandClaim(
    cell: Cell,
    player: PlayerState
) {
    return (
        cell.tile &&
        cell.tile.ownerPlayerIndex === player.index &&
        cell.tile.type !== TileType.LAND_CLAIM
    );
}

export function getAllCellsOwnedByCurrentPlayer(
    state: GameState,
    player: PlayerState
) {
    return state.common.board
        .flat()
        .filter(cell => isOwnedByCurrentPlayerExcludingLandClaim(cell, player));
}

function getAvailableCells(state: GameState, player: PlayerState) {
    return state.common.board
        .flat()
        .filter(cell => isAvailable(state, cell, player));
}

function getAvailableCellsOnMars(state: GameState, player: PlayerState) {
    return getAvailableCells(state, player).filter(cell =>
        cellHelpers.onMars(cell)
    );
}

export function getCellsWithCitiesOnMars(state: GameState) {
    return getAllCellsOnMars(state).filter(hasCity);
}

export function getAllCellsOnMars(state: GameState) {
    return state.common.board.flat().filter(cell => cellHelpers.onMars(cell));
}

export function getCellsWithCities(state: GameState, player: PlayerState) {
    const lastRow = state.common.board[state.common.board.length - 1];
    const citiesOnLastRow = lastRow.filter(hasCity);
    return [...getCellsWithCitiesOnMars(state), ...citiesOnLastRow];
}

export function findCellWithTile(state: GameState, type: TileType) {
    return getAllCellsOnMars(state).find(cell => cell.tile?.type === type);
}

export function findCellsWithTile(state: GameState, type: TileType) {
    return getAllCellsOnMars(state).filter(cell => cell.tile?.type === type);
}

function getAvailableLandCellsOnMars(state: GameState, player: PlayerState) {
    return getAvailableCellsOnMars(state, player).filter(
        cell => cell.type === CellType.LAND
    );
}

function getGreeneries(state) {
    return state.common.board
        .flat()
        .filter(cell => cell.tile?.type === TileType.GREENERY);
}

export function getGreeneriesForPlayer(state: GameState, playerIndex: number) {
    return getGreeneries(state).filter(
        cell => cell.tile.ownerPlayerIndex === playerIndex
    );
}

export function getValidPlacementsForRequirement(
    state: GameState,
    tilePlacement: TilePlacement | undefined,
    player: PlayerState
) {
    if (player.pendingTileRemoval) {
        return state.common.board
            .flat()
            .filter(cell => cell?.tile?.type === player.pendingTileRemoval);
    }
    if (!tilePlacement) return [];
    return getPossibleValidPlacementsForRequirement(
        state,
        tilePlacement.placementRequirement,
        player
    );
}

export function getPossibleValidPlacementsForRequirement(
    state: GameState,
    requirement: PlacementRequirement | undefined,
    player: PlayerState
): Cell[] {
    if (!requirement) return getAvailableLandCellsOnMars(state, player);

    switch (requirement) {
        case PlacementRequirement.CITY:
            return getAvailableLandCellsOnMars(state, player).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(
                    adjCell => !cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.CITY_ADJACENT:
            return getAvailableLandCellsOnMars(state, player).filter(cell =>
                getAdjacentCellsForCell(state, cell).some(adjCell =>
                    cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.DOUBLE_CITY_ADJACENT:
            return getAvailableLandCellsOnMars(state, player).filter(
                cell =>
                    getAdjacentCellsForCell(state, cell).filter(adjCell =>
                        cellHelpers.containsCity(adjCell)
                    ).length >= 2
            );
        case PlacementRequirement.GREENERY: {
            const availableLandCellsOnMars = getAvailableLandCellsOnMars(
                state,
                player
            );
            const cellsAdjacentToCurrentTiles = availableLandCellsOnMars.filter(
                cell =>
                    getAdjacentCellsForCell(state, cell).some(adjCell =>
                        isOwnedByCurrentPlayerExcludingLandClaim(
                            adjCell,
                            player
                        )
                    )
            );
            if (cellsAdjacentToCurrentTiles.length === 0) {
                return availableLandCellsOnMars;
            }
            return cellsAdjacentToCurrentTiles;
        }
        case PlacementRequirement.GREENERY_ADJACENT:
            return getAvailableLandCellsOnMars(state, player).filter(cell =>
                getAdjacentCellsForCell(state, cell).some(adjCell =>
                    cellHelpers.containsGreenery(adjCell)
                )
            );
        case PlacementRequirement.ISOLATED:
            return getAvailableLandCellsOnMars(state, player).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(adjCell =>
                    cellHelpers.isEmpty(adjCell) || adjCell.tile?.type == TileType.LAND_CLAIM
                )
            );
        case PlacementRequirement.NON_RESERVED:
        case PlacementRequirement.NOT_RESERVED_FOR_OCEAN:
            return getAvailableLandCellsOnMars(state, player);
        case PlacementRequirement.RESERVED_FOR_OCEAN:
            return getAvailableCells(state, player).filter(
                cell => cell.type === CellType.WATER
            );
        case PlacementRequirement.STEEL_OR_TITANIUM:
            return getAvailableLandCellsOnMars(state, player).filter(
                cell =>
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_STEEL) ||
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_TITANIUM)
            );
        case PlacementRequirement.STEEL_OR_TITANIUM_PLAYER_ADJACENT:
            const availableLandCellsOnMars = getAvailableLandCellsOnMars(
                state,
                player
            );
            const cellsAdjacentToCurrentTiles = availableLandCellsOnMars.filter(
                cell =>
                    getAdjacentCellsForCell(state, cell).some(adjCell =>
                        isOwnedByCurrentPlayerExcludingLandClaim(
                            adjCell,
                            player
                        )
                    )
            );
            return cellsAdjacentToCurrentTiles.filter(
                cell =>
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_STEEL) ||
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_TITANIUM)
            );
        case PlacementRequirement.VOLCANIC: {
            const volcanic = getAllCellsOnMars(state).filter(cell =>
                cellHelpers.hasAttribute(cell, CellAttribute.VOLCANIC)
            );
            if (volcanic.length === 0)
                return getAvailableLandCellsOnMars(state, player);
            return getAvailableCells(state, player).filter(cell =>
                cellHelpers.hasAttribute(cell, CellAttribute.VOLCANIC)
            );
        }
        case PlacementRequirement.VOLCANIC_CITY: {
            const volcanic = getAllCellsOnMars(state).filter(cell =>
                cellHelpers.hasAttribute(cell, CellAttribute.VOLCANIC)
            );
            if (volcanic.length === 0) {
                return getAvailableLandCellsOnMars(state, player).filter(cell =>
                    getAdjacentCellsForCell(state, cell).every(
                        adjCell => !cellHelpers.containsCity(adjCell)
                    )
                );
            }
            return getAvailableCells(state, player).filter(cell =>
                cellHelpers.hasAttribute(cell, CellAttribute.VOLCANIC)
            );
        }
        case PlacementRequirement.PHOBOS:
            return state.common.board
                .flat()
                .filter(
                    cell => cell.specialLocation === SpecialLocation.PHOBOS
                );
        case PlacementRequirement.NOCTIS:
            const noctis = state.common.board
                .flat()
                .filter(
                    cell => cell.specialLocation === SpecialLocation.NOCTIS
                );
            if (noctis.length === 1) return noctis;
            return getAvailableLandCellsOnMars(state, player).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(
                    adjCell => !cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.GANYMEDE:
            return state.common.board
                .flat()
                .filter(
                    cell => cell.specialLocation === SpecialLocation.GANYMEDE
                );
        case PlacementRequirement.DAWN_CITY:
            return state.common.board
                .flat()
                .filter(
                    cell => cell.specialLocation === SpecialLocation.DAWN_CITY
                );
        case PlacementRequirement.LUNA_METROPOLIS:
            return state.common.board
                .flat()
                .filter(
                    cell =>
                        cell.specialLocation === SpecialLocation.LUNA_METROPOLIS
                );
        case PlacementRequirement.MAXWELL_BASE:
            return state.common.board
                .flat()
                .filter(
                    cell =>
                        cell.specialLocation === SpecialLocation.MAXWELL_BASE
                );
        case PlacementRequirement.STRATOPOLIS:
            return state.common.board
                .flat()
                .filter(
                    cell => cell.specialLocation === SpecialLocation.STRATOPOLIS
                );
        default:
            throw new Error('case not handled');
    }
}
