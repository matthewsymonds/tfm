import {Box, Flex} from 'components/box';
import {PlayerCorpAndIcon} from 'components/icons/player';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {GameStage} from 'constants/game';
import {GlobalPopoverContext} from 'context/global-popover-context';
import React, {useContext, useEffect, useLayoutEffect, useRef} from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {BlankButton} from './blank-button';
import {GameAction, GameActionType} from 'GameActionState';
import spawnExhaustiveSwitchError from 'utils';
import {CardTextToken} from 'components/card/CardToken';
import {getGameAction} from 'selectors/get-game-action';
import {SerializedGameAction} from 'state-serialization';
import {ResourceIcon} from 'components/icons/resource';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {CardType} from 'constants/card-types';
import {getDiscountedCardCost} from 'selectors/get-discounted-card-cost';

export const ActionLog = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <React.Fragment>
            <BlankButton onClick={() => setIsOpen(!isOpen)} style={{marginRight: 4}}>
                📜
            </BlankButton>
            {isOpen && (
                <TexturedCard
                    borderRadius={5}
                    bgColor="white"
                    style={{
                        overflow: 'hidden',
                        boxShadow: '2px 2px 5px 0px hsl(0, 0%, 20%)',
                        position: 'absolute',
                        top: 40,
                        right: 40,
                        zIndex: 5,
                    }}
                >
                    <LogPanel />
                </TexturedCard>
            )}
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
    max-height: 600px;
    max-width: 500px;
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
    return (
        <LogPanelBase>
            <ScrollableFeed>
                {log.map((entry, entryIndex) => (
                    <LogEntry
                        entry={entry}
                        entryIndex={entryIndex}
                        players={players}
                        corporationNames={corporationNames}
                        key={`${entry}-${entryIndex}`}
                    />
                ))}
            </ScrollableFeed>
        </LogPanelBase>
    );
};

const LogEntryInner = ({
    entry,
    entryIndex,
    players,
    corporationNames,
}: {
    entry: SerializedGameAction;
    entryIndex: number;
    players: PlayerState[];
    corporationNames: string[];
}) => {
    let innerElement: React.ReactNode;
    const gameAction = getGameAction(entry);

    let isTopLevelItem = false;
    if (
        typeof gameAction !== 'string' ||
        gameAction.startsWith('Generation') ||
        gameAction.startsWith('Production') ||
        gameAction.indexOf('passed') !== -1
    ) {
        isTopLevelItem = true;
    }

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

        const style = isTopLevelItem ? null : {marginLeft: 30, fontSize: '0.8em', opacity: 0.85};
        innerElement = (
            <Box display="inline" style={style}>
                {elements.map((el, index) => {
                    if (typeof el === 'string') {
                        return <span key={index}>{el}</span>;
                    }
                    return el;
                })}
            </Box>
        );
    } else {
        // new style
        const player = players.find(p => p.index === gameAction.playerIndex);
        if (!player) throw new Error('unknown player');
        switch (gameAction.actionType) {
            case GameActionType.CARD: {
                const {card} = gameAction;
                const payment =
                    gameAction.payment === null || gameAction.payment === undefined
                        ? {}
                        : gameAction.payment;
                const cardCost = getDiscountedCardCost(card, player);
                if (cardCost > 0 && Object.keys(payment).length === 0) {
                    payment[Resource.MEGACREDIT] = cardCost;
                }

                if (card.type === CardType.CORPORATION) {
                    innerElement = (
                        <Box display="inline">
                            <span>{player.username} selected </span>
                            <CardTextToken card={gameAction.card} margin="0px" />
                        </Box>
                    );
                } else {
                    innerElement = (
                        <Flex display="inline-flex" alignItems="center">
                            <PlayerCorpAndIcon player={player} isInline />
                            {cardCost === 0 ? (
                                <span style={{marginLeft: 4, marginRight: 4}}>played</span>
                            ) : (
                                <React.Fragment>
                                    <span style={{marginLeft: 4, marginRight: 4}}> paid </span>
                                    <PaymentIconography payment={payment} />
                                    <span style={{marginLeft: 4, marginRight: 4}}> to play </span>
                                </React.Fragment>
                            )}
                            <CardTextToken card={card} margin="0px" />
                        </Flex>
                    );
                }
            }
            case GameActionType.CARD_ACTION: {
                const {card} = gameAction;

                innerElement = (
                    <Flex display="inline-flex" alignItems="center">
                        <PlayerCorpAndIcon player={player} isInline />
                        <React.Fragment>
                            <span style={{marginLeft: 4, marginRight: 4}}> played </span>
                            <CardTextToken card={card} margin="0px" />
                            <span style={{marginRight: 4}}>'s action</span>
                        </React.Fragment>
                    </Flex>
                );
            }
            case GameActionType.AWARD:
            case GameActionType.MILESTONE:
            case GameActionType.STANDARD_PROJECT:
            case GameActionType.TRADE:
            case GameActionType.PASS:
            case GameActionType.SKIP:
                break;
            default:
                throw spawnExhaustiveSwitchError(gameAction);
        }
    }

    return (
        <Box key={`Log-entry-${entryIndex}`} padding="8px">
            {innerElement}
        </Box>
    );
};

export const LogEntry = React.memo(LogEntryInner, logPropsAreEqual);

function logPropsAreEqual() {
    return true;
}

function PaymentIconography({payment}: {payment: NumericPropertyCounter<Resource>}) {
    console.log('yo', Object.entries(payment));
    return (
        <React.Fragment>
            {Object.entries(payment)
                .filter(([, amount]) => amount > 0)
                .map(([resource, amount], index) => {
                    return (
                        <React.Fragment>
                            {index > 0 && <span style={{marginLeft: 4, marginRight: 4}}> + </span>}
                            <ResourceIcon name={resource as Resource} amount={amount} />
                        </React.Fragment>
                    );
                })}
        </React.Fragment>
    );
}
