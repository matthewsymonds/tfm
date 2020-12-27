import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {AskUserToMakeChoice} from 'components/ask-user-to-make-choice';
import {CardSelector} from 'components/card-selector';
import {Card as CardComponent, CardContext} from 'components/card/Card';
import {PlayerCorpAndIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import {GameStage} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Card} from 'models/card';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {getMoney} from 'selectors/get-money';
import {Box, Flex} from './box';

export function AskUserToMakeCardSelection({player}: {player: PlayerState}) {
    const pendingCardSelection = player.pendingCardSelection!;
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const state = useTypedSelector(state => state);
    const isDrafting =
        state.common.gameStage === GameStage.DRAFTING && state.options.isDraftingEnabled;

    const actionGuard = new ActionGuard(state, player.username);

    const playerBudget = getMoney(state, player);
    // TODO: Fix this for the expansion corps with different card prices
    const totalCostOfCards = selectedCards.length * 3;
    const remainingBudget = playerBudget - totalCostOfCards;

    const cardOrCards = `card${selectedCards.length === 1 ? '' : 's'}`;
    let cardSelectionPrompt: string | React.ReactNode;
    let cardSelectionButtonText: string;
    let cardSelectionSubtitle: React.ReactNode = null;
    let maxCards: number;
    let minCards: number;

    if (isDrafting) {
        let passTargetIndex = state.common.generation % 2 ? player.index + 1 : player.index - 1;
        passTargetIndex = passTargetIndex < 0 ? state.players.length - 1 : passTargetIndex;
        passTargetIndex = passTargetIndex >= state.players.length ? 0 : passTargetIndex;
        cardSelectionPrompt = 'Draft 1 card';
        cardSelectionSubtitle = (
            <Box marginBottom="16px" marginLeft="8px">
                Passing to <PlayerCorpAndIcon player={state.players[passTargetIndex]} />
            </Box>
        );
        cardSelectionButtonText = `Draft ${selectedCards[0]?.name ?? 'card'}`;
        maxCards = 1;
        minCards = 1;
    } else if (pendingCardSelection.isBuyingCards) {
        // buying cards
        const numCards =
            pendingCardSelection.numCardsToTake ?? pendingCardSelection.possibleCards.length;
        cardSelectionPrompt = `Select up to ${numCards} ${cardOrCards} to buy (${remainingBudget} MC remaining)`;
        cardSelectionButtonText = `Buy ${selectedCards.length} ${cardOrCards}`;
        maxCards = pendingCardSelection.numCardsToTake ?? pendingCardSelection.possibleCards.length;
        minCards = pendingCardSelection.numCardsToTake ?? 0;
    } else if (pendingCardSelection.numCardsToTake) {
        // taking cards, e.g. invention contest (look at 4, take 2)
        const numCards = pendingCardSelection.numCardsToTake;
        cardSelectionPrompt = `Select ${numCards} ${cardOrCards} to take`;
        cardSelectionButtonText = `Take ${numCards} ${cardOrCards}`;
        maxCards = pendingCardSelection.numCardsToTake;
        minCards = pendingCardSelection.numCardsToTake;
    } else {
        throw new Error('Unhandled scenario in ask user to make card selection');
    }

    async function handleConfirmCardSelection(payment?: PropertyCounter<Resource>) {
        await apiClient.confirmCardSelectionAsync({
            selectedCards,
            corporation: player.corporation,
            payment,
        });
        setSelectedCards([]);
    }

    const shouldDisableConfirmCardSelection = !actionGuard.canConfirmCardSelection(
        selectedCards,
        state
    );

    // hide card selector while waiting on others to pick cards
    const isWaitingOnOthersToDraft =
        isDrafting &&
        pendingCardSelection.possibleCards.length + (pendingCardSelection.draftPicks?.length ?? 0) >
            4;
    let passSourceIndex = state.common.generation % 2 ? player.index - 1 : player.index + 1;
    passSourceIndex = passSourceIndex < 0 ? state.players.length - 1 : passSourceIndex;
    passSourceIndex = passSourceIndex >= state.players.length ? 0 : passSourceIndex;
    const usePaymentPopover =
        pendingCardSelection.isBuyingCards &&
        player.corporation.name === 'Helion' &&
        selectedCards.length;

    return (
        <AskUserToMakeChoice>
            {isDrafting &&
                pendingCardSelection.draftPicks &&
                pendingCardSelection.draftPicks.length > 0 && (
                    <Flex flexDirection="column" marginRight="100px">
                        <h3 style={{marginBottom: 4, marginLeft: 8}}>Drafted cards</h3>
                        <Box marginBottom="16px" marginLeft="8px">
                            Receiving from{' '}
                            <PlayerCorpAndIcon player={state.players[passSourceIndex]} />
                        </Box>
                        <Flex>
                            {pendingCardSelection.draftPicks.map(draftedCard => (
                                <Flex margin="8px" key={draftedCard.name}>
                                    <CardComponent
                                        cardContext={CardContext.DISPLAY_ONLY}
                                        card={draftedCard}
                                    />
                                </Flex>
                            ))}
                        </Flex>
                    </Flex>
                )}
            {isWaitingOnOthersToDraft ? (
                <Flex alignItems="center" justifyContent="center">
                    Waiting on other players to draft...
                </Flex>
            ) : (
                <Flex flexDirection="column" width="100%">
                    <CardSelector
                        max={maxCards}
                        min={minCards}
                        selectedCards={selectedCards}
                        onSelect={cards => {
                            if (cards.length * 3 <= playerBudget) {
                                setSelectedCards(cards);
                            }
                        }}
                        options={pendingCardSelection.possibleCards}
                        orientation="vertical"
                    >
                        <h3
                            style={{
                                marginBottom: cardSelectionSubtitle ? 4 : 'initial',
                            }}
                        >
                            {cardSelectionPrompt}
                        </h3>
                        {cardSelectionSubtitle}
                    </CardSelector>
                    <Flex justifyContent="center">
                        <PaymentPopover
                            cost={selectedCards.length * 3}
                            onConfirmPayment={payment => handleConfirmCardSelection(payment)}
                            shouldHide={!usePaymentPopover}
                        >
                            <button
                                disabled={shouldDisableConfirmCardSelection}
                                onClick={() => !usePaymentPopover && handleConfirmCardSelection()}
                            >
                                {cardSelectionButtonText}
                            </button>
                        </PaymentPopover>
                    </Flex>
                </Flex>
            )}
        </AskUserToMakeChoice>
    );
}
