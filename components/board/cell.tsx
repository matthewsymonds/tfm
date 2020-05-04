import React from 'react';
import styled from 'styled-components';
import {CellType} from '../../constants/board';
import {Resource} from '../../constants/resource';
import {ResourceIcon} from '../resource';
import {Hexagon} from './hexagon';

interface CellProps {
    bonus: Resource[];
    type: CellType;
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

    font-family: sans-serif;
    user-select: none;
    background: rgba(255, 255, 255, 0.8);
    overflow: auto;
    z-index: 2;
    top: 4px;
    font-weight: bold;
    font-size: 10px;
    transform: scale(1.3);
    &:hover {
        transform: scale(1.5);
        background: rgba(255, 255, 255, 0.9);
    }
`;

const CellWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

export const Cell: React.FunctionComponent<CellProps> = props => (
    <CellWrapper>
        <Hexagon color={getColor(props.type)} selectable={props.selectable}>
            {props.bonus.map((resource, index) => (
                <ResourceIcon key={index} name={resource} />
            ))}
        </Hexagon>
        {props.children && (
            <ChildrenWrapper selectable={props.selectable}>{props.children}</ChildrenWrapper>
        )}
    </CellWrapper>
);
