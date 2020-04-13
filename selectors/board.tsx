import {RootState} from '../reducer';
import {
    PlacementRequirement,
    CellAttribute,
    Cell,
    TileType,
    CellType,
    SpecialLocation,
    cellHelpers
} from '../constants/board';
import {Card} from '../models/card';

function getAdjacentCellsForCell(state: RootState, cell: Cell) {
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
            this.common.board[neighborRowIndex][neighborCellIndex]
        ) {
            validNeighborCells.push(state.common.board[neighborRowIndex][neighborCellIndex]);
        }
    });

    return validNeighborCells;
}

function isAvailable(state: RootState, cell: Cell) {
    return !cell.tile || cell.landClaimedBy === state.loggedInPlayerIndex;
}

function getAvailableCells(state: RootState) {
    return state.common.board.flat().filter(cell => isAvailable(state, cell));
}

function getAvailableCellsOnMars(state: RootState) {
    return state.common.board
        .flat()
        .filter(cell => isAvailable(state, cell) && cellHelpers.onMars(cell));
}

function getAvailableLandCellsOnMars(state: RootState) {
    return state.common.board
        .flat()
        .filter(
            cell =>
                isAvailable(state, cell) && cellHelpers.onMars(cell) && cell.type === CellType.LAND
        );
}

function getGreeneries(state: RootState) {
    return state.common.board.flat().filter(cell => cell.tile?.type === TileType.GREENERY);
}

export function getValidPlacementsForRequirement(
    state: RootState,
    requirement: PlacementRequirement
): Cell[] {
    switch (requirement) {
        case PlacementRequirement.CITY:
            return getAvailableCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(
                    adjCell => !cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.CITY_ADJACENT:
            return getAvailableCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).some(adjCell =>
                    cellHelpers.containsCity(adjCell)
                )
            );
        case PlacementRequirement.DOUBLE_CITY_ADJACENT:
            return getAvailableCellsOnMars(state).filter(
                cell =>
                    getAdjacentCellsForCell(state, cell).filter(adjCell =>
                        cellHelpers.containsCity(adjCell)
                    ).length >= 2
            );
        case PlacementRequirement.GREENERY:
            return getAvailableLandCellsOnMars(state);
        case PlacementRequirement.GREENERY_ADJACENT:
            return getGreeneries(state).filter(greeneryCell => {
                getAdjacentCellsForCell(state, greeneryCell).some(adjacentCell =>
                    isAvailable(state, adjacentCell)
                );
            });
        case PlacementRequirement.ISOLATED:
            return getAvailableLandCellsOnMars(state).filter(cell =>
                getAdjacentCellsForCell(state, cell).every(adj => !cellHelpers.isEmpty(adj))
            );
        case PlacementRequirement.NON_RESERVED:
        case PlacementRequirement.NOT_RESERVED_FOR_OCEAN:
            return getAvailableLandCellsOnMars(state);
        case PlacementRequirement.RESERVED_FOR_OCEAN:
            // I think it's impossible for this condition to be false, maybe just skip the check?
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
                    adjCell => adjCell.tile?.ownerPlayerIndex === state.loggedInPlayerIndex
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
