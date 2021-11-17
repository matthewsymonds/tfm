import Color from 'color';
import {Box, Flex} from 'components/box';
import {CardContext, LiveCard as LiveCardComponent} from 'components/card/Card';
import {CardActions} from 'components/card/CardActions';
import {CardEffects} from 'components/card/CardEffects';
import {PlayerIcon} from 'components/icons/player';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {GlobalPopoverContext} from 'context/global-popover-context';
import {useComponentId} from 'hooks/use-component-id';
import {Card as CardModel} from 'models/card';
import React, {useContext, useEffect, useRef} from 'react';
import {useHover} from 'react-laag';
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
    canPlayInSpiteOfUI?: boolean;
};

export const CardToggleToken = ({
    card,
    onClick,
    isSelected,
    margin,
    showCardOnHover = true,
    disabled,
}: CardToggleTokenProps) => {
    const id = useComponentId();
    const color = getColorForCardType(card.type);
    const {setPopoverConfig} = useContext(GlobalPopoverContext);
    const [isOver, hoverProps] = useHover({delayEnter: 0, delayLeave: 0});
    const ref = useRef<HTMLLabelElement>(null);

    useEffect(() => {
        if (!showCardOnHover) {
            return;
        }
        setPopoverConfig(
            isOver
                ? {
                      popover: <LiveCardComponent card={card} />,
                      triggerRef: ref,
                      popoverOpts: {placement: 'bottom-start'},
                  }
                : null
        );
    }, [isOver]);

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
                {...hoverProps}
            >
                {card.name}
            </CardToggleTokenLabel>
        </React.Fragment>
    );
};

export const CardTextToken = ({
    card,
    margin,
    style,
    shouldUseFullWidth,
    showCardOnHover = true,
}: CardTextTokenProps) => {
    const {setPopoverConfig} = useContext(GlobalPopoverContext);
    const color = getColorForCardType(card.type);
    const ref = useRef<HTMLDivElement>(null);
    const [isOver, hoverProps] = useHover({delayEnter: 0, delayLeave: 0});

    useEffect(() => {
        if (!showCardOnHover) {
            return;
        }
        setPopoverConfig(
            isOver
                ? {
                      popover: <LiveCardComponent card={card} />,
                      triggerRef: ref,
                      popoverOpts: {
                          placement: 'bottom-start',
                          possiblePlacements: [
                              'bottom-start',
                              'bottom-end',
                              'top-start',
                              'top-end',
                          ],
                      },
                  }
                : null
        );
    }, [isOver]);

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
                {...hoverProps}
            >
                {card.name === '' ? 'Event' : card.name}
            </CardTextTokenBase>
        </Flex>
    );
};

export const MiniatureCard = ({
    card,
    cardOwner,
    cardContext,
    shouldUseFullWidth,
    canPlayInSpiteOfUI,
}: MiniatureCardProps) => {
    const {setPopoverConfig} = useContext(GlobalPopoverContext);
    const color = getColorForCardType(card.type);
    const currentGeneration = useTypedSelector(state => state.common.generation);
    const ref = useRef<HTMLDivElement>(null);
    const [isOver, hoverProps] = useHover({delayEnter: 0, delayLeave: 0});

    useEffect(() => {
        setPopoverConfig(
            isOver
                ? {
                      popover: <LiveCardComponent card={card} />,
                      triggerRef: ref,
                  }
                : null
        );
    }, [isOver]);

    const hasBeenUsedThisRound =
        card.lastRoundUsedAction === currentGeneration && !canPlayInSpiteOfUI;

    return (
        <Flex display="inline-flex" width={shouldUseFullWidth ? '100%' : undefined}>
            <Flex flexDirection="column" width={shouldUseFullWidth ? '100%' : undefined}>
                <CardTextTokenBase
                    ref={ref}
                    color={color}
                    style={{
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    }}
                    margin="0px"
                    {...hoverProps}
                >
                    {hasBeenUsedThisRound && (
                        <PlayerIcon
                            border="white"
                            playerIndex={cardOwner.index}
                            size={12}
                            style={{marginRight: 4}}
                        />
                    )}
                    <span className="truncate">{card.name === '' ? 'Event' : card.name}</span>
                </CardTextTokenBase>
                <Box
                    position="relative"
                    borderRadius="0px"
                    style={{
                        borderBottomRightRadius: 4,
                        borderBottomLeftRadius: 4,
                        backgroundColor: colors.LIGHTEST_BG,
                    }}
                >
                    <CardEffects card={card} showEffectText={false} />
                    <Box opacity={hasBeenUsedThisRound ? 0.6 : 1}>
                        <CardActions
                            card={card}
                            cardOwner={cardOwner}
                            cardContext={cardContext}
                            showActionText={false}
                            canPlayInSpiteOfUI={canPlayInSpiteOfUI}
                        />
                    </Box>
                    {hasBeenUsedThisRound && (
                        <Flex
                            position="absolute"
                            left="0"
                            right="0"
                            bottom="0"
                            top="0"
                            backgroundColor="hsla(0,0%,0%,0.6)"
                        />
                    )}
                </Box>
            </Flex>
        </Flex>
    );
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
    align-items: center;
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
