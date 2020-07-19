import {
    announceReadyToStartRound,
    completeAction,
    discardCards,
    discardRevealedCards,
    moveCardFromHandToPlayArea,
    payForCards,
    removeForcedActionFromPlayer,
    setCards,
    setSelectedCards,
} from 'actions';
import AskUserToConfirmResourceActionDetails from 'components/ask-user-to-confirm-resource-action-details';
import PaymentPopover from 'components/popovers/payment-popover';
import {Switcher} from 'components/switcher';
import {TileType} from 'constants/board';
import {CardType} from 'constants/card-types';
import {colors, GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {getResourceName, Resource} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import {AppContext, doesCardPaymentRequirePlayerInput} from 'context/app-context';
import {useSyncState} from 'hooks/sync-state';
import {Card} from 'models/card';
import {useRouter} from 'next/router';
import React, {MouseEvent, useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {RootState, useTypedSelector} from 'reducer';
import {getHumanReadableTileName} from 'selectors/get-human-readable-tile-name';
import {getWaitingMessage} from 'selectors/get-waiting-message';
import {getForcedActionsForPlayer} from 'selectors/player';
import styled from 'styled-components';
import {ActionBar, ActionBarRow} from './action-bar';
import {AskUserToConfirmDiscardSelection} from './ask-user-to-confirm-discard-selection';
import {AskUserToMakeActionChoice} from './ask-user-to-make-action-choice';
import Awards from './board/awards';
import {Board} from './board/board';
import Milestones from './board/milestones';
import StandardProjects from './board/standard-projects';
import {Box, Flex, Panel} from './box';
import {Button} from './button';
import {CardActionElements, CardComponent, CardDisabledText, CardText} from './card';
import {CardSelector} from './card-selector';
import GlobalParams from './global-params';
import {PlayerOverview} from './player-overview';
import {Square} from './square';
import {SwitchColors} from './switch-colors';
import {TopBar} from 'components/top-bar';

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const ActiveRoundOuter = styled.div`
    width: calc(100% - 32px);
    margin: 16px;
    display: flex;
`;

const RightBox = styled.div`
    width: 100%;
    flex-grow: 1;
`;

const HiddenCardsMessage = styled.div`
    margin: 16px;
`;

export const ActiveRound = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const {corporation, possibleCards, cards, selectedCards} = player;
    const turn = useTypedSelector(state => state.common.turn);
    const action = player.action;
    const generation = useTypedSelector(state => state.common.generation);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const [cardsToDiscard, setCardsToDiscard] = useState<Card[]>([]);
    const log = useTypedSelector(state => state.log);

    const [isPaymentPopoverOpen, setIsPaymentPopoverOpen] = useState(false);
    const [cardPendingPayment, setCardPendingPayment] = useState<Card | null>(null);

    let maxCardsToDiscard: number;
    const discardAmount = player?.pendingDiscard?.amount;

    if (discardAmount === VariableAmount.USER_CHOICE) {
        maxCardsToDiscard = cards.length;
    } else if (discardAmount === VariableAmount.USER_CHOICE_UP_TO_ONE) {
        maxCardsToDiscard = 1;
    } else {
        maxCardsToDiscard = discardAmount as number;
    }

    let minCardsToDiscard = 0;
    if (typeof discardAmount === 'number') {
        minCardsToDiscard = discardAmount;
    }
    if (discardAmount === VariableAmount.USER_CHOICE) {
        // Can't cycle a turn with sell patents by selling 0 cards!
        minCardsToDiscard = 1;
    }

    // For selecting cards to discard
    function handleCardClick(card) {
        if (player.pendingDiscard) {
            let newCardsToDiscard = [...cardsToDiscard];
            if (newCardsToDiscard.includes(card)) {
                newCardsToDiscard = newCardsToDiscard.filter(c => c !== card);
            } else {
                newCardsToDiscard.push(card);
                while (newCardsToDiscard.length > maxCardsToDiscard) {
                    newCardsToDiscard.shift();
                }
            }
            setCardsToDiscard(newCardsToDiscard);
        }
    }

    useSyncState();

    useEffect(() => {
        if (state.common.currentPlayerIndex === player.index) {
            const forcedActions = getForcedActionsForPlayer(state, player.index);

            for (let i = 0; i < 2; i++) {
                if (forcedActions[i]) {
                    context.playAction({state, action: forcedActions[i]});
                    context.queue.push(completeAction(player.index));
                    context.queue.push(removeForcedActionFromPlayer(playerIndex, forcedActions[i]));
                }
            }
            context.processQueue(dispatch);
        }
    }, []);

    function playCard(card: Card, payment?: PropertyCounter<Resource>) {
        dispatch(moveCardFromHandToPlayArea(card, playerIndex));
        context.playCard(card, store.getState(), payment);
        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        context.triggerEffectsFromPlayedCard(
            card,
            // refreshed state so that the card we just played is present.
            store.getState()
        );
        context.processQueue(dispatch);
    }

    function handlePlayCard(card: Card) {
        if (doesCardPaymentRequirePlayerInput(player, card)) {
            setCardPendingPayment(card);
            setIsPaymentPopoverOpen(true);
        } else {
            playCard(card);
        }
    }

    function handleConfirmCardPayment(payment: PropertyCounter<Resource>) {
        if (!cardPendingPayment) {
            throw new Error('No card pending payment');
        }
        playCard(cardPendingPayment, payment);
        setIsPaymentPopoverOpen(false);
        setCardPendingPayment(null);
    }

    function confirmDiscardSelection() {
        dispatch(discardCards(cardsToDiscard, playerIndex));
        context.processQueue(dispatch);
        setCardsToDiscard([]);
    }

    const players = useTypedSelector(state => state.players);

    function continueAfterRevealingCards() {
        context.queue.push(discardRevealedCards());
        context.processQueue(dispatch);
    }

    function handleConfirmBuyOrTakeCards() {
        if (gameStage === GameStage.ACTIVE_ROUND) {
            context.processQueue(dispatch);
            return;
        }

        if (gameStage === GameStage.CORPORATION_SELECTION) {
            dispatch(moveCardFromHandToPlayArea(corporation, playerIndex));
            context.playCard(corporation, state);
            context.triggerEffectsFromPlayedCard(corporation, store.getState());
        }

        dispatch(setCards(cards.concat(selectedCards), playerIndex));
        dispatch(setSelectedCards([], playerIndex));
        dispatch(
            discardCards(
                possibleCards.filter(card => !selectedCards.includes(card)),
                playerIndex
            )
        );
        dispatch(payForCards(selectedCards, player.index));
        dispatch(announceReadyToStartRound(playerIndex));
        context.processQueue(dispatch);
    }

    const waitingMessage = getWaitingMessage(playerIndex, state);

    const router = useRouter();

    const totalCardCost = player.selectedCards.length * 3;
    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const playerMoney =
        gameStage === GameStage.CORPORATION_SELECTION
            ? player.corporation.gainResource[Resource.MEGACREDIT]
            : player.resources[Resource.MEGACREDIT];
    const remaining = player.buyCards ? playerMoney - totalCardCost : playerMoney;
    const numCardsToTake = player.buyCards ? player.possibleCards.length : player.numCardsToTake;
    let lookAtCardsPrompt = `Select ${player.buyCards ? 'up to ' : ''}${numCardsToTake} card${
        numCardsToTake !== 1 ? 's' : ''
    } to ${player.buyCards ? 'buy' : 'take'}`;
    if (player.buyCards) {
        lookAtCardsPrompt += ` (${remaining} MC remaining)`;
    }
    const cannotContinueAfterLookingAtCards =
        totalCardCost > playerMoney ||
        (player.numCardsToTake !== null && player.selectedCards.length < player.numCardsToTake);

    const sortedPlayers = [...players].sort(
        (a, b) =>
            state.common.playerIndexOrderForGeneration.indexOf(a.index) -
            state.common.playerIndexOrderForGeneration.indexOf(b.index)
    );

    const isPlayerMakingDecision =
        player.pendingTilePlacement ||
        state.common.revealedCards.length > 0 ||
        player.possibleCards.length > 0 ||
        player.pendingResourceActionDetails ||
        player.pendingChoice ||
        player.forcedActions.length ||
        player.pendingDiscard;

    useEffect(() => {
        if (!isPlayerMakingDecision) {
            context.processQueue(dispatch);
        }
    }, []);
    const isCorporationSelection = gameStage === GameStage.CORPORATION_SELECTION;
    const isBuyOrDiscard = gameStage === GameStage.BUY_OR_DISCARD;

    const passedMessage = action || gameStage !== GameStage.ACTIVE_ROUND ? '' : 'You have passed';

    return (
        <>
            <TopBar player={player} isPlayerMakingDecision={isPlayerMakingDecision} />
            <ActiveRoundOuter className="active-round-outer">
                <Box width={'648px'}>
                    <Board
                        board={state.common.board}
                        playerIndex={playerIndex}
                        parameters={state.common.parameters}
                    />
                    <Box>
                        <GlobalParams parameters={state.common.parameters} />
                    </Box>
                    <Box>
                        <Panel>
                            <Switcher tabs={['Standard Projects', 'Milestones', 'Awards']}>
                                <StandardProjects />
                                <Milestones />
                                <Awards />
                            </Switcher>
                        </Panel>
                    </Box>
                    <Panel>
                        <Box margin="8px" fontWeight="bold">
                            <em>Log</em>
                        </Box>
                        <Flex
                            maxHeight="400px"
                            margin="12px"
                            overflowY="auto"
                            flexDirection="column-reverse"
                        >
                            <SwitchColors>
                                {log.map((entry, entryIndex) => {
                                    return (
                                        <Box
                                            marginTop="4px"
                                            padding="8px"
                                            key={'Log-entry-' + entryIndex}
                                        >
                                            {entry}
                                        </Box>
                                    );
                                })}
                            </SwitchColors>
                        </Flex>
                    </Panel>
                </Box>

                <RightBox className="right-box">
                    <Box width="100%">
                        <Switcher
                            defaultTabIndex={sortedPlayers.indexOf(player)}
                            tabs={sortedPlayers.map(player => (
                                <Flex flexDirection="row" alignItems="center" key={player.index}>
                                    <Box display="inline-block" marginRight="8px">
                                        {isCorporationSelection
                                            ? player.username
                                            : player.corporation.name}
                                    </Box>
                                    <Square playerIndex={player.index} />
                                </Flex>
                            ))}
                        >
                            {sortedPlayers.map(thisPlayer => {
                                const cards = (
                                    <Hand key={thisPlayer.index + 'hand'}>
                                        {thisPlayer.cards.map(card => {
                                            const [canPlay, reason] = context.canPlayCard(
                                                card,
                                                state
                                            );
                                            return (
                                                <CardComponent
                                                    key={card.name}
                                                    content={card}
                                                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                                                        if (playerIndex !== thisPlayer.index)
                                                            return;
                                                        handleCardClick(card);
                                                    }}
                                                    selected={cardsToDiscard.includes(card)}
                                                >
                                                    {!canPlay && (
                                                        <CardDisabledText>
                                                            <em>{reason}</em>
                                                        </CardDisabledText>
                                                    )}
                                                    {playerIndex === thisPlayer.index ? (
                                                        <button
                                                            disabled={
                                                                !canPlay || player.pendingDiscard
                                                            }
                                                            onClick={() => handlePlayCard(card)}
                                                            id={card.name.replace(/\s+/g, '-')}
                                                        >
                                                            Play
                                                        </button>
                                                    ) : null}
                                                </CardComponent>
                                            );
                                        })}
                                        {cardPendingPayment && (
                                            <PaymentPopover
                                                isOpen={isPaymentPopoverOpen}
                                                target={cardPendingPayment.name.replace(
                                                    /\s+/g,
                                                    '-'
                                                )}
                                                card={cardPendingPayment}
                                                toggle={() =>
                                                    setIsPaymentPopoverOpen(!isPaymentPopoverOpen)
                                                }
                                                onConfirmPayment={(...args) =>
                                                    handleConfirmCardPayment(...args)
                                                }
                                            />
                                        )}
                                    </Hand>
                                );
                                const playedCards = (
                                    <Hand key={thisPlayer.index + 'playedCards'}>
                                        {thisPlayer.playedCards
                                            .filter(card => card.type !== CardType.CORPORATION)
                                            .map(card => {
                                                let resources = '';
                                                const {
                                                    storedResourceType: type,
                                                    storedResourceAmount: amount,
                                                } = card;
                                                if (type) {
                                                    resources = `Holds ${amount} ${getResourceName(
                                                        type
                                                    )}${amount === 1 ? '' : 's'}`;
                                                }

                                                const isLoggedInPlayer =
                                                    thisPlayer.index === playerIndex;
                                                return (
                                                    <CardComponent
                                                        content={card}
                                                        key={card.name}
                                                        isHidden={
                                                            !isLoggedInPlayer &&
                                                            card.type === CardType.EVENT
                                                        }
                                                    >
                                                        {resources && (
                                                            <CardText>{resources}</CardText>
                                                        )}

                                                        <CardActionElements
                                                            player={thisPlayer}
                                                            isLoggedInPlayer={isLoggedInPlayer}
                                                            card={card}
                                                        />
                                                    </CardComponent>
                                                );
                                            })}
                                    </Hand>
                                );

                                const cardsHiddenCorporationSelection = (
                                    <HiddenCardsMessage>
                                        You can't count {thisPlayer.username}'s hand until
                                        everyone's ready.
                                    </HiddenCardsMessage>
                                );

                                const cardsHiddenBuyOrDiscard = (
                                    <HiddenCardsMessage>
                                        {thisPlayer.corporation.name} had{' '}
                                        {thisPlayer.previousCardsInHand || 0} card
                                        {thisPlayer.previousCardsInHand === 1 ? '' : 's'} at the end
                                        of the previous round.
                                    </HiddenCardsMessage>
                                );

                                const cardsHiddenActiveRound = (
                                    <HiddenCardsMessage>
                                        {thisPlayer.corporation.name} has {thisPlayer.cards.length}{' '}
                                        card
                                        {thisPlayer.cards.length === 1 ? '' : 's'} in hand.
                                    </HiddenCardsMessage>
                                );

                                const noPlayedCardsMessage = (
                                    <HiddenCardsMessage>No cards played yet.</HiddenCardsMessage>
                                );

                                const noCardsInHandMessage = (
                                    <HiddenCardsMessage>No cards in hand.</HiddenCardsMessage>
                                );

                                const isLoggedInPlayer = thisPlayer.index === playerIndex;

                                const cardsHidden = isCorporationSelection
                                    ? cardsHiddenCorporationSelection
                                    : isBuyOrDiscard
                                    ? cardsHiddenBuyOrDiscard
                                    : cardsHiddenActiveRound;

                                const playedCardsExcludingCorp = thisPlayer.playedCards.filter(
                                    card => card.type !== CardType.CORPORATION
                                );

                                return (
                                    <React.Fragment key={thisPlayer.index}>
                                        <Flex flexDirection="column" justifyContent="stretch">
                                            <Panel>
                                                <PlayerOverview
                                                    player={thisPlayer}
                                                    isLoggedInPlayer={
                                                        playerIndex === thisPlayer.index
                                                    }
                                                />
                                            </Panel>
                                            <Panel>
                                                <Switcher
                                                    color={colors[thisPlayer.index]}
                                                    tabs={['Hand', 'Played Cards']}
                                                    defaultTabIndex={0}
                                                >
                                                    {[
                                                        !isLoggedInPlayer
                                                            ? cardsHidden
                                                            : thisPlayer.cards.length === 0
                                                            ? noCardsInHandMessage
                                                            : cards,
                                                        playedCardsExcludingCorp.length > 0
                                                            ? playedCards
                                                            : noPlayedCardsMessage,
                                                    ]}
                                                </Switcher>
                                            </Panel>
                                        </Flex>
                                    </React.Fragment>
                                );
                            })}
                        </Switcher>
                    </Box>
                </RightBox>
            </ActiveRoundOuter>
            {isPlayerMakingDecision && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.pendingChoice && <AskUserToMakeActionChoice player={player} />}
                        {player.pendingDiscard && (
                            <AskUserToConfirmDiscardSelection
                                minCardsToDiscard={minCardsToDiscard}
                                maxCardsToDiscard={maxCardsToDiscard}
                                cardsToDiscard={cardsToDiscard}
                                confirmDiscardSelection={confirmDiscardSelection}
                                player={player}
                            />
                        )}
                        {player.possibleCards.length > 0 && (
                            <Flex flexDirection="column">
                                <h3>{lookAtCardsPrompt}</h3>
                                <CardSelector
                                    max={player.numCardsToTake || Infinity}
                                    selectedCards={player.selectedCards}
                                    onSelect={cards =>
                                        dispatch(setSelectedCards(cards, playerIndex))
                                    }
                                    options={player.possibleCards}
                                    budget={remaining}
                                    orientation="vertical"
                                />
                                <Flex justifyContent="center">
                                    <Button
                                        disabled={cannotContinueAfterLookingAtCards}
                                        onClick={() => handleConfirmBuyOrTakeCards()}
                                    >
                                        {player.buyCards
                                            ? 'Confirm'
                                            : `Take ${
                                                  player.numCardsToTake === 1 ? 'card' : 'cards'
                                              }`}
                                    </Button>
                                </Flex>
                            </Flex>
                        )}
                        {player.pendingTilePlacement &&
                            (player.pendingTilePlacement.type === TileType.LAND_CLAIM ? (
                                <h3>Claim an unreserved area.</h3>
                            ) : (
                                <h3>
                                    Place the{' '}
                                    {getHumanReadableTileName(player.pendingTilePlacement.type)}{' '}
                                    tile.
                                </h3>
                            ))}
                        {player.pendingResourceActionDetails && (
                            <AskUserToConfirmResourceActionDetails
                                player={player}
                                resourceActionDetails={player.pendingResourceActionDetails}
                            />
                        )}
                        {state.common.revealedCards.map((card, index) => {
                            return (
                                <CardComponent key={index} width={250} content={card}>
                                    {index === state.common.revealedCards.length - 1 ? (
                                        <button onClick={continueAfterRevealingCards}>
                                            Continue
                                        </button>
                                    ) : null}
                                </CardComponent>
                            );
                        })}
                    </ActionBarRow>
                </ActionBar>
            )}
        </>
    );
};
