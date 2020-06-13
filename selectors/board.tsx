import {RootState} from 'reducer';
import {
    PlacementRequirement,
    CellAttribute,
    Cell,
    TileType,
    CellType,
    SpecialLocation,
    cellHelpers,
    Tile,
    RESERVED_LOCATIONS,
    TilePlacement,
} from 'constants/board';
import {getLoggedInPlayerIndex} from 'context/app-context';

export function getAdjacentCellsForCell(state: RootState, cell: Cell) {
    if (!cell.coords) {
        return [];
    }
    const [rowIndex, cellIndex] = cell.coords;

    const neighborCoords: [number, number][] = [];
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

    const validNeighborCells: Array<Cell> = [];
    neighborCoords.forEach(([neighborRowIndex, neighborCellIndex]) => {
        if (
            state.common.board[neighborRowIndex] &&
            state.common.board[neighborRowIndex][neighborCellIndex]
        ) {
            validNeighborCells.push(state.common.board[neighborRowIndex][neighborCellIndex]);
        }
    });

    return validNeighborCells;
}

function isAvailable(state: RootState, cell: Cell) {
    if (cell.specialLocation && RESERVED_LOCATIONS.includes(cell.specialLocation)) return false;
    return (
        !cell.tile ||
        (cell.tile.type === TileType.LAND_CLAIM &&
            cell.tile.ownerPlayerIndex === getLoggedInPlayerIndex())
    );
}

function isOwnedByCurrentPlayer(state: RootState, cell: Cell) {
    return cell.tile && cell.tile.ownerPlayerIndex === getLoggedInPlayerIndex();
}

export function getAllCellsOwnedByCurrentPlayer(state: RootState) {
    return state.common.board.flat().filter(cell => isOwnedByCurrentPlayer(state, cell));
}

function getAvailableCells(state: RootState) {
    return state.common.board.flat().filter(cell => isAvailable(state, cell));
}

function getTakenCells(state: RootState) {
    return state.common.board.flat().filter(cell => !isAvailable(state, cell));
}

function getTakenCellsOnMars(state: RootState) {
    return getTakenCells(state).filter(cell => cellHelpers.onMars(cell));
}

function getAvailableCellsOnMars(state: RootState) {
    return getAvailableCells(state).filter(cell => cellHelpers.onMars(cell));
}

export function getCellsWithCitiesOnMars(state: RootState) {
    return getTakenCellsOnMars(state).filter(cell => cell.tile?.type === TileType.CITY);
}

export function getCellsWithCities(state: RootState) {
    const lastRow = state.common.board[state.common.board.length - 1];
    const citiesOnLastRow = lastRow.filter(cell => cell.tile?.type === TileType.CITY);
    return [...getCellsWithCitiesOnMars(state), ...citiesOnLastRow];
}

export function findCellWithTile(state: RootState, type: TileType) {
    return getTakenCells(state).find(cell => cell.tile?.type === type);
}

export function findCellsWithTile(state: RootState, type: TileType) {
    return getTakenCells(state).filter(cell => cell.tile?.type === type);
}

function getAvailableLandCellsOnMars(state: RootState) {
    return getAvailableCellsOnMars(state).filter(cell => cell.type === CellType.LAND);
}

function getGreeneries(state: RootState) {
    return state.common.board.flat().filter(cell => cell.tile?.type === TileType.GREENERY);
}

export function getGreeneriesForPlayer(state: RootState, playerIndex: number) {
    return getGreeneries(state).filter(cell => cell.tile.ownerPlayerIndex === playerIndex);
}

export function getValidPlacementsForRequirement(
    state: RootState,
    tilePlacement: TilePlacement | undefined
) {
    if (!tilePlacement) return [];
    return getPossibleValidPlacementsForRequirement(state, tilePlacement.placementRequirement);
}

export function getPossibleValidPlacementsForRequirement(
    state: RootState,
    requirement: PlacementRequirement | undefined
): Cell[] {
    if (!requirement) return getAvailableLandCellsOnMars(state);

    switch (requirement) {
        case PlacementRequirement.CITY:
            return getAvailableLandCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(
                    adjCell => !cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.CITY_ADJACENT:
            return getAvailableLandCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).some(adjCell =>
                    cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.DOUBLE_CITY_ADJACENT:
            return getAvailableLandCellsOnMars(state).filter(
                cell =>
                    getAdjacentCellsForCell(state, cell).filter(adjCell =>
                        cellHelpers.containsCity(adjCell)
                    ).length >= 2
            );
        case PlacementRequirement.GREENERY: {
            const availableLandCellsOnMars = getAvailableLandCellsOnMars(state);
            const cellsAdjacentToCurrentTiles = availableLandCellsOnMars.filter(cell =>
                getAdjacentCellsForCell(state, cell).some(adjCell =>
                    isOwnedByCurrentPlayer(state, adjCell)
                )
            );
            if (cellsAdjacentToCurrentTiles.length === 0) {
                return availableLandCellsOnMars;
            }
            return cellsAdjacentToCurrentTiles;
        }
        case PlacementRequirement.GREENERY_ADJACENT:
            return getAvailableLandCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).some(adjCell =>
                    cellHelpers.containsGreenery(adjCell)
                )
            );
        case PlacementRequirement.ISOLATED:
            return getAvailableLandCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(adjCell => cellHelpers.isEmpty(adjCell))
            );
        case PlacementRequirement.NON_RESERVED:
        case PlacementRequirement.NOT_RESERVED_FOR_OCEAN:
            return getAvailableLandCellsOnMars(state);
        case PlacementRequirement.RESERVED_FOR_OCEAN:
            return getAvailableCells(state).filter(cell => cell.type === CellType.WATER);
        case PlacementRequirement.STEEL_OR_TITANIUM:
            return getAvailableCells(state).filter(
                cell =>
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_STEEL) ||
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_TITANIUM)
            );
        case PlacementRequirement.STEEL_OR_TITANIUM_PLAYER_ADJACENT:
            const steelOrTitaniumCells = getAvailableCells(state).filter(
                cell =>
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_STEEL) ||
                    cellHelpers.hasAttribute(cell, CellAttribute.HAS_TITANIUM)
            );
            return steelOrTitaniumCells.filter(cell =>
                getAdjacentCellsForCell(state, cell).some(
                    adjCell => adjCell.tile?.ownerPlayerIndex === getLoggedInPlayerIndex()
                )
            );
        case PlacementRequirement.VOLCANIC:
            return getAvailableCells(state).filter(cell =>
                cellHelpers.hasAttribute(cell, CellAttribute.VOLCANIC)
            );
        case PlacementRequirement.PHOBOS:
            return state.common.board
                .flat()
                .filter(cell => cell.specialLocation === SpecialLocation.PHOBOS);
        case PlacementRequirement.NOCTIS:
            return state.common.board
                .flat()
                .filter(cell => cell.specialLocation === SpecialLocation.NOCTIS);
        case PlacementRequirement.GANYMEDE:
            return state.common.board
                .flat()
                .filter(cell => cell.specialLocation === SpecialLocation.GANYMEDE);
        default:
            throw new Error('case not handled');
    }
}
