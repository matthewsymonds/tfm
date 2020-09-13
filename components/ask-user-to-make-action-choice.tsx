import {PlayerState} from 'reducer';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {useContext} from 'react';
import {AppContext} from 'context/app-context';
import {useStore, useDispatch} from 'react-redux';
import React from 'react';
import {makeActionChoice} from 'actions';
import {ApiClient} from 'api-client';

export function AskUserToMakeActionChoice({player}: {player: PlayerState}) {
    const {card, playedCard, choice} = player.pendingChoice!;
    const context = useContext(AppContext);
    const store = useStore();
    const state = store.getState();
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const choiceButtons = choice.map((action, index) => {
        const [canPlay, reason] = context.canPlayActionInSpiteOfUI(action, state, card);
        return (
            <React.Fragment key={index}>
                <button
                    disabled={!canPlay}
                    onClick={() => {
                        apiClient.playCardActionAsync({
                            parent: card,
                            choiceIndex: index,
                        });
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
