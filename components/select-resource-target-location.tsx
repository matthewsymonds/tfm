import {PlayerState} from '../reducer';
import {isStorableResource, Resource, ResourceLocationType} from '../constants/resource';
import {getAllowedCardsForResourceAction} from '../selectors/card';
import {CardComponent} from './card';
import {Card} from '../models/card';
import {useContext} from 'react';
import {AppContext} from '../context/app-context';
import {useDispatch} from 'react-redux';
import {Amount} from '../constants/action';
import {gainStorableResource} from '../actions';

type SelectResourceTargetLocationProps = {
    player: PlayerState;
};

function isNonCardResourceLocationType(locationType: ResourceLocationType) {
    return (
        locationType !== ResourceLocationType.ANY_PLAYER &&
        locationType !== ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG
    );
}

function SelectResourceTargetLocation({player}: SelectResourceTargetLocationProps) {
    const appContext = useContext(AppContext);
    const dispatch = useDispatch();

    if (!player.pendingResourceTargetConfirmation) {
        return null;
    }
    let {resource, amount, targetType, card} = player.pendingResourceTargetConfirmation;
    if (!isStorableResource(resource)) {
        throw new Error('Cannot store a non-storable resource on a card');
    }

    function confirmStorableResourceGain(resource: Resource, amount: Amount, card: Card) {
        if (amount > 0) {
            appContext.queue.unshift(gainStorableResource(resource, amount, card, player.index));
        } else {
            appContext.queue.unshift(removeStorableResource(resource, amount, card, player.index));
        }
        appContext.processQueue(dispatch);
    }

    if (isNonCardResourceLocationType(targetType)) {
        // if removing from a player
        // const possiblePlayers =
    } else {
        // if removing from a card
        const possibleCards = getAllowedCardsForResourceAction({
            player,
            resource,
            resourceLocationType: targetType,
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
}

export default SelectResourceTargetLocation;
