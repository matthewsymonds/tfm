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

function getCostForStandardProject(
    standardProjectAction: StandardProjectAction,
    player: PlayerState
) {
    switch (standardProjectAction.type) {
        case StandardProjectType.SELL_PATENTS:
            return 0;
        case StandardProjectType.POWER_PLANT:
            return standardProjectAction.cost - player.discounts.standardProjectPowerPlant;
        default:
            return standardProjectAction.cost;
    }
}

export default function StandardProjects() {
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);

    function renderStandardProjectButton(standardProject: StandardProjectAction) {
        const isDisabled = useTypedSelector(
            () => !context.canPlayStandardProject(standardProject, state)
        );
        const text = getTextForStandardProject(standardProject.type);
        const cost = getCostForStandardProject(standardProject, player);
        const costAsText = cost === 0 ? 'X' : `${cost}`;
        const handleConfirmPayment = (
            payment: PropertyCounter<Resource> = {[Resource.MEGACREDIT]: cost}
        ) => {
            context.playStandardProject(standardProject, payment, state);
            context.processQueue(dispatch);
        };

        if (
            player.corporation.name === 'Helion' &&
            player.resources[Resource.HEAT] > 0 &&
            standardProject.type !== StandardProjectType.SELL_PATENTS
        ) {
            return (
                <PaymentPopover cost={cost} onConfirmPayment={handleConfirmPayment}>
                    <SharedActionRow disabled={isDisabled}>
                        <span>{text}</span>
                        <span>{costAsText}</span>
                    </SharedActionRow>
                </PaymentPopover>
            );
        }

        return (
            <SharedActionRow disabled={isDisabled} onClick={() => handleConfirmPayment()}>
                <span>{text}</span>
                <span>{costAsText}</span>
            </SharedActionRow>
        );
    }

    return (
        <SharedActionsContainer>
            {standardProjectActions.map((standardProjectAction, index) => {
                return (
                    <React.Fragment key={index}>
                        {renderStandardProjectButton(standardProjectAction)}
                    </React.Fragment>
                );
            })}
        </SharedActionsContainer>
    );
}
