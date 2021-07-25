import {setCorporation} from 'actions';
import {AskUserToMakeChoice} from 'components/ask-user-to-make-choice';
import {CardSelector} from 'components/card-selector';
import {CARD_HEIGHT, CARD_WIDTH} from 'components/card/Card';
import {PlayerCorpAndIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import {GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {getMoney} from 'selectors/get-money';
import {SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import {Flex} from './box';
import {CardTextToken} from './card/CardToken';
import {colors} from './ui';

const HoverToPreviewPlaceholderBase = styled.div`
    width: ${CARD_WIDTH}px;
    height: ${CARD_HEIGHT}px;
    display: flex;
    border: 2px solid black;
    align-items: center;
    text-align: center;
    justify-content: center;
    border-style: solid;
    border-radius: 8px;
    background-color: hsla(0, 0%, 100%, 0.2);
    border-top-color: ${colors.CARD_BORDER_1};
    border-left-color: ${colors.CARD_BORDER_1};
    border-bottom-color: ${colors.CARD_BORDER_2};
    border-right-color: ${colors.CARD_BORDER_2};
`;

function HoverToPreviewPlaceholder() {
    return (
        <HoverToPreviewPlaceholderBase>
            <div style={{padding: 16}}>Hover over card names to preview</div>
        </HoverToPreviewPlaceholderBase>
    );
}

export function AskUserToMakeCardSelection({player}: {player: PlayerState}) {
    const pendingCardSelection = player.pendingCardSelection!;
    const [selectedCards, setSelectedCards] = useState<SerializedCard[]>([]);
    const gameName = useTypedSelector(state => state.name);
    useEffect(() => {
        setSelectedCards([]);
    }, [gameName]);
    const {possiblePreludes, possibleCorporations} = player;
    const [selectedPreludes, setSelectedPreludes] = useState<SerializedCard[]>([]);
    const numPlayers = useTypedSelector(state => state.players.length);

    const dispatch = useDispatch();
    const apiClient = useApiClient();
    const isDrafting = useTypedSelector(state => state.common.gameStage === GameStage.DRAFTING);
    const isSyncing = useTypedSelector(state => state.syncing);

    const playerBudget = useTypedSelector(state => getMoney(state, player));
    const totalCostOfCards = selectedCards.length * (player.cardCost ?? 3);
    const remainingBudget = playerBudget - totalCostOfCards;

    let cardOrCards = `card${selectedCards.length === 1 ? '' : 's'}`;
    let cardSelectionPrompt: string | React.ReactNode;
    let cardSelectionButtonText: string;
    let cardSelectionSubtitle: React.ReactNode = null;
    let maxCards: number;
    let minCards: number;
    const passPlayer = useTypedSelector(state => {
        let passTargetIndex = state.common.generation % 2 ? player.index + 1 : player.index - 1;
        passTargetIndex = passTargetIndex < 0 ? state.players.length - 1 : passTargetIndex;
        passTargetIndex = passTargetIndex >= state.players.length ? 0 : passTargetIndex;
        return state.players[passTargetIndex];
    });

    if (isDrafting) {
        cardSelectionPrompt = 'Draft 1 card';
        cardSelectionSubtitle = (
            <Flex marginBottom="16px" marginLeft="8px" alignItems="center">
                <span style={{marginRight: 4}}>Passing to</span>
                <PlayerCorpAndIcon player={passPlayer} color={colors.TEXT_LIGHT_1} />
            </Flex>
        );
        cardSelectionButtonText = `Draft ${selectedCards[0]?.name ?? 'card'}`;
        maxCards = 1;
        minCards = 1;
    } else if (pendingCardSelection.isBuyingCards) {
        // buying cards
        const numCards =
            pendingCardSelection.numCardsToTake ?? pendingCardSelection.possibleCards.length;
        let selectedCardOrCards = `card${selectedCards.length === 1 ? '' : 's'}`;
        let cardOrCards = `card${numCards === 1 ? '' : 's'}`;
        cardSelectionPrompt = `Select up to ${numCards} ${cardOrCards} to buy (${remainingBudget} MC remaining)`;
        cardSelectionButtonText = `Buy ${selectedCards.length} ${selectedCardOrCards}`;
        maxCards = pendingCardSelection.numCardsToTake ?? pendingCardSelection.possibleCards.length;
        minCards = pendingCardSelection.numCardsToTake ?? 0;
    } else if (pendingCardSelection.numCardsToTake) {
        // taking cards, e.g. Business Contacts (look at 4, take 2)
        const numCards = pendingCardSelection.numCardsToTake;
        cardSelectionPrompt = `Select ${numCards} ${numCards === 1 ? 'card' : 'cards'} to take`;
        cardSelectionButtonText = `Take ${numCards} ${cardOrCards}`;
        maxCards = pendingCardSelection.numCardsToTake;
        minCards = pendingCardSelection.numCardsToTake;
    } else {
        throw new Error('Unhandled scenario in ask user to make card selection');
    }

    if (isSyncing) {
        cardSelectionPrompt = `Loading...`;
    }

    async function handleConfirmCardSelection(payment?: PropertyCounter<Resource>) {
        setSelectedCards([]);
        await apiClient.confirmCardSelectionAsync({
            selectedCards,
            selectedPreludes,
            corporation: player.corporation,
            payment,
        });
    }

    const actionGuard = useActionGuard();

    const canConfirmCardSelection = useTypedSelector(state =>
        actionGuard.canConfirmCardSelection(selectedCards.map(getCard), state)
    );
    const shouldDisableDueToPreludes =
        player.possiblePreludes?.length > 0 && selectedPreludes.length !== 2;
    const shouldDisableConfirmCardSelection =
        !canConfirmCardSelection || actionGuard.isSyncing || shouldDisableDueToPreludes;

    // hide card selector while waiting on others to pick cards
    const isWaitingOnOthersToDraft =
        isDrafting &&
        pendingCardSelection.possibleCards.length + (pendingCardSelection.draftPicks?.length ?? 0) >
            4;

    const passSourcePlayer = useTypedSelector(state => {
        let passSourceIndex = state.common.generation % 2 ? player.index - 1 : player.index + 1;
        passSourceIndex = passSourceIndex < 0 ? state.players.length - 1 : passSourceIndex;
        passSourceIndex = passSourceIndex >= state.players.length ? 0 : passSourceIndex;
        return state.players[passSourceIndex];
    });

    const usePaymentPopover =
        pendingCardSelection.isBuyingCards &&
        player.corporation.name === 'Helion' &&
        player.resources[Resource.HEAT] > 0 &&
        selectedCards.length;

    const showPreviewBelow = isDrafting;

    return (
        <div style={{color: colors.TEXT_LIGHT_1}}>
            {possibleCorporations.length > 0 && (
                <CardSelector
                    min={1}
                    max={1}
                    selectedCards={[player.corporation]}
                    onSelect={cards => dispatch(setCorporation(cards[0], player.index))}
                    options={possibleCorporations}
                    orientation="vertical"
                    cardSelectorPrompt={<Flex margin="0 8px">Select a corporation</Flex>}
                />
            )}
            {possiblePreludes?.length > 0 && (
                <CardSelector
                    max={2}
                    min={2}
                    orientation="horizontal"
                    selectedCards={selectedPreludes}
                    onSelect={cards => {
                        setSelectedPreludes(cards);
                    }}
                    options={possiblePreludes}
                    cardSelectorPrompt={<Flex margin="0 8px">Select 2 prelude cards</Flex>}
                />
            )}
            <AskUserToMakeChoice>
                <Flex marginBottom="16" flexDirection="column">
                    {isDrafting &&
                        pendingCardSelection.draftPicks &&
                        pendingCardSelection.draftPicks.length > 0 && (
                            <Flex flexDirection="column">
                                <span style={{fontSize: '1.1em', fontWeight: 700}}>
                                    Drafted cards
                                </span>
                                <Flex flexWrap="wrap" marginBottom="8px" marginTop="8px">
                                    {pendingCardSelection.draftPicks.map(draftedCard => (
                                        <CardTextToken
                                            showCardOnHover={true}
                                            card={getCard(draftedCard)}
                                            key={draftedCard.name}
                                            margin="0 8px 8px 0"
                                            style={{fontSize: '1em'}}
                                            absoluteOffset={-68}
                                            variant="pill"
                                        />
                                    ))}
                                </Flex>
                            </Flex>
                        )}
                    {isWaitingOnOthersToDraft && (
                        <Flex justifyContent="center" flexDirection="column">
                            <em style={{margin: '16px 0px'}}>
                                Waiting on other players to draft...
                            </em>
                            {numPlayers > 2 && (
                                <table>
                                    <tr>
                                        <td>
                                            <span style={{marginRight: 4}}>Receiving from</span>
                                        </td>
                                        <td>
                                            <PlayerCorpAndIcon
                                                player={passSourcePlayer}
                                                color={colors.TEXT_LIGHT_1}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <span style={{marginRight: 4}}>Passing to</span>
                                        </td>
                                        <td>
                                            <PlayerCorpAndIcon
                                                player={passPlayer}
                                                color={colors.TEXT_LIGHT_1}
                                            />
                                        </td>
                                    </tr>
                                </table>
                            )}
                        </Flex>
                    )}
                </Flex>
                {!isWaitingOnOthersToDraft && (
                    <Flex flexDirection="column" width="100%">
                        <CardSelector
                            max={maxCards}
                            min={minCards}
                            selectedCards={selectedCards}
                            onSelect={cards => {
                                if (
                                    !pendingCardSelection.isBuyingCards ||
                                    cards.length * (player.cardCost ?? 3) <= playerBudget
                                ) {
                                    setSelectedCards(cards);
                                }
                            }}
                            options={pendingCardSelection.possibleCards}
                            orientation="vertical"
                            cardSelectorPrompt={
                                <React.Fragment>
                                    <Flex margin="8px" style={{fontSize: '1.1em', fontWeight: 700}}>
                                        {cardSelectionPrompt}
                                    </Flex>
                                    {cardSelectionSubtitle}
                                </React.Fragment>
                            }
                        />
                        <Flex justifyContent="center" margin="8px 0 16px">
                            <PaymentPopover
                                cost={selectedCards.length * (player.cardCost ?? 3)}
                                onConfirmPayment={payment => handleConfirmCardSelection(payment)}
                                shouldHide={!usePaymentPopover || shouldDisableConfirmCardSelection}
                            >
                                <button
                                    disabled={shouldDisableConfirmCardSelection}
                                    onClick={() =>
                                        !usePaymentPopover && handleConfirmCardSelection()
                                    }
                                >
                                    {cardSelectionButtonText}
                                </button>
                            </PaymentPopover>
                        </Flex>
                    </Flex>
                )}
            </AskUserToMakeChoice>
        </div>
    );
}
