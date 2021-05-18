import {AskUserToMakeChoice} from 'components/ask-user-to-make-choice';
import {CardSelector} from 'components/card-selector';
import {Card as CardComponent} from 'components/card/Card';
import {VariableAmount} from 'constants/variable-amount';
import {useApiClient} from 'hooks/use-api-client';
import {Card as CardModel} from 'models/card';
import React, {useState} from 'react';
import {PlayerState} from 'reducer';
import {SerializedCard} from 'state-serialization';
import {Flex} from './box';
import {colors} from './ui';

export function AskUserToMakeDiscardChoice({player}: {player: PlayerState}) {
    const {card, amount, isFromSellPatents, playedCard} = player.pendingDiscard!;
    const [selectedCards, setSelectedCards] = useState<SerializedCard[]>([]);
    const [cardToPreview, setCardToPreview] = useState<null | CardModel>(null);
    const apiClient = useApiClient();

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
        await apiClient.confirmCardSelectionAsync({
            selectedCards,
            corporation: player.corporation,
            selectedPreludes: [],
        });
        setSelectedCards([]);
    }

    return (
        <AskUserToMakeChoice card={card} playedCard={playedCard}>
            <Flex flexDirection="column" width="100%" style={{color: colors.TEXT_LIGHT_1}}>
                <CardSelector
                    max={maxCardsToDiscard}
                    min={0}
                    selectedCards={selectedCards}
                    onSelect={cards => setSelectedCards(cards)}
                    options={player.cards}
                    orientation="vertical"
                    cardSelectorPrompt={<div style={{margin: '0 8px'}}>{cardSelectionPrompt}</div>}
                    setCardToPreview={setCardToPreview}
                />
                <Flex justifyContent="center" marginTop="8px">
                    <button onClick={handleConfirmCardSelection}>
                        Discard {selectedCards.length} card{selectedCards.length === 1 ? '' : 's'}
                    </button>
                </Flex>
                <Flex justifyContent="center" marginTop="16px">
                    {cardToPreview && <CardComponent card={cardToPreview} />}
                </Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
