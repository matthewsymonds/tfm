import {Box, Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {getTileBgColor} from 'components/icons/tile';
import {Square} from 'components/square';
import {Cell as CellModel, CellType, getTileIcon, TileType} from 'constants/board';
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
        default:
            return 'rgba(0,0,0,0)';
    }
};

const ChildrenWrapper = styled.div<{selectable?: boolean; moveUp?: boolean}>`
    color: #333333;
    cursor: ${props => (props.selectable ? 'pointer' : 'auto')};
    padding: 2px;
    border-radius: 2px;

    z-index: 1;
    user-select: none;
    margin-bottom: 8%;
    overflow: visible;
    margin-top: 8%;
    font-weight: bold;
    font-size: clamp(7px, 1vw, 9px);
    background: rgba(255, 255, 255, 0.8);
    white-space: nowrap;
    transform: translateY(${props => (props.moveUp ? -32 : 0)}%);
`;

const CellWrapper = styled.div`
    display: flex;
    width: fit-content;
    flex-grow: 1;
    justify-content: center;
    flex: 0 0 calc(100% / 9);
`;

export const Cell: React.FunctionComponent<CellProps> = ({cell, selectable}) => {
    const {type, bonus = [], tile = null, specialName = null} = cell;
    const isLandClaim = tile?.type === TileType.LAND_CLAIM;

    const bgColor =
        tile && typeof tile.ownerPlayerIndex === 'number' && !isLandClaim
            ? PLAYER_COLORS[tile?.ownerPlayerIndex]
            : getColor(type);

    function renderTile(tile) {
        // Land claim is specially coded as a tile, but shouldn't show a tile.
        if (tile.type === TileType.LAND_CLAIM) {
            return (
                <Box position="absolute" bottom="4px">
                    <Square playerIndex={tile.ownerPlayerIndex!} />
                </Box>
            );
        }

        const scale = typeof tile.ownerPlayerIndex === 'number' ? 0.8 : 1;
        return (
            <Hexagon scale={scale} color={getTileBgColor(tile.type)}>
                <Flex
                    height="100%"
                    width="100%"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="clamp(16px,5vw,36px)"
                    lineHeight="clamp(16px,5vw,36px)"
                >
                    {getTileIcon(tile.type)}
                </Flex>
            </Hexagon>
        );
    }

    function renderBonus(bonus: Array<Resource>, specialName: string | null) {
        const hasCard = bonus.some(resource => resource === Resource.CARD);
        return (
            <Flex flexDirection="row">
                {bonus.map((resource, index) => (
                    <ResourceIcon
                        margin={index ? '0 0 0 0.3vw' : 0}
                        key={index}
                        name={resource}
                        size={1.5}
                        unit="vw"
                    />
                ))}
            </Flex>
        );
    }

    return (
        <>
            <Hexagon color={bgColor} selectable={selectable}>
                {specialName && (
                    <ChildrenWrapper moveUp={bonus.length === 0} selectable={selectable}>
                        {specialName}
                    </ChildrenWrapper>
                )}
                <Flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                >
                    {bonus.length > 0 && (isLandClaim || !tile) && renderBonus(bonus, specialName)}
                    {tile && renderTile(tile)}
                </Flex>
            </Hexagon>
        </>
    );
};
