import {PlayerState} from 'reducer';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {useContext} from 'react';
import {AppContext} from 'context/app-context';
import {useStore, useDispatch} from 'react-redux';
import React from 'react';
import {makeActionChoice} from 'actions';

export function AskUserToMakeActionChoice({player}: {player: PlayerState}) {
    const {card, playedCard, choice} = player.pendingChoice!;
    const context = useContext(AppContext);
    const store = useStore();
    const state = store.getState();
    const dispatch = useDispatch();
    const choiceButtons = choice.map((action, index) => {
        const [canPlay, reason] = context.canPlayActionInSpiteOfUI(action, state, card);
        return (
            <React.Fragment key={index}>
                <button
                    disabled={!canPlay}
                    onClick={() => {
                        if (!canPlay) return;
                        context.playAction({
                            action,
                            state,
                            parent: card,
                            withPriority: true,
                        });
                        context.queue.unshift(makeActionChoice(player.index));
                        context.processQueue(dispatch);
                    }}
                >
                    {action.text}
                </button>
                {!canPlay && <em>{reason}</em>}
            </React.Fragment>
        );
    });
    return (
        <AskUserToMakeChoice card={card} playedCard={playedCard}>
            {choiceButtons}
        </AskUserToMakeChoice>
    );
}
