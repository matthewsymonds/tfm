import Color from 'color';
import {Box, Flex} from 'components/box';
import {CardContext, LiveCard as LiveCardComponent} from 'components/card/Card';
import {CardActions} from 'components/card/CardActions';
import {CardEffects} from 'components/card/CardEffects';
import {PlayerIcon} from 'components/icons/player';
import {Popover} from 'components/popover';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {PopoverType, usePopoverType} from 'context/global-popover-context';
import {useComponentId} from 'hooks/use-component-id';
import {Card as CardModel} from 'models/card';
import React, {useEffect, useRef} from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import {CheckIcon, SizeIcon} from '@radix-ui/react-icons';

import {useHover} from 'react-laag';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {ResourceIcon} from 'components/icons/resource';
import {Resource} from 'constants/resource-enum';
import {CardTags} from './CardTags';
import {TagIcon} from 'components/icons/tag';
import classNames from 'classnames';

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
    disabled,
}: CardToggleTokenProps) => {
    const id = useComponentId();
    const color = getColorForCardType(card.type);

    return (
        <div className="flex items-center">
            <Checkbox.Root
                checked={isSelected}
                onCheckedChange={onClick}
                id={id}
                disabled={disabled}
                className={classNames(
                    'h-5 w-5 border border-dark-5 text-white rounded flex items-center justify-center',
                    isSelected
                        ? 'opacity-100 bg-dark-2 text-white '
                        : 'opacity-30 hover:opacity-60'
                )}
            >
                <Checkbox.Indicator>
                    <CheckIcon height={20} width={20} className="text-base" />
                </Checkbox.Indicator>
            </Checkbox.Root>
            <label
                htmlFor={id}
                className={classNames(
                    'cursor-pointer ml-2 h-8 rounded p-1.5 text-light-1',
                    'font-display w-[200px] flex items-center border',
                    isSelected
                        ? 'opacity-100 border-dark-5'
                        : 'opacity-30 hover:opacity-60 border-transparent'
                )}
                style={{
                    background: color,
                    backgroundColor: isSelected
                        ? color
                        : new Color(color)
                              .darken(0.2)
                              .desaturate(0.2)
                              .toString(),
                }}
            >
                <div className="flex-none flex items-center justify-center">
                    {typeof card.cost === 'number' && (
                        <ResourceIcon
                            name={Resource.MEGACREDIT}
                            amount={card.cost}
                            margin="0 4px 0 0"
                            size={20}
                        />
                    )}
                </div>
                <span className="flex-auto ellipsis text-base/[16px]">
                    {card.name}
                </span>
                <div className="flex-none flex ml-1">
                    {card.tags.map((tag, index) => (
                        <div key={index} style={{marginLeft: 2}}>
                            <TagIcon name={tag} size={20} />
                        </div>
                    ))}
                </div>
            </label>

            <Popover
                align="start"
                side="right"
                sideOffset={4}
                content={<LiveCardComponent card={card} />}
            >
                <button
                    className="ml-1 border-none hover:bg-dark-2 rounded h-8 w-8 
                flex items-center justify-center data-[state=open]:bg-dark-2"
                >
                    <SizeIcon />
                </button>
            </Popover>
        </div>
    );
};

export const CardTextToken = ({
    card,
    margin,
    style,
    shouldUseFullWidth,
    showCardOnHover = true,
}: CardTextTokenProps) => {
    const {showPopover, hidePopover} = usePopoverType(PopoverType.CARD);
    const color = getColorForCardType(card.type);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [isOver, hoverProps] = useHover({delayEnter: 0, delayLeave: 0});

    useEffect(() => {
        if (!showCardOnHover) {
            return;
        }
        if (isOver) {
            showPopover({
                popover: <LiveCardComponent card={card} />,
                triggerRef,
                popoverOpts: {
                    placement: 'bottom-start',
                    possiblePlacements: [
                        'bottom-start',
                        'bottom-end',
                        'top-start',
                        'top-end',
                    ],
                },
            });
        } else {
            hidePopover(triggerRef);
        }
    }, [isOver]);

    return (
        <Flex
            display="inline-flex"
            width={shouldUseFullWidth ? '100%' : undefined}
        >
            <CardTextTokenBase
                ref={triggerRef}
                color={color}
                margin={margin}
                style={{
                    ...style,
                    width: shouldUseFullWidth ? 'calc(100%)' : undefined,
                    display: 'block',
                }}
                className="ellipsis"
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
    const {showPopover, hidePopover} = usePopoverType(PopoverType.CARD);
    const color = getColorForCardType(card.type);
    const currentGeneration = useTypedSelector(
        state => state.common.generation
    );
    const triggerRef = useRef<HTMLDivElement>(null);
    const [isOver, hoverProps] = useHover({
        delayEnter: 0,
        delayLeave: 0,
        hideOnScroll: true,
    });

    useEffect(() => {
        if (isOver) {
            showPopover({
                popover: <LiveCardComponent card={card} />,
                triggerRef,
            });
        } else {
            hidePopover(triggerRef);
        }
    }, [isOver]);

    const hasBeenUsedThisRound =
        card.lastRoundUsedAction === currentGeneration && !canPlayInSpiteOfUI;

    return (
        <Flex
            display="inline-flex"
            width={shouldUseFullWidth ? '100%' : undefined}
        >
            <Flex
                flexDirection="column"
                width={shouldUseFullWidth ? '100%' : undefined}
            >
                <CardTextTokenBase
                    ref={triggerRef}
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
                    <span className="ellipsis">
                        {card.name === '' ? 'Event' : card.name}
                    </span>
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
    padding: 4px 8px;
    font-family: 'Ubuntu Condensed', sans-serif;
    display: inline-flex;
    margin: ${props => props.margin ?? '0 4px'};
    cursor: default;
    font-size: 0.85em;
    transition: all 0.1s;
    opacity: 1;
    align-items: center;
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
        case CardType.GLOBAL_EVENT:
            return colors.CARD_GLOBAL_EVENT;
        default:
            throw spawnExhaustiveSwitchError(cardType);
    }
}
