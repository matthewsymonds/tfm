import Color from 'color';
import {Box, Flex} from 'components/box';
import {CardContext, LiveCard as LiveCardComponent} from 'components/card/Card';
import {CardActions} from 'components/card/CardActions';
import {CardEffects} from 'components/card/CardEffects';
import {PlayerIcon} from 'components/icons/player';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {useComponentId} from 'hooks/use-component-id';
import {Card as CardModel} from 'models/card';
import React, {useState} from 'react';
import {useRect} from 'react-use-rect';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

type SharedCardTokenProps = {
    card: CardModel;
    margin?: string;
    showCardOnHover?: boolean;
    absoluteOffset?: number;
};
type CardToggleTokenProps = SharedCardTokenProps & {
    onClick?: () => void;
    isSelected?: boolean;
    disabled?: boolean;
};
type CardTextTokenProps = SharedCardTokenProps & {
    style?: React.CSSProperties;
    shouldUseFullWidth?: boolean;
};
type MiniatureCardProps = SharedCardTokenProps & {
    cardOwner: PlayerState;
    cardContext: CardContext;
    shouldUseFullWidth?: boolean;
};

export const CardTextTokenBase = styled.div<{
    color: string;
    margin?: string;
}>`
    background-color: ${props => props.color};
    color: ${colors.LIGHT_1};
    border-radius: 4px;
    padding: 4px;
    font-family: 'Ubuntu Condensed', sans-serif;
    display: inline-flex;
    margin: ${props => props.margin ?? '0 4px'};
    cursor: default;
    font-size: 0.85em;
    transition: all 0.1s;
    opacity: 1;
`;

const CardToggleTokenLabel = styled.label<{
    color: string;
    margin?: string;
    isSelected?: boolean;
}>`
    color: ${colors.CARD_TEXT};
    display: inline-flex;
    white-space: nowrap;
    margin: ${props => props.margin ?? '0 4px'};
    padding: 4px;
    opacity: ${props => (props.isSelected ? 1 : 0.4)};
    border-radius: 4px;
    background-color: ${props => {
        let color = new Color(props.color);
        if (!props.isSelected) {
            return color.darken(0.2).desaturate(0.2).toString();
        }
        return color.toString();
    }};
    cursor: default;
    transition: all 0.1s;
`;

const CardToggleTokenHiddenInput = styled.input`
    border: 0;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
`;

function getColorForCardType(cardType: CardType) {
    switch (cardType) {
        case CardType.ACTIVE:
            return colors.CARD_ACTIVE;
        case CardType.AUTOMATED:
            return colors.CARD_AUTOMATED;
        case CardType.CORPORATION:
            return 'black';
        case CardType.EVENT:
            return colors.CARD_EVENT;
        case CardType.PRELUDE:
            return colors.CARD_PRELUDE;
        default:
            throw spawnExhaustiveSwitchError(cardType);
    }
}

export const CardToggleToken = ({
    card,
    onClick,
    isSelected,
    margin,
    showCardOnHover,
    absoluteOffset,
    disabled,
}: CardToggleTokenProps) => {
    const [isHovering, setIsHovering] = useState(false);
    const id = useComponentId();
    const color = getColorForCardType(card.type);
    const {ref, top, left} = useCardPositionOnHover(absoluteOffset);

    return (
        <React.Fragment>
            <CardToggleTokenHiddenInput
                id={id}
                type="checkbox"
                value={card.name}
                checked={isSelected}
                onChange={onClick}
                disabled={disabled}
            />
            <CardToggleTokenLabel
                htmlFor={id}
                ref={ref}
                color={color}
                isSelected={isSelected}
                margin={margin}
                {...(showCardOnHover
                    ? {
                          onMouseEnter: () => setIsHovering(true),
                          onMouseLeave: () => {
                              setIsHovering(false);
                          },
                      }
                    : {})}
            >
                {card.name}
            </CardToggleTokenLabel>
            {isHovering && showCardOnHover && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        left,
                        top,
                    }}
                >
                    <LiveCardComponent card={card} />
                </div>
            )}
        </React.Fragment>
    );
};

function useCardPositionOnHover(absoluteOffset) {
    const [ref, rect] = useRect();
    const showAbove = rect.top > 320;
    let windowScrollY = 0;
    if (typeof window !== 'undefined') {
        windowScrollY = window.scrollY;
    }
    const topRelativeToWindow = rect.top + windowScrollY + (absoluteOffset ?? 0);
    const top = showAbove ? topRelativeToWindow - 310 : topRelativeToWindow + 30;
    let windowInnerWidth = 0;
    if (typeof window !== 'undefined') {
        windowInnerWidth = window.innerWidth;
    }
    const left = Math.min(rect.left, windowInnerWidth - 230);

    return {
        ref,
        top,
        left,
    };
}

export const CardTextToken = ({
    card,
    margin,
    showCardOnHover,
    style,
    absoluteOffset,
    shouldUseFullWidth,
}: CardTextTokenProps) => {
    const [isHovering, setIsHovering] = useState(false);
    const color = getColorForCardType(card.type);

    const {ref, top, left} = useCardPositionOnHover(absoluteOffset);

    return (
        <Flex display="inline-flex" width={shouldUseFullWidth ? '100%' : undefined}>
            <CardTextTokenBase
                ref={ref}
                color={color}
                margin={margin}
                style={{
                    ...style,
                    width: shouldUseFullWidth ? 'calc(100%)' : undefined,
                    display: 'block',
                }}
                className="truncate"
                {...(showCardOnHover
                    ? {
                          onMouseEnter: () => setIsHovering(true),
                          onMouseLeave: () => {
                              setIsHovering(false);
                          },
                      }
                    : {})}
            >
                {card.name === '' ? 'Event' : card.name}
            </CardTextTokenBase>
            {isHovering && showCardOnHover && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        left,
                        top,
                    }}
                >
                    <LiveCardComponent card={card} />
                </div>
            )}
        </Flex>
    );
};

export const MiniatureCard = ({
    card,
    showCardOnHover,
    cardOwner,
    cardContext,
    shouldUseFullWidth,
}: MiniatureCardProps) => {
    const [isHovering, setIsHovering] = useState(false);
    const color = getColorForCardType(card.type);
    const currentGeneration = useTypedSelector(state => state.common.generation);

    const {ref, top, left} = useCardPositionOnHover(0);
    return (
        <Flex display="inline-flex" width={shouldUseFullWidth ? '100%' : undefined}>
            <Flex
                flexDirection="column"
                width={shouldUseFullWidth ? '100%' : undefined}
                position="relative"
            >
                <CardTextTokenBase
                    ref={ref}
                    color={color}
                    style={{
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        display: 'block',
                    }}
                    margin="0px"
                    className="truncate"
                    {...(showCardOnHover
                        ? {
                              onMouseEnter: () => setIsHovering(true),
                              onMouseLeave: () => {
                                  setIsHovering(false);
                              },
                          }
                        : {})}
                >
                    {card.name === '' ? 'Event' : card.name}
                </CardTextTokenBase>
                <Box
                    borderRadius="0px"
                    style={{
                        borderBottomRightRadius: 4,
                        borderBottomLeftRadius: 4,
                        backgroundColor: colors.LIGHTEST_BG,
                    }}
                >
                    <CardEffects card={card} showEffectText={false} />
                    <CardActions
                        card={card}
                        cardOwner={cardOwner}
                        cardContext={cardContext}
                        showActionText={false}
                    />
                </Box>
                {card.lastRoundUsedAction === currentGeneration && (
                    <Box
                        position="absolute"
                        top="24px"
                        bottom="0"
                        left="0"
                        right="0"
                        style={{
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                            backgroundColor: 'hsla(0, 0%, 0%, 0.7)',
                        }}
                    >
                        <PlayerIcon
                            playerIndex={cardOwner.index}
                            size={18}
                            style={{
                                position: 'absolute',
                                bottom: '50%',
                                right: '50%',
                                marginBottom: -11,
                                marginRight: -11,
                                opacity: 1,
                            }}
                        />
                    </Box>
                )}
            </Flex>
            {isHovering && showCardOnHover && (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: 10,
                        left,
                        top,
                    }}
                >
                    <LiveCardComponent card={card} />
                </div>
            )}
        </Flex>
    );
};
