import React from 'react';
import {TileType, getTileBgColor, getTileIcon} from 'constants/board';
import {Hexagon} from 'components/board/hexagon';

export const TileIcon = ({type, size = 16}: {type: TileType; size?: number}) => {
    return (
        <Hexagon hexRadius={size / 2} color={getTileBgColor(type)}>
            {getTileIcon(type)}
        </Hexagon>
    );
};
