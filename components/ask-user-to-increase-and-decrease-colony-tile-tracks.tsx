import {useApiClient} from 'hooks/use-api-client';
import React, {useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {Box, Flex} from './box';
import {ColonySwitcher} from './colonies';

export function AskUserToIncreaseAndDecreaseColonyTileTracks({
    player,
}: {
    player: PlayerState;
}) {
    const [selectedIncreaseTrackColonies, setSelectedIncreaseTrackColonies] =
        useState([true]);

    const [selectedDecreaseTrackColonies, setSelectedDecreaseTrackColonies] =
        useState([true]);

    const colonies = useTypedSelector(state => state.common.colonies ?? []);

    // increase/decrease colonies must be different
    const filteredDecreaseTrackColonies = colonies.filter(
        (_, index) => !selectedIncreaseTrackColonies[index]
    );

    const stepsString = `${player.increaseAndDecreaseColonyTileTracks} step${
        player.increaseAndDecreaseColonyTileTracks === 1 ? '' : 's'
    }`;

    const selectedIncreaseColony =
        colonies[selectedIncreaseTrackColonies.indexOf(true)];
    const selectedDecreaseColony =
        filteredDecreaseTrackColonies[
            selectedDecreaseTrackColonies.indexOf(true)
        ];

    const noopIncreaseMessage =
        selectedIncreaseColony.step < 0 ? (
            <em>
                Note: Increasing {selectedIncreaseColony.name} will have no
                effect.
            </em>
        ) : null;
    const noopDecreaseMessage =
        selectedDecreaseColony.step < 0 ? (
            <em>
                Note: Decreasing {selectedDecreaseColony.name} will have no
                effect.
            </em>
        ) : null;

    const apiClient = useApiClient();

    return (
        <Box margin="4px auto">
            <Flex
                color="#ccc"
                flexWrap="wrap"
                marginBottom="8px"
                justifyContent="center"
                marginLeft="auto"
                marginRight="auto"
            >
                <Box width="340px" margin="4px" marginBottom="16px">
                    <div>Increase track {stepsString}:</div>
                    <ColonySwitcher
                        colonies={colonies}
                        selectedColonies={selectedIncreaseTrackColonies}
                        setSelectedColonies={setSelectedIncreaseTrackColonies}
                    />
                    {noopIncreaseMessage}
                </Box>
                <Box width="340px" margin="4px">
                    <div>Decrease track {stepsString}:</div>
                    <ColonySwitcher
                        colonies={filteredDecreaseTrackColonies}
                        selectedColonies={selectedDecreaseTrackColonies}
                        setSelectedColonies={setSelectedDecreaseTrackColonies}
                    />
                    {noopDecreaseMessage}
                </Box>
            </Flex>
            <Flex justifyContent="center" marginLeft="auto" marginRight="auto">
                <button
                    onClick={() => {
                        apiClient.completeIncreaseAndDecreaseColonyTileTracksAsync(
                            {
                                increase: selectedIncreaseColony.name,
                                decrease: selectedDecreaseColony.name,
                            }
                        );
                    }}
                >
                    Confirm
                </button>
            </Flex>
        </Box>
    );
}
