import React from 'react';
import {Resource} from 'constants/resource';
import styled from 'styled-components';
import {ResourceIcon} from 'components/icons/resource';

const ProductionIconBase = styled.div<{size: number}>`
    background-color: brown;
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
`;

export const ProductionIcon = ({name, size = 20}: {name: Resource; size: number}) => {
    return (
        <ProductionIconBase size={size}>
            <ResourceIcon name={name} size={size - 8} />
        </ProductionIconBase>
    );
};
