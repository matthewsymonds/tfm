import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {AskUserToMakeChoice} from 'components/ask-user-to-make-choice';
import {CardSelector} from 'components/card-selector';
import {Card} from 'models/card';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {getMoney} from 'selectors/get-money';
import {Flex} from './box';

export function AskUserToMakeCardSelection({player}: {player: PlayerState}) {
    const pendingCardSelection = player.pendingCardSelection!;
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const state = useTypedSelector(state => state);
    const actionGuard = new ActionGuard(state, player.username);

    const cardOrCards = `card${selectedCards.length === 1 ? '' : 's'}`;
    let cardSelectionPrompt: string;
    let cardSelectionButtonText: string;

    const playerBudget = getMoney(state, player);
    // TODO: Fix this for the expansion corps with different card prices
    const totalCostOfCards = selectedCards.length * 3;
    const remainingBudget = playerBudget - totalCostOfCards;

    if (pendingCardSelection.isBuyingCards) {
        // buying cards
        const numCards =
            pendingCardSelection.numCardsToTake ?? pendingCardSelection.possibleCards.length;
        cardSelectionPrompt = `Select up to ${numCards} ${cardOrCards} to buy (${remainingBudget} MC remaining)`;
        cardSelectionButtonText = `Buy ${selectedCards.length} ${cardOrCards}`;
    } else if (pendingCardSelection.numCardsToTake) {
        // taking cards, e.g. invention contest (look at 4, take 2)
        const numCards = pendingCardSelection.numCardsToTake;
        cardSelectionPrompt = `Select ${numCards} ${cardOrCards} to take`;
        cardSelectionButtonText = `Take ${numCards} ${cardOrCards}`;
    } else {
        throw new Error('Unhandled scenario in ask user to make card selection');
    }

    async function handleConfirmCardSelection() {
        await apiClient.confirmCardSelectionAsync({selectedCards, corporation: player.corporation});
        setSelectedCards([]);
    }

    const shouldDisableConfirmCardSelection = !actionGuard.canConfirmCardSelection(
        selectedCards.length,
        state
    );

    return (
        <AskUserToMakeChoice>
            <Flex flexDirection="column" width="100%" maxWidth="936px">
                <h3>{cardSelectionPrompt}</h3>
                <CardSelector
                    max={
                        pendingCardSelection.numCardsToTake ??
                        pendingCardSelection.possibleCards.length
                    }
                    min={
                        pendingCardSelection.isBuyingCards
                            ? 0
                            : pendingCardSelection.numCardsToTake ?? 0
                    }
                    selectedCards={selectedCards}
                    onSelect={cards => {
                        if (cards.length * 3 <= playerBudget) {
                            setSelectedCards(cards);
                        }
                    }}
                    options={pendingCardSelection.possibleCards}
                    orientation="vertical"
                />
                <Flex justifyContent="center">
                    <button
                        disabled={shouldDisableConfirmCardSelection}
                        onClick={handleConfirmCardSelection}
                    >
                        {cardSelectionButtonText}
                    </button>
                </Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
