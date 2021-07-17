import {Action} from 'constants/action';
import {Colony} from 'constants/colonies';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import React from 'react';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {BaseActionIconography} from './card/CardIconography';
import {ResourceIcon} from './icons/resource';

const COLONY_PLACEMENT_BONUS_BORDER = 'rgba(40,40,40,.5)';
const COLONY_PLACEMENT_BONUS_BORDER_STARTING_STEP =
    'linear-gradient(to top, #eee, rgba(40,40,40,0))';

const COLONY_PLACEMENT_BONUS_BACKGROUND = 'rgba(255,255,255,.3)';
const COLONY_PLACEMENT_BONUS_BACKGROUND_STARTING_STEP =
    'linear-gradient(to bottom, #ddd, rgba(80,80,80))';

const ColonyBase = styled.div<{backgroundColor: string; reverseBackground?: boolean}>`
    width: 300px;
    height: 156px;
    display: flex;
    border-radius: 82px;
    flex-shrink: 0;
    background: gray;
    margin: 8px;
    position: relative;
    position: relative;
    border-size: 4px;
    background: linear-gradient(
        ${props => (props.reverseBackground ? 'to left' : 'to right')},
        ${props => props.backgroundColor} 0%,
        #333 75%
    );
`;

const ColonyTileInner = styled.div<{backgroundColor: string; reverseBackground?: boolean}>`
    content: '';
    width: 294px;
    height: 150px;
    left: 4px;
    background: radial-gradient(
        circle at center ${props => (props.reverseBackground ? 'right' : 'left')},
        ${props => props.backgroundColor} 0%,
        #333 55%
    );
    align-self: center;
    justify-self: center;
    border-radius: 82px;
    position: absolute;
    z-index: 1;
    overflow: hidden;
`;

const ColonyTitle = styled.h1`
    align-self: flex-start;
    z-index: 3;
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
    background: linear-gradient(90deg, rgb(128 181 193 / 35%) 0%, rgba(0, 0, 0, 0) 55%);
    color: #111;
    letter-spacing: 0.2px;
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
        ${props => (props.reverseBackground ? '#333' : props.backgroundColor)} 0%,
        ${props => (!props.reverseBackground ? '#333' : props.backgroundColor)} 100%
    );
    position: absolute;
    z-index: -1;
    top: ${props => props.position.top * 1.5}px;
    right: ${props => props.position.right * 1.5}px;
    filter: blur(${props => props.blur ?? 0}px);
`;

export function ColonyComponent({colony}: {colony: Colony}) {
    return (
        <ColonyBase
            backgroundColor={colony.borderColor}
            reverseBackground={colony.reverseBackground}
        >
            <ColonyTileInner
                backgroundColor={colony.backgroundColor}
                reverseBackground={colony.reverseBackground}
            >
                <ColonyTitle className="display">{colony.name}</ColonyTitle>
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
                    color={colony?.colonyBonus?.removeResource ? 'white' : '#333'}
                    fontWeight="bold"
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
                    transform="scale(0.9)"
                    transformOrigin={'tradeIncomeQuantities' in colony ? 'bottom' : 'top'}
                >
                    {colony.tradeIncome
                        .map((_, index) => colony.colonyPlacementBonus[index])
                        .map((placementBonus, index) => {
                            return (
                                <Flex flexDirection="column" alignItems="center" key={index}>
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
                                            index === 1 || index === colony.tradeIncome.length - 1
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
                                            {getPlacementBonuses(placementBonus)}
                                        </Flex>
                                    </Flex>
                                    {'tradeIncomeQuantities' in colony ? (
                                        <h3
                                            className="display"
                                            style={{
                                                color: '#ddd',
                                                marginTop: '2px',
                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                                marginBottom: 0,
                                            }}
                                        >
                                            {colony['tradeIncomeQuantities']?.[index]}
                                        </h3>
                                    ) : (
                                        <Flex
                                            alignItems="flex-start"
                                            justifyContent="center"
                                            transform="scale(0.8)"
                                            boxShadow="3px 2px 2px 1px rgba(0, 0, 0, 0.2);"
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
            <Box key={elements.length} transform={`scale(${scale}%) rotate(180deg)`}>
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
                    gainResource[resource] as number /* assuming no variable amounts in colonies */
                )
                    .fill(null)
                    .map((_, index) => (
                        <Box
                            key={resource + index}
                            transform={`rotate(180deg) ${
                                stagger ? ` translateY(${(-1 + 2 * index) * 24}%)` : ''
                            }`}
                        >
                            <ResourceIcon name={resource} size={13} />
                        </Box>
                    ))
            )}
        </>
    );
}
