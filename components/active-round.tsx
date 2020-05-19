import React, {MouseEvent, useContext, useEffect, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import styled from 'styled-components';
import {
    askUserToConfirmResourceTargetLocation as askUserToConfirmResourceTargetLocationAction,
    completeAction,
    discardCards,
    gainResource,
    gainStorableResource,
    markCardActionAsPlayed,
    moveCardFromHandToPlayArea,
    skipAction,
    discardRevealedCards,
    setSelectedCards,
} from '../actions';
import CardPaymentPopover from '../components/popovers/card-payment';
import {ResourceBoard, ResourceBoardCell, ResourceBoardRow} from '../components/resource';
import {Amount, Action} from '../constants/action';
import {TileType} from '../constants/board';
import {Conversion, CONVERSIONS} from '../constants/conversion';
import {PropertyCounter} from '../constants/property-counter';
import {Resource, ResourceLocationType} from '../constants/resource';
import {AppContext, doesCardPaymentRequiresPlayerInput} from '../context/app-context';
import {Card} from '../models/card';
import {useSyncState} from '../pages/sync-state';
import {RootState, useTypedSelector} from '../reducer';
import {ActionBar, ActionBarRow} from './action-bar';
import {Board} from './board/board';
import {CardComponent, CardText} from './card';
import SelectResourceTargetLocation from './select-resource-target-location';
import SelectResourceTypeToGain from './select-resource-type-to-gain';
import {CardSelector} from './card-selector';
import {TurnContext} from './turn-context';
import {ConversionLink} from './conversion-link';
import {getWaitingMessage} from '../selectors/get-waiting-message';
import {getHumanReadableTileName} from '../selectors/get-human-readable-tile-name';

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const FlexColumn = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

function getResourceHumanName(resource: Resource): string {
    let result = String(resource);
    return result.slice('resource'.length).toLowerCase();
}

function getResourceReductionAmountHumanName(amount: Amount) {
    if (typeof amount !== 'number') {
        return 'any number of';
    } else {
        return amount;
    }
}

export const ActiveRound = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const resources = useTypedSelector(state => state.players[playerIndex].resources);
    const productions = useTypedSelector(state => state.players[playerIndex].productions);
    const cards = useTypedSelector(state => state.players[playerIndex].cards);
    const playedCards = useTypedSelector(state => state.players[playerIndex].playedCards);
    const turn = useTypedSelector(state => state.common.turn);
    const action = player.action;
    const generation = useTypedSelector(state => state.common.generation);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const [cardsToDiscard, setCardsToDiscard] = useState<Set<Card>>(new Set());

    const [isCardPaymentPopoverOpen, setIsCardPaymentPopoverOpen] = useState(false);
    const [cardPendingPayment, setCardPendingPayment] = useState<Card | null>(null);

    function handleCardClick(card) {
        if (player.pendingResourceReduction?.resource === Resource.CARD) {
            const newCardsToDiscard = new Set(cardsToDiscard);
            if (cardsToDiscard.has(card)) {
                newCardsToDiscard.delete(card);
            } else {
                newCardsToDiscard.add(card);
            }
            setCardsToDiscard(newCardsToDiscard);
        }
    }

    useSyncState();

    useEffect(() => {
        context.processQueue(dispatch);
    }, []);

    function playCard(card: Card, payment?: PropertyCounter<Resource>) {
        dispatch(moveCardFromHandToPlayArea(card, playerIndex));
        context.playCard(card, store.getState(), payment);
        // Have to trigger effects from the card we just played.
        // Must be processed separatedly in case the card affects itself.
        context.triggerEffectsFromPlayedCard(
            card.cost || 0,
            card.tags,
            // refreshed state so that the card we just played is present.
            store.getState()
        );
        context.processQueue(dispatch);
    }

    function handlePlayCard(card: Card) {
        if (doesCardPaymentRequiresPlayerInput(card)) {
            setCardPendingPayment(card);
            setIsCardPaymentPopoverOpen(true);
        } else {
            playCard(card);
        }
    }

    function handleConfirmCardPayment(payment: PropertyCounter<Resource>) {
        if (!cardPendingPayment) {
            throw new Error('No card pending payment');
        }
        playCard(cardPendingPayment, payment);
        setIsCardPaymentPopoverOpen(false);
        setCardPendingPayment(null);
    }

    function confirmDiscardSelection() {
        dispatch(discardCards(Array.from(cardsToDiscard), playerIndex));
        context.processQueue(dispatch);
        setCardsToDiscard(new Set());
    }

    function confirmResourceGain(resource: Resource, amount: number) {
        dispatch(gainResource(resource, amount, playerIndex));
        context.processQueue(dispatch);
    }

    function askUserToConfirmResourceTargetLocation(
        gainResource: PropertyCounter<Resource>,
        gainResourceTargetType: ResourceLocationType,
        card: Card | undefined
    ) {
        dispatch(
            askUserToConfirmResourceTargetLocationAction(
                gainResource,
                gainResourceTargetType,
                card,
                playerIndex
            )
        );
    }

    function confirmStorableResourceGain(resource: Resource, amount: Amount, card: Card) {
        dispatch(gainStorableResource(resource, amount, card, playerIndex));
        context.processQueue(dispatch);
    }

    function playAction(card: Card, action: Action) {
        dispatch(markCardActionAsPlayed(card, playerIndex));
        context.playAction(action, state, card);
        context.queue.push(completeAction(playerIndex));
        context.processQueue(dispatch);
    }

    function cardActionElements(card: Card) {
        if (!card.action) return null;

        const options = card.action.choice || [card.action];

        if (card.usedActionThisRound) {
            return (
                <CardText>
                    <em>Used action this round</em>
                </CardText>
            );
        }

        return options.map((option, index) => {
            const [canPlay, reason] = context.canPlayAction(option, state, card);
            return (
                <React.Fragment key={index}>
                    <button disabled={!canPlay} onClick={() => playAction(card, option)}>
                        {options.length === 1 ? 'Play Action' : option.text}
                    </button>
                    {!canPlay && reason ? (
                        <CardText>
                            <em>{reason}</em>
                        </CardText>
                    ) : null}
                </React.Fragment>
            );
        });
    }

    function continueAfterRevealingCards() {
        context.queue.push(discardRevealedCards());
        context.processQueue(dispatch);
    }

    const waitingMessage = getWaitingMessage(playerIndex, state);

    const totalCardCost = player.selectedCards.length * 3;
    const playerMoney = player.resources[Resource.MEGACREDIT];
    const remaining = player.buyCards ? playerMoney - totalCardCost : playerMoney;
    const numCardsToTake = player.buyCards ? player.possibleCards.length : player.numCardsToTake;
    const lookAtCardsPrompt = `Select ${player.buyCards ? 'up to ' : ''}${numCardsToTake} card${
        numCardsToTake !== 1 ? 's' : ''
    } to ${player.buyCards ? 'buy' : 'take'}`;
    const cannotContinueAfterLookingAtCards =
        totalCardCost > playerMoney ||
        (player.numCardsToTake !== null && player.selectedCards.length < player.numCardsToTake);

    const showBottomActionBar =
        player.pendingTilePlacement ||
        player.pendingResourceReduction ||
        player.pendingResourceGain ||
        state.common.revealedCards.length > 0 ||
        player.possibleCards.length > 0 ||
        player.pendingResourceGainTargetConfirmation;
    return (
        <>
            <ActionBar>
                <ActionBarRow>
                    <h1>
                        {corporation && corporation.name} ({player.username})
                    </h1>
                    <TurnContext>
                        <div>Turn {turn}</div>
                        <div>Action {action} of 2</div>
                        <div>Generation {generation}</div>
                        <div>TFR {player.terraformRating}</div>
                    </TurnContext>
                    <TurnContext>
                        <button
                            disabled={context.shouldDisableUI(state)}
                            onClick={() => dispatch(skipAction(playerIndex))}
                        >
                            {action === 2 ? 'Skip 2nd action' : 'Pass'}
                        </button>
                    </TurnContext>
                    <ResourceBoard>
                        <ResourceBoardRow>
                            {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(
                                resourceType => {
                                    return (
                                        <ResourceBoardCell
                                            key={resourceType}
                                            resource={resourceType}
                                            production={productions[resourceType]}
                                            amount={resources[resourceType]}
                                        />
                                    );
                                }
                            )}
                        </ResourceBoardRow>
                        <ResourceBoardRow>
                            {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resource => {
                                const conversion = CONVERSIONS[resource];
                                return (
                                    <div key={resource}>
                                        <ResourceBoardCell
                                            resource={resource}
                                            production={productions[resource]}
                                            amount={resources[resource]}
                                        />
                                        {context.canDoConversion(state, conversion) ? (
                                            <>
                                                <ConversionLink
                                                    onClick={() =>
                                                        context.doConversion(
                                                            state,
                                                            playerIndex,
                                                            dispatch,
                                                            conversion
                                                        )
                                                    }
                                                >
                                                    Convert 8
                                                </ConversionLink>
                                            </>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </ResourceBoardRow>
                    </ResourceBoard>
                </ActionBarRow>
                {waitingMessage ? <ActionBarRow>{waitingMessage}</ActionBarRow> : null}
            </ActionBar>
            <Board
                board={state.common.board}
                playerIndex={playerIndex}
                parameters={state.common.parameters}
            />
            <h3>Hand</h3>
            <Hand>
                {cards.map(card => {
                    const [canPlay, reason] = context.canPlayCard(card, state);
                    return (
                        <CardComponent
                            content={card}
                            width={250}
                            key={card.name}
                            onClick={(e: MouseEvent<HTMLDivElement>) => handleCardClick(card)}
                            selected={cardsToDiscard.has(card)}
                        >
                            {!canPlay && (
                                <CardText>
                                    <em>{reason}</em>
                                </CardText>
                            )}
                            <button
                                disabled={
                                    !context.canPlayCard(card, state)[0] ||
                                    player.pendingResourceReduction?.resource === Resource.CARD
                                }
                                onClick={() => handlePlayCard(card)}
                                id={card.name.replace(/\s+/g, '-')}
                            >
                                Play
                            </button>
                        </CardComponent>
                    );
                })}
                {cardPendingPayment && (
                    <CardPaymentPopover
                        isOpen={isCardPaymentPopoverOpen}
                        target={cardPendingPayment.name.replace(/\s+/g, '-')}
                        card={cardPendingPayment}
                        toggle={() => setIsCardPaymentPopoverOpen(!isCardPaymentPopoverOpen)}
                        onConfirmPayment={(...args) => handleConfirmCardPayment(...args)}
                    />
                )}
            </Hand>
            <hr></hr>
            <h3>Played cards</h3>
            <Hand>
                {playedCards.map(card => {
                    let resources = '';
                    const {storedResourceType: type, storedResourceAmount: amount} = card;
                    if (type) {
                        resources = `Holds ${amount} ${getResourceHumanName(type)}${
                            amount === 1 ? '' : 's'
                        }`;
                    }
                    return (
                        <CardComponent content={card} width={250} key={card.name}>
                            {resources && <CardText>{resources}</CardText>}

                            {cardActionElements(card)}
                        </CardComponent>
                    );
                })}
            </Hand>
            {showBottomActionBar && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.possibleCards.length > 0 && (
                            <FlexColumn>
                                <h3>{lookAtCardsPrompt}</h3>
                                <CardSelector
                                    max={player.numCardsToTake || Infinity}
                                    cardWidth={250}
                                    selectedCards={player.selectedCards}
                                    onSelect={cards =>
                                        dispatch(setSelectedCards(cards, playerIndex))
                                    }
                                    options={player.possibleCards}
                                    budget={remaining}
                                    orientation="vertical"
                                />
                                <button
                                    disabled={cannotContinueAfterLookingAtCards}
                                    onClick={() => context.processQueue(dispatch)}
                                >
                                    {player.buyCards ? 'Confirm' : 'Take cards'}
                                </button>
                            </FlexColumn>
                        )}
                        {player.pendingTilePlacement && (
                            <h3>
                                Place the{' '}
                                {getHumanReadableTileName(player.pendingTilePlacement.type)} tile.
                            </h3>
                        )}
                        {player.pendingResourceReduction?.resource === Resource.CARD && (
                            <>
                                <div>
                                    Select{' '}
                                    {getResourceReductionAmountHumanName(
                                        player.pendingResourceReduction.amount
                                    )}{' '}
                                    card{player.pendingResourceReduction.amount === 1 ? '' : 's'} to
                                    discard.
                                </div>
                                <button onClick={confirmDiscardSelection}>
                                    Confirm discard selection
                                </button>
                            </>
                        )}
                        {player.pendingResourceGain && (
                            <SelectResourceTypeToGain
                                player={player}
                                confirmResourceGain={confirmResourceGain}
                                askUserToConfirmResourceTargetLocation={
                                    askUserToConfirmResourceTargetLocation
                                }
                            />
                        )}
                        {player.pendingResourceGainTargetConfirmation && (
                            <SelectResourceTargetLocation
                                player={player}
                                confirmStorableResourceGain={confirmStorableResourceGain}
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
