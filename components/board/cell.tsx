import {Box, Flex} from 'components/box';
import {BaseActionIconography} from 'components/card/CardIconography';
import {ResourceIcon} from 'components/icons/resource';
import {getTileBgColor} from 'components/icons/tile';
import {Square} from 'components/square';
import {
    Cell as CellModel,
    CellType,
    getTileIcon,
    TileType,
} from 'constants/board';
import {PLAYER_COLORS} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import React from 'react';
import Twemoji from 'react-twemoji';
import styled from 'styled-components';
import {Hexagon} from './hexagon';

interface CellProps {
    cell: CellModel;
    selectable?: boolean;
}

export const getCellColor = (type: CellType) => {
    switch (type) {
        case CellType.LAND:
        case CellType.OFF_MARS:
            return 'rgba(255, 255, 255, 0.2)';
        case CellType.WATER:
            return '#b0b2b5';
        default:
            return 'rgba(0,0,0,0)';
    }
};

const ChildrenWrapper = styled.div<{
    selectable?: boolean;
    moveUp?: boolean;
    moveDown?: boolean;
}>`
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
    transform: translateY(
        ${props => (props.moveUp ? -32 : props.moveDown ? 48 : 0)}%
    );
`;

export const Cell: React.FunctionComponent<CellProps> = ({
    cell,
    selectable,
}) => {
    const {type, bonus = [], tile = null, specialName = null} = cell;
    const isLandClaim = tile?.type === TileType.LAND_CLAIM;

    const bgColor =
        tile && typeof tile.ownerPlayerIndex === 'number' && !isLandClaim
            ? PLAYER_COLORS[tile?.ownerPlayerIndex]
            : getCellColor(type);

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
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                >
                    <Twemoji>{getTileIcon(tile.type)}</Twemoji>
                </Flex>
            </Hexagon>
        );
    }

    function renderBonus(bonus: Array<Resource>) {
        const hasCard = bonus.some(resource => resource === Resource.CARD);
        return (
            <Flex flexDirection="row">
                {bonus.map((resource, index) => (
                    <ResourceIcon
                        margin={index ? '0 0 0 0.3vw' : 0}
                        key={index}
                        name={resource}
                        size={2.25}
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
                    <ChildrenWrapper
                        moveUp={!tile && bonus.length === 0}
                        moveDown={!!tile}
                        selectable={selectable}
                    >
                        {specialName}
                    </ChildrenWrapper>
                )}
                <Flex
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    width="100%"
                    position={tile ? 'absolute' : 'static'}
                >
                    {bonus.length > 0 &&
                        (isLandClaim || !tile) &&
                        renderBonus(bonus)}
                    {tile && renderTile(tile)}
                    {!tile && cell.action && (
                        <Box transform="scale(0.75)" height="100%" width="100%">
                            <BaseActionIconography card={cell.action} />
                        </Box>
                    )}
                </Flex>
            </Hexagon>
        </>
    );
};
