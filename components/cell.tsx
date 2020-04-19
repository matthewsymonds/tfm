import {CellType} from '../constants/board';
import {Resource} from '../constants/resource';
import {ResourceIcon} from './resource';
import {Hexagon} from './hexagon';
import React from 'react';

interface CellProps {
    bonus: Resource[];
    type: CellType;
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

export const Cell: React.FunctionComponent<CellProps> = props => (
    <Hexagon color={getColor(props.type)}>
        {props.bonus.map((resource, index) => (
            <ResourceIcon key={index} name={resource} />
        ))}
    </Hexagon>
);
