import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {getAward, getAwards} from 'constants/awards';
import {getMilestone, getMilestones} from 'constants/milestones';
import {getStandardProjects} from 'constants/standard-project';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useCallback, useMemo, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';
import {BlankButton} from './blank-button';
import {throttle} from 'throttle-debounce';
import {AwardPopover, useAwardConfigsByAward} from './board/board-actions/awards';
import {getTextForStandardProject} from './board/board-actions/standard-projects';
import {Flex} from './box';
import {colors} from './ui';
import {ResourceIcon} from './icons/resource';
import {Resource} from 'constants/resource-enum';
import PaymentPopover from './popovers/payment-popover';
import {NumericPropertyCounter} from 'constants/property-counter';

const actionTypes = ['Awards', 'Milestones', 'Std Projects', 'Conversions'] as Array<ActionType>;
type ActionType = 'Awards' | 'Milestones' | 'Std Projects' | 'Conversions';

const useActionSubItems = (selectedAction: ActionType) => {
    return useTypedSelector(state => {
        if (selectedAction === 'Awards') {
            return getAwards(state);
        } else if (selectedAction === 'Milestones') {
            return getMilestones(state);
        } else if (selectedAction === 'Std Projects') {
            return getStandardProjects(state).map(stdProj =>
                getTextForStandardProject(stdProj.type)
            );
        } else if (selectedAction === 'Conversions') {
            return ['Plants to Greenery', 'Heat to Temperature'];
        }
    });
};

const CategoryListItem = styled(Flex)`
    &:hover {
        background-color: ${colors.DARK_4};
    }
`;

export function ActionTable() {
    const [selectedActionAndSubActionIndex, setSelectedActionAndSubActionIndex] = useState<
        [ActionType, number]
    >(['Awards', 0]);
    const [selectedAction, selectedSubActionIndex] = selectedActionAndSubActionIndex;
    const [hoveredAction, setHoverAction] = useState<number | null>(null);
    const [
        prevSelectedSubItemIndexByActionType,
        setPrevSelectedSubItemIndexByActionType,
    ] = useState({
        Awards: 0,
        Milestones: 0,
        'Std Projects': 0,
        Conversions: 0,
    });
    const subItems = useActionSubItems(selectedAction);
    const setHoverItem = useCallback((index: number) => {
        setHoverAction(index);
    }, []);
    const throttledSetHoverItem = useMemo(() => throttle(100, setHoverItem), [setHoverItem]);

    return (
        <Flex flexDirection="column" className="action-table">
            <Flex justifyContent="center" padding="8px 0">
                {actionTypes.map(actionType => (
                    <Flex
                        margin="0 4px 0 0"
                        padding="2px 4px"
                        style={{
                            borderRadius: 6,
                            ...(selectedAction === actionType
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
                                    setSelectedActionAndSubActionIndex([actionType, prevIndex]);
                                }
                            }}
                        >
                            {actionType}
                        </ActionTableHeader>
                    </Flex>
                ))}
            </Flex>
            <Flex
                justifyContent="space-between"
                style={{
                    borderBottom: `1px solid ${colors.LIGHTEST_BG}`,
                    borderTop: `1px solid ${colors.LIGHTEST_BG}`,
                    height: 156,
                }}
            >
                <Flex
                    flex="0 0 30%"
                    flexDirection="column"
                    overflow="auto"
                    style={{
                        borderRight: `1px solid ${colors.LIGHTEST_BG}`,
                    }}
                >
                    {subItems?.map((subItem, index) => (
                        <CategoryListItem
                            onClick={() => {
                                setSelectedActionAndSubActionIndex([selectedAction, index]);
                                setPrevSelectedSubItemIndexByActionType({
                                    ...prevSelectedSubItemIndexByActionType,
                                    [selectedAction]: index,
                                });
                            }}
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
                                actionAndSubItemIndex={[selectedActionAndSubActionIndex[0], index]}
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

    if (actionType === 'Milestones') {
        const claimedByPlayer =
            claimedMilestones.find(cm => cm.milestone.toLowerCase() === subItem.toLowerCase())
                ?.claimedByPlayer ?? null;

        return (
            <ActionTableSubItemBase>
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

    return (
        <ActionTableSubItemBase>
            <span
                style={{
                    padding: '2px 4px',
                    marginLeft: 4,
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
        </ActionTableSubItemBase>
    );
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
                        {players.map(player => {
                            const quantity = convertAmountToNumber(
                                milestoneConfig.amount,
                                state,
                                player
                            );
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
                                cost={8}
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
                        {players.map(player => {
                            const quantity = convertAmountToNumber(
                                awardConfig.amount,
                                state,
                                player
                            );
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

        case 'Std Projects': {
        }

        default:
            return null;
    }
}
