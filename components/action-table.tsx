import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {getAward, getAwards} from 'constants/awards';
import {getMilestone, getMilestones} from 'constants/milestones';
import {
    getStandardProjects,
    StandardProjectAction,
    StandardProjectType,
} from 'constants/standard-project';
import AnimateHeight from 'react-animate-height';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';
import {BlankButton} from './blank-button';
import {throttle} from 'throttle-debounce';
import {useAwardConfigsByAward} from './board/board-actions/awards';
import {
    getCostForStandardProject,
    getTextForStandardProject,
    StandardProjectActionIcon,
} from './board/board-actions/standard-projects';
import {Flex} from './box';
import {colors} from './ui';
import {ResourceIcon} from './icons/resource';
import {Resource} from 'constants/resource-enum';
import PaymentPopover from './popovers/payment-popover';
import {NumericPropertyCounter} from 'constants/property-counter';
import spawnExhaustiveSwitchError from 'utils';
import {Payment} from 'constants/action';
import {
    Conversion,
    DEFAULT_CONVERSIONS,
    HELION_CONVERSION,
    STORMCRAFT_CONVERSION,
} from 'constants/conversion';
import {renderArrow, renderLeftSideOfArrow, renderRightSideOfArrow} from './card/CardActions';

const actionTypes = ['Milestones', 'Awards', 'Std Projects', 'Conversions'] as Array<ActionType>;
type ActionType = 'Awards' | 'Milestones' | 'Std Projects' | 'Conversions';

function useActionSubItems(selectedAction: ActionType) {
    const loggedInPlayer = useLoggedInPlayer();

    return useTypedSelector(state => {
        if (selectedAction === 'Awards') {
            return getAwards(state);
        } else if (selectedAction === 'Milestones') {
            return getMilestones(state);
        } else if (selectedAction === 'Std Projects') {
            return getStandardProjects(state);
        } else if (selectedAction === 'Conversions') {
            const conversions = Object.values(DEFAULT_CONVERSIONS);
            if (loggedInPlayer.corporation.name === 'Helion') {
                conversions.push(HELION_CONVERSION);
            }
            if (loggedInPlayer.corporation.name === 'Stormcraft Incorporated') {
                conversions.push(STORMCRAFT_CONVERSION);
            }
            return conversions;
        }
    });
}

const CategoryListItem = styled(Flex)`
    &:hover {
        background-color: ${colors.DARK_4};
    }
`;

export function ActionTable() {
    const [selectedActionAndSubActionIndex, setSelectedActionAndSubActionIndex] = useState<
        [ActionType, number]
    >(['Awards', 0]);
    const [selectedAction] = selectedActionAndSubActionIndex;
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [
        prevSelectedSubItemIndexByActionType,
        setPrevSelectedSubItemIndexByActionType,
    ] = useState({
        Awards: 0,
        Milestones: 0,
        'Std Projects': 0,
        Conversions: 0,
    });

    return (
        <Flex
            flexDirection="column"
            className="action-table"
            style={{
                borderRadius: 3,
                border: '1px solid rgb(80, 80, 80)',
                background: 'rgb(53, 53, 53)',
                margin: '8px 8px 0',
                maxWidth: 500,
                width: '100%',
                justifySelf: 'center',
            }}
        >
            <Flex justifyContent="center" padding="8px 0">
                {actionTypes.map(actionType => (
                    <Flex
                        margin="0 4px 0 0"
                        padding="2px 4px"
                        style={{
                            borderRadius: 6,
                            ...(selectedAction === actionType && !isCollapsed
                                ? {
                                      background: `${colors.GOLD}`,
                                      border: `1px solid ${colors.GOLD}`,
                                      color: colors.TEXT_DARK_1,
                                      fontWeight: 600,
                                  }
                                : {border: '1px solid transparent', color: colors.GOLD}),
                        }}
                    >
                        <ActionTableHeader
                            onClick={() => {
                                if (actionType !== selectedAction) {
                                    const prevIndex =
                                        prevSelectedSubItemIndexByActionType[actionType];
                                    setIsCollapsed(false);
                                    setSelectedActionAndSubActionIndex([actionType, prevIndex]);
                                } else {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                        >
                            {actionType}
                        </ActionTableHeader>
                    </Flex>
                ))}
            </Flex>
            <AnimateHeight height={isCollapsed ? 0 : 'auto'} id="action-table">
                <Flex justifyContent="center">
                    <ActionTableInner
                        selectedActionAndSubActionIndex={selectedActionAndSubActionIndex}
                        onSelectNewSubItem={(index: number) => {
                            setSelectedActionAndSubActionIndex([selectedAction, index]);
                            setPrevSelectedSubItemIndexByActionType({
                                ...prevSelectedSubItemIndexByActionType,
                                [selectedAction]: index,
                            });
                        }}
                    />
                </Flex>
            </AnimateHeight>
        </Flex>
    );
}

const ActionTableHeader = styled(BlankButton)`
    text-transform: uppercase;
    white-space: nowrap;
    padding: 0;
    letter-spacing: 0.05em;
    font-size: 11px;
`;

function ActionTableInner({
    selectedActionAndSubActionIndex,
    onSelectNewSubItem,
}: {
    selectedActionAndSubActionIndex: [ActionType, number];
    onSelectNewSubItem: (subItemIndex: number) => void;
}) {
    const [selectedAction, selectedSubActionIndex] = selectedActionAndSubActionIndex;
    const subItems = useActionSubItems(selectedAction);
    const [hoveredAction, setHoverAction] = useState<number | null>(null);
    const setHoverItem = useCallback((index: number) => {
        setHoverAction(index);
    }, []);
    const throttledSetHoverItem = useMemo(() => throttle(100, setHoverItem), [setHoverItem]);
    const actionGuard = useActionGuard();
    const apiClient = useApiClient();
    const loggedInPlayer = useLoggedInPlayer();

    switch (selectedAction) {
        case 'Awards':
        case 'Milestones':
            return (
                <Flex maxWidth="500px" width="100%">
                    <Flex
                        flex="0 0 30%"
                        flexDirection="column"
                        overflow="auto"
                        style={{
                            borderRight: `1px solid ${colors.LIGHTEST_BG}`,
                        }}
                    >
                        {subItems?.map((_, index) => (
                            <CategoryListItem
                                onClick={() => onSelectNewSubItem(index)}
                                onMouseEnter={() => {
                                    throttledSetHoverItem(index);
                                }}
                                onMouseMove={() => {
                                    throttledSetHoverItem(index);
                                }}
                                onMouseLeave={() => {
                                    throttledSetHoverItem(null);
                                }}
                                style={{
                                    ...(selectedSubActionIndex === index
                                        ? {
                                              backgroundColor: colors.LIGHTEST_BG,
                                              color: colors.TEXT_DARK_1,
                                          }
                                        : {
                                              color: colors.TEXT_LIGHT_1,
                                          }),
                                }}
                            >
                                <ActionTableSubItem
                                    actionAndSubItemIndex={[
                                        selectedActionAndSubActionIndex[0],
                                        index,
                                    ]}
                                    isSelected={selectedSubActionIndex === index}
                                />
                            </CategoryListItem>
                        ))}
                    </Flex>
                    <Flex flex="0 0 70%" overflow="auto">
                        <ActionTableDetail
                            actionAndSubItemIndex={
                                hoveredAction !== null
                                    ? [selectedActionAndSubActionIndex[0], hoveredAction]
                                    : selectedActionAndSubActionIndex
                            }
                        />
                    </Flex>
                </Flex>
            );
        case 'Std Projects':
            return (
                <Flex
                    flexWrap="wrap"
                    justifyContent="center"
                    alignItems="center"
                    width="100%"
                    overflow="auto"
                >
                    {subItems?.map(subItem => {
                        const canPlay = actionGuard.canPlayStandardProject(subItem)[0];
                        const playStandardProjectAction = (
                            standardProjectAction: StandardProjectAction,
                            payment: Payment
                        ) => {
                            if (canPlay) {
                                apiClient.playStandardProjectAsync({
                                    payment,
                                    standardProjectAction,
                                });
                            }
                        };
                        const cost = getCostForStandardProject(subItem, loggedInPlayer);
                        const showPaymentPopover =
                            loggedInPlayer.corporation.name === 'Helion' &&
                            loggedInPlayer.resources[Resource.HEAT] > 0 &&
                            cost;

                        return (
                            <PaymentPopover
                                cost={cost}
                                onConfirmPayment={payment =>
                                    playStandardProjectAction(subItem, payment)
                                }
                                shouldHide={!showPaymentPopover}
                            >
                                <StandardProjectButton
                                    bgColorHover={colors.DARK_4}
                                    disabled={!canPlay}
                                    onClick={() => {
                                        playStandardProjectAction(subItem, {
                                            [Resource.MEGACREDIT]: cost,
                                        });
                                    }}
                                >
                                    <Flex
                                        flexDirection="column"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        position="relative"
                                    >
                                        <div className="standard-project-icon">
                                            <StandardProjectActionIcon
                                                actionType={(subItem as StandardProjectAction).type}
                                            />
                                        </div>
                                        <div className="standard-project-cost">
                                            <ResourceIcon
                                                name={Resource.MEGACREDIT}
                                                amount={
                                                    (subItem as StandardProjectAction).type ===
                                                    StandardProjectType.SELL_PATENTS
                                                        ? '+X'
                                                        : cost
                                                }
                                                size={20}
                                            />
                                        </div>
                                        <span style={{marginTop: 2}}>
                                            {getTextForStandardProject(
                                                (subItem as StandardProjectAction).type
                                            )}
                                        </span>
                                    </Flex>
                                </StandardProjectButton>
                            </PaymentPopover>
                        );
                    })}
                </Flex>
            );
        case 'Conversions':
            return (
                <Flex>
                    {subItems?.map(subItem => {
                        let [canDoConversion, reason] = actionGuard.canDoConversion(
                            subItem as Conversion
                        );
                        console.log(reason);
                        function doConversion() {
                            if (canDoConversion) {
                                apiClient.doConversionAsync({conversion: subItem as Conversion});
                            }
                        }

                        return (
                            <ConversionButton
                                bgColorHover={colors.DARK_4}
                                onClick={doConversion}
                                disabled={!canDoConversion}
                            >
                                <ConversionIconography conversion={subItem as Conversion} />
                                <span>{(subItem as Conversion).name}</span>
                            </ConversionButton>
                        );
                    })}
                </Flex>
            );
        default:
            throw spawnExhaustiveSwitchError(selectedAction);
    }
}

function ConversionIconography({conversion}: {conversion: Conversion}) {
    const loggedInPlayer = useLoggedInPlayer();
    return (
        <Flex justifyContent="center" alignItems="center" flex="auto">
            {renderLeftSideOfArrow({
                ...conversion,
                ...(conversion.name === 'Plants to Greenery'
                    ? {removeResource: {[Resource.PLANT]: 8 - (loggedInPlayer.plantDiscount || 0)}}
                    : {}),
            })}
            {renderArrow()}
            {renderRightSideOfArrow(conversion)}
        </Flex>
    );
}

const ConversionButton = styled(BlankButton)`
    color: ${colors.TEXT_LIGHT_1};
    border-radius: 3px;
    margin: 4px 8px;
    padding: 4px 8px;
    font-size: 0.8em;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const StandardProjectButton = styled(BlankButton)`
    color: ${colors.TEXT_LIGHT_1};
    border-radius: 3px;
    margin: 4px;
    padding: 4px;
    width: 100px;
    font-size: 0.7em;

    .standard-project-cost {
        position: absolute;
        opacity: 0;
    }

    div {
        transition: opacity 300ms;
    }

    &:hover {
        .standard-project-cost {
            opacity: 1;
        }
        .standard-project-icon {
            opacity: 0;
        }
    }
`;

const ActionTableSubItemBase = styled.div`
    margin: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    padding: 0;
    font-size: 10px;
    color: ${colors.TEXT_LIGHT_1};
    cursor: default;
`;

function ActionTableSubItem({
    actionAndSubItemIndex,
    isSelected,
}: {
    actionAndSubItemIndex: [ActionType, number];
    isSelected: boolean;
}) {
    const [actionType, subItemIndex] = actionAndSubItemIndex;
    const subItems = useActionSubItems(actionType);
    const subItem = subItems?.[subItemIndex] ?? '';
    const claimedMilestones = useTypedSelector(state =>
        state.common.claimedMilestones.map(cm => ({
            ...cm,
            claimedByPlayer: state.players[cm.claimedByPlayerIndex],
        }))
    );
    const fundedAwards = useTypedSelector(state =>
        state.common.fundedAwards.map(fa => ({
            ...fa,
            fundedByPlayer: state.players[fa.fundedByPlayerIndex],
        }))
    );
    const actionGuard = useActionGuard();

    const categoryName = (
        <span
            style={{
                padding: '2px 4px',
                marginRight: 4,
                ...(isSelected
                    ? {
                          color: colors.TEXT_DARK_1,
                      }
                    : {
                          color: colors.TEXT_LIGHT_1,
                      }),
            }}
        >
            {subItem}
        </span>
    );

    switch (actionType) {
        case 'Milestones': {
            const claimedByPlayer =
                claimedMilestones.find(
                    cm => cm.milestone.toLowerCase() === (subItem as string).toLowerCase()
                )?.claimedByPlayer ?? null;

            return (
                <ActionTableSubItemBase>
                    {categoryName}
                    {claimedByPlayer && (
                        <PlayerIcon
                            border={colors.TEXT_LIGHT_1}
                            playerIndex={claimedByPlayer.index}
                            size={10}
                        />
                    )}
                </ActionTableSubItemBase>
            );
        }
        case 'Awards':
            const fundedByPlayer =
                fundedAwards.find(
                    fa => fa.award.toLowerCase() === (subItem as string).toLowerCase()
                )?.fundedByPlayer ?? null;

            return (
                <ActionTableSubItemBase>
                    {categoryName}
                    {fundedByPlayer && (
                        <PlayerIcon
                            border={colors.TEXT_LIGHT_1}
                            playerIndex={fundedByPlayer.index}
                            size={10}
                        />
                    )}
                </ActionTableSubItemBase>
            );
        default:
            return <ActionTableSubItemBase>{categoryName}</ActionTableSubItemBase>;
    }
}

function ActionTableDetail({actionAndSubItemIndex}: {actionAndSubItemIndex: [ActionType, number]}) {
    const [actionType, subItemIndex] = actionAndSubItemIndex;
    const subItems = useActionSubItems(actionType);
    const players = useTypedSelector(state => state.players);
    const loggedInPlayer = useLoggedInPlayer();
    const actionGuard = useActionGuard();
    const apiClient = useApiClient();
    const state = useTypedSelector(state => state);
    const awardConfigsByAward = useAwardConfigsByAward();
    const claimedMilestones = useTypedSelector(state =>
        state.common.claimedMilestones.map(cm => ({
            ...cm,
            claimedByPlayer: state.players[cm.claimedByPlayerIndex],
        }))
    );

    switch (actionType) {
        case 'Milestones': {
            const milestone = subItems?.[subItemIndex] as string;
            const milestoneConfig = getMilestone(milestone);

            const claimedByPlayer =
                claimedMilestones.find(cm => cm.milestone.toLowerCase() === milestone.toLowerCase())
                    ?.claimedByPlayer ?? null;
            const canPlay = actionGuard.canClaimMilestone(milestone)[0];

            const showPaymentPopover =
                loggedInPlayer.corporation.name === 'Helion' &&
                loggedInPlayer.resources[Resource.HEAT] > 0;
            return (
                <Flex flexDirection="column" alignItems="flex-start" margin="8px" width="100%">
                    <Flex justifyContent="space-between" width="100%" alignItems="center">
                        <h3
                            className="display"
                            style={{
                                color: colors.TEXT_LIGHT_1,
                                marginBottom: 0,
                            }}
                        >
                            {milestone}
                        </h3>
                        {claimedByPlayer === null ? (
                            <PaymentPopover
                                cost={8}
                                onConfirmPayment={payment => {
                                    if (canPlay) {
                                        apiClient.claimMilestoneAsync({milestone, payment});
                                    }
                                }}
                                shouldHide={!showPaymentPopover}
                            >
                                <BlankButton
                                    disabled={!canPlay}
                                    style={{
                                        opacity: canPlay ? 1 : 0.3,
                                        backgroundColor: colors.LIGHT_2,
                                        fontSize: '0.6em',
                                        borderRadius: 2,
                                        padding: '0 4px',
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <span>Claim</span>
                                    <ResourceIcon
                                        margin="0 0 0 4px"
                                        name={Resource.MEGACREDIT}
                                        amount={8}
                                        size={12}
                                    />
                                </BlankButton>
                            </PaymentPopover>
                        ) : (
                            <PlayerCorpAndIcon
                                player={claimedByPlayer}
                                color={colors.TEXT_LIGHT_1}
                            />
                        )}
                    </Flex>

                    <Flex
                        style={{
                            fontSize: '10px',
                            color: colors.TEXT_LIGHT_2,
                            fontStyle: 'italic',
                        }}
                    >
                        {milestoneConfig.requirementText}
                    </Flex>
                    <Flex flexDirection="column" width="100%" marginTop="8px">
                        {players
                            .map(player => {
                                const quantity = convertAmountToNumber(
                                    milestoneConfig.amount,
                                    state,
                                    player
                                );
                                return {
                                    player,
                                    quantity,
                                };
                            })
                            .sort(
                                ({quantity: quantity1}, {quantity: quantity2}) =>
                                    quantity2 - quantity1
                            )
                            .map(({player, quantity}) => {
                                return (
                                    <Flex
                                        key={player.index}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        margin="4px 0"
                                        width="100%"
                                    >
                                        <PlayerCorpAndIcon
                                            player={player}
                                            color={colors.TEXT_LIGHT_1}
                                            style={{
                                                fontWeight: 400,
                                                fontSize: 12,
                                                color: colors.TEXT_LIGHT_1,
                                            }}
                                        />
                                        <span
                                            style={{
                                                marginLeft: 20,
                                                color: colors.TEXT_LIGHT_1,
                                                fontSize: 12,
                                            }}
                                        >
                                            {quantity}
                                        </span>
                                    </Flex>
                                );
                            })}
                    </Flex>
                </Flex>
            );
        }
        case 'Awards': {
            const award = subItems?.[subItemIndex] as string;
            const canPlay = actionGuard.canFundAward(award)[0];

            const isFree = loggedInPlayer.fundAward;
            const awardConfig = getAward(award);
            const cost = isFree ? 0 : awardConfigsByAward[award].cost;
            const fundAward = (award: string, payment: NumericPropertyCounter<Resource>) => {
                if (canPlay) {
                    if (isFree) {
                        apiClient.fundAwardAsync({award, payment: {}});
                    } else {
                        apiClient.fundAwardAsync({award, payment});
                    }
                }
            };
            const showPaymentPopover =
                loggedInPlayer.corporation.name === 'Helion' &&
                loggedInPlayer.resources[Resource.HEAT] > 0 &&
                !loggedInPlayer.fundAward;

            return (
                <Flex flexDirection="column" alignItems="flex-start" margin="8px" width="100%">
                    <Flex justifyContent="space-between" width="100%" alignItems="center">
                        <h3
                            className="display"
                            style={{
                                color: colors.TEXT_LIGHT_1,
                                marginBottom: 0,
                            }}
                        >
                            {award}
                        </h3>
                        {[null, undefined].includes(awardConfigsByAward[award]?.fundedByPlayer) ? (
                            <PaymentPopover
                                cost={cost}
                                onConfirmPayment={payment => {
                                    fundAward(award, payment);
                                }}
                                shouldHide={!showPaymentPopover}
                            >
                                <BlankButton
                                    disabled={!canPlay}
                                    style={{
                                        opacity: canPlay ? 1 : 0.3,
                                        backgroundColor: colors.LIGHT_2,
                                        fontSize: '0.6em',
                                        borderRadius: 2,
                                        padding: '0 4px',
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onClick={() => fundAward(award, {[Resource.MEGACREDIT]: cost})}
                                >
                                    <span>Fund</span>
                                    <ResourceIcon
                                        margin="0 0 0 4px"
                                        name={Resource.MEGACREDIT}
                                        amount={8}
                                        size={12}
                                    />
                                </BlankButton>
                            </PaymentPopover>
                        ) : (
                            <PlayerCorpAndIcon
                                player={awardConfigsByAward[award].fundedByPlayer}
                                color={colors.TEXT_LIGHT_1}
                            />
                        )}
                    </Flex>

                    <Flex
                        style={{
                            fontSize: '10px',
                            color: colors.TEXT_LIGHT_2,
                            fontStyle: 'italic',
                        }}
                    >
                        {awardConfig.description}
                    </Flex>
                    <Flex flexDirection="column" width="100%" marginTop="8px">
                        {players
                            .map(player => {
                                const quantity = convertAmountToNumber(
                                    awardConfig.amount,
                                    state,
                                    player
                                );
                                return {
                                    player,
                                    quantity,
                                };
                            })
                            .sort(
                                ({quantity: quantity1}, {quantity: quantity2}) =>
                                    quantity2 - quantity1
                            )
                            .map(({player, quantity}) => {
                                return (
                                    <Flex
                                        key={player.index}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        margin="4px 0"
                                        width="100%"
                                    >
                                        <PlayerCorpAndIcon
                                            player={player}
                                            color={colors.TEXT_LIGHT_1}
                                            style={{
                                                fontWeight: 400,
                                                fontSize: 12,
                                                color: colors.TEXT_LIGHT_1,
                                            }}
                                        />
                                        <span
                                            style={{
                                                marginLeft: 20,
                                                color: colors.TEXT_LIGHT_1,
                                                fontSize: 12,
                                            }}
                                        >
                                            {quantity}
                                        </span>
                                    </Flex>
                                );
                            })}
                    </Flex>
                </Flex>
            );
        }

        default:
            throw new Error('Unsupported action type for detail view');
    }
}
