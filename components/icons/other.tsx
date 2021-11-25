import {AllCapsIcon} from 'components/icons/global-parameter';
import {colors} from 'components/ui';
import React from 'react';
import styled from 'styled-components';

// TODO: make proper icons for these
export const TerraformRatingIcon = ({
    size = 16,
    margin = 0,
    red,
}: {
    size?: number;
    margin?: string | number;
    red?: boolean;
}) => {
    return (
        <AllCapsIcon size={size} bgColor={red ? colors.TEXT_ERROR : '#f59038'} margin={margin}>
            TR
        </AllCapsIcon>
    );
};

export const ColonyIcon = ({size = 16, margin = 0}: {size?: number; margin?: string | number}) => {
    return (
        <AllCapsIcon size={size} bgColor="#ccc" margin={margin} borderRadius={12} padding={3}>
            COL
        </AllCapsIcon>
    );
};

export const TradeIcon = ({size = 16, margin = 0}: {size?: number; margin?: string | number}) => {
    return (
        <div
            style={{
                width: 0,
                height: 0,
                borderLeft: `${size / 2}px solid transparent`,
                borderRight: `${size / 2}px solid transparent`,
                borderBottom: `${size}px solid #555`,
            }}
        />
    );
};

const InfluenceIconBase = styled.div<{size: number; margin: string}>`
    align-items: center;
    background-color: black;
    display: flex;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    justify-content: center;
    margin: ${props => props.margin};
    position: relative;
    transform: rotate(45deg);

    &::before,
    &::after {
        background-color: black;
        content: '';
        display: block;
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: -1;
    }

    &::before {
        transform: rotate(30deg);
    }

    &::after {
        transform: rotate(60deg);
    }

    span {
        transform: rotate(-45deg);
    }
`;

export const InfluenceIcon = ({size = 20, margin = '0'}: {size?: number; margin?: string}) => {
    return (
        <InfluenceIconBase size={size} margin={margin}>
            <span style={{color: 'white'}}>👤</span>
        </InfluenceIconBase>
    );
};

const VictoryPointCircle = styled.div<{size: number; margin: string | number}>`
    border-radius: 50%;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    margin: ${props => (typeof props.margin === 'string' ? props.margin : `${props.margin}px`)};
    display: flex;
    font-size: 16px;
    background-color: ${colors.CARD_VP_BG};
    color: ${colors.CARD_BORDER_2};
    border: 1px solid ${colors.CARD_BORDER_2};
    font-family: 'Ubuntu Condensed', sans-serif;
    align-items: center;
    justify-content: center;
`;

export const VictoryPointIcon = ({
    children,
    size = 16,
    margin = 0,
}: React.PropsWithChildren<{
    size?: number;
    margin?: string | number;
}>) => {
    return (
        <VictoryPointCircle size={size} margin={margin}>
            {children}
        </VictoryPointCircle>
    );
};
