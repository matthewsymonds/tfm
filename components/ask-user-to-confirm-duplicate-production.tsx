import {Action} from 'constants/action';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {AppContext, appContext} from 'context/app-context';
import {Card} from 'models/card';
import {useContext} from 'react';
import {useDispatch, useStore} from 'react-redux';
import {GameState, PlayerState} from 'reducer';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {CardComponent} from './card';
import {getResourceName} from 'constants/resource';
import {skipChoice} from 'actions';

type DuplicateProductionOption = {
    /* The original card */
    card: Card;
    /* Only the production part of the "play card" action */
    action: Action;
};

function getOptionsForDuplicateProduction(
    tag: Tag,
    player: PlayerState,
    context: typeof appContext,
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
        .filter(([card, action]) => {
            return context.canPlayActionInSpiteOfUI(action, state)[0];
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
    const store = useStore();
    const state = store.getState();
    const context = useContext(AppContext);

    const options = getOptionsForDuplicateProduction(tag, player, context, state);

    const dispatch = useDispatch();

    const handleSkip = () => {
        dispatch(skipChoice(player.index));
        context.processQueue(dispatch);
    };

    const handleConfirmDuplicateProduction = (option: DuplicateProductionOption) => {
        context.playAction({action: option.action, state});
        context.processQueue(dispatch);
    };

    const showSkip = options.length === 0;

    return (
        <AskUserToMakeChoice card={card}>
            {options.map(option => {
                return (
                    <CardComponent key={option.card.name} content={option.card}>
                        <button onClick={() => handleConfirmDuplicateProduction(option)}>
                            {formatText(option.card)}
                        </button>
                    </CardComponent>
                );
            })}
            {showSkip && <button onClick={handleSkip}>Skip</button>}
        </AskUserToMakeChoice>
    );
}
