import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';

export function AskUserToMakeActionChoice({player}: {player: PlayerState}) {
    const {card, playedCard, choice} = player.pendingChoice!;
    const apiClient = useApiClient();
    const parent = getCard(card);
    const choiceButtons = choice.map((action, index) => {
        const [canPlay, reason] = useTypedSelector(state =>
            canPlayActionInSpiteOfUI(action, state, player, parent)
        );
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
