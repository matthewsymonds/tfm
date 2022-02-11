import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {canPlaceColony} from 'selectors/can-build-colony';
import {AskUserToMakeChoice} from './ask-user-to-make-choice';
import {Flex} from './box';
import {Button} from './button';

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
            <Flex width="100%" justifyContent="center">
                {choiceButtons.map(choiceButton => {
                    return <Flex marginRight="8px">{choiceButton}</Flex>;
                })}
            </Flex>
        </AskUserToMakeChoice>
    );
}
