import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Flex} from 'components/box';
import {GenericCardCost} from 'components/card/CardCost';
import {
    GainResourceIconography,
    IncreaseParameterIconography,
    ProductionIconography,
    RemoveResourceIconography,
} from 'components/card/CardIconography';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {ColonyIcon} from 'components/icons/other';
import {ProductionIcon} from 'components/icons/production';
import {ResourceIcon} from 'components/icons/resource';
import {TileIcon} from 'components/icons/tile';
import PaymentPopover from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {Parameter, TileType} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {
    StandardProjectAction,
    standardProjectActions,
    StandardProjectType,
} from 'constants/standard-project';
import {VariableAmount} from 'constants/variable-amount';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

export default function StandardProjectsNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const canPlay = standardProjectAction =>
        actionGuard.canPlayStandardProject(standardProjectAction)[0];

    const playStandardProjectAction = (
        standardProjectAction: StandardProjectAction,
        payment: PropertyCounter<Resource>
    ) => {
        if (canPlay(standardProjectAction)) {
            apiClient.playStandardProjectAsync({payment, standardProjectAction});
        }
    };

    return (
        <ActionListWithPopovers<StandardProjectAction>
            actions={standardProjectActions}
            emphasizeOnHover={canPlay}
            style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
            }}
            ActionComponent={({action}) => (
                <StandardProject
                    action={action}
                    playStandardProjectAction={playStandardProjectAction}
                    loggedInPlayer={loggedInPlayer}
                />
            )}
            ActionPopoverComponent={({action}: {action: StandardProjectAction}) => (
                <StandardProjectTooltip action={action} loggedInPlayer={loggedInPlayer} />
            )}
        />
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

function StandardProject({
    action,
    playStandardProjectAction,
    loggedInPlayer,
}: {
    action: StandardProjectAction;
    playStandardProjectAction: (
        action: StandardProjectAction | null,
        payment: PropertyCounter<Resource>
    ) => void;
    loggedInPlayer: PlayerState;
}) {
    const cost = getCostForStandardProject(action, loggedInPlayer);

    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' &&
        loggedInPlayer.resources[Resource.HEAT] > 0 &&
        action.cost;

    return (
        <PaymentPopover
            cost={cost}
            onConfirmPayment={payment => playStandardProjectAction(action, payment)}
            shouldHide={!showPaymentPopover}
        >
            <Flex
                onClick={() => {
                    !showPaymentPopover &&
                        playStandardProjectAction(action, {[Resource.MEGACREDIT]: cost});
                }}
                height="32px"
                width="32px"
                justifyContent="center"
                alignItems="center"
            >
                <StandardProjectActionIcon actionType={action.type} />
            </Flex>
        </PaymentPopover>
    );
}

function StandardProjectTooltip({
    action,
    loggedInPlayer,
}: {
    action: StandardProjectAction;
    loggedInPlayer: PlayerState;
}) {
    const actionGuard = useActionGuard();
    const cost = getCostForStandardProject(action, loggedInPlayer);
    const [canPlay, reason] = actionGuard.canPlayStandardProject(action);

    return (
        <TexturedCard width={200}>
            <GenericCardTitleBar bgColor={'#d67500'}>
                {getTextForStandardProject(action.type)}
            </GenericCardTitleBar>
            <GenericCardCost cost={cost} originalCost={action.cost} />
            <Flex alignItems="center" margin="8px" marginBottom="8px" fontSize="13px">
                <StandardProjectActionDescription action={action} />
            </Flex>
            <Flex alignItems="center" justifyContent="center" marginBottom="8px">
                <StandardProjectActionIconography action={action} />
            </Flex>
            <Flex flex="auto"></Flex>
            {!canPlay && reason && (
                <Flex
                    margin="8px"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    fontSize="13px"
                >
                    <ErrorText>{reason}</ErrorText>
                </Flex>
            )}
        </TexturedCard>
    );
}

function StandardProjectActionIcon({actionType}: {actionType: StandardProjectType}) {
    switch (actionType) {
        case StandardProjectType.SELL_PATENTS:
            return (
                <React.Fragment>
                    <span style={{marginRight: 2}}>-</span>
                    <ResourceIcon name={Resource.CARD} size={18} />
                </React.Fragment>
            );
        case StandardProjectType.POWER_PLANT:
            return <ProductionIcon name={Resource.ENERGY} size={22} paddingSize={3} />;
        case StandardProjectType.ASTEROID:
            return <GlobalParameterIcon parameter={Parameter.TEMPERATURE} size={22} />;
        case StandardProjectType.AQUIFER:
            return <GlobalParameterIcon parameter={Parameter.OCEAN} size={22} />;
        case StandardProjectType.GREENERY:
            return <TileIcon type={TileType.GREENERY} size={22} />;
        case StandardProjectType.CITY:
            return <TileIcon type={TileType.CITY} size={22} />;
        case StandardProjectType.COLONY:
            return <ColonyIcon size={22} />;
        case StandardProjectType.VENUS:
            return <GlobalParameterIcon parameter={Parameter.VENUS} size={22} />;
        default:
            throw spawnExhaustiveSwitchError(actionType);
    }
}

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

function getCostForStandardProject(action: StandardProjectAction, player: PlayerState) {
    switch (action.type) {
        case StandardProjectType.SELL_PATENTS:
            return 0;
        case StandardProjectType.POWER_PLANT:
            return action.cost - player.discounts.standardProjectPowerPlant;
        default:
            return action.cost;
    }
}

function StandardProjectActionDescription({action}: {action: StandardProjectAction}) {
    switch (action.type) {
        case StandardProjectType.SELL_PATENTS:
            return (
                <React.Fragment>
                    Discard any number of cards from hand to gain that many MC.
                </React.Fragment>
            );
        case StandardProjectType.POWER_PLANT:
            return <React.Fragment>Increase your energy production 1 step.</React.Fragment>;
        case StandardProjectType.ASTEROID:
            return <React.Fragment>Raise temperature 1 step.</React.Fragment>;
        case StandardProjectType.AQUIFER:
            return <React.Fragment>Place an ocean tile.</React.Fragment>;
        case StandardProjectType.GREENERY:
            return <React.Fragment>Place a greenery tile.</React.Fragment>;
        case StandardProjectType.CITY:
            return (
                <React.Fragment>
                    Place a city tile and increase your MC production 1 step.
                </React.Fragment>
            );
        case StandardProjectType.COLONY:
            return <React.Fragment>Build a colony.</React.Fragment>;
        case StandardProjectType.VENUS:
            return <React.Fragment>Raise Venus 1 step.</React.Fragment>;
        default:
            throw spawnExhaustiveSwitchError(action);
    }
}
function StandardProjectActionIconography({action}: {action: StandardProjectAction}) {
    switch (action.type) {
        case StandardProjectType.SELL_PATENTS:
            return (
                <React.Fragment>
                    <RemoveResourceIconography
                        removeResource={{[Resource.CARD]: VariableAmount.USER_CHOICE}}
                        sourceType={undefined}
                    />
                    <GainResourceIconography
                        gainResource={{[Resource.MEGACREDIT]: VariableAmount.BASED_ON_USER_CHOICE}}
                    />
                </React.Fragment>
            );
        case StandardProjectType.POWER_PLANT:
            return <ProductionIcon name={Resource.ENERGY} size={26} paddingSize={4} />;
        case StandardProjectType.ASTEROID:
            return (
                <IncreaseParameterIconography
                    size={32}
                    increaseParameter={{[Parameter.TEMPERATURE]: 1}}
                />
            );
        case StandardProjectType.AQUIFER:
            return <TileIcon type={TileType.OCEAN} size={40} />;
        case StandardProjectType.GREENERY:
            return (
                <React.Fragment>
                    <TileIcon type={TileType.GREENERY} size={40} />
                    <IncreaseParameterIconography increaseParameter={{[Parameter.OXYGEN]: 1}} />
                </React.Fragment>
            );
        case StandardProjectType.CITY:
            return (
                <React.Fragment>
                    <TileIcon type={TileType.CITY} size={40} />
                    <ProductionIconography
                        card={{increaseProduction: {[Resource.MEGACREDIT]: 1}}}
                    />
                </React.Fragment>
            );
        case StandardProjectType.COLONY:
            return <ColonyIcon size={16} />;
        case StandardProjectType.VENUS:
            return <IncreaseParameterIconography increaseParameter={{[Parameter.VENUS]: 1}} />;
        default:
            throw spawnExhaustiveSwitchError(action);
    }
}
