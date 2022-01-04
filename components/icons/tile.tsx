import {Hexagon} from 'components/board/hexagon';
import {colors} from 'components/ui';
import {getTileIcon, Parameter, TileType} from 'constants/board';
import React from 'react';
import Twemoji from 'react-twemoji';

export const TileIcon = ({
    type,
    size = 16,
    margin = 0,
    showRedBorder,
}: {
    type: TileType;
    size?: number;
    margin?: number | string;
    showRedBorder?: boolean;
}) => {
    return (
        <div
            style={{
                margin,
                width: `${size}px`,
                border: showRedBorder ? '2px solid red' : 'initial',
            }}
        >
            <Hexagon hexRadius={size / 2} color={getTileBgColor(type)}>
                {/* hacks... */}
                <span
                    style={{
                        fontSize: `100px`,
                        transform: `scale(${size / 200})`,
                    }}
                >
                    <Twemoji>{getTileIcon(type)}</Twemoji>
                </span>
            </Hexagon>
        </div>
    );
};

export const getTileBgColor = (type: TileType) => {
    switch (type) {
        case TileType.CITY:
            return 'gray';
        case TileType.GREENERY:
            return `${colors.PARAMETERS[Parameter.OXYGEN]}`;
        case TileType.OCEAN:
            return '#3987c9';
        case TileType.LAVA_FLOW:
            return '#ff2222';
        case TileType.OTHER:
            return 'brown';
        case TileType.NATURAL_PRESERVE:
            return 'pink';
        case TileType.MINING_AREA:
        case TileType.MINING_RIGHTS:
            return 'brown';
        case TileType.COMMERCIAL_DISTRICT:
            return '#777';
        default:
            return 'white';
    }
};
