import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCard} from 'selectors/get-card';
import {isActiveRound} from 'selectors/is-active-round';
import {Box, Flex} from './box';
import {Card, CardContext} from './card/Card';

export function AskUserToPlayPrelude({player}: {player: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard(player.username);
    const handleSkip = () => {
        apiClient.skipActionAsync();
    };

    const playableCards = player.preludes.filter(prelude => {
        const card = getCard(prelude);
        return actionGuard.canPlayCard(card)[0];
    });

    const activeRound = useTypedSelector(state => isActiveRound(state));

    if (!activeRound) {
        return null;
    }

    const preludesEls = (
        <Flex justifyContent="center" flexWrap="wrap">
            {player.preludes.map(prelude => {
                const card = getCard(prelude);
                return (
                    <Box marginRight="8px" marginBottom="8px" key={card.name}>
                        <Card card={card} cardContext={CardContext.SELECT_TO_PLAY} />
                    </Box>
                );
            })}
        </Flex>
    );

    if (playableCards.length === 0) {
        return (
            <>
                <Flex flexDirection="column" alignItems="center">
                    <h2>You are unable to play any of these preludes.</h2>
                    <button onClick={handleSkip}>Skip</button>
                </Flex>
                {preludesEls}
            </>
        );
    }

    return (
        <>
            <h2 style={{color: '#eee'}}>
                {player.choosePrelude
                    ? 'Please choose the prelude you would like to play.'
                    : 'Please play your preludes.'}
            </h2>
            {preludesEls}
        </>
    );
}
