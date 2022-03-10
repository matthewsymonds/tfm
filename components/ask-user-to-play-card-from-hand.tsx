import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {getMostRecentlyPlayedCard, PlayerState} from 'reducer';
import {getPlayableCards} from 'selectors/get-playable-cards';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {Flex} from './box';

export const AskUserToPlayCardFromHand = ({player}: {player: PlayerState}) => {
    const mostRecentlyPlayedCard = getMostRecentlyPlayedCard(player);
    const playCardParams = player.pendingPlayCardFromHand! ?? {
        ignoreGlobalRequirements: true,
        discount: 0,
    };
    const {ignoreGlobalRequirements, discount} = playCardParams;
    const actionGuard = useActionGuard(player.username);
    const apiClient = useApiClient();

    const playableCards = getPlayableCards(player, actionGuard);

    const handleSkip = () => {
        apiClient.skipActionAsync();
    };

    if (playableCards.length === 0) {
        return (
            <AskUserToMakeChoice playedCard={mostRecentlyPlayedCard}>
                <Flex flexDirection="column" alignItems="center">
                    <h3>You cannot play a card from hand.</h3>
                    <div>None of your cards are playable at this time.</div>
                    <button onClick={handleSkip}>Skip</button>
                </Flex>
            </AskUserToMakeChoice>
        );
    }

    return (
        <AskUserToMakeChoice playedCard={mostRecentlyPlayedCard}>
            <Flex flexDirection="column">
                <h3>Please play a card from hand.</h3>
                {ignoreGlobalRequirements ? (
                    <div>You may ignore global requirements.</div>
                ) : null}
                {discount ? (
                    <div>The cost is discounted {discount}MC.</div>
                ) : null}
            </Flex>
        </AskUserToMakeChoice>
    );
};
