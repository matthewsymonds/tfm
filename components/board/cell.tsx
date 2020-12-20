import {Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {Square} from 'components/square';
import {Cell as CellModel, CellType, getTileBgColor, getTileIcon, TileType} from 'constants/board';
import {PLAYER_COLORS} from 'constants/game';
import {Resource} from 'constants/resource';
import React from 'react';
import styled from 'styled-components';
import {Hexagon} from './hexagon';

interface CellProps {
    cell: CellModel;
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
    padding: 2px;
    border-radius: 2px;

    z-index: 1;
    user-select: none;
    overflow: auto;
    font-weight: bold;
    font-size: 8px;
    background: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
`;

const CellWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

export const Cell: React.FunctionComponent<CellProps> = ({cell, selectable}) => {
    const {type, bonus = [], tile = null, specialName = null} = cell;

    const bgColor =
        tile && typeof tile.ownerPlayerIndex === 'number'
            ? PLAYER_COLORS[tile?.ownerPlayerIndex]
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
                {tile && renderTile(tile)}
                {bonus.length > 0 && !tile && renderBonus(bonus)}
            </Hexagon>
            {specialName && (
                <ChildrenWrapper selectable={selectable}>{specialName}</ChildrenWrapper>
            )}
        </CellWrapper>
    );
};
