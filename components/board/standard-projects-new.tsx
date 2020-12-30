// import {ApiClient} from 'api-client';
// import {ActionGuard} from 'client-server-shared/action-guard';
// import {getTextForStandardProject} from 'components/board/standard-projects';
// import {Flex} from 'components/box';
// import {GlobalParameterIcon} from 'components/icons/global-parameter';
// import {ColonyIcon} from 'components/icons/other';
// import {ProductionIcon} from 'components/icons/production';
// import {ResourceIcon} from 'components/icons/resource';
// import {TileIcon} from 'components/icons/tile';
// import PaymentPopover from 'components/popovers/payment-popover';
// import {colors} from 'components/ui';
// import {Parameter, TileType} from 'constants/board';
// import {PropertyCounter} from 'constants/property-counter';
// import {Resource} from 'constants/resource';
// import {
//     StandardProjectAction,
//     standardProjectActions,
//     StandardProjectType,
// } from 'constants/standard-project';
// import React, {useState} from 'react';
// import {useDispatch} from 'react-redux';
// import {Tooltip} from 'react-tippy';
// import {PlayerState, useTypedSelector} from 'reducer';
// import styled from 'styled-components';
// import spawnExhaustiveSwitchError from 'utils';

// const OuterWrapper = styled.div`
//     display: flex;
//     align-items: center;
// `;

// const ACTION_MARGIN = 6;

// export default function StandardProjectsNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
//     const dispatch = useDispatch();
//     const apiClient = new ApiClient(dispatch);
//     const state = useTypedSelector(state => state);
//     const actionGuard = new ActionGuard(state, loggedInPlayer.username);

//     const playStandardProjectAction = (
//         standardProjectAction: StandardProjectAction,
//         payment?: PropertyCounter<Resource>
//     ) => {
//         const [canPlay] = actionGuard.canPlayStandardProject(standardProjectAction);
//         if (canPlay) {
//             apiClient.playStandardProjectAsync({payment, standardProjectAction});
//         }
//     };
//     return (
//         <OuterWrapper>
//             {standardProjectActions.map(action => {
//                 const [canPlay, reason] = actionGuard.canPlayStandardProject(action);
//                 return (
//                     <StandardProject
//                         action={action}
//                         loggedInPlayer={loggedInPlayer}
//                         playStandardProjectAction={playStandardProjectAction}
//                         canPlay={canPlay}
//                         reason={reason}
//                     />
//                 );
//             })}
//         </OuterWrapper>
//     );
// }

// const ErrorText = styled.span`
//     color: ${colors.TEXT_ERROR};
// `;

// function StandardProject({
//     action,
//     loggedInPlayer,
//     playStandardProjectAction,
//     canPlay,
//     reason,
// }: {
//     action: StandardProjectAction;
//     loggedInPlayer: PlayerState;
//     playStandardProjectAction: (
//         standardProjectAction: StandardProjectAction,
//         payment?: PropertyCounter<Resource>
//     ) => void;
//     canPlay: boolean;
//     reason: string;
// }) {
//     const cost = getCostForStandardProject(action, loggedInPlayer);
//     const [isActive, setIsActive] = useState(false);

//     return (
//         <Tooltip
//             trigger="click"
//             animation="none"
//             interactive={true}
//             popperOptions={{
//                 placement: 'bottom-start',
//                 modifiers: {
//                     offset: {
//                         offset: `${ACTION_MARGIN},0`,
//                     },
//                 },
//             }}
//             position="bottom"
//             onShow={() => setIsActive(true)}
//             onHide={() => setIsActive(false)}
//             html={
//                 <StandardProjectTooltip
//                     action={action}
//                     cost={cost}
//                     canPlay={canPlay}
//                     reason={reason}
//                     loggedInPlayer={loggedInPlayer}
//                     playStandardProjectAction={playStandardProjectAction}
//                 />
//             }
//         >
//             <StandardProjectActionIconWrapper isActive={isActive}>
//                 <StandardProjectActionIcon actionType={action.type} />
//             </StandardProjectActionIconWrapper>
//         </Tooltip>
//     );
// }

// function StandardProjectTooltip({
//     action,
//     cost,
//     canPlay,
//     reason,
//     loggedInPlayer,
//     playStandardProjectAction,
// }: {
//     action: StandardProjectAction;
//     cost: number;
//     canPlay: boolean;
//     reason: string;
//     loggedInPlayer: PlayerState;
//     playStandardProjectAction: (
//         action: StandardProjectAction,
//         payment?: PropertyCounter<Resource>
//     ) => void;
// }) {
//     return (
//         <Flex
//             flexDirection="column"
//             justifyContent="center"
//             background={colors.LIGHT_BG}
//             padding="4px"
//             style={{
//                 borderRadius: 3,
//                 borderTopLeftRadius: 0,
//             }}
//         >
//             <h3 style={{marginBottom: 4}}>{getTextForStandardProject(action.type)}</h3>
//             <Flex alignItems="center" marginBottom="8px">
//                 <StandardProjectActionDescription action={action} cost={cost} />
//             </Flex>
//             {!canPlay && <ErrorText>Cannot play: {reason}</ErrorText>}
//             {loggedInPlayer.corporation.name === 'Helion' &&
//                 loggedInPlayer.resources[Resource.HEAT] > 0 &&
//                 action.cost && (
//                     <PaymentPopover
//                         cost={cost}
//                         onConfirmPayment={payment => playStandardProjectAction(action, payment)}
//                     >
//                         <button disabled={!canPlay}>Play</button>
//                     </PaymentPopover>
//                 )}
//             <button disabled={!canPlay} onClick={() => playStandardProjectAction(action)}>
//                 Play
//             </button>
//         </Flex>
//     );
// }

// const StandardProjectActionIconWrapper = styled.div<{isActive: boolean}>`
//     display: flex;
//     height: 32px;
//     width: 32px;
//     margin: 0 ${ACTION_MARGIN}px;
//     border-radius: 3px;
//     align-items: center;
//     justify-content: center;
//     cursor: default;
//     user-select: none;

//     background-color: ${props => (props.isActive ? colors.LIGHT_BG : 'initial')};
//     opacity: ${props => (props.isActive ? 1 : 0.75)};
//     border-bottom-left-radius: ${props => (props.isActive ? 0 : '3px')};
//     border-bottom-right-radius: ${props => (props.isActive ? 0 : '3px')};
//     &:hover {
//         background-color: ${colors.LIGHT_BG};
//         opacity: 1;
//     }
// `;

// function StandardProjectActionIcon({actionType}: {actionType: StandardProjectType}) {
//     switch (actionType) {
//         case StandardProjectType.SELL_PATENTS:
//             return (
//                 <React.Fragment>
//                     <span>X</span>
//                     <ResourceIcon name={Resource.CARD} size={18} />
//                 </React.Fragment>
//             );
//         case StandardProjectType.POWER_PLANT:
//             return <ProductionIcon name={Resource.ENERGY} size={22} />;
//         case StandardProjectType.ASTEROID:
//             return <GlobalParameterIcon parameter={Parameter.TEMPERATURE} size={22} />;
//         case StandardProjectType.AQUIFER:
//             return <GlobalParameterIcon parameter={Parameter.OCEAN} size={22} />;
//         case StandardProjectType.GREENERY:
//             return <TileIcon type={TileType.GREENERY} size={22} />;
//         case StandardProjectType.CITY:
//             return <TileIcon type={TileType.CITY} size={22} />;
//         case StandardProjectType.COLONY:
//             return <ColonyIcon size={22} />;
//         case StandardProjectType.VENUS:
//             return <GlobalParameterIcon parameter={Parameter.VENUS} size={22} />;
//         default:
//             throw spawnExhaustiveSwitchError(actionType);
//     }
// }

// function getCostForStandardProject(action: StandardProjectAction, player: PlayerState) {
//     switch (action.type) {
//         case StandardProjectType.SELL_PATENTS:
//             return 0;
//         case StandardProjectType.POWER_PLANT:
//             return action.cost - player.discounts.standardProjectPowerPlant;
//         default:
//             return action.cost;
//     }
// }

// function StandardProjectActionDescription({
//     action,
//     cost,
// }: {
//     action: StandardProjectAction;
//     cost: number;
// }) {
//     switch (action.type) {
//         case StandardProjectType.SELL_PATENTS:
//             return (
//                 <React.Fragment>
//                     Sell X<ResourceIcon name={Resource.CARD} /> from your hand for{' '}
//                     <ResourceIcon name={Resource.MEGACREDIT} amount="1" /> each
//                 </React.Fragment>
//             );
//         case StandardProjectType.POWER_PLANT:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to increase your{' '}
//                     <ProductionIcon name={Resource.ENERGY} /> 1 step.
//                 </React.Fragment>
//             );
//         case StandardProjectType.ASTEROID:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to increase{' '}
//                     <GlobalParameterIcon parameter={Parameter.TEMPERATURE} /> 1 step.
//                 </React.Fragment>
//             );
//         case StandardProjectType.AQUIFER:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to place 1{' '}
//                     <TileIcon type={TileType.OCEAN} />.
//                 </React.Fragment>
//             );
//         case StandardProjectType.GREENERY:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to place 1{' '}
//                     <TileIcon type={TileType.GREENERY} />.
//                 </React.Fragment>
//             );
//         case StandardProjectType.CITY:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to place 1{' '}
//                     <TileIcon type={TileType.CITY} />.
//                 </React.Fragment>
//             );
//         case StandardProjectType.COLONY:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to build a{' '}
//                     <ColonyIcon />.
//                 </React.Fragment>
//             );
//         case StandardProjectType.VENUS:
//             return (
//                 <React.Fragment>
//                     Spend <ResourceIcon name={Resource.MEGACREDIT} amount={cost} /> to increase{' '}
//                     <GlobalParameterIcon parameter={Parameter.TEMPERATURE} /> 1 step.
//                 </React.Fragment>
//             );
//         default:
//             throw spawnExhaustiveSwitchError(action);
//     }
// }

export const x = {};
