import {Action} from 'constants/action';
import {
    getColony,
    MAX_NUM_COLONIES,
    SerializedColony,
} from 'constants/colonies';
import {PLAYER_COLORS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useRef, useState} from 'react';
import {useTypedSelector} from 'reducer';
import {getEligibleTradeIncomes} from 'selectors/get-eligible-trade-incomes';
import {getValidTradePayment} from 'selectors/valid-trade-payment';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {Button} from './button';
import {BaseActionIconography} from './card/CardIconography';
import {ResourceIcon} from './icons/resource';
import {Popover} from './popover';
import {SelectButtons} from './select-buttons';
import {colors} from './ui';

const COLONY_PLACEMENT_BONUS_BORDER = 'rgba(40,40,40,.5)';
const COLONY_PLACEMENT_BONUS_BORDER_STARTING_STEP =
    'linear-gradient(to top, #eee, rgba(40,40,40,0))';

const COLONY_PLACEMENT_BONUS_BACKGROUND = 'rgba(255,255,255,.3)';
const COLONY_PLACEMENT_BONUS_BACKGROUND_STARTING_STEP =
    'linear-gradient(to bottom, #ddd, rgba(80,80,80))';

const Cube = styled.div<{color?: string}>`
    background: ${props => props.color ?? '#444'};
    border: 1px solid #ccc;
    width: 28px;
    height: 28px;
    &:hover {
        opacity: 0.1;
    }
    transition: opacity 0.3s;
    position: absolute;
`;

const ColonyBase = styled.div<{
    backgroundColor: string;
    reverseBackground?: boolean;
}>`
    width: 300px;
    height: 156px;
    display: flex;
    border-radius: 82px;
    flex-shrink: 0;
    background: gray;
    margin: 4px 8px;
    position: relative;
    position: relative;
    border-size: 4px;
    background: linear-gradient(
        ${props => (props.reverseBackground ? 'to left' : 'to right')},
        ${props => props.backgroundColor} 0%,
        #333 75%
    );
`;

const ColonyTileInner = styled.div<{
    backgroundColor: string;
    reverseBackground?: boolean;
}>`
    content: '';
    width: 294px;
    height: 150px;
    left: 4px;
    background: radial-gradient(
        circle at center
            ${props => (props.reverseBackground ? 'right' : 'left')},
        ${props => props.backgroundColor} 0%,
        #333 55%
    );
    align-self: center;
    justify-self: center;
    border-radius: 82px;
    position: absolute;
    overflow: hidden;
`;

const ColonyTitle = styled.h1`
    align-self: flex-start;
    justify-self: flex-start;
    text-transform: uppercase;
    text-align: left;
    padding-top: 1px;
    margin-bottom: 2px;
    padding-left: 48px;
    margin-top: 0px;
    width: 100%;
    padding-bottom: 1px;
    box-shadow: 3px 1px 4px -5px #000000;
    background: linear-gradient(
        90deg,
        rgb(128 181 193 / 35%) 0%,
        rgba(0, 0, 0, 0) 55%
    );
    color: #111;
    letter-spacing: 0.2px;

    // Ensure the title is in front of the planet.
    position: absolute;
    z-index: 1;
`;

const ColonyPlanet = styled.div<{
    backgroundColor: string;
    position: {top: number; right: number};
    size: number;
    blur?: number;
    reverseBackground?: boolean;
}>`
    height: ${props => props.size * 1.5}px;
    width: ${props => props.size * 1.5}px;
    align-self: center;
    justify-self: center;
    border-radius: 50%;
    background: radial-gradient(
        circle at 100%,
        ${props => (props.reverseBackground ? '#333' : props.backgroundColor)}
            0%,
        ${props => (!props.reverseBackground ? '#333' : props.backgroundColor)}
            100%
    );
    position: absolute;
    top: ${props => props.position.top * 1.5}px;
    right: ${props => props.position.right * 1.5}px;
    filter: blur(${props => props.blur ?? 0}px);
`;

function TradePaymentPopover({
    colony,
    closePopover,
}: {
    colony: SerializedColony;
    closePopover: () => void;
}) {
    const player = useLoggedInPlayer();
    const eligibleTradeIncomes = getEligibleTradeIncomes(colony, player);
    const [selectedTradeIncome, setSelectedTradeIncome] = useState(
        eligibleTradeIncomes[eligibleTradeIncomes.length - 1]
    );
    const validTradePayments = getValidTradePayment(player);
    const [selectedTradePayment, setSelectedTradePayment] = useState(
        validTradePayments[0]
    );
    const actionGuard = useActionGuard();
    const hydratedColony = getColony(colony);
    const apiClient = useApiClient();
    const [canTradeForFree] = actionGuard.canTradeForFree(colony.name);

    return (
        <Flex
            padding="8px"
            background={colors.LIGHT_3}
            boxShadow={`0 0 0 2px ${colors.DARK_3}`}
            flexDirection="column"
        >
            {eligibleTradeIncomes.length > 0 && (
                <Flex marginBottom="16px" flexDirection="column">
                    <span style={{marginBottom: 8, color: colors.TEXT_DARK_1}}>
                        Select trade bonus
                    </span>

                    <Flex>
                        <SelectButtons
                            selectedItem={selectedTradeIncome}
                            setSelectedItem={newIndex =>
                                setSelectedTradeIncome(newIndex)
                            }
                            items={eligibleTradeIncomes}
                            itemRenderer={item => {
                                const thisTradeIncome =
                                    hydratedColony.tradeIncome[item];

                                return (
                                    <BaseActionIconography
                                        card={thisTradeIncome}
                                        reverse
                                        shouldShowPlus={
                                            !!thisTradeIncome.removeResource
                                        }
                                    />
                                );
                            }}
                        />
                    </Flex>
                </Flex>
            )}
            {!canTradeForFree ? (
                <>
                    <span style={{marginBottom: 8, color: colors.TEXT_DARK_1}}>
                        Select trade payment
                    </span>
                    <Flex>
                        <SelectButtons
                            items={validTradePayments}
                            selectedItem={selectedTradePayment}
                            itemRenderer={payment => {
                                return (
                                    <BaseActionIconography
                                        card={{
                                            gainResource: {
                                                [payment.resource]:
                                                    payment.quantity,
                                            },
                                        }}
                                    />
                                );
                            }}
                            setSelectedItem={item => {
                                setSelectedTradePayment(item);
                            }}
                            isSelected={item => {
                                return (
                                    selectedTradePayment.resource ===
                                    item.resource
                                );
                            }}
                        />
                    </Flex>
                </>
            ) : null}
            <Flex
                marginTop="12px"
                width="100px"
                justifySelf="center"
                alignSelf="center"
            >
                <Button
                    variant="bordered"
                    onClick={() => {
                        closePopover();
                        if (canTradeForFree) {
                            apiClient.tradeForFreeAsync({
                                colony: colony.name,
                                tradeIncome: selectedTradeIncome,
                            });
                        } else {
                            apiClient.tradeAsync({
                                colony: colony.name,
                                tradeIncome: selectedTradeIncome,
                                payment: selectedTradePayment.resource,
                            });
                        }
                    }}
                >
                    Trade{canTradeForFree ? ' for free' : ''}
                </Button>
            </Flex>
        </Flex>
    );
}

const BASE_TRADE_FLEET_SIZE = 36;

type TradeFleetProps = {
    size?: number;
    border?: string;
    color?: string;
};

export const TradeFleet = ({
    size = 20,
    color = colors.LIGHT_1,
    border = colors.LIGHT_4,
}: TradeFleetProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 -1 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M2.08637 12.4308L9.17781 2.18761C9.57546 1.61322 10.4245 1.61322 10.8222 2.18761L17.9136 12.4308C18.3728 13.094 17.8981 14 17.0914 14L16 14C15.4477 14 15 14.4477 15 15V16C15 16.5523 14.5523 17 14 17H6C5.44772 17 5 16.5523 5 16L5 15C5 14.4477 4.55228 14 4 14L2.90857 14C2.10191 14 1.62721 13.094 2.08637 12.4308Z"
            stroke={border}
            fill={color}
            strokeWidth="1"
            strokeLinecap="round"
        />
    </svg>
);

export function ColonyComponent({
    colony: serializedColony,
}: {
    colony: SerializedColony;
}) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const actionGuard = useActionGuard();
    const [canTrade] = actionGuard.canTrade(serializedColony.name);
    const [canTradeForFree] = actionGuard.canTradeForFree(
        serializedColony.name
    );

    const tradeFleet = useTypedSelector(state => {
        if (!serializedColony.lastTrade) return null;

        if (serializedColony.lastTrade.round !== state.common.generation) {
            return null;
        }

        const player = state.players.findIndex(
            player => player.username === serializedColony.lastTrade?.player
        );

        return (
            <Box
                position="absolute"
                right="90px"
                top="20px"
                zIndex={4}
                transform="rotate(45deg)"
            >
                <TradeFleet color={PLAYER_COLORS[player]} size={48} />
            </Box>
        );
    });
    const colony = getColony(serializedColony);
    return (
        <ColonyBase
            backgroundColor={colony.borderColor}
            reverseBackground={colony.reverseBackground}
        >
            {tradeFleet}
            <ColonyTileInner
                backgroundColor={colony.backgroundColor}
                reverseBackground={colony.reverseBackground}
            >
                <ColonyTitle className="display text-2xl">
                    {colony.name}
                </ColonyTitle>
                <ColonyPlanet
                    backgroundColor={colony.planetColor}
                    position={colony.planetPosition}
                    size={colony.planetSize}
                    blur={colony.blur}
                    reverseBackground={colony.reverseBackground}
                />
                <Flex
                    marginBottom="2px"
                    justifyContent="left"
                    paddingLeft="12px"
                    alignItems="center"
                    color={
                        colony?.colonyBonus?.removeResource ? 'white' : '#333'
                    }
                    fontWeight="bold"
                    position="absolute"
                    top="46px"
                    height="24px"
                >
                    <BaseActionIconography
                        card={colony.colonyBonus}
                        inline
                        reverse
                        shouldShowPlus={!!colony.colonyBonus?.removeResource}
                    />
                    <Box
                        className="display"
                        marginLeft="4px"
                        paddingLeft="4px"
                        borderLeft="3px solid rgba(200, 200, 200, 0.9)"
                        background="linear-gradient(to right, rgba(140, 140, 140, 1) 0%, rgba(140, 140, 140, 0) 100%)"
                        paddingRight="20px"
                        color="#222"
                    >
                        COLONY BONUS
                    </Box>
                </Flex>
                <Flex
                    justifyContent="center"
                    transform="translateX(-50%) scale(0.9)"
                    position="absolute"
                    left="50%"
                    bottom={'tradeIncomeQuantities' in colony ? '16px' : '6px'}
                    transformOrigin={
                        'tradeIncomeQuantities' in colony ? 'bottom' : 'top'
                    }
                >
                    {colony.tradeIncome
                        .map((_, index) =>
                            index < MAX_NUM_COLONIES
                                ? colony.colonyPlacementBonus
                                : null
                        )
                        .map((placementBonus, index) => {
                            return (
                                <Flex
                                    flexDirection="column"
                                    alignItems="center"
                                    key={index}
                                    position="relative"
                                >
                                    <Flex
                                        alignItems="center"
                                        justifyContent="center"
                                        width="34px"
                                        height="34px"
                                        background={
                                            index === 1
                                                ? COLONY_PLACEMENT_BONUS_BORDER_STARTING_STEP
                                                : COLONY_PLACEMENT_BONUS_BORDER
                                        }
                                        transform="rotate(180deg)"
                                        padding="1px"
                                        paddingLeft={
                                            index === 1 ||
                                            index ===
                                                colony.tradeIncome.length - 1
                                                ? '1px'
                                                : '0px'
                                        }
                                    >
                                        <Flex
                                            height="30px"
                                            width="30px"
                                            padding="1px"
                                            flexDirection="row-reverse"
                                            background={
                                                index === 1
                                                    ? COLONY_PLACEMENT_BONUS_BACKGROUND_STARTING_STEP
                                                    : COLONY_PLACEMENT_BONUS_BACKGROUND
                                            }
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {getPlacementBonuses(
                                                placementBonus
                                            )}
                                        </Flex>
                                        {index === serializedColony.step ? (
                                            <Cube />
                                        ) : serializedColony.colonies[index] !=
                                          null ? (
                                            <Cube
                                                color={
                                                    PLAYER_COLORS[
                                                        serializedColony
                                                            .colonies[index]
                                                    ]
                                                }
                                            />
                                        ) : null}
                                    </Flex>
                                    {'tradeIncomeQuantities' in colony ? (
                                        <h3
                                            className="display text-lg"
                                            style={{
                                                color: '#ddd',
                                                marginTop: '2px',
                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                                marginBottom: 0,
                                            }}
                                        >
                                            {
                                                colony?.tradeIncomeQuantities?.[
                                                    index
                                                ]
                                            }
                                        </h3>
                                    ) : (
                                        <Flex
                                            alignItems="flex-start"
                                            justifyContent="center"
                                            transform="scale(0.8)"
                                            boxShadow="2px 1px 2px 2px rgb(50 50 50 / 60%)"
                                        >
                                            <BaseActionIconography
                                                card={colony.tradeIncome[index]}
                                            />
                                        </Flex>
                                    )}
                                </Flex>
                            );
                        })}
                </Flex>
            </ColonyTileInner>
            <Flex
                ref={triggerRef}
                position="absolute"
                right="40px"
                top="32px"
                flexDirection="column"
                zIndex="2"
            >
                <Popover
                    content={forceClose => (
                        <TradePaymentPopover
                            colony={serializedColony}
                            closePopover={forceClose}
                        />
                    )}
                >
                    <Button
                        disabled={!canTrade && !canTradeForFree}
                        size="small"
                        variant="default"
                    >
                        Trade
                    </Button>
                </Popover>
            </Flex>
        </ColonyBase>
    );
}

function getPlacementBonuses(placementBonus: Action | null) {
    if (!placementBonus) return null;
    const elements: Array<React.ReactNode> = [];
    if (placementBonus.gainResource) {
        let scale = 100;
        for (const resource in placementBonus.gainResource) {
            if (placementBonus?.gainResource[resource] === 1) {
                scale = 150;
            }
        }
        elements.push(
            <Flex
                key={elements.length}
                transform={`scale(${scale}%)`}
                flexWrap="wrap"
                alignItems="center"
                justifyContent="space-around"
            >
                <ResourcePlacementBonus
                    gainResource={placementBonus.gainResource}
                    stagger={Resource.CARD in placementBonus.gainResource}
                />
            </Flex>
        );
    } else {
        let scale = placementBonus.tilePlacements
            ? 68
            : placementBonus?.increaseProduction?.[Resource.MEGACREDIT]
            ? 80
            : 84;
        elements.push(
            <Box
                key={elements.length}
                color="#333"
                transform={`scale(${scale}%) rotate(180deg)`}
            >
                <BaseActionIconography card={placementBonus} />
            </Box>
        );
    }
    return elements;
}

function ResourcePlacementBonus({
    gainResource,
    stagger,
}: {
    gainResource: PropertyCounter<Resource>;
    stagger: boolean;
}) {
    const resources: Resource[] = [];
    for (const resource in gainResource) {
        resources.push(resource as Resource);
    }
    return (
        <>
            {resources.flatMap(resource =>
                Array(
                    gainResource[
                        resource
                    ] as number /* assuming no variable amounts in colonies */
                )
                    .fill(null)
                    .map((_, index) => (
                        <Flex
                            key={resource + index}
                            transform={`rotate(180deg) ${
                                stagger
                                    ? ` translateY(${(-1 + 2 * index) * 24}%)`
                                    : ''
                            }`}
                        >
                            <ResourceIcon name={resource} size={13} />
                        </Flex>
                    ))
            )}
        </>
    );
}
