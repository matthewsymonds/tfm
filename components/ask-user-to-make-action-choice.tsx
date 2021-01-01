import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import React from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';

export function AskUserToMakeActionChoice({player}: {player: PlayerState}) {
    const {card, playedCard, choice} = player.pendingChoice!;
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const actionGuard = new ActionGuard(state, player.username);
    const parent = getCard(card);
    const choiceButtons = choice.map((action, index) => {
        const [canPlay, reason] = actionGuard.canPlayActionInSpiteOfUI(action, state, parent);
        return (
            <React.Fragment key={index}>
                <button
                    disabled={!canPlay}
                    onClick={() => {
                        apiClient.playCardActionAsync({
                            parent,
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
