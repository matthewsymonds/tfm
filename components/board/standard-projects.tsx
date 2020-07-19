import React, {useContext, useState} from 'react';

import {
    standardProjectActions,
    StandardProjectType,
    StandardProjectAction,
    NonSellPatentsStandardProjectAction,
} from 'constants/standard-project';
import PaymentPopover from 'components/popovers/payment-popover';
import {AppContext} from 'context/app-context';
import {useTypedSelector, PlayerState} from 'reducer';
import {useDispatch} from 'react-redux';
import {SharedActionsContainer, SharedActionRow} from './shared-actions';
import {Resource} from 'constants/resource';
import {PropertyCounter} from 'constants/property-counter';

export function getTextForStandardProject(standardProject: StandardProjectType) {
    switch (standardProject) {
        case StandardProjectType.SELL_PATENTS:
            return 'Sell patents';
        case StandardProjectType.POWER_PLANT:
            return 'Power plant';
        case StandardProjectType.ASTEROID:
            return 'Asteroid';
        case StandardProjectType.AQUIFER:
            return 'Aquifer';
        case StandardProjectType.GREENERY:
            return 'Greenery';
        case StandardProjectType.CITY:
            return 'City';
    }
}

function getPriceForStandardProject(
    standardProjectAction: StandardProjectAction,
    player: PlayerState
) {
    switch (standardProjectAction.type) {
        case StandardProjectType.SELL_PATENTS:
            return 'X';
        case StandardProjectType.POWER_PLANT:
            return standardProjectAction.cost - player.discounts.standardProjectPowerPlant;
        default:
            return standardProjectAction.cost;
    }
}

export default function StandardProjects() {
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const player = context.getLoggedInPlayer(state);
    const [
        actionPendingPayment,
        setActionPendingPayment,
    ] = useState<NonSellPatentsStandardProjectAction | null>(null);

    function handlePlayStandardProject(standardProjectAction: StandardProjectAction) {
        if (!context.canPlayStandardProject(standardProjectAction, state)) {
            return;
        }

        if (
            player.corporation.name === 'Helion' &&
            player.resources[Resource.HEAT] > 0 &&
            standardProjectAction.type !== StandardProjectType.SELL_PATENTS
        ) {
            // Helion can pay with heat and money
            setActionPendingPayment(standardProjectAction);
        } else {
            // Everyone else can only pay with money
            const cost = getPriceForStandardProject(standardProjectAction, player);
            context.playStandardProject(
                standardProjectAction,
                typeof cost === 'number' ? {[Resource.MEGACREDIT]: cost} : undefined,
                state
            );
            context.processQueue(dispatch);
        }
    }

    function handleConfirmPayment(payment: PropertyCounter<Resource>) {
        if (!actionPendingPayment) {
            throw new Error('No action pending payment');
        }
        context.playStandardProject(actionPendingPayment, payment, state);
        context.processQueue(dispatch);
        setActionPendingPayment(null);
    }

    return (
        <SharedActionsContainer>
            {standardProjectActions.map((standardProjectAction, index) => {
                return (
                    <React.Fragment key={index}>
                        <SharedActionRow
                            id={standardProjectAction.type}
                            selectable={context.canPlayStandardProject(
                                standardProjectAction,
                                state
                            )}
                            onClick={() => handlePlayStandardProject(standardProjectAction)}
                        >
                            <span>{getTextForStandardProject(standardProjectAction.type)}</span>
                            <span>{getPriceForStandardProject(standardProjectAction, player)}</span>
                        </SharedActionRow>
                        {actionPendingPayment && (
                            <PaymentPopover
                                isOpen={!!actionPendingPayment}
                                target={actionPendingPayment.type}
                                cost={actionPendingPayment.cost}
                                toggle={() => setActionPendingPayment(null)}
                                onConfirmPayment={(...args) => handleConfirmPayment(...args)}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </SharedActionsContainer>
    );
}
