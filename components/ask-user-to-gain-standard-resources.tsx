import {STANDARD_RESOURCES} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {useApiClient} from 'hooks/use-api-client';
import React, {useState} from 'react';
import {PlayerState} from 'reducer';
import {Flex} from './box';
import {ResourceIcon} from './icons/resource';
import {colors} from './ui';

function ResourceChooser({
    resource,
    quantity,
    onChange,
    max,
}: {
    resource: Resource;
    quantity: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => unknown;
    max: number;
}) {
    return (
        <Flex alignItems="center" justifyContent="center">
            <ResourceIcon margin={4} size={10} name={resource} />
            <input type="number" min={0} value={quantity} max={max} onChange={onChange}></input>
        </Flex>
    );
}

export function AskUserToGainStandardResources({player}: {player: PlayerState}) {
    const apiClient = useApiClient();
    const {pendingGainStandardResources: quantity} = player;
    if (!quantity) return null;

    const [resources, setResources] = useState({
        [Resource.MEGACREDIT]: 0,
        [Resource.STEEL]: 0,
        [Resource.TITANIUM]: 0,
        [Resource.PLANT]: 0,
        [Resource.ENERGY]: 0,
        [Resource.HEAT]: 0,
    });
    const total = STANDARD_RESOURCES.reduce((acc, resource) => acc + resources[resource] ?? 0, 0);
    const remaining = quantity - total;
    const confirmGainResources = () => {
        apiClient.gainStandardResourcesAsync({resources});
    };
    return (
        <Flex flexDirection="column">
            <span style={{marginBottom: 16, color: colors.TEXT_LIGHT_1}}>
                Please gain {quantity} standard resource{quantity === 1 ? '' : 's'}
            </span>
            <Flex flexWrap="wrap">
                {STANDARD_RESOURCES.map(resource => {
                    const max = resources[resource] + remaining;
                    return (
                        <ResourceChooser
                            key={resource}
                            onChange={event => {
                                const newResources = {
                                    ...resources,
                                    [resource]: Math.max(
                                        0,
                                        Math.min(max, Number(event.target.value))
                                    ),
                                };
                                setResources(newResources);
                            }}
                            resource={resource}
                            quantity={quantity}
                            max={max}
                        />
                    );
                })}
            </Flex>
            <button onClick={confirmGainResources}>Continue</button>
        </Flex>
    );
}
