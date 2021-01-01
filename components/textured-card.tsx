import {colors} from 'components/ui';
import React from 'react';
import styled from 'styled-components';
import {Flex} from './box';

const BORDER_RADIUS = 10;

const CardContainer = styled.div<{
    height?: number;
    width?: number;
    bgColor: string;
    isSelected?: boolean;
    borderRadius: number;
    borderWidth: number;
}>`
    width: ${props => (props.width ? `${props.width}px` : 'initial')};
    height: ${props => (props.height ? `${props.height}px` : 'initial')};
    border-radius: ${props => props.borderRadius}px;
    border-width: ${props => props.borderWidth}px;
    border-style: solid;
    border-top-color: ${colors.CARD_BORDER_1};
    border-left-color: ${colors.CARD_BORDER_1};
    border-bottom-color: ${colors.CARD_BORDER_2};
    border-right-color: ${colors.CARD_BORDER_2};
    opacity: ${props => (props.isSelected === false ? '0.7' : '1')};
    position: relative;

    &:before {
        content: '';
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        border-radius: ${props => props.borderRadius}px;
        background-color: ${props => props.bgColor};
    }
`;

const CardTexture = styled.div<{borderRadius: number}>`
    height: 100%;
    &:before {
        content: '';
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        border-radius: ${props => props.borderRadius}px;
        filter: sepia(0.1) hue-rotate(-9deg);
        opacity: 0.8;
        background-image: url(${require('assets/hexellence.png')});
    }
`;

export default function TexturedCard({
    children,
    height,
    width,
    bgColor = 'hsl(15, 70%, 50%)',
    isSelected,
    borderRadius = 10,
    borderWidth = 2,
}: {
    children: React.ReactNode;
    height?: number;
    width?: number;
    isSelected?: boolean;
    bgColor?: string;
    borderRadius?: number;
    borderWidth?: number;
}) {
    return (
        <CardContainer
            borderRadius={borderRadius}
            borderWidth={borderWidth}
            height={height}
            width={width}
            bgColor={bgColor}
            isSelected={isSelected}
        >
            <CardTexture borderRadius={borderRadius}>
                <Flex position="relative" height="100%" flexDirection="column">
                    {children}
                </Flex>
            </CardTexture>
        </CardContainer>
    );
}
