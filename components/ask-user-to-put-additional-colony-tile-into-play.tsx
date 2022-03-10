import {COLONIES, getSerializedColony} from 'constants/colonies';
import {useApiClient} from 'hooks/use-api-client';
import React, {useState} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {Box, Flex} from './box';
import {ColonySwitcher} from './colonies';

export function AskUserToPutAdditionalColonyTileIntoPlay({
    player,
}: {
    player: PlayerState;
}) {
    const [selectedColonies, setSelectedColonies] = useState([true]);

    const coloniesAlreadyInGame = useTypedSelector(
        state => state.common.colonies ?? []
    ).map(colony => colony.name);

    const otherColonies = COLONIES.filter(
        colony => !coloniesAlreadyInGame.includes(colony.name)
    ).map(getSerializedColony);

    const selectedColony = otherColonies[selectedColonies.indexOf(true)];

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
                    <Box marginBottom="8px">
                        Select an additional colony to put into play:
                    </Box>
                    <ColonySwitcher
                        colonies={otherColonies}
                        selectedColonies={selectedColonies}
                        setSelectedColonies={setSelectedColonies}
                    />
                </Box>
            </Flex>
            <Flex justifyContent="center" marginLeft="auto" marginRight="auto">
                <button
                    onClick={() => {
                        apiClient.completePutAdditionalColonyTileIntoPlayAsync({
                            colony: selectedColony.name,
                        });
                    }}
                >
                    Confirm
                </button>
            </Flex>
        </Box>
    );
}
