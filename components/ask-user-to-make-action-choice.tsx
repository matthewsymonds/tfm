import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {Flex} from './box';

export function AskUserToMakeActionChoice({player}: {player: PlayerState}) {
    const {card, playedCard, choice} = player.pendingChoice!;
    const apiClient = useApiClient();
    const parent = getCard(card);
    const choiceButtons = choice.map((action, index) => {
        const [canPlay, reason] = useTypedSelector(state =>
            canPlayActionInSpiteOfUI(action, state, player, parent)
        );
        return (
            <Flex key={index} marginBottom="16px">
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
                {!canPlay && <em style={{marginLeft: 4}}>{reason}</em>}
            </Flex>
        );
    });
    return (
        <AskUserToMakeChoice card={card} playedCard={playedCard}>
            <Flex flexDirection="column">{choiceButtons}</Flex>
        </AskUserToMakeChoice>
    );
}
