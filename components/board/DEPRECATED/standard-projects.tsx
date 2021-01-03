import PaymentPopover from 'components/popovers/payment-popover';
import {MAX_PARAMETERS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {
    StandardProjectAction,
    standardProjectActions,
    StandardProjectType,
} from 'constants/standard-project';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {GameState, getNumOceans, PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {SharedActionRow, SharedActionsContainer} from './shared-actions';

const Warning = styled.div`
    font-weight: bold;
    color: maroon;
    text-align: center;
    padding: 4px;
    border: 2px solid black;
    background: lightgray;
    max-width: 140px;
    font-size: 10px;
    margin: 0 auto;
`;

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

function getWarning(isDisabled: boolean, state: GameState, standardProject: StandardProjectAction) {
    if (isDisabled) {
        return null;
    }
    if (standardProject.type === StandardProjectType.AQUIFER) {
        const numOceans = getNumOceans(state);
        if (numOceans === MAX_PARAMETERS.ocean) {
            return <Warning>All oceans placed</Warning>;
        }
    }

    if (standardProject.type === StandardProjectType.ASTEROID) {
        if (state.common.parameters.temperature === MAX_PARAMETERS.temperature) {
            return <Warning>Temperature at max</Warning>;
        }
    }

    return null;
}

export default function StandardProjects() {
    const player = useLoggedInPlayer();

    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    function renderStandardProjectButton(standardProject: StandardProjectAction) {
        const isDisabled = useTypedSelector(
            () => !actionGuard.canPlayStandardProject(standardProject)[0]
        );
        const text = getTextForStandardProject(standardProject.type);
        const cost = getCostForStandardProject(standardProject, player);
        const costAsText = cost === 0 ? 'X' : `${cost}`;
        const handleConfirmPayment = (
            payment: PropertyCounter<Resource> = {[Resource.MEGACREDIT]: cost}
        ) => {
            if (isDisabled) {
                return;
            }
            apiClient.playStandardProjectAsync({payment, standardProjectAction: standardProject});
        };

        const warning = useTypedSelector(state => getWarning(isDisabled, state, standardProject));

        if (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0 && cost) {
            return (
                <PaymentPopover cost={cost} onConfirmPayment={handleConfirmPayment}>
                    <SharedActionRow isDisabled={isDisabled}>
                        <span>{text}</span>
                        <span>{costAsText}</span>
                    </SharedActionRow>
                    {warning}
                </PaymentPopover>
            );
        }

        return (
            <div>
                <SharedActionRow isDisabled={isDisabled} onClick={() => handleConfirmPayment()}>
                    <span>{text}</span>
                    <span>{costAsText}</span>
                </SharedActionRow>
                {warning}
            </div>
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