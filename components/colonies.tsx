import {Box, Flex} from 'components/box';
import {ColonyComponent} from 'components/colony';
import {getColony, SerializedColony} from 'constants/colonies';
import React, {Dispatch, SetStateAction} from 'react';
import {useTypedSelector} from 'reducer';

export const BOX_SHADOW_BASE = `0px 0px 5px 0px`;

export function ColonySwitcher({
    colonies,
    setSelectedColonies,
    selectedColonies,
    allowMulti,
}: {
    colonies: SerializedColony[];
    setSelectedColonies: Dispatch<SetStateAction<boolean[]>>;
    selectedColonies: boolean[];
    allowMulti?: boolean;
}) {
    return (
        <>
            <ColonyPicker {...{colonies, setSelectedColonies, selectedColonies, allowMulti}} />
            {selectedColonies.map((selected, index) => {
                return selected ? <ColonyComponent colony={colonies[index]} key={index} /> : null;
            })}
        </>
    );
}

function ColonyPicker({
    colonies,
    setSelectedColonies,
    selectedColonies,
    allowMulti,
}: {
    colonies: SerializedColony[];
    setSelectedColonies: Dispatch<SetStateAction<boolean[]>>;
    selectedColonies: boolean[];
    allowMulti?: boolean;
}) {
    return (
        <Flex
            className="display"
            color="#ccc"
            flexWrap="wrap"
            marginBottom="8px"
            marginLeft="4px"
            marginRight="4px"
            style={{userSelect: 'none'}}
        >
            {colonies.map((colony, index) => {
                const {planetColor} = getColony(colony);

                return (
                    <Box
                        cursor={!allowMulti && selectedColonies[index] ? 'auto' : 'pointer'}
                        key={colony.name}
                        padding="8px"
                        marginRight="8px"
                        marginBottom="4px"
                        marginTop="4px"
                        background="#333"
                        borderRadius="12px"
                        boxShadow={
                            selectedColonies[index] ? `${BOX_SHADOW_BASE} ${planetColor}` : 'none'
                        }
                        onClick={event => {
                            const newSelectedColonies =
                                event.shiftKey && allowMulti ? [...selectedColonies] : [];
                            newSelectedColonies[index] = !newSelectedColonies[index];
                            // ensure at least one colony selected.
                            if (newSelectedColonies.every(selected => !selected)) return;

                            setSelectedColonies(newSelectedColonies);
                        }}
                    >
                        {colony.name}
                    </Box>
                );
            })}
        </Flex>
    );
}

export function Colonies() {
    const colonies = useTypedSelector(state => state.common.colonies ?? []);

    if (!colonies[0]) {
        return null;
    }

    return (
        <Flex flexWrap="wrap" maxWidth="100%" alignItems="center" justifyContent="center">
            {colonies.map(colony => (
                <ColonyComponent colony={colony} key={colony.name} />
            ))}
        </Flex>
    );
}
