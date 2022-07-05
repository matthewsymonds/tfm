import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {getAwardConfig, getAwards} from 'constants/awards';
import {Parameter, TileType} from 'constants/board';
import {Deck} from 'constants/card-types';
import {
    Conversion,
    DEFAULT_CONVERSIONS,
    HELION_CONVERSION,
    STORMCRAFT_CONVERSION,
} from 'constants/conversion';
import {
    getMilestoneConfig,
    getMilestones,
    MilestoneConfig,
} from 'constants/milestones';
import {Resource} from 'constants/resource-enum';
import {
    getStandardProjects,
    StandardProjectAction,
    StandardProjectType,
} from 'constants/standard-project';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {useWindowWidth} from 'hooks/use-window-width';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';
import {throttle} from 'throttle-debounce';
import spawnExhaustiveSwitchError from 'utils';
import {BlankButton} from './blank-button';
import {Board} from './board/board';
import {Box, Flex} from './box';
import {Button} from './button';
import {
    renderArrow,
    renderLeftSideOfArrow,
    renderRightSideOfArrow,
} from './card/CardActions';
import {Colonies} from './colonies';
import GlobalParams from './global-params';
import {GlobalParameterIcon} from './icons/global-parameter';
import {ColonyIcon} from './icons/other';
import {ProductionIcon} from './icons/production';
import {ResourceIcon} from './icons/resource';
import {TileIcon} from './icons/tile';
import {AwardsListViewWithDetail} from './list-with-detail-view/awards-list-with-detail-view';
import {MilestonesListViewWithDetail} from './list-with-detail-view/milestones-list-with-detail-view';
import {Notes} from './notes';
import {usePaymentPopover} from './popovers/payment-popover';
import {Turmoil} from './turmoil';
import {colors} from './ui';

const actionTypes: Array<ActionType> = [
    'Mars',
    'Actions',
    'Colonies',
    'Turmoil',
    'Notes',
];

type ActionType = 'Mars' | 'Actions' | 'Colonies' | 'Turmoil' | 'Notes';

export const ActionTable: React.FunctionComponent = () => {
    const [selectedTab, setSelectedTab] = useState<ActionType | ''>('');
    const player = useLoggedInPlayer();
    const windowWidth = useWindowWidth();

    useEffect(() => {
        if (windowWidth <= 1500 && selectedTab === '') {
            setSelectedTab('Mars');
        } else if (windowWidth > 1500 && selectedTab === 'Mars') {
            setSelectedTab('Actions');
        }
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
        windowWidth,
    ]);

    const isColoniesEnabled = useTypedSelector(state =>
        state.options?.decks.includes(Deck.COLONIES)
    );
    const isTurmoilEnabled = useTypedSelector(state =>
        state.options?.decks.includes(Deck.TURMOIL)
    );

    const visibleActionTypes = useTypedSelector(state =>
        actionTypes.filter(actionType => {
            if (actionType === 'Colonies') {
                return isColoniesEnabled;
            }
            if (actionType === 'Turmoil') {
                return isTurmoilEnabled;
            }
            if (actionType === 'Mars') {
                return windowWidth <= 1500;
            }

            return true;
        })
    );

    return (
        <Flex
            className="action-table"
            flexDirection="column"
            alignItems="flex-start"
            width="100%"
            maxWidth="798px"
            style={{justifySelf: 'center'}}
        >
            <Flex
                width="100%"
                flexWrap="wrap"
                flexShrink="0"
                className="action-table-buttons"
            >
                {visibleActionTypes.map(actionType => (
                    <Flex key={actionType} margin="0 4px 4px 0">
                        <ActionTableHeader
                            isSelected={selectedTab === actionType}
                            onClick={() => {
                                if (actionType !== selectedTab) {
                                    setSelectedTab(actionType);
                                } else {
                                    setSelectedTab('');
                                }
                            }}
                        >
                            {actionType}
                        </ActionTableHeader>
                    </Flex>
                ))}
            </Flex>
            <Flex flexDirection="column" alignItems="center" width="100%">
                {actionTypes.map(actionType => {
                    return (
                        <Box
                            key={actionType}
                            display={
                                actionType === selectedTab ? 'initial' : 'none'
                            }
                            width="100%"
                        >
                            <ActionTableInner selectedTab={actionType} />
                        </Box>
                    );
                })}
            </Flex>
        </Flex>
    );
};

const ActionTableHeader = styled(BlankButton)<{isSelected: boolean}>`
    white-space: nowrap;
    font-family: 'Ubuntu Condensed', sans-serif;
    padding: 0;
    font-weight: 500;
    font-size: 1.2em;
    @media (max-width: 420px) {
        font-size: 1em;
    }
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
                color: ${colors.GOLD};

                &:hover {
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

function ActionTableInner({selectedTab}: {selectedTab: ActionType | ''}) {
    const parameters = useTypedSelector(state => state.common.parameters);
    switch (selectedTab) {
        case '':
            return null;
        case 'Actions': {
            return (
                <Flex
                    flexDirection="column"
                    alignItems="flex-start"
                    maxWidth="500px"
                    className="action-table-actions"
                >
                    <BoardActionsHeader className="display">
                        Milestones
                    </BoardActionsHeader>
                    <MilestonesListViewWithDetail />

                    <BoardActionsHeader className="display">
                        Awards
                    </BoardActionsHeader>
                    <AwardsListViewWithDetail />

                    <BoardActionsHeader className="display">
                        Standard Projects
                    </BoardActionsHeader>
                    <StandardProjects />

                    <BoardActionsHeader className="display">
                        Conversions
                    </BoardActionsHeader>
                    <Conversions />
                </Flex>
            );
        }

        case 'Colonies':
            return <Colonies />;
        case 'Turmoil':
            return <Turmoil />;
        case 'Mars':
            return (
                <Flex className="board-and-params" marginTop="12px">
                    <Board />
                    <GlobalParams parameters={parameters} />
                </Flex>
            );
        case 'Notes':
            return <Notes />;
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
                    ? {
                          removeResource: {
                              [Resource.PLANT]:
                                  8 - (loggedInPlayer.plantDiscount || 0),
                          },
                      }
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
    const canPlay = actionGuard.canPlayStandardProject(
        standardProjectAction
    )[0];
    const cost = getCostForStandardProject(
        standardProjectAction,
        loggedInPlayer
    );

    const {collectPaymentAndPerformAction, triggerRef} =
        usePaymentPopover<HTMLButtonElement>({
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
                    <StandardProjectActionIcon
                        actionType={standardProjectAction.type}
                    />
                </div>
                <div className="standard-project-cost">
                    <ResourceIcon
                        name={Resource.MEGACREDIT}
                        amount={
                            standardProjectAction.type ===
                            StandardProjectType.SELL_PATENTS
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

function StandardProjects() {
    const standardProjects = useTypedSelector(state =>
        getStandardProjects(state)
    );

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
        <Flex justifyContent="center" width="100%" flexWrap="wrap">
            {conversions?.map(conversion => {
                let [canDoConversion, reason] =
                    actionGuard.canDoConversion(conversion);
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

function getCostForStandardProject(
    action: StandardProjectAction,
    player: PlayerState
) {
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

function StandardProjectActionIcon({
    actionType,
}: {
    actionType: StandardProjectType;
}) {
    switch (actionType) {
        case StandardProjectType.SELL_PATENTS:
            return (
                <Flex>
                    <span style={{marginRight: 2}}>-</span>
                    <ResourceIcon name={Resource.CARD} size={15} />
                </Flex>
            );
        case StandardProjectType.POWER_PLANT:
            return (
                <ProductionIcon
                    name={Resource.ENERGY}
                    size={24}
                    paddingSize={3}
                />
            );
        case StandardProjectType.ASTEROID:
            return (
                <GlobalParameterIcon
                    parameter={Parameter.TEMPERATURE}
                    size={24}
                />
            );
        case StandardProjectType.AQUIFER:
            return <TileIcon type={TileType.OCEAN} size={21} />;
        case StandardProjectType.GREENERY:
            return <TileIcon type={TileType.GREENERY} size={21} />;
        case StandardProjectType.CITY:
            return <TileIcon type={TileType.CITY} size={21} />;
        case StandardProjectType.COLONY:
            return <ColonyIcon size={16} />;
        case StandardProjectType.VENUS:
            return (
                <GlobalParameterIcon parameter={Parameter.VENUS} size={17} />
            );
        default:
            throw spawnExhaustiveSwitchError(actionType);
    }
}
