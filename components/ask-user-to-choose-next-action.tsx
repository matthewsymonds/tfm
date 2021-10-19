import {
    addActionToPlay,
    askUserToPlaceTile,
    askUserToPlayCardFromHand,
    decreaseProduction,
    gainResource,
    increaseProduction,
    removeResource,
} from 'actions';
import React from 'react';
import {PlayerState} from 'reducer';
import {Box, Flex} from './box';
import {
    BaseActionIconography,
    GainResourceIconography,
    ProductionIconography,
    RemoveResourceIconography,
} from './card/CardIconography';
import {TileIcon} from './icons/tile';
import {colors} from './ui';

export function AskUserToChooseNextAction({player}: {player: PlayerState}) {
    let renderedActions: React.ReactNode[] = [];
    const actions = player?.pendingActionChoice ?? [];

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        if (increaseProduction.match(action)) {
            renderedActions.push(
                <ProductionIconography
                    card={{increaseProduction: {[action.payload.resource]: action.payload.amount}}}
                />
            );
        } else if (decreaseProduction.match(action)) {
            renderedActions.push(
                <ProductionIconography
                    card={{decreaseProduction: {[action.payload.resource]: action.payload.amount}}}
                />
            );
        } else if (gainResource.match(action)) {
            renderedActions.push(
                <GainResourceIconography
                    gainResource={{[action.payload.resource]: action.payload.amount}}
                />
            );
        } else if (removeResource.match(action)) {
            renderedActions.push(
                <RemoveResourceIconography
                    removeResource={{[action.payload.resource]: action.payload.amount}}
                />
            );
        } else if (addActionToPlay.match(action)) {
            renderedActions.push(<BaseActionIconography card={action.payload.action} />);
        } else if (askUserToPlaceTile.match(action)) {
            renderedActions.push(<TileIcon type={action.payload.tilePlacement.type} size={24} />);
        } else {
            console.log(action);
        }
    }

    renderedActions = renderedActions.map((action, index) => (
        <Box margin="8px" key={index} height="100%">
            <button onClick={() => alert(JSON.stringify(action))} style={{height: '100%'}}>
                {action}
            </button>
        </Box>
    ));

    return (
        <Box color={colors.TEXT_LIGHT_1}>
            <h3>Please choose the next effect:</h3>
            <Flex alignItems="center" width="100%" flexWrap="wrap">
                {renderedActions}
            </Flex>
        </Box>
    );
}
