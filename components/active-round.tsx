import {MouseEvent, useContext, useEffect, useState} from 'react';
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
} from '../actions';
import CardPaymentPopover from '../components/popovers/card-payment';
import {ResourceBoard, ResourceBoardCell, ResourceBoardRow} from '../components/resource';
import {Amount} from '../constants/action';
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

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

function getResourceHumanName(resource: Resource): string {
    let result = String(resource);
    return result.slice('resource'.length);
}

function getTileHumanName(type: TileType): string {
    return (
        {
            [TileType.CAPITAL]: 'Capital',
            [TileType.CITY]: 'City',
            [TileType.COMMERCIAL_DISTRICT]: 'Commercial District',
            [TileType.ECOLOGICAL_ZONE]: 'Ecological Zone',
            [TileType.GREENERY]: 'Greenery',
            [TileType.INDUSTRIAL_CENTER]: 'Industrial Center',
            [TileType.LAVA_FLOW]: 'Lava Flow',
            [TileType.MINING_RIGHTS]: 'Mining',
            [TileType.MOHOLE_AREA]: 'Mohole Area',
            [TileType.NATURAL_PRESERVE]: 'Natural Preserve',
            [TileType.NUCLEAR_ZONE]: 'Nuclear zone',
            [TileType.OCEAN]: 'Ocean',
            [TileType.OTHER]: 'Unknown',
            [TileType.RESTRICTED_AREA]: 'Restricted Area',
        }[type] || 'Unknown'
    );
}
function getResourceReductionAmountHumanName(amount: Amount) {
    if (typeof amount !== 'number') {
        return 'any number of';
    } else {
        return amount;
    }
}

const TurnContext = styled.div`
    margin-left: 24px;
`;

const ConversionLink = styled.a`
    color: black;
    margin-top: 3px;
    display: block;
    margin-right: 8px;
    text-decoration: underline;
    cursor: pointer;
    text-align: center;
`;

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

    function playAction(card: Card) {
        dispatch(markCardActionAsPlayed(card, playerIndex));
        context.playAction(card.action!, state, card);
        context.queue.push(completeAction(playerIndex));
        context.processQueue(dispatch);
    }

    function canPlayAction(card: Card) {
        if (card.usedActionThisRound) return false;

        if (!card.action) return false;

        return context.canPlayAction(card.action, state)[0];
    }

    function doConversion(conversion?: Conversion) {
        if (!conversion) return;
        context.playAction(conversion, state);
        context.queue.push(completeAction(playerIndex));
        context.processQueue(dispatch);
    }

    function continueAfterRevealingCard() {
        context.processQueue(dispatch);
    }

    function canDoConversion(conversion?: Conversion) {
        if (!conversion) return false;
        return context.canPlayAction(conversion, state)[0];
    }

    const showBottomActionBar =
        player.pendingTilePlacement ||
        player.pendingResourceReduction ||
        player.pendingResourceGain ||
        player.pendingResourceGainTargetConfirmation;
    return (
        <>
            <ActionBar>
                <ActionBarRow>
                    <h1>{corporation && corporation.name}</h1>
                    <TurnContext>
                        <div>Turn {turn}</div>
                        <div>Action {action} of 2</div>
                        <div>Generation {generation}</div>
                        <div>TFR {player.terraformRating}</div>
                    </TurnContext>
                    <TurnContext>
                        <button onClick={() => dispatch(skipAction(playerIndex))}>
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
                                        {canDoConversion(conversion) ? (
                                            <>
                                                <ConversionLink
                                                    onClick={() => doConversion(conversion)}
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

                            {card.action && (
                                <button
                                    disabled={!canPlayAction(card)}
                                    onClick={() => playAction(card)}
                                >
                                    Play action
                                </button>
                            )}
                        </CardComponent>
                    );
                })}
            </Hand>
            {showBottomActionBar && (
                <ActionBar className="bottom">
                    <ActionBarRow>
                        {player.pendingTilePlacement && (
                            <h3>
                                Place the {getTileHumanName(player.pendingTilePlacement.type)} tile.
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
                        {state.common.revealedCard && (
                            <CardComponent width={250} content={state.common.revealedCard}>
                                <button onClick={continueAfterRevealingCard}>Continue</button>
                            </CardComponent>
                        )}
                    </ActionBarRow>
                </ActionBar>
            )}
        </>
    );
};
