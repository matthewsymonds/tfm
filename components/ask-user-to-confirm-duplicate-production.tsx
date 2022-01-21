import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {Card as CardComponent} from 'components/card/Card';
import {Action} from 'constants/action';
import {Tag} from 'constants/tag';
import {useApiClient} from 'hooks/use-api-client';
import {Card} from 'models/card';
import {useState} from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {getVisiblePlayedCards} from 'selectors/get-played-cards';
import styled from 'styled-components';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';

type DuplicateProductionOption = {
    /* The original card */
    card: Card;
    /* Only the production part of the "play card" action */
    action: Action;
};

export function getOptionsForDuplicateProduction(
    tag: Tag,
    player: PlayerState,
    state: GameState
): DuplicateProductionOption[] {
    const candidates: Card[] = getVisiblePlayedCards(player)
        .filter(card => card.tags.includes(tag))
        .filter(card => {
            const productionDelta = {
                ...card.increaseProduction,
                ...card.increaseProductionOption,
                ...card.decreaseProduction,
                ...card.decreaseAnyProduction,
            };
            return Object.keys(productionDelta).length > 0;
        });

    return candidates
        .map(candidate => {
            const syntheticAction: Action = {
                increaseProduction: candidate.increaseProduction,
                increaseProductionOption: candidate.increaseProductionOption,
                decreaseProduction: candidate.decreaseProduction,
                decreaseAnyProduction: candidate.decreaseAnyProduction,
            };

            return [candidate, syntheticAction] as [Card, Action];
        })
        .filter(([, action]) => {
            const [canPlay] = canPlayActionInSpiteOfUI(action, state, player);
            return canPlay;
        })
        .map(([candidate, action]) => {
            return {
                card: candidate,
                action,
            };
        });
}

const CardWrapper = styled.div``;

export function AskUserToDuplicateProduction({player}: {player: PlayerState}) {
    const {pendingDuplicateProduction} = player;
    const {tag, card} = pendingDuplicateProduction!;
    const options = useTypedSelector(state => getOptionsForDuplicateProduction(tag, player, state));
    const [selectedIndex, setSelectedIndex] = useState<null | number>(options.length ? 0 : null);

    const apiClient = useApiClient();

    const handleSkip = () => {
        apiClient.skipChooseDuplicateProductionAsync();
    };

    const handleConfirmDuplicateProduction = (index: number) => {
        apiClient.completeChooseDuplicateProductionAsync(index);
    };

    const showSkip = options.length === 0;

    return (
        <AskUserToMakeChoice card={card}>
            <Flex flexDirection="column">
                <em style={{marginBottom: 4}}>Select a card to duplicate production</em>
                <Flex margin="0 8px 8px 0" flexWrap="wrap">
                    {options.map((option, index) => {
                        return (
                            <CardWrapper
                                onClick={() => {
                                    setSelectedIndex(index);
                                }}
                                key={option.card.name}
                                style={{marginLeft: index > 0 ? 8 : 0}}
                            >
                                <CardComponent
                                    card={option.card}
                                    isSelected={selectedIndex === index}
                                />
                            </CardWrapper>
                        );
                    })}
                </Flex>
                <Flex alignItems="center" marginTop="16px" justifyContent="center">
                    <button
                        onClick={() => handleConfirmDuplicateProduction(selectedIndex as number)}
                        disabled={typeof selectedIndex !== 'number'}
                    >
                        Confirm production duplication
                    </button>
                    {showSkip && (
                        <button style={{marginLeft: 8}} onClick={handleSkip}>
                            Skip
                        </button>
                    )}
                </Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
