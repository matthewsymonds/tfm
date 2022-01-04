import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {canPlayActionInSpiteOfUI} from 'client-server-shared/action-guard';
import {PlayerState, useTypedSelector} from 'reducer';
import {canPlaceColony} from 'selectors/can-build-colony';
import {BlankButton} from './blank-button';
import {Button} from './button';

import React from 'react';
import {Flex} from './box';
import {useApiClient} from 'hooks/use-api-client';

export function AskUserToPlaceColony({player}: {player: PlayerState}) {
    const colonies = useTypedSelector(state => state.common.colonies ?? []);
    const apiClient = useApiClient();

    const choiceButtons = colonies
        .filter(colony => {
            const [canBuild] = canPlaceColony(colony, player.index, player.placeColony);
            return canBuild;
        })
        .map(colony => {
            return (
                <Button
                    variant="default"
                    onClick={() => {
                        apiClient.completePlaceColonyAsync({
                            colony: colony.name,
                        });
                    }}
                >
                    {colony.name}
                </Button>
            );
        });

    return (
        <AskUserToMakeChoice>
            <Flex flexDirection="column" style={{marginLeft: '8px'}}>
                <span style={{margin: '0 0 8px 0'}}>You may place a colony</span>
                <Flex>
                    {choiceButtons.map(choiceButton => {
                        return <Flex marginRight="8px">{choiceButton}</Flex>;
                    })}
                </Flex>
            </Flex>
        </AskUserToMakeChoice>
    );
}
