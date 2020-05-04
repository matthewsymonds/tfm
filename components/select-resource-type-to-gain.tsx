import {PlayerState} from '../reducer';
import {
    isStorableResource,
    Resource,
    getResourceName,
    ResourceLocationType,
} from '../constants/resource';
import {getAllowedCardsToGainResourceTo} from '../selectors/card';
import {Card} from '../models/card';
import {PropertyCounter} from '../constants/property-counter';

function getResourceGainHumanName(resource: Resource, amount: number) {
    return `${amount} ${getResourceName(resource)}${amount > 1 ? 's' : ''}`;
}

type SelectResourceTypeToGain = {
    player: PlayerState;
    confirmResourceGain: (resource: Resource, amount: number) => void;
    askUserToConfirmResourceTargetLocation: (
        gainResource: PropertyCounter<Resource>,
        gainResourceTargetType: ResourceLocationType,
        card: Card | undefined
    ) => void;
};

function SelectResourceTypeToGain({
    player,
    confirmResourceGain,
    askUserToConfirmResourceTargetLocation,
}: SelectResourceTypeToGain) {
    if (!player.pendingResourceGain) {
        return null;
    }
    let {gainResourceOption, gainResourceTargetType, card} = player.pendingResourceGain;
    function handleSelectResourceToGain(resource: Resource) {
        if (isStorableResource(resource)) {
            if (!player.pendingResourceGain?.gainResourceTargetType) {
                throw new Error('Storable resources must list a target type');
            }
            askUserToConfirmResourceTargetLocation(
                {[resource]: player.pendingResourceGain.gainResourceOption[resource]},
                player.pendingResourceGain?.gainResourceTargetType,
                card
            );
        } else {
            confirmResourceGain(
                resource,
                player.pendingResourceGain?.gainResourceOption[resource] as number // hack but this should always be a number
            );
        }
    }
    return (
        <>
            <h3>Select which resource to gain.</h3>
            {Object.keys(gainResourceOption).map(resource => {
                if (!player.pendingResourceGain) return null; // appease TS
                if (typeof player.pendingResourceGain.gainResourceOption[resource] !== 'number') {
                    throw new Error('No support for variable user-based resource gain');
                }

                if (isStorableResource(resource) && gainResourceTargetType) {
                    // verify that there is a home for this
                    const cards = getAllowedCardsToGainResourceTo({
                        player,
                        resource,
                        gainResourceTargetType,
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
                            player.pendingResourceGain.gainResourceOption[resource]
                        )}
                    </button>
                );
            })}
        </>
    );
}

export default SelectResourceTypeToGain;
