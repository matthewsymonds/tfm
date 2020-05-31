import React from 'react';
import styled from 'styled-components';
import {Board as BoardModel, Cell as CellModel, SpecialLocation} from 'constants/board';
import {Cell} from './cell';
import {Tile} from './tile';

const OffMarsCityContainer = styled.div`
    position: absolute;
`;

type OffMarsCitiesProps = {
    board: BoardModel;
    validPlacements: CellModel[];
    handleClick: (cell: CellModel) => void;
};

type OffMarsCityProps = {
    cell: CellModel;
    offMarsCitiesProps: OffMarsCitiesProps;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
};

const px = (num?: number) => {
    return num ? `${num}px` : 'auto';
};

const OffMarsCity = ({cell, offMarsCitiesProps, top, left, right, bottom}: OffMarsCityProps) => (
    <OffMarsCityContainer
        style={{top: px(top), left: px(left), bottom: px(bottom), right: px(right)}}
        onClick={() => offMarsCitiesProps.handleClick(cell)}
    >
        <Cell
            selectable={offMarsCitiesProps.validPlacements.includes(cell)}
            type={cell.type}
            bonus={cell.bonus ?? []}
        >
            {cell.specialName ?? ''}
        </Cell>
        {cell.tile && <Tile ownerPlayerIndex={cell.tile.ownerPlayerIndex} type={cell.tile.type} />}
    </OffMarsCityContainer>
);

function OffMarsCities(props: OffMarsCitiesProps) {
    const cells = props.board.flat();
    const ganymede = cells.find(cell => cell.specialLocation === SpecialLocation.GANYMEDE)!;
    const phobos = cells.find(cell => cell.specialLocation === SpecialLocation.PHOBOS)!;

    return (
        <>
            <OffMarsCity cell={ganymede} offMarsCitiesProps={props} right={15} top={15} />
            <OffMarsCity cell={phobos} offMarsCitiesProps={props} left={15} bottom={15} />
        </>
    );
}

export default OffMarsCities;
