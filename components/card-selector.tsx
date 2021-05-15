import {Card as CardComponent, CardContext} from 'components/card/Card';
import React from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedCard} from 'state-serialization';
import styled from 'styled-components';
import {Flex} from './box';
import {CardLink} from './card/CardLink';

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
`;

const CardSelectorOuter = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;
`;

const CardWrapper = styled.div`
    margin: 8px;
    cursor: pointer;
`;

export const CardSelector: React.FunctionComponent<CardSelectorProps> = props => {
    const {min = 0, max, onSelect, options, orientation, selectedCards, budget, className} = props;
    const numSelected = selectedCards.length;
    const mustSelectOne = max === 1;
    const canAfford = budget === undefined || budget >= (numSelected + 1) * 3;
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
                    const selected = selectedCards.some(card => card.name === option.name);

                    const cannotSelect = !selected && !canSelect;
                    const cannotUnselect = selected && numSelected === 1 && min === 1;

                    const disabled = cannotSelect || cannotUnselect;
                    return (
                        <Flex margin="4px" key={key}>
                            <CardLink
                                margin="0"
                                card={getCard(option)}
                                isSelected={selected}
                                onClick={() => {
                                    if (disabled) {
                                        return;
                                    }
                                    handleSelect(option);
                                }}
                            />
                        </Flex>
                    );
                    // return (
                    //     <CardWrapper
                    //         onClick={() => {
                    //             if (disabled) {
                    //                 return;
                    //             }
                    //             handleSelect(option);
                    //         }}
                    //         key={key}
                    //     >
                    //         <CardComponent
                    //             cardContext={CardContext.SELECT_TO_BUY}
                    //             card={getCard(option)}
                    //             isSelected={selected}
                    //         />
                    //     </CardWrapper>
                    // );
                })}
            </CardSelectorBase>
        </CardSelectorOuter>
    );
};
