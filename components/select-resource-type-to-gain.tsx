import {PlayerState} from '../reducer';
import {isStorableResource, Resource, getResourceName} from '../constants/resource';
import {getAllowedCardsForResourceAction} from '../selectors/card';
import {useContext} from 'react';
import {AppContext} from '../context/app-context';
import {askUserToConfirmResourceTargetLocation, gainResource} from '../actions';
import {useDispatch} from 'react-redux';

function getResourceGainHumanName(resource: Resource, amount: number) {
    return `${amount} ${getResourceName(resource)}${amount > 1 ? 's' : ''}`;
}

type SelectResourceTypeToGainProps = {
    player: PlayerState;
};

function SelectResourceTypeToGain({player}: SelectResourceTypeToGainProps) {
    if (!player.pendingResourceOption) {
        return null;
    }
    const appContext = useContext(AppContext);
    const dispatch = useDispatch();
    let {resourceOption, targetType, card} = player.pendingResourceOption;

    function handleSelectResourceToGain(resource: Resource) {
        if (isStorableResource(resource)) {
            if (!player.pendingResourceOption?.targetType) {
                throw new Error('Storable resources must list a target type');
            }
            appContext.queue.unshift(
                askUserToConfirmResourceTargetLocation(
                    resource,
                    player.pendingResourceOption.targetType,
                    player.pendingResourceOption.resourceOption[resource]!,
                    card,
                    player.index
                )
            );
        } else {
            appContext.queue.push(
                gainResource(
                    resource,
                    player.pendingResourceOption?.resourceOption[resource]!,
                    player.index
                )
            );
        }
        appContext.processQueue(dispatch);
    }

    return (
        <>
            <h3>Select which resource to gain.</h3>
            {Object.keys(resourceOption).map(resource => {
                if (!player.pendingResourceOption) return null; // appease TS
                if (typeof player.pendingResourceOption.resourceOption[resource] !== 'number') {
                    throw new Error('No support for variable user-based resource gain');
                }

                if (isStorableResource(resource) && targetType) {
                    // verify that there is a home for this
                    const cards = getAllowedCardsForResourceAction({
                        player,
                        resource,
                        resourceLocationType: targetType,
                        thisCard: card,
                    });
                    if (cards.length === 0) {
                        return null;
                    }
                }

                return (
                    <button
                        key={resource}
                        onClick={() => handleSelectResourceToGain(resource as Resource)}
                    >
                        {getResourceGainHumanName(
                            resource as Resource,
                            player.pendingResourceOption.resourceOption[resource]
                        )}
                    </button>
                );
            })}
        </>
    );
}

export default SelectResourceTypeToGain;
