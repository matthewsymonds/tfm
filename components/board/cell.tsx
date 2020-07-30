import {ResourceIcon} from 'components/resource';
import {CellType, Tile, TileType, getTileIcon, getTileBgColor} from 'constants/board';
import {Resource} from 'constants/resource';
import React from 'react';
import styled from 'styled-components';
import {Hexagon} from './hexagon';
import {colors} from 'constants/game';
import {Flex} from 'components/box';
import {Square} from 'components/square';

interface CellProps {
    cell: Cell;
    selectable?: boolean;
}

const getColor = (type: CellType) => {
    switch (type) {
        case CellType.LAND:
        case CellType.OFF_MARS:
            return 'rgba(255, 255, 255, 0.2)';
        case CellType.WATER:
            return 'rgba(206, 247, 253, 0.5)';
    }
};

const ChildrenWrapper = styled.div<{selectable?: boolean}>`
    position: absolute;
    color: #333333;
    cursor: ${props => (props.selectable ? 'pointer' : 'auto')};
    padding: 3px;
    border-radius: 2px;

    user-select: none;
    overflow: auto;
    font-weight: bold;
    font-size: 6px;
    transform: scale(1.7);
    background: rgba(255, 255, 255, 0.8);
    &:hover {
        transform: scale(1.9);
        background: rgba(255, 255, 255, 0.9);
    }
`;

const CellWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

export const Cell: React.FunctionComponent<CellProps> = ({cell, selectable}) => {
    const {type, bonus = [], tile = null, specialName = null} = cell;

    const bgColor =
        tile && typeof tile.ownerPlayerIndex === 'number'
            ? colors[tile?.ownerPlayerIndex]
            : getColor(type);

    function renderTile(tile) {
        // Land claim is specially coded as a tile, but shouldn't show a tile.
        if (tile.type === TileType.LAND_CLAIM) {
            return <Square playerIndex={tile.ownerPlayerIndex!} />;
        }

        const scale = typeof tile.ownerPlayerIndex === 'number' ? 0.8 : 1;
        return (
            <Hexagon scale={scale} color={getTileBgColor(tile.type)}>
                {getTileIcon(tile.type)}
            </Hexagon>
        );
    }

    function renderBonus(bonus: Array<Resource>) {
        return (
            <Flex flexDirection="row">
                {bonus.map((resource, index) => (
                    <ResourceIcon key={index} name={resource} size={12} />
                ))}
            </Flex>
        );
    }

    return (
        <CellWrapper>
            <Hexagon color={bgColor} selectable={selectable}>
                {/* {bonus.map((resource, index) => (
                    <ResourceIcon key={index} name={resource} />
                ))} */}
                {tile && renderTile(tile)}
                {bonus.length && !tile && renderBonus(bonus)}
                {specialName && }
            </Hexagon>
            {children && (
                <ChildrenWrapper selectable={selectable}>{children}</ChildrenWrapper>
            )}
        </CellWrapper>
    );
};
