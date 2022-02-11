import {AskUserToMakeChoice} from 'components/ask-user-to-make-choice';
import {CardSelector} from 'components/card-selector';
import {VariableAmount} from 'constants/variable-amount';
import {useApiClient} from 'hooks/use-api-client';
import React, {useState} from 'react';
import {PlayerState} from 'reducer';
import {SerializedCard} from 'state-serialization';
import {Flex} from './box';
import {colors} from './ui';

export function AskUserToMakeDiscardChoice({player}: {player: PlayerState}) {
    const {card, amount, isFromSellPatents, playedCard} = player.pendingDiscard!;
    const [selectedCards, setSelectedCards] = useState<SerializedCard[]>([]);
    const apiClient = useApiClient();

    let cardSelectionPrompt: string;
    let maxCardsToDiscard: number;

    // TODO, move the min max validation to the backend so someone can't bypass this.
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
        await apiClient.confirmCardSelectionAsync({
            selectedCards,
            corporation: player.corporation,
            selectedPreludes: [],
        });
    }

    const min = typeof amount === 'number' ? amount : amount === VariableAmount.USER_CHOICE ? 1 : 0;

    return (
        <AskUserToMakeChoice card={card} playedCard={playedCard}>
            <Flex flexDirection="column" width="100%" style={{color: colors.TEXT_LIGHT_1}}>
                <CardSelector
                    max={maxCardsToDiscard}
                    min={min}
                    selectedCards={selectedCards}
                    onSelect={cards => setSelectedCards(cards)}
                    options={player.cards}
                    orientation="vertical"
                    cardSelectorPrompt={<div style={{margin: '0 8px'}}>{cardSelectionPrompt}</div>}
                />
                <Flex justifyContent="center" marginTop="8px">
                    <button
                        onClick={handleConfirmCardSelection}
                        disabled={
                            selectedCards.length < min || selectedCards.length > maxCardsToDiscard
                        }
                    >
                        Discard {selectedCards.length} card{selectedCards.length === 1 ? '' : 's'}
                    </button>
                </Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
