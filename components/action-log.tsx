import {Box, Flex} from 'components/box';
import {CardTextToken} from 'components/card/CardToken';
import {PlayerCorpAndIcon} from 'components/icons/player';
import {ResourceIcon} from 'components/icons/resource';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {Parameter, TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {StandardProjectType} from 'constants/standard-project';
import {PopoverType, usePopoverType} from 'context/global-popover-context';
import {GameActionType} from 'GameActionState';
import React, {useEffect, useLayoutEffect, useRef} from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import {PlayerState, useTypedSelector} from 'reducer';
import {getGameAction} from 'selectors/get-game-action';
import {SerializedGameAction} from 'state-serialization';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {BlankButton} from './blank-button';
import {getTextForAward} from './board/board-actions/awards';
import {getTextForMilestone} from './board/board-actions/milestones';
import {getLogTextForStandardProject} from './board/board-actions/standard-projects';
import {GlobalParameterIcon} from './icons/global-parameter';
import {TileIcon} from './icons/tile';

export function bucketLogItems(
    logItems: Array<SerializedGameAction>
): Array<Array<SerializedGameAction>> {
    const bucketedEntries: Array<Array<SerializedGameAction>> = [];
    let currentBucket: Array<SerializedGameAction> = [];
    logItems.forEach(entry => {
        if (
            typeof entry === 'string' ||
            entry.actionType === GameActionType.PLAYER_RESOURCE_UPDATE
        ) {
            currentBucket.push(entry);
        } else {
            if (currentBucket.length > 0) {
                bucketedEntries.push(currentBucket);
            }
            currentBucket = [entry];
        }
    });
    if (currentBucket.length > 0) {
        bucketedEntries.push(currentBucket);
    }
    return bucketedEntries;
}

export const ActionLog = () => {
    const {showPopover, hidePopover, popoverConfig} = usePopoverType(PopoverType.ACTION_LOG);
    const triggerRef = useRef<HTMLButtonElement>(null);

    function toggleLog() {
        if (popoverConfig?.triggerRef === triggerRef) {
            hidePopover(triggerRef);
        } else {
            const rootEl = document.querySelector('#root');
            if (!rootEl) {
                throw new Error('could not find root element');
            }
            const clientRect = rootEl.getBoundingClientRect();
            const maxHeight = clientRect.height - 72;
            const maxWidth = clientRect.width - 32;

            showPopover({
                popover: (
                    <TexturedCard
                        className="action-log"
                        borderRadius={5}
                        bgColor="white"
                        style={{
                            overflow: 'hidden',
                            boxShadow: '2px 2px 5px 0px hsl(0, 0%, 20%)',
                            zIndex: 5,
                            height: Math.min(600, maxHeight),
                            width: Math.min(500, maxWidth),
                        }}
                    >
                        <LogPanel />
                    </TexturedCard>
                ),
                triggerRef,
                popoverOpts: {
                    placement: 'bottom-end',
                },
            });
        }
    }

    return (
        <React.Fragment>
            <BlankButton ref={triggerRef} onClick={() => toggleLog()} style={{marginRight: 4}}>
                📜
            </BlankButton>
        </React.Fragment>
    );
};

export const SwitchColors = styled.div`
    > * > * {
        &:nth-child(even) {
            background-color: hsla(0, 0%, 50%, 25%);
        }
    }
`;

export const LogPanelBase = styled(SwitchColors)`
    display: flex;
    overflow-y: auto;
    color: ${colors.TEXT_DARK_1};
    flex-direction: column;
`;

export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const LogPanel = () => {
    const log = useTypedSelector(state => state.log);
    const isCorporationSelection = useTypedSelector(
        state => state.common.gameStage === GameStage.CORPORATION_SELECTION
    );

    const players = useTypedSelector(state => state.players);
    const corporationNames = players
        .filter(player => player?.corporation?.name)
        .map(player => player.corporation.name);

    if (isCorporationSelection) {
        return null;
    }

    const bucketedEntries = bucketLogItems(log);

    return (
        <LogPanelBase>
            <ScrollableFeed>
                {bucketedEntries.map((items, entryIndex) => (
                    <LogEntry
                        items={items}
                        entryIndex={entryIndex}
                        players={players}
                        corporationNames={corporationNames}
                        key={`log-${entryIndex}`}
                    />
                ))}
            </ScrollableFeed>
        </LogPanelBase>
    );
};

const LogEntryInner = ({
    items,
    entryIndex,
    players,
    corporationNames,
    shouldUsePadding = true,
}: {
    items: Array<SerializedGameAction>;
    entryIndex: number;
    players: PlayerState[];
    corporationNames: string[];
    shouldUsePadding?: boolean;
}) => {
    const innerElements: Array<React.ReactNode> = [];
    const gameActions = items.map(getGameAction);

    gameActions.forEach((gameAction, index) => {
        if (typeof gameAction === 'string') {
            // OLD STYLE
            const elements: Array<React.ReactNode> = [gameAction];
            corporationNames.forEach((corpName, index) => {
                let i = 0;
                let key = 0;
                while (i < elements.length) {
                    const stringOrElement = elements[i];
                    if (typeof stringOrElement !== 'string') {
                        i++;
                        continue;
                    } else {
                        if (stringOrElement.indexOf(corpName) === -1) {
                            i++;
                            continue;
                        } else {
                            elements.splice(
                                i,
                                1,
                                stringOrElement.substring(0, stringOrElement.indexOf(corpName))
                            );
                            i++;
                            elements.splice(
                                i,
                                0,
                                <PlayerCorpAndIcon
                                    key={entryIndex + corpName + key++}
                                    player={players[index]}
                                    isInline={true}
                                />
                            );
                            i++;
                            elements.splice(
                                i,
                                0,
                                stringOrElement.substring(
                                    stringOrElement.indexOf(corpName) + corpName.length
                                )
                            );
                            i++;
                            continue;
                        }
                    }
                }
            });

            innerElements.push(
                <Box display="inline" key={innerElements.length}>
                    {elements.map((el, index) => {
                        if (typeof el === 'string') {
                            return <span key={index}>{el}</span>;
                        }
                        return <React.Fragment key={index}>{el}</React.Fragment>;
                    })}
                </Box>
            );
        } else {
            // new style
            switch (gameAction.actionType) {
                case GameActionType.CARD: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {card, payment} = gameAction;
                    const isFree = Object.values(payment).reduce((a, b) => a + b, 0) === 0;

                    if (card.type === CardType.CORPORATION) {
                        innerElements.push(
                            <Box display="inline">
                                <span>{player.username} selected </span>
                                <CardTextToken card={gameAction.card} margin="0px" />
                            </Box>
                        );
                    } else {
                        innerElements.push(
                            <Flex display="inline" alignItems="center">
                                <PlayerCorpAndIcon player={player} isInline />
                                {isFree ? (
                                    <span style={{marginLeft: 4, marginRight: 4}}>played</span>
                                ) : (
                                    <React.Fragment>
                                        <span style={{marginLeft: 4, marginRight: 4}}>paid</span>
                                        <PaymentIconography payment={payment} />
                                        <span style={{marginLeft: 4, marginRight: 4}}>to play</span>
                                    </React.Fragment>
                                )}
                                <CardTextToken card={card} margin="0px" />
                                {isFree && <span style={{marginLeft: 4}}>for free</span>}
                            </Flex>
                        );
                    }
                    break;
                }
                case GameActionType.CARD_ACTION: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {card} = gameAction;
                    const payment = gameAction.payment ?? {};

                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <React.Fragment>
                                {Object.keys(payment).length > 0 ? (
                                    <React.Fragment>
                                        <span style={{marginLeft: 4, marginRight: 4}}>paid</span>
                                        <PaymentIconography payment={payment} />
                                        <span style={{marginLeft: 4, marginRight: 4}}>to play</span>
                                    </React.Fragment>
                                ) : (
                                    <span style={{marginLeft: 4, marginRight: 4}}>played</span>
                                )}
                                <CardTextToken card={card} margin="0px" />
                                <span style={{marginLeft: 4}}>'s action</span>
                            </React.Fragment>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.AWARD: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {award, payment} = gameAction;

                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <React.Fragment>
                                <span style={{marginLeft: 4, marginRight: 4}}>paid</span>
                                <PaymentIconography payment={payment} />
                                <span style={{marginLeft: 4}}>
                                    to fund {getTextForAward(award)}
                                </span>
                            </React.Fragment>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.MILESTONE: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {milestone, payment} = gameAction;

                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <React.Fragment>
                                <span style={{marginLeft: 4, marginRight: 4}}>paid</span>
                                <PaymentIconography payment={payment} />
                                <span style={{marginLeft: 4}}>
                                    to claim {getTextForMilestone(milestone)}
                                </span>
                            </React.Fragment>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.CONVERSION: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {conversionType} = gameAction;
                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <span style={{marginLeft: 4}}>converted</span>
                            {conversionType === 'heat' ? (
                                <React.Fragment>
                                    <span style={{marginLeft: 4, marginRight: 4}}>heat into</span>
                                    <GlobalParameterIcon
                                        parameter={Parameter.TEMPERATURE}
                                        size={20}
                                    />
                                </React.Fragment>
                            ) : (
                                <React.Fragment>
                                    <span style={{marginLeft: 4, marginRight: 4}}>plants into</span>
                                    <TileIcon type={TileType.GREENERY} size={20} />
                                </React.Fragment>
                            )}
                        </Flex>
                    );
                    break;
                }
                case GameActionType.STANDARD_PROJECT: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {standardProject, payment} = gameAction;

                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <React.Fragment>
                                {standardProject !== StandardProjectType.SELL_PATENTS && (
                                    <React.Fragment>
                                        <span style={{marginLeft: 4, marginRight: 4}}>paid</span>
                                        <PaymentIconography payment={payment} />
                                        <span style={{marginLeft: 4, marginRight: 4}}>to</span>
                                    </React.Fragment>
                                )}
                                {getLogTextForStandardProject(standardProject)}
                            </React.Fragment>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.TRADE: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    const {colonyName, payment} = gameAction;

                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <React.Fragment>
                                <span style={{marginLeft: 4, marginRight: 4}}>paid</span>
                                <PaymentIconography payment={payment} />
                                <span style={{marginLeft: 4, marginRight: 4}}>
                                    to trade with {colonyName}
                                </span>
                            </React.Fragment>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.PASS: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <span style={{marginLeft: 4, marginRight: 4}}>
                                passed for this generation
                            </span>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.SKIP: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    innerElements.push(
                        <Flex display="inline" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            <span style={{marginLeft: 4, marginRight: 4}}>
                                skipped their 2nd action
                            </span>
                        </Flex>
                    );
                    break;
                }
                case GameActionType.GAME_UPDATE: {
                    innerElements.push(
                        <Flex
                            display="inline"
                            alignItems="center"
                            className="display"
                            style={{fontSize: '1rem'}}
                        >
                            {gameAction.text}
                        </Flex>
                    );
                    break;
                }
                case GameActionType.PLAYER_RESOURCE_UPDATE: {
                    const player = players.find(p => p.index === gameAction.playerIndex);
                    if (!player) throw new Error('unknown player');
                    innerElements.push(
                        <Flex flexDirection="column">
                            <Flex display="inline" alignItems="center">
                                <PlayerCorpAndIcon player={player} isInline />
                            </Flex>
                            <Box display="grid">
                                {[
                                    Resource.MEGACREDIT,
                                    Resource.STEEL,
                                    Resource.TITANIUM,
                                    Resource.PLANT,
                                    Resource.ENERGY,
                                    Resource.HEAT,
                                ].map((resource, index) => (
                                    <Flex
                                        key={resource}
                                        justifyContent="center"
                                        alignItems="center"
                                        style={{
                                            margin: '4px 0',
                                            gridColumn: (index + 1) % 3,
                                            gridRow: index > 2 ? 2 : 1,
                                        }}
                                    >
                                        <span
                                            key={resource}
                                            style={{
                                                display: 'inline',
                                                marginRight: 8,
                                                alignItems: 'center',
                                                fontWeight: 700,
                                            }}
                                        >
                                            <ResourceIcon
                                                amount={gameAction.resource[resource]}
                                                name={resource as Resource}
                                                margin="0 0 0 2px"
                                            />
                                        </span>
                                    </Flex>
                                ))}
                            </Box>
                        </Flex>
                    );
                    break;
                }
                default:
                    throw spawnExhaustiveSwitchError(gameAction);
            }
        }
    });

    return (
        <Box
            key={`Log-entry-${entryIndex}`}
            padding={shouldUsePadding ? '8px' : undefined}
            fontSize="0.8rem"
        >
            {innerElements.map((innerElement, index) =>
                index === 0 ? (
                    <React.Fragment key={index}>{innerElement}</React.Fragment>
                ) : (
                    <Box margin="8px 30px 0" key={index}>
                        {innerElement}
                    </Box>
                )
            )}
        </Box>
    );
};

export const LogEntry = React.memo(LogEntryInner, logPropsAreEqual);

function logPropsAreEqual(props1, props2) {
    return props1?.items && props1?.items?.length === props2?.items?.length;
}

function PaymentIconography({payment}: {payment: NumericPropertyCounter<Resource>}) {
    return (
        <React.Fragment>
            {Object.entries(payment ?? {}) // legacy games may have `null` payment
                .filter(([, amount]) => amount > 0)
                .map(([resource, amount], index) => {
                    return (
                        <React.Fragment key={index}>
                            {index > 0 && <span style={{marginLeft: 4, marginRight: 4}}> + </span>}
                            <ResourceIcon name={resource as Resource} amount={amount} size={16} />
                        </React.Fragment>
                    );
                })}
        </React.Fragment>
    );
}
