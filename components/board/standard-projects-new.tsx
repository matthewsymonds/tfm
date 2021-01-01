import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import ActionListWithPopovers from 'components/action-list-with-popovers';
import {getTextForStandardProject} from 'components/board/standard-projects';
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
import React from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

const OuterWrapper = styled.div`
    display: flex;
    align-items: center;
    position: relative;
`;

const ACTION_MARGIN = 0;

export default function StandardProjectsNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const state = useTypedSelector(state => state);
    const actionGuard = new ActionGuard(state, loggedInPlayer.username);

    const playStandardProjectAction = (
        standardProjectAction: StandardProjectAction,
        payment?: PropertyCounter<Resource>
    ) => {
        const [canPlay] = actionGuard.canPlayStandardProject(standardProjectAction);
        if (canPlay) {
            apiClient.playStandardProjectAsync({payment, standardProjectAction});
        }
    };

    return (
        <ActionListWithPopovers<StandardProjectAction>
            id="standard-projects"
            actions={standardProjectActions}
            ActionComponent={StandardProject}
            ActionPopoverComponent={({
                action,
                closePopover,
            }: {
                action: StandardProjectAction;
                closePopover: () => void;
            }) => (
                <StandardProjectTooltip
                    action={action}
                    loggedInPlayer={loggedInPlayer}
                    playStandardProjectAction={playStandardProjectAction}
                    closeTooltip={closePopover}
                />
            )}
        />
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

function StandardProject({
    action,
    setSelectedAction,
    isSelected,
}: {
    action: StandardProjectAction;
    setSelectedAction: (action: StandardProjectAction | null) => void;
    isSelected: boolean;
}) {
    return (
        <Flex
            onClick={() => {
                setSelectedAction(isSelected ? null : action);
            }}
            height="32px"
            width="32px"
            justifyContent="center"
            alignItems="center"
        >
            {/* <StandardProjectActionIconWrapper isActive={isSelected}> */}
            <StandardProjectActionIcon actionType={action.type} />
            {/* </StandardProjectActionIconWrapper> */}
        </Flex>
    );
}

const TooltipWrapper = styled.div`
    position: absolute;
    bottom: 48px;
    left: ${ACTION_MARGIN}px;
    right: ${ACTION_MARGIN}px;
    z-index: 1;
    transition: opacity 250ms;
`;

function StandardProjectTooltip({
    action,
    loggedInPlayer,
    playStandardProjectAction,
    closeTooltip,
}: {
    action: StandardProjectAction;
    loggedInPlayer: PlayerState;
    playStandardProjectAction: (
        action: StandardProjectAction,
        payment?: PropertyCounter<Resource>
    ) => void;
    closeTooltip: () => void;
}) {
    const state = useTypedSelector(state => state);
    const actionGuard = new ActionGuard(state, loggedInPlayer.username);
    const cost = getCostForStandardProject(action, loggedInPlayer);
    const [canPlay, reason] = actionGuard.canPlayStandardProject(action);

    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' &&
        loggedInPlayer.resources[Resource.HEAT] > 0 &&
        action.cost;

    return (
        <TooltipWrapper>
            <TexturedCard height={188} borderRadius={4} borderWidth={0}>
                <GenericCardTitleBar bgColor={'#d67500'}>
                    {getTextForStandardProject(action.type)}
                </GenericCardTitleBar>
                <GenericCardCost cost={cost} originalCost={action.cost} />
                <Flex alignItems="center" margin="4px" marginBottom="8px" fontSize="13px">
                    <StandardProjectActionDescription action={action} />
                </Flex>
                <Flex alignItems="center" justifyContent="center" marginBottom="8px">
                    <StandardProjectActionIconography action={action} />
                </Flex>
                <Flex flex="auto"></Flex>
                <Flex
                    margin="8px"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                >
                    {!canPlay && <ErrorText>Cannot play: {reason}</ErrorText>}
                    {showPaymentPopover && (
                        <PaymentPopover
                            cost={cost}
                            onConfirmPayment={payment => playStandardProjectAction(action, payment)}
                        >
                            <button disabled={!canPlay} style={{width: 80}}>
                                Play
                            </button>
                        </PaymentPopover>
                    )}
                    {!showPaymentPopover && (
                        <button
                            disabled={!canPlay}
                            style={{width: 80}}
                            onClick={() => {
                                closeTooltip();
                                playStandardProjectAction(action);
                            }}
                        >
                            Play
                        </button>
                    )}
                </Flex>
            </TexturedCard>
        </TooltipWrapper>
    );
}

const StandardProjectActionIconWrapper = styled.div<{isActive: boolean}>`
    display: flex;
    position: relative;
    height: 32px;
    width: 32px;
    margin: 0 ${ACTION_MARGIN}px;
    align-items: center;
    justify-content: center;
    cursor: default;
    user-select: none;

    &:before {
        content: '';
        background-color: ${props => (props.isActive ? colors.LIGHT_BG : 'initial')};
        box-shadow: ${props => (props.isActive ? 'rgb(0 0 0 / 1) 4px 6px 6px -1px' : 'none')};
        transition: background-color 250ms, box-shadow 250ms;
        position: absolute;
        height: 100%;
        width: 100%;
        z-index: -1;
        border-radius: 3px;
    }

    &:hover:before {
        background-color: ${colors.LIGHT_BG};
        box-shadow: rgb(0 0 0 / 1) 4px 6px 6px -1px;
    }
`;

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
            return <ProductionIconography card={{increaseProduction: {[Resource.ENERGY]: 1}}} />;
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
