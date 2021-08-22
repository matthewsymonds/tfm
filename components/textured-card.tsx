import hex from 'assets/hexellence.png';
import {colors} from 'components/ui';
import React from 'react';
import styled from 'styled-components';
import {Flex} from './box';

const CardContainer = styled.div<TexturedCardProps>`
    color: ${colors.TEXT_DARK_1};
    width: ${props => (props.width ? `${props.width}px` : 'initial')};
    min-width: ${props => (props.width ? `${props.width}px` : 'initial')};
    height: ${props => (props.height ? `${props.height}px` : 'initial')};
    min-height: ${props => (props.height ? `${props.height}px` : 'initial')};
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
        background-image: url(${hex.src ?? '/hexellence.png'});
    }
`;

type TexturedCardProps = {
    children: React.ReactNode;
    height?: number;
    width?: number;
    isSelected?: boolean;
    bgColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    style?: React.CSSProperties;
};

const TexturedCard = React.forwardRef<HTMLDivElement, TexturedCardProps>(
    (
        {
            children,
            height,
            width,
            bgColor = 'hsl(15, 70%, 50%)',
            isSelected,
            borderRadius = 10,
            borderWidth = 2,
            style,
        }: {
            children: React.ReactNode;
            height?: number;
            width?: number;
            isSelected?: boolean;
            bgColor?: string;
            borderRadius?: number;
            borderWidth?: number;
            style?: React.CSSProperties;
        },
        ref
    ) => {
        return (
            <CardContainer
                ref={ref}
                borderRadius={borderRadius}
                borderWidth={borderWidth}
                height={height}
                width={width}
                bgColor={bgColor}
                isSelected={isSelected}
                style={style}
            >
                <CardTexture borderRadius={borderRadius}>
                    <Flex position="relative" height="100%" flexDirection="column">
                        {children}
                    </Flex>
                </CardTexture>
            </CardContainer>
        );
    }
);

export default TexturedCard;
