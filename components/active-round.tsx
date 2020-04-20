import {useContext, useState} from 'react';
import {useDispatch, useStore} from 'react-redux';
import styled from 'styled-components';
import {discardCards, markCardActionAsPlayed} from '../actions';
import {ResourceBoard, ResourceBoardCell, ResourceBoardRow} from '../components/resource';
import {Amount} from '../constants/action';
import {TileType} from '../constants/board';
import {Resource} from '../constants/resource';
import {AppContext} from '../context/app-context';
import {Card} from '../models/card';
import {RootState, useTypedSelector} from '../reducer';
import {Board} from './board';
import {CardComponent} from './card';

interface ButtonProps {
    disabled?: boolean;
    onClick?: () => void;
}

const Hand = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    overflow-y: auto;
    flex-wrap: wrap;
`;

const Button = styled.button<ButtonProps>`
    margin: 0 auto;
`;

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
            [TileType.MINING]: 'Mining',
            [TileType.MOHOLE_AREA]: 'Mohole Area',
            [TileType.NATURAL_PRESERVE]: 'Natural Preserve',
            [TileType.NUCLEAR_ZONE]: 'Nuclear zone',
            [TileType.OCEAN]: 'Ocean',
            [TileType.OTHER]: 'Unknown',
            [TileType.RESTRICTED_AREA]: 'Restricted Area'
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

export const ActiveRound = ({playerIndex}: {playerIndex: number}) => {
    const player = useTypedSelector(state => state.players[playerIndex]);
    const corporation = useTypedSelector(state => state.players[playerIndex].corporation);
    const resources = useTypedSelector(state => state.players[playerIndex].resources);
    const productions = useTypedSelector(state => state.players[playerIndex].productions);
    const cards = useTypedSelector(state => state.players[playerIndex].cards);
    const playedCards = useTypedSelector(state => state.players[playerIndex].playedCards);
    const store = useStore<RootState>();
    const state = store.getState();
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const [cardsToDiscard, setCardsToDiscard] = useState<Set<Card>>(new Set());

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

    function confirmDiscardSelection() {
        dispatch(discardCards(Array.from(cardsToDiscard), playerIndex));
        context.processQueue(dispatch);
        setCardsToDiscard(new Set());
    }

    function playAction(card: Card) {
        dispatch(markCardActionAsPlayed(card, playerIndex));
        context.playAction(card.action!, state);
        context.processQueue(dispatch);
    }

    function canPlayAction(card: Card) {
        if (card.usedActionThisRound) return false;

        if (!card.action) return false;

        return context.canPlayAction(card.action, state)[0];
    }

    return (
        <>
            <Board
                board={state.common.board}
                playerIndex={playerIndex}
                parameters={state.common.parameters}
            />
            <h1>{corporation && corporation.name}</h1>
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(resourceType => (
                        <ResourceBoardCell
                            key={resourceType}
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resourceType => (
                        <ResourceBoardCell
                            key={resourceType}
                            resource={resourceType}
                            production={productions[resourceType]}
                            amount={resources[resourceType]}
                        />
                    ))}
                </ResourceBoardRow>
            </ResourceBoard>
            {player.pendingTilePlacement && (
                <div>
                    Please place the {getTileHumanName(player.pendingTilePlacement.type)} tile.
                </div>
            )}
            {player.pendingResourceReduction?.resource === Resource.CARD && (
                <>
                    <div>
                        Please select{' '}
                        {getResourceReductionAmountHumanName(
                            player.pendingResourceReduction.amount
                        )}{' '}
                        card{player.pendingResourceReduction.amount === 1 ? '' : 's'} to discard.
                    </div>
                    <Button onClick={confirmDiscardSelection}>Confirm discard selection</Button>
                </>
            )}
            <h3>Hand</h3>
            <Hand>
                {cards.map(card => {
                    const [canPlay, reason] = context.canPlayCard(card, state);
                    return (
                        <CardComponent
                            content={card}
                            width={250}
                            key={card.name}
                            onClick={() => handleCardClick(card)}
                            selected={cardsToDiscard.has(card)}
                        >
                            {!canPlay && <em>{reason}</em>}
                            <Button
                                disabled={
                                    !context.canPlayCard(card, state)[0] ||
                                    player.pendingResourceReduction?.resource === Resource.CARD
                                }
                                onClick={() => {
                                    context.playCard(card, state);
                                    context.processQueue(dispatch);
                                }}
                            >
                                Play
                            </Button>
                        </CardComponent>
                    );
                })}
            </Hand>
            <hr></hr>
            <h3>Played cards</h3>
            {playedCards.map(card => {
                const resourceMessage = getResourceMessage(card);

                return (
                    <CardComponent content={card} width={250} key={card.name}>
                        <div>{resourceMessage}</div>
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
        </>
    );
};

function getResourceMessage(card: Card) {
    const {storedResourceType: type, storedResourceAmount: amount} = card;

    if (!type) return '';

    if (amount) {
        return `Holding ${amount} ${type}${amount > 1 ? 's' : ''}`;
    }

    `Holds ${type}s`;
}
