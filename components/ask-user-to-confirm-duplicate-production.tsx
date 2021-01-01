import {ApiClient} from 'api-client';
import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {Card as CardComponent} from 'components/card/Card';
import {Action} from 'constants/action';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {getPlayedCards} from 'selectors/get-played-cards';
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
    const candidates: Card[] = getPlayedCards(player)
        .filter(card => card.type !== CardType.EVENT)
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
            const [canPlay, reason] = canPlayActionInSpiteOfUI(action, state, player);
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
    const state = useTypedSelector(state => state);
    const options = getOptionsForDuplicateProduction(tag, player, state);
    const [selectedIndex, setSelectedIndex] = useState<null | number>(options.length ? 0 : null);

    const dispatch = useDispatch();

    const apiClient = new ApiClient(dispatch);

    const handleSkip = () => {
        apiClient.skipChooseDuplicateProductionAsync();
    };

    const handleConfirmDuplicateProduction = (index: number) => {
        apiClient.completeChooseDuplicateProductionAsync(index);
    };

    const showSkip = options.length === 0;

    return (
        <AskUserToMakeChoice card={card}>
            <Flex>
                <Flex marginRight="8px">
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
                <div>
                    <button
                        onClick={() => handleConfirmDuplicateProduction(selectedIndex as number)}
                        disabled={typeof selectedIndex !== 'number'}
                    >
                        Confirm production duplication
                    </button>
                    {showSkip && <button onClick={handleSkip}>Skip</button>}
                </div>
            </Flex>
        </AskUserToMakeChoice>
    );
}
