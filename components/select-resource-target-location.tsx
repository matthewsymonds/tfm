import {PlayerState} from '../reducer';
import {isStorableResource, Resource} from '../constants/resource';
import {getAllowedCardsToGainResourceTo} from '../selectors/card';
import {CardComponent} from './card';
import {Card} from '../models/card';
import {PropertyCounter} from '../constants/property-counter';

type SelectResourceTargetLocationProps = {
    player: PlayerState;
    confirmStorableResourceGain: (resource: Resource, amount: number, card: Card) => void;
};

function SelectResourceTargetLocation({
    player,
    confirmStorableResourceGain,
}: SelectResourceTargetLocationProps) {
    if (!player.pendingResourceGainTargetConfirmation) {
        return null;
    }
    let {gainResource, gainResourceTargetType, card} = player.pendingResourceGainTargetConfirmation;
    const resource = Object.keys(gainResource)[0];
    const amount = gainResource[resource];
    if (!isStorableResource(resource)) {
        throw new Error('Cannot store a non-storable resource on a card');
    }
    const possibleCards = getAllowedCardsToGainResourceTo({
        player,
        resource,
        gainResourceTargetType,
        thisCard: card,
    });

    return (
        <>
            <h3>Select where to gain the resource.</h3>
            {possibleCards.map(card => (
                <CardComponent content={card} width={300}>
                    <button onClick={() => confirmStorableResourceGain(resource, amount, card)}>
                        Add to {card.name}
                    </button>
                </CardComponent>
            ))}
        </>
    );
}

export default SelectResourceTargetLocation;
