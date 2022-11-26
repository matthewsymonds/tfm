import {
    GREENS,
    KELVINISTS,
    MARS_FIRST,
    REDS,
    SCIENTISTS,
    TurmoilParty,
    UNITY,
} from 'constants/party';
import {useApiClient} from 'hooks/use-api-client';
import {useState} from 'react';
import {PlayerState} from 'reducer';
import {Box, Flex} from './box';
import {Button} from './button';
import {PartySymbol} from './icons/turmoil';
import {SelectButtons} from './select-buttons';

export function AskUserToPlaceDelegatesInOneParty({
    player,
}: {
    player: PlayerState;
}) {
    const numDelegatesToPlace = player.placeDelegatesInOneParty;
    if (numDelegatesToPlace === undefined) {
        throw new Error('no delegates to place');
    }

    const parties: Array<TurmoilParty> = [
        MARS_FIRST,
        SCIENTISTS,
        UNITY,
        GREENS,
        REDS,
        KELVINISTS,
    ];
    const [selectedParty, setSelectedParty] = useState<TurmoilParty>(
        parties[0]
    );

    const apiClient = useApiClient();

    return (
        <Box>
            <Flex margin="16px 0 0 0" flexDirection="column">
                <SelectButtons<TurmoilParty>
                    selectedItem={selectedParty}
                    setSelectedItem={setSelectedParty}
                    itemRenderer={party => <PartySymbol party={party} />}
                    items={parties}
                    isSelected={party => party === selectedParty}
                />
                <Flex margin="16px 0 0 0" justifyContent="center">
                    <Button
                        onClick={() =>
                            apiClient.completePlaceDelegatesInOnePartyAsync(
                                selectedParty
                            )
                        }
                    >
                        <span>
                            Send {numDelegatesToPlace} delegate
                            {numDelegatesToPlace === 1 ? '' : 's'} to{' '}
                        </span>
                        <PartySymbol
                            party={selectedParty}
                            size={20}
                            margin="0 0 0 4px"
                        />
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
}
