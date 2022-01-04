import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {getAward, getAwards} from 'constants/awards';
import {Parameter, TileType} from 'constants/board';
import {Deck} from 'constants/card-types';
import {
    Conversion,
    DEFAULT_CONVERSIONS,
    HELION_CONVERSION,
    STORMCRAFT_CONVERSION,
} from 'constants/conversion';
import {getMilestone, getMilestones} from 'constants/milestones';
import {Resource} from 'constants/resource-enum';
import {
    getStandardProjects,
    StandardProjectAction,
    StandardProjectType,
} from 'constants/standard-project';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import AnimateHeight from 'react-animate-height';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';
import {throttle} from 'throttle-debounce';
import spawnExhaustiveSwitchError from 'utils';
import {BlankButton} from './blank-button';
import {Box, Flex} from './box';
import {renderArrow, renderLeftSideOfArrow, renderRightSideOfArrow} from './card/CardActions';
import {Colonies} from './colonies';
import {GlobalParameterIcon} from './icons/global-parameter';
import {ColonyIcon} from './icons/other';
import {ProductionIcon} from './icons/production';
import {ResourceIcon} from './icons/resource';
import {TileIcon} from './icons/tile';
import {PlayerPanels} from './player-panel/player-panels';
import {usePaymentPopover} from './popovers/payment-popover';
import {Turmoil} from './turmoil';
import {colors} from './ui';

const actionTypes = [
    'Prompt',
    'Players',
    'Standard Projects',
    'Milestones',
    'Awards',
    'Conversions',
    'Colonies',
    'Turmoil',
] as Array<ActionType>;
type ActionType =
    | 'Prompt'
    | 'Players'
    | 'Awards'
    | 'Milestones'
    | 'Standard Projects'
    | 'Conversions'
    | 'Colonies'
    | 'Turmoil';

function useActionSubItems(selectedAction: ActionType) {
    const loggedInPlayer = useLoggedInPlayer();

    return useTypedSelector(state => {
        if (selectedAction === 'Awards') {
            return getAwards(state);
        } else if (selectedAction === 'Milestones') {
            return getMilestones(state);
        } else if (selectedAction === 'Standard Projects') {
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

const TABLE_ITEMS = ['Milestones', 'Awards'];

type ActionPrompt = {
    text?: string | null;
    element?: React.ReactElement | null;
    buttonNeeded: boolean;
};

type ActionTableProps = {actionPrompt: ActionPrompt};

export const ActionTable: React.FunctionComponent<ActionTableProps> = ({
    actionPrompt,
}: ActionTableProps) => {
    const [selectedActionAndSubActionIndex, setSelectedActionAndSubActionIndex] = useState<
        [ActionType, number]
    >(['Prompt', 0]);
    const [selectedAction] = selectedActionAndSubActionIndex;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [
        prevSelectedSubItemIndexByActionType,
        setPrevSelectedSubItemIndexByActionType,
    ] = useState({
        Awards: 0,
        Milestones: 0,
        'Standard Projects': 0,
        Conversions: 0,
    });

    const player = useLoggedInPlayer();

    useEffect(() => {
        if (player.placeColony || player.tradeForFree) {
            setSelectedActionAndSubActionIndex(['Colonies', 0]);
        } else if (
            player.placeDelegatesInOneParty ||
            player.removeNonLeaderDelegate ||
            player.exchangeNeutralNonLeaderDelegate
        ) {
            setSelectedActionAndSubActionIndex(['Turmoil', 0]);
        }
    }, [
        player.placeColony,
        player.tradeForFree,
        player.placeDelegatesInOneParty,
        player.removeNonLeaderDelegate,
        player.exchangeNeutralNonLeaderDelegate,
    ]);

    useEffect(() => {
        if (!actionPrompt?.element || !actionPrompt?.buttonNeeded) {
            setSelectedActionAndSubActionIndex(['Players', 0]);
        } else {
            setSelectedActionAndSubActionIndex(['Prompt', 0]);
        }
    }, [!actionPrompt?.buttonNeeded, !actionPrompt?.element]);

    const isColoniesEnabled = useTypedSelector(state =>
        state.options.decks.includes(Deck.COLONIES)
    );
    const isTurmoilEnabled = useTypedSelector(state => state.options.decks.includes(Deck.TURMOIL));

    const visibleActionTypes = useTypedSelector(state =>
        actionTypes.filter(actionType => {
            if (actionType === 'Prompt') {
                return !!(actionPrompt.buttonNeeded && actionPrompt.element);
            }
            if (actionType === 'Colonies') {
                return isColoniesEnabled;
            }
            if (actionType === 'Turmoil') {
                return isTurmoilEnabled;
            }

            return true;
        })
    );

    return (
        <Flex
            className="action-table"
            flexDirection="column"
            alignItems="flex-start"
            marginLeft="8px"
            marginRight="8px"
            marginBottom="8px"
            marginTop="4px"
            width="100%"
            maxWidth="100%"
            style={{justifySelf: 'center'}}
        >
            <Flex
                justifyContent="flex-start"
                width="100%"
                flexWrap="wrap"
                flexShrink="0"
                padding="6px 0"
                marginLeft="8px"
                marginRight="8px"
            >
                {visibleActionTypes.map(actionType => (
                    <Flex
                        key={actionType}
                        margin="0 4px 4px 0"
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
                            {actionType === 'Prompt' ? actionPrompt?.text ?? 'Action' : actionType}
                        </ActionTableHeader>
                    </Flex>
                ))}
            </Flex>
            <Flex
                flexDirection="column"
                style={{
                    borderRadius: 3,
                    border: TABLE_ITEMS.includes(selectedAction)
                        ? '1px solid rgb(80, 80, 80)'
                        : '1px solid transparent',
                    background: TABLE_ITEMS.includes(selectedAction)
                        ? 'rgb(53, 53, 53)'
                        : 'transparent',
                    maxWidth: TABLE_ITEMS.includes(selectedAction) ? 500 : 'initial',
                    width: '100%',
                    justifySelf: 'center',
                }}
            >
                <AnimateHeight height={isCollapsed ? 0 : 'auto'} id="action-table-inner">
                    <Flex>
                        <ActionTableInner
                            actionType={selectedActionAndSubActionIndex[0]}
                            actionPrompt={actionPrompt}
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
        </Flex>
    );
};

export const useAwardConfigsByAward = () => {
    return useTypedSelector(
        state =>
            getAwards(state).reduce((acc, award) => {
                const isFunded = state.common.fundedAwards.map(fa => fa.award).includes(award);
                let fundedByPlayer;
                if (isFunded) {
                    const {fundedByPlayerIndex} = state.common.fundedAwards.find(
                        fa => fa.award.toLowerCase() === award.toLowerCase()
                    )!;
                    fundedByPlayer = state.players[fundedByPlayerIndex];
                }
                acc[award] = {
                    isFunded,
                    cost: getCostForAward(award, state),
                    fundedByPlayer,
                };
                return acc;
            }, {}),
        (prev, next) => {
            // Brief equality check.
            for (const award in prev) {
                if (prev[award].fundedByPlayer !== next[award].fundedByPlayer) {
                    return false;
                }
            }
            return true;
        }
    );
};

function FundAwardButton({award}: {award: string}) {
    const actionGuard = useActionGuard();
    const apiClient = useApiClient();
    const canPlay = actionGuard.canFundAward(award)[0];
    const awardConfigsByAward = useAwardConfigsByAward();
    const loggedInPlayer = useLoggedInPlayer();

    const isFree = loggedInPlayer.fundAward;
    const cost = isFree ? 0 : awardConfigsByAward[award].cost;
    const {collectPaymentAndPerformAction, triggerRef} = usePaymentPopover<HTMLButtonElement>({
        onConfirmPayment: payment => {
            if (canPlay) {
                if (isFree) {
                    apiClient.fundAwardAsync({award, payment: {}});
                } else {
                    apiClient.fundAwardAsync({award, payment});
                }
            }
        },
        opts: {
            type: 'action',
            cost,
            action: {},
        },
    });

    return (
        <BlankButton
            disabled={!canPlay}
            ref={triggerRef}
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
            onClick={collectPaymentAndPerformAction}
        >
            <span>Fund</span>
            <ResourceIcon margin="0 0 0 4px" name={Resource.MEGACREDIT} amount={8} size={12} />
        </BlankButton>
    );
}

function ClaimMilestoneButton({milestone}: {milestone: string}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const canPlay = actionGuard.canClaimMilestone(milestone)[0];
    const {collectPaymentAndPerformAction, triggerRef} = usePaymentPopover<HTMLButtonElement>({
        onConfirmPayment: payment => {
            if (canPlay) {
                apiClient.claimMilestoneAsync({milestone, payment});
            }
        },
        opts: {
            type: 'action',
            cost: 8,
            action: {},
        },
    });

    return (
        <BlankButton
            ref={triggerRef}
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
            onClick={collectPaymentAndPerformAction}
        >
            <span>Claim</span>
            <ResourceIcon margin="0 0 0 4px" name={Resource.MEGACREDIT} amount={8} size={12} />
        </BlankButton>
    );
}

const ActionTableHeader = styled(BlankButton)`
    text-transform: uppercase;
    white-space: nowrap;
    padding: 0;
    letter-spacing: 0.05em;
    font-size: 11px;
    margin-bottom: 2px;
`;

function ActionTableInner({
    selectedActionAndSubActionIndex,
    onSelectNewSubItem,
    actionPrompt,
    actionType,
}: {
    selectedActionAndSubActionIndex: [ActionType, number];
    onSelectNewSubItem: (subItemIndex: number) => void;
    actionPrompt: ActionPrompt;
    actionType: ActionType;
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

    switch (selectedAction) {
        case 'Prompt':
            return <Flex flexDirection="column">{actionPrompt?.element ?? null}</Flex>;
        case 'Players':
            return (
                <Box width="100%">
                    <PlayerPanels />
                </Box>
            );
        case 'Awards':
        case 'Milestones':
            return (
                <Flex width="100%">
                    <Flex
                        flex="0 0 30%"
                        flexDirection="column"
                        overflow="auto"
                        style={{
                            borderRight: `1px solid ${colors.DARK_4}`,
                        }}
                    >
                        {subItems?.map((subItem, index) => (
                            <CategoryListItem
                                key={subItem}
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
        case 'Standard Projects':
            return (
                <Flex flexWrap="wrap" alignItems="center" width="100%" overflow="auto">
                    {subItems?.map(subItem => {
                        return (
                            <StandardProjectButton
                                standardProjectAction={subItem}
                                key={(subItem as StandardProjectAction).type}
                            />
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
                        function doConversion() {
                            if (canDoConversion) {
                                apiClient.doConversionAsync({conversion: subItem as Conversion});
                            }
                        }

                        return (
                            <ConversionButton
                                key={(subItem as Conversion).name}
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
        case 'Colonies':
            return <Colonies />;
        case 'Turmoil':
            return <Turmoil />;
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
    font-size: 0.7em;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

function StandardProjectButton({
    standardProjectAction,
}: {
    standardProjectAction: StandardProjectAction;
}) {
    const actionGuard = useActionGuard();
    const apiClient = useApiClient();
    const loggedInPlayer = useLoggedInPlayer();
    const canPlay = actionGuard.canPlayStandardProject(standardProjectAction)[0];
    const cost = getCostForStandardProject(standardProjectAction, loggedInPlayer);

    const {collectPaymentAndPerformAction, triggerRef} = usePaymentPopover<HTMLButtonElement>({
        onConfirmPayment: payment => {
            if (canPlay) {
                apiClient.playStandardProjectAsync({
                    payment,
                    standardProjectAction,
                });
            }
        },
        opts: {
            type: 'action',
            cost,
            action: {},
        },
    });

    return (
        <StandardProjectButtonInner
            ref={triggerRef}
            bgColorHover={colors.DARK_4}
            disabled={!canPlay}
            onClick={collectPaymentAndPerformAction}
        >
            <Flex
                flexDirection="column"
                alignItems="center"
                justifyContent="space-between"
                position="relative"
            >
                <div className="standard-project-icon">
                    <StandardProjectActionIcon actionType={standardProjectAction.type} />
                </div>
                <div className="standard-project-cost">
                    <ResourceIcon
                        name={Resource.MEGACREDIT}
                        amount={
                            standardProjectAction.type === StandardProjectType.SELL_PATENTS
                                ? '+X'
                                : cost
                        }
                        size={20}
                    />
                </div>
                <span style={{marginTop: 2}}>
                    {getTextForStandardProject(standardProjectAction.type)}
                </span>
            </Flex>
        </StandardProjectButtonInner>
    );
}

const StandardProjectButtonInner = styled(BlankButton)`
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
                            <ClaimMilestoneButton milestone={milestone} />
                        ) : (
                            <PlayerCorpAndIcon
                                player={claimedByPlayer}
                                color={colors.TEXT_LIGHT_1}
                                style={{
                                    fontWeight: 500,
                                    fontSize: '0.7em',
                                }}
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
            const awardConfig = getAward(award);

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
                            <FundAwardButton award={award} />
                        ) : (
                            <PlayerCorpAndIcon
                                style={{
                                    fontSize: '0.7em',
                                    fontWeight: 500,
                                }}
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
                                                fontWeight: 500,
                                                fontSize: '0.7em',
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

function getCostForAward(award: string, state: GameState) {
    const fundedIndex = state.common.fundedAwards.findIndex(
        config => config.award.toLowerCase() === award.toLowerCase()
    );
    if (fundedIndex !== -1) {
        return [8, 14, 20][fundedIndex];
    } else {
        return [8, 14, 20, 20][state.common.fundedAwards.length];
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
function getTextForStandardProject(standardProject: StandardProjectType) {
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
        case StandardProjectType.VENUS:
            return 'Venus';
        case StandardProjectType.COLONY:
            return 'Colony';
        default:
            throw spawnExhaustiveSwitchError(standardProject);
    }
}

function StandardProjectActionIcon({actionType}: {actionType: StandardProjectType}) {
    switch (actionType) {
        case StandardProjectType.SELL_PATENTS:
            return (
                <Flex>
                    <span style={{marginRight: 2}}>-</span>
                    <ResourceIcon name={Resource.CARD} size={15} />
                </Flex>
            );
        case StandardProjectType.POWER_PLANT:
            return <ProductionIcon name={Resource.ENERGY} size={24} paddingSize={3} />;
        case StandardProjectType.ASTEROID:
            return <GlobalParameterIcon parameter={Parameter.TEMPERATURE} size={24} />;
        case StandardProjectType.AQUIFER:
            return <TileIcon type={TileType.OCEAN} size={21} />;
        case StandardProjectType.GREENERY:
            return <TileIcon type={TileType.GREENERY} size={21} />;
        case StandardProjectType.CITY:
            return <TileIcon type={TileType.CITY} size={21} />;
        case StandardProjectType.COLONY:
            return <ColonyIcon size={16} />;
        case StandardProjectType.VENUS:
            return <GlobalParameterIcon parameter={Parameter.VENUS} size={17} />;
        default:
            throw spawnExhaustiveSwitchError(actionType);
    }
}
