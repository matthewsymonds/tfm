import {ResourceIcon} from 'components/icons/resource';
import {getResourceBorder, Resource} from 'constants/resource';
import React from 'react';
import styled from 'styled-components';

export const PRODUCTION_PADDING = 6;

const ProductionIconBase = styled.div<{size: number; paddingSize: number; margin: string | number}>`
    background-color: brown;
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    padding: ${props => props.paddingSize}px;
    box-sizing: border-box;
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
`;

export const ProductionIcon = ({
    name,
    size = 20,
    paddingSize = PRODUCTION_PADDING,
    margin = 0,
}: {
    name: Resource;
    size?: number;
    paddingSize?: number;
    margin?: string | number;
}) => {
    return (
        <ProductionIconBase size={size} paddingSize={paddingSize} margin={margin}>
            <ResourceIcon
                border={getResourceBorder(name)}
                name={name}
                size={size - paddingSize * 2}
            />
        </ProductionIconBase>
    );
};
