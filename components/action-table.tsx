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
import React, {useEffect, useMemo, useState} from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';
import {throttle} from 'throttle-debounce';
import spawnExhaustiveSwitchError from 'utils';
import {BlankButton} from './blank-button';
import {Box, Flex} from './box';
import {Button} from './button';
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

const actionTypes: Array<ActionType> = ['Prompt', 'Players', 'Actions', 'Colonies', 'Turmoil'];

type ActionType = 'Prompt' | 'Players' | 'Actions' | 'Colonies' | 'Turmoil';

const CategoryListItem = styled(Flex)<{isSelected: boolean}>`
    border-radius: 4px;
    margin: 2px 0;
    padding: 4px 6px;
    font-size: 0.8em;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    cursor: default;
    color: ${colors.TEXT_LIGHT_1};
    transition: 200ms all;

    ${props => {
        if (props.isSelected) {
            return `
                background: ${colors.DARK_2};
            `;
        } else {
            return `
                opacity: 0.4;

                &:hover {
                    opacity: 0.7;
                }
            `;
        }
    }}

    &:hover {
        background-color: ${colors.DARK_2};

        &:active {
            transform: scale(0.98);
        }
    }
`;

type ActionPrompt = {
    text?: string | null;
    element?: React.ReactElement | null;
    buttonNeeded: boolean;
};

type ActionTableProps = {actionPrompt: ActionPrompt};

export const ActionTable: React.FunctionComponent<ActionTableProps> = ({
    actionPrompt,
}: ActionTableProps) => {
    const [selectedTab, setSelectedTab] = useState<ActionType>('Prompt');
    const player = useLoggedInPlayer();

    useEffect(() => {
        if (player.tradeForFree) {
            setSelectedTab('Colonies');
        } else if (
            player.placeDelegatesInOneParty ||
            player.removeNonLeaderDelegate ||
            player.exchangeNeutralNonLeaderDelegate
        ) {
            setSelectedTab('Turmoil');
        }
    }, [
        player.tradeForFree,
        player.placeDelegatesInOneParty,
        player.removeNonLeaderDelegate,
        player.exchangeNeutralNonLeaderDelegate,
    ]);

    useEffect(() => {
        if (!actionPrompt?.element || !actionPrompt?.buttonNeeded) {
            setSelectedTab('Players');
        } else {
            setSelectedTab('Prompt');
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
                justifyContent="center"
                width="100%"
                flexWrap="wrap"
                flexShrink="0"
                padding="6px 0"
            >
                {visibleActionTypes.map(actionType => (
                    <Flex key={actionType} margin="0 4px 4px 0">
                        <ActionTableHeader
                            isSelected={selectedTab === actionType}
                            onClick={() => {
                                if (actionType !== selectedTab) {
                                    setSelectedTab(actionType);
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
                justifySelf="center"
                alignItems="center"
                width="100%"
                marginTop="-8px"
            >
                {actionTypes.map(actionType => {
                    return (
                        <Box
                            key={actionType}
                            display={actionType === selectedTab ? 'initial' : 'none'}
                            maxWidth="100%"
                        >
                            <ActionTableInner
                                selectedTab={actionType}
                                actionPrompt={actionPrompt}
                            />
                        </Box>
                    );
                })}
            </Flex>
        </Flex>
    );
};

export const useAwardConfigsByAward = () => {
    return useTypedSelector(
        state =>
            getAwards(state).reduce<{
                [key: string]: {
                    isFunded: boolean;
                    cost: number;
                    fundedByPlayer: PlayerState | null;
                };
            }>((acc, award) => {
                const isFunded = state.common.fundedAwards.map(fa => fa.award).includes(award);
                let fundedByPlayer;
                if (isFunded) {
                    const {fundedByPlayerIndex} = state.common.fundedAwards.find(
                        fa => fa.award.toLowerCase() === award.toLowerCase()
                    )!;
                    fundedByPlayer = state.players[fundedByPlayerIndex];
                } else {
                    fundedByPlayer = null;
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
                if (!next[award]) return false;
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
        <Button buttonRef={triggerRef} disabled={!canPlay} onClick={collectPaymentAndPerformAction}>
            <span>Fund</span>
            <ResourceIcon margin="0 0 0 4px" name={Resource.MEGACREDIT} amount={cost} size={16} />
        </Button>
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
        <Button buttonRef={triggerRef} disabled={!canPlay} onClick={collectPaymentAndPerformAction}>
            <span>Claim</span>
            <ResourceIcon margin="0 0 0 4px" name={Resource.MEGACREDIT} amount={8} size={16} />
        </Button>
    );
}

const ActionTableHeader = styled(BlankButton)<{isSelected: boolean}>`
    white-space: nowrap;
    font-family: 'Ubuntu Condensed', sans-serif;
    padding: 0;
    font-weight: 500;
    font-size: 1.2em;
    margin-bottom: 2px;
    padding: 6px 12px;
    transition: all 100ms;
    border-radius: 4px;

    ${props => {
        if (props.isSelected) {
            return `
                color: ${colors.GOLD};
                background: ${colors.DARK_2};
            `;
        } else {
            return `
                opacity: 0.4;
                color: ${colors.GOLD};

                &:hover {
                    opacity: 0.7;
                    background: ${colors.DARK_2};
                }
            `;
        }
    }}
`;

const BoardActionsHeader = styled.p`
    margin: 0 0 4px 6px;
    color: ${colors.YELLOW};
    opacity: 0.8;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
`;

function ActionTableInner({
    selectedTab,
    actionPrompt,
}: {
    selectedTab: ActionType;
    actionPrompt: ActionPrompt;
}) {
    switch (selectedTab) {
        case 'Prompt':
            return <Flex flexDirection="column">{actionPrompt?.element ?? null}</Flex>;
        case 'Players':
            return (
                <Box width="100%">
                    <PlayerPanels />
                </Box>
            );
        case 'Actions': {
            return (
                <Flex flexDirection="column" alignItems="flex-start" maxWidth="500px">
                    <BoardActionsHeader className="display">Milestones</BoardActionsHeader>
                    <MilestonesTable />

                    <BoardActionsHeader className="display">Awards</BoardActionsHeader>
                    <AwardsTable />

                    <BoardActionsHeader className="display">Standard Projects</BoardActionsHeader>
                    <StandardProjects />

                    <BoardActionsHeader className="display">Conversions</BoardActionsHeader>
                    <Conversions />
                </Flex>
            );
        }

        case 'Colonies':
            return <Colonies />;
        case 'Turmoil':
            return <Turmoil />;
        default:
            throw spawnExhaustiveSwitchError(selectedTab);
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
    border-radius: 4px;
    margin: 4px 8px;
    padding: 4px 8px;
    min-width: 150px;
    font-size: 0.8em;
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
            bgColorHover={colors.DARK_2}
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
    border-radius: 4px;
    margin: 4px;
    padding: 4px;
    min-width: 115px;
    font-size: 0.8em;

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

const AwardsOrMilestonesTableBase = styled(Flex)`
    margin-bottom: 16px;
    box-sizing: border-box;
    width: 100%;
`;

const AwardOrMilestoneDetailContainer = styled(Flex)`
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    margin-left: 4px;
    padding: 8px;
    border-radius: 4px;
    background: ${colors.DARK_2};
`;

function MilestonesTable() {
    const milestones = useTypedSelector(state => getMilestones(state));
    const [selectedMilestone, setSelectedMilestone] = useState(milestones[0]);
    const [hoveredMilestone, setHoveredMilestone] = useState(null);
    const claimedMilestones = useTypedSelector(state =>
        state.common.claimedMilestones.map(cm => ({
            ...cm,
            claimedByPlayer: state.players[cm.claimedByPlayerIndex],
        }))
    );
    const state = useTypedSelector(state => state);
    const players = useTypedSelector(state => state.players);
    const throttledSetHoveredMilestone = useMemo(() => throttle(100, setHoveredMilestone), [
        setHoveredMilestone,
    ]);
    const visibleMilestone = hoveredMilestone ?? selectedMilestone;
    const visibleClaimedByPlayer =
        claimedMilestones.find(cm => cm.milestone.toLowerCase() === visibleMilestone.toLowerCase())
            ?.claimedByPlayer ?? null;
    const milestoneConfig = getMilestone(visibleMilestone);

    const gameName = useTypedSelector(state => state.name);

    useEffect(() => {
        setSelectedMilestone(milestones[0]);
        setHoveredMilestone(null);
    }, [gameName, milestones[0]]);

    if (!milestoneConfig) {
        return null;
    }

    return (
        <AwardsOrMilestonesTableBase>
            <Flex flex="0 0 30%" flexDirection="column" overflow="auto">
                {milestones?.map(milestone => {
                    const claimedByPlayer = claimedMilestones.find(cm => cm.milestone === milestone)
                        ?.claimedByPlayer;
                    return (
                        <CategoryListItem
                            key={milestone}
                            onClick={() => setSelectedMilestone(milestone)}
                            onMouseEnter={() => {
                                throttledSetHoveredMilestone(milestone);
                            }}
                            onMouseMove={() => {
                                throttledSetHoveredMilestone(milestone);
                            }}
                            onMouseLeave={() => {
                                throttledSetHoveredMilestone(null);
                            }}
                            isSelected={selectedMilestone === milestone}
                        >
                            {milestone}
                            {claimedByPlayer && (
                                <PlayerIcon
                                    border={colors.TEXT_LIGHT_1}
                                    playerIndex={claimedByPlayer.index}
                                    size={10}
                                    style={{marginLeft: 4}}
                                />
                            )}
                        </CategoryListItem>
                    );
                })}
            </Flex>
            <Flex flex="0 0 70%" overflow="auto">
                <AwardOrMilestoneDetailContainer>
                    <Flex
                        justifyContent="space-between"
                        width="100%"
                        alignItems="center"
                        position="relative"
                    >
                        <h3
                            className="display"
                            style={{
                                color: colors.TEXT_LIGHT_1,
                                marginBottom: 0,
                            }}
                        >
                            {visibleMilestone}
                        </h3>
                        {visibleClaimedByPlayer === null ? (
                            <Box position="absolute" right="0">
                                <ClaimMilestoneButton milestone={visibleMilestone} />
                            </Box>
                        ) : (
                            <PlayerCorpAndIcon
                                player={visibleClaimedByPlayer}
                                color={colors.TEXT_LIGHT_1}
                                style={{
                                    fontWeight: 500,
                                    fontSize: '0.9em',
                                }}
                            />
                        )}
                    </Flex>

                    <Flex
                        style={{
                            fontSize: '10px',
                            color: colors.TEXT_LIGHT_2,
                            fontStyle: 'italic',
                            marginTop: 2,
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
                                            includeUsername={true}
                                            player={player}
                                            color={colors.TEXT_LIGHT_1}
                                            style={{
                                                fontWeight: 500,
                                                fontSize: '0.8em',
                                            }}
                                        />
                                        <span
                                            style={{
                                                color: colors.TEXT_LIGHT_1,
                                                fontSize: '0.8em',
                                            }}
                                        >
                                            {quantity}
                                        </span>
                                    </Flex>
                                );
                            })}
                    </Flex>
                </AwardOrMilestoneDetailContainer>
            </Flex>
        </AwardsOrMilestonesTableBase>
    );
}

function AwardsTable() {
    const awardConfigsByAward = useAwardConfigsByAward();
    const awards = useTypedSelector(state => getAwards(state));
    const [selectedAward, setSelectedAward] = useState(awards[0]);
    const [hoveredAward, setHoveredAward] = useState(null);
    const throttledSetHoveredAward = useMemo(() => throttle(100, setHoveredAward), [
        setHoveredAward,
    ]);

    const players = useTypedSelector(state => state.players);
    const state = useTypedSelector(state => state);
    const visibleAward = hoveredAward ?? selectedAward;
    const visibleAwardConfig = awardConfigsByAward[visibleAward];
    const hydratedAward = getAward(visibleAward);

    const gameName = useTypedSelector(state => state.name);

    useEffect(() => {
        setSelectedAward(awards[0]);
        setHoveredAward(null);
    }, [gameName, awards[0]]);

    if (!visibleAwardConfig) return null;

    return (
        <AwardsOrMilestonesTableBase>
            <Flex flex="0 0 30%" flexDirection="column" overflow="auto">
                {awards?.map((award, index) => {
                    const awardConfig = awardConfigsByAward[award];
                    return (
                        <CategoryListItem
                            key={award}
                            onClick={() => setSelectedAward(award)}
                            onMouseEnter={() => {
                                throttledSetHoveredAward(award);
                            }}
                            onMouseMove={() => {
                                throttledSetHoveredAward(award);
                            }}
                            onMouseLeave={() => {
                                throttledSetHoveredAward(null);
                            }}
                            isSelected={selectedAward === award}
                        >
                            {award}
                            {awardConfig.fundedByPlayer && (
                                <PlayerIcon
                                    border={colors.TEXT_LIGHT_1}
                                    playerIndex={awardConfig.fundedByPlayer.index}
                                    size={10}
                                    style={{marginLeft: 4}}
                                />
                            )}
                        </CategoryListItem>
                    );
                })}
            </Flex>
            <Flex flex="0 0 70%" overflow="auto">
                <AwardOrMilestoneDetailContainer>
                    <Flex
                        justifyContent="space-between"
                        width="100%"
                        alignItems="center"
                        position="relative"
                    >
                        <h3
                            className="display"
                            style={{
                                color: colors.TEXT_LIGHT_1,
                                marginBottom: 0,
                            }}
                        >
                            {visibleAward}
                        </h3>
                        {visibleAwardConfig.fundedByPlayer === null ? (
                            <Box position="absolute" right="0">
                                <FundAwardButton award={visibleAward} />
                            </Box>
                        ) : (
                            <PlayerCorpAndIcon
                                style={{
                                    fontSize: '0.9em',
                                    fontWeight: 500,
                                }}
                                player={visibleAwardConfig.fundedByPlayer}
                                color={colors.TEXT_LIGHT_1}
                            />
                        )}
                    </Flex>

                    <Flex
                        style={{
                            fontSize: '10px',
                            color: colors.TEXT_LIGHT_2,
                            fontStyle: 'italic',
                            marginTop: 2,
                        }}
                    >
                        {hydratedAward.description}
                    </Flex>
                    <Flex flexDirection="column" width="100%" marginTop="8px">
                        {players
                            .map(player => {
                                const quantity = convertAmountToNumber(
                                    hydratedAward.amount,
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
                                            includeUsername={true}
                                            player={player}
                                            color={colors.TEXT_LIGHT_1}
                                            style={{
                                                fontWeight: 500,
                                                fontSize: '0.8em',
                                            }}
                                        />
                                        <span
                                            style={{
                                                color: colors.TEXT_LIGHT_1,
                                                fontSize: '0.8em',
                                            }}
                                        >
                                            {quantity}
                                        </span>
                                    </Flex>
                                );
                            })}
                    </Flex>
                </AwardOrMilestoneDetailContainer>
            </Flex>
        </AwardsOrMilestonesTableBase>
    );
}

function StandardProjects() {
    const standardProjects = useTypedSelector(state => getStandardProjects(state));

    return (
        <Flex
            flexWrap="wrap"
            alignItems="center"
            justifyContent="center"
            width="100%"
            overflow="auto"
            marginBottom="16px"
        >
            {standardProjects?.map(standardProject => {
                return (
                    <StandardProjectButton
                        standardProjectAction={standardProject}
                        key={standardProject.type}
                    />
                );
            })}
        </Flex>
    );
}

function Conversions() {
    const loggedInPlayer = useLoggedInPlayer();
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const conversions = useMemo(() => {
        const conversions = Object.values(DEFAULT_CONVERSIONS);
        if (loggedInPlayer.corporation.name === 'Helion') {
            conversions.push(HELION_CONVERSION);
        }
        if (loggedInPlayer.corporation.name === 'Stormcraft Incorporated') {
            conversions.push(STORMCRAFT_CONVERSION);
        }
        return conversions;
    }, [loggedInPlayer.corporation]);

    return (
        <Flex justifyContent="center" width="100%">
            {conversions?.map(conversion => {
                let [canDoConversion, reason] = actionGuard.canDoConversion(conversion);
                function doConversion() {
                    if (canDoConversion) {
                        apiClient.doConversionAsync({conversion: conversion});
                    }
                }

                return (
                    <ConversionButton
                        key={conversion.name}
                        bgColorHover={colors.DARK_2}
                        onClick={doConversion}
                        disabled={!canDoConversion}
                    >
                        <ConversionIconography conversion={conversion} />
                        <span>{(conversion as Conversion).name}</span>
                    </ConversionButton>
                );
            })}
        </Flex>
    );
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
