import {ApiClient} from 'api-client';
import {AskUserToMakeChoice} from 'components/ask-user-to-make-choice';
import {CardSelector} from 'components/card-selector';
import {VariableAmount} from 'constants/variable-amount';
import {Card} from 'models/card';
import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState} from 'reducer';
import {Flex} from './box';

export function AskUserToMakeDiscardChoice({player}: {player: PlayerState}) {
    const {card, amount, isFromSellPatents, playedCard} = player.pendingDiscard!;
    const [selectedCards, setSelectedCards] = useState<Card[]>([]);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);

    let cardSelectionPrompt: string;
    let maxCardsToDiscard: number;

    if (amount === VariableAmount.USER_CHOICE) {
        maxCardsToDiscard = player.cards.length;
        cardSelectionPrompt = `${
            isFromSellPatents ? 'Sell patents: ' : ''
        } Select 1 or more cards to discard`;
    } else if (amount === VariableAmount.USER_CHOICE_UP_TO_ONE) {
        maxCardsToDiscard = 1;
        cardSelectionPrompt = 'You may select a card to discard';
    } else {
        if (typeof amount !== 'number') {
            throw new Error('Unhandled variable amount in discard choice component');
        }
        cardSelectionPrompt = `Select ${amount} card${amount === 1 ? '' : 's'} to discard.`;
        maxCardsToDiscard = amount;
    }

    async function handleConfirmCardSelection() {
        await apiClient.confirmCardSelectionAsync({selectedCards, corporation: player.corporation});
        setSelectedCards([]);
    }

    return (
        <AskUserToMakeChoice card={card} playedCard={playedCard}>
            <Flex flexDirection="column" width="100%">
                <CardSelector
                    max={maxCardsToDiscard}
                    min={0}
                    selectedCards={selectedCards}
                    onSelect={cards => setSelectedCards(cards)}
                    options={player.cards}
                    orientation="vertical"
                >
                    <h3>{cardSelectionPrompt}</h3>
                </CardSelector>
                <Flex justifyContent="center">
                    <button onClick={handleConfirmCardSelection}>
                        Discard {selectedCards.length} card{selectedCards.length === 1 ? '' : 's'}
                    </button>
                </Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
