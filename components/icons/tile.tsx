import {Hexagon} from 'components/board/hexagon';
import {getTileBgColor, getTileIcon, TileType} from 'constants/board';
import React from 'react';

export const TileIcon = ({type, size = 16}: {type: TileType; size?: number}) => {
    return (
        <Hexagon hexRadius={size / 2} color={getTileBgColor(type)}>
            {getTileIcon(type)}
        </Hexagon>
    );
};
