import {ApiClient} from 'api-client';
import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {Action} from 'constants/action';
import {CardType} from 'constants/card-types';
import {getResourceName} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Card} from 'models/card';
import {useDispatch} from 'react-redux';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {CardComponent} from './card';

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
    const candidates: Card[] = player.playedCards
        .filter(card => card.type !== CardType.EVENT)
        .filter(card => card.type !== CardType.CORPORATION)
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
            return canPlayActionInSpiteOfUI(action, state, player)[0];
        })
        .map(([candidate, action]) => {
            return {
                card: candidate,
                action,
            };
        });
}

function formatText(card: Card) {
    const base = `Copy ${card.name}`;

    if (card.increaseProductionResult) {
        return `${base} (${getResourceName(card.increaseProductionResult)})`;
    }

    return base;
}

export function AskUserToDuplicateProduction({player}: {player: PlayerState}) {
    const {pendingDuplicateProduction} = player;
    const {tag, card} = pendingDuplicateProduction!;
    const state = useTypedSelector(state => state);

    const options = getOptionsForDuplicateProduction(tag, player, state);

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
            {options.map((option, index) => {
                return (
                    <CardComponent key={option.card.name} content={option.card}>
                        <button onClick={() => handleConfirmDuplicateProduction(index)}>
                            {formatText(option.card)}
                        </button>
                    </CardComponent>
                );
            })}
            {showSkip && <button onClick={handleSkip}>Skip</button>}
        </AskUserToMakeChoice>
    );
}
