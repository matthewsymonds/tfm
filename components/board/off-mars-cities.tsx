import React from 'react';
import {Board as BoardModel, Cell as CellModel, cellHelpers} from '../../constants/board';
import {Cell} from './cell';
import {Tile} from './tile';
import styled from 'styled-components';

const OffMarsCitiesContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const OffMarsCityContainer = styled.div`
    position: relative;
    margin: 8px 0;
`;

type OffMarsCitiesProps = {
    board: BoardModel;
    validPlacements: CellModel[];
    handleClick: (cell: CellModel) => void;
};

function OffMarsCities({board, validPlacements, handleClick}: OffMarsCitiesProps) {
    const offMarsCells = board.flat().filter(cell => !cellHelpers.onMars(cell));

    return (
        <OffMarsCitiesContainer>
            {offMarsCells.map(offMarsCell => {
                return (
                    <OffMarsCityContainer
                        key={offMarsCell.specialLocation}
                        onClick={() => handleClick(offMarsCell)}
                    >
                        <Cell
                            selectable={validPlacements.includes(offMarsCell)}
                            type={offMarsCell.type}
                            bonus={offMarsCell.bonus ?? []}
                        >
                            {offMarsCell.specialName ?? ''}
                        </Cell>
                        {offMarsCell.tile && <Tile type={offMarsCell.tile.type} />}
                    </OffMarsCityContainer>
                );
            })}
        </OffMarsCitiesContainer>
    );
}

export default OffMarsCities;
