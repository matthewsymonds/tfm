import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import {Flex} from './box';
import {CardToggleToken} from './card/CardToken';

interface CardSelectorProps {
    min?: number;
    max: number;
    onSelect: (cards: SerializedCard[]) => void;
    options: SerializedCard[];
    orientation: string;
    selectedCards: SerializedCard[];
    cardSelectorPrompt?: React.ReactNode;
    budget?: number;
    className?: string;
}

const CardSelectorBase = styled.div<{orientation: string}>`
    margin: 0 4px;
    display: flex;
    flex-wrap: wrap;
    width: max-content;
    max-width: calc(100% - 8px);
`;

const CardSelectorOuter = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
    const {min = 0, max, onSelect, options, orientation, selectedCards, budget, className} = props;
    const numSelected = selectedCards.length;
    const mustSelectOne = max === 1;
    const loggedInPlayer = useLoggedInPlayer();
    const canAfford = budget === undefined || budget >= (numSelected + 1) * loggedInPlayer.cardCost;
    const canSelect = canAfford && (selectedCards.length < max || mustSelectOne);

    const handleSelect = (card: SerializedCard) => {
        let newSelectedCards = [...selectedCards];
        const index = selectedCards.findIndex(selectedCard => selectedCard.name === card.name);
        if (index < 0) {
            if (mustSelectOne) {
                // Special case. Just change the selection to the unselected card.
                newSelectedCards = [card];
            } else {
                newSelectedCards.unshift(card);
            }
        } else {
            newSelectedCards.splice(index, 1);
        }
        onSelect(newSelectedCards);
    };

    return (
        <CardSelectorOuter className={className}>
            {props.cardSelectorPrompt}
            <CardSelectorBase orientation={orientation}>
                {options.map((option, key) => {
                    const selected = selectedCards.some(card => card.name === option?.name);

                    const cannotSelect = !selected && !canSelect;
                    const cannotUnselect = selected && numSelected === 1 && min === 1;

                    const disabled = cannotSelect || cannotUnselect;
                    const card = getCard(option);
                    return (
                        <Flex margin="4px" key={key}>
                            <CardToggleToken
                                margin="0"
                                showCardOnHover={true}
                                absoluteOffset={-68}
                                card={card}
                                isSelected={selected}
                                disabled={disabled}
                                onClick={() => {
                                    handleSelect(option);
                                }}
                            />
                        </Flex>
                    );
                })}
            </CardSelectorBase>
        </CardSelectorOuter>
    );
};
