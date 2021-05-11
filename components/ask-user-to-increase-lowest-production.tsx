import {getResourceName, Resource} from 'constants/resource';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Flex} from './box';

export function getLowestProductions(player: PlayerState): Resource[] {
    const lowestProductionValue = Math.min(...Object.values(player.productions));
    return Object.entries(player.productions)
        .filter(entry => entry[1] === lowestProductionValue)
        .map(entry => entry[0] as Resource);
}

const ProductionButton = styled.button`
    margin-left: 4px;
`;

export function AskUserToIncreaseLowestProduction({player}: {player: PlayerState}) {
    const lowestProductions = useTypedSelector(state => getLowestProductions(player));
    const apiClient = useApiClient();
    return (
        <Flex flexDirection="column">
            <h2>Please increase a production:</h2>
            <Flex>
                {lowestProductions.map(resource => (
                    <ProductionButton
                        key={resource}
                        onClick={() =>
                            apiClient.increaseLowestProductionAsync({production: resource})
                        }
                    >
                        {getResourceName(resource)}
                    </ProductionButton>
                ))}
            </Flex>
        </Flex>
    );
}
