import React from 'react';
import {Card as CardModel} from 'models/card';
import {Box, Flex} from 'components/box';
import {
    InlineText,
    renderIncreaseProductionIconography,
    TextWithSpacing,
} from 'stories/Card/CardIconography';
import {ResourceIcon} from 'components/icons/resource';
import {Resource} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import styled from 'styled-components';
import {Tag} from 'constants/tag';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {TileType} from 'constants/board';
import {TerraformRatingIcon} from 'components/icons/other';
import {Action} from 'constants/action';
import {GlobalParameterIcon} from 'components/icons/global-parameter';

const ActionText = styled.span`
    font-size: 10px;
`;

const ActionWrapper = styled.div`
    display: flex;
    border: 2px dashed blue;
    margin: 3px;
    padding: 2px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;

    &:hover {
        background-color: lightblue;
    }
`;

export function renderRightSideOfArrow(action: Action, card?: CardModel) {
    if (action.stealResource) {
        return (
            <React.Fragment>
                {Object.keys(action.stealResource).map(resource => {
                    return <ResourceIcon name={resource as Resource} size={16} />;
                })}
            </React.Fragment>
        );
    } else if (action.gainResourceOption) {
        const elements: Array<React.ReactNode> = [];
        Object.entries(action.gainResourceOption).forEach(([resource, amount], index) => {
            if (index > 0) {
                elements.push(<TextWithSpacing>/</TextWithSpacing>);
            }
            if (typeof amount === 'number') {
                if (resource === Resource.MEGACREDIT) {
                    elements.push(
                        <ResourceIcon name={resource as Resource} size={16} amount={`${amount}`} />
                    );
                } else {
                    elements.push(
                        <React.Fragment>
                            {amount === 1 ? null : <TextWithSpacing>{amount}</TextWithSpacing>}
                            <ResourceIcon name={resource as Resource} size={16} />
                        </React.Fragment>
                    );
                }
            }
        });
        return elements;
    } else if (action.increaseProduction) {
        return renderIncreaseProductionIconography(action.increaseProduction);
    } else if (action.gainResource) {
        const elements: Array<React.ReactNode> = [];
        for (const [resource, amount] of Object.entries(action.gainResource)) {
            if (typeof amount === 'number') {
                if (resource === Resource.MEGACREDIT) {
                    elements.push(
                        <ResourceIcon name={resource as Resource} size={16} amount={`${amount}`} />
                    );
                } else {
                    if (amount <= 3) {
                        elements.push(
                            <React.Fragment>
                                {Array(amount)
                                    .fill(null) /* @ts-ignore */
                                    .map((_, index) => (
                                        <ResourceIcon
                                            key={index}
                                            name={resource as Resource}
                                            size={16}
                                        />
                                    ))}
                            </React.Fragment>
                        );
                    } else {
                        elements.push(
                            <React.Fragment>
                                <TextWithSpacing>{amount}</TextWithSpacing>
                                <ResourceIcon name={resource as Resource} size={16} />
                            </React.Fragment>
                        );
                    }
                }
            } else {
                switch (amount) {
                    case VariableAmount.REVEALED_CARD_MICROBE:
                        elements.push(
                            <React.Fragment>
                                <TagIcon name={Tag.MICROBE} size={16} />
                                <span>*</span>
                                <TextWithSpacing>:</TextWithSpacing>
                                <ResourceIcon name={resource as Resource} size={16} />
                            </React.Fragment>
                        );
                        break;
                    case VariableAmount.CITIES_ON_MARS:
                        elements.push(
                            <React.Fragment>
                                <ResourceIcon name={resource as Resource} size={16} />
                                <TextWithSpacing>/</TextWithSpacing>
                                <TileIcon type={TileType.CITY} size={24} />
                            </React.Fragment>
                        );
                        break;
                    case VariableAmount.BASED_ON_USER_CHOICE:
                        // hackkk
                        if (
                            Object.values(action.removeResource ?? {})[0] ===
                            VariableAmount.USER_CHOICE_UP_TO_ONE
                        ) {
                            elements.push(
                                <React.Fragment>
                                    <InlineText>+</InlineText>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                </React.Fragment>
                            );
                        } else if (resource === Resource.MEGACREDIT) {
                            elements.push(
                                <ResourceIcon name={resource as Resource} size={16} amount="X" />
                            );
                        } else {
                            elements.push(
                                <React.Fragment>
                                    <InlineText>X</InlineText>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                </React.Fragment>
                            );
                        }
                        break;
                    case VariableAmount.RESOURCES_ON_CARD:
                        elements.push(
                            <React.Fragment>
                                <ResourceIcon name={resource as Resource} size={16} />
                                <TextWithSpacing>/</TextWithSpacing>
                                <ResourceIcon name={Resource.ANY_STORABLE_RESOURCE} size={16} />
                            </React.Fragment>
                        );
                        break;
                    case VariableAmount.BASED_ON_USER_CHOICE:
                        elements.push(
                            <React.Fragment>
                                <ResourceIcon name={resource as Resource} size={16} />
                                <TextWithSpacing>/</TextWithSpacing>
                                <ResourceIcon name={Resource.ANY_STORABLE_RESOURCE} size={16} />
                            </React.Fragment>
                        );
                        break;
                    case VariableAmount.TRIPLE_BASED_ON_USER_CHOICE:
                        elements.push(
                            <ResourceIcon name={resource as Resource} size={16} amount="3X" />
                        );
                        break;
                    default:
                        throw new Error(
                            'unhandled variable amount in renderLeftSideOfArrow - ' + card?.name
                        );
                }
            }
        }
        return elements;
    } else if (action.increaseTerraformRating) {
        if (action.increaseTerraformRating !== 1) {
            throw new Error('render right side of error - ' + card?.name);
        }
        return <TerraformRatingIcon size={16} />;
    } else if (action.tilePlacements) {
        return (
            <React.Fragment>
                {action.tilePlacements.map((tilePlacement, index) => (
                    <TileIcon type={tilePlacement.type} key={index} size={24} />
                ))}
            </React.Fragment>
        );
    } else if (action.lookAtCards) {
        return (
            <Box marginLeft="8px" display="flex">
                <ActionText>{action.text}</ActionText>
            </Box>
        );
    } else if (action.increaseParameter) {
        const elements: Array<React.ReactNode> = [];
        for (const [parameter, amount] of Object.entries(action.increaseParameter)) {
            elements.push(
                ...Array(amount)
                    .fill(null)
                    .map((_, index) => (
                        <GlobalParameterIcon parameter={parameter as Parameter} key={index} />
                    ))
            );
        }
        return elements;
    } else {
        return null;
    }
}

export function renderLeftSideOfArrow(action: Action, card?: CardModel) {
    if (action.cost) {
        return (
            <React.Fragment>
                <ResourceIcon name={Resource.MEGACREDIT} amount={`${action.cost}`} />
            </React.Fragment>
        );
    } else if (action.stealResource) {
        return (
            <React.Fragment>
                {Object.keys(action.stealResource).map(resource => {
                    return (
                        <ResourceIcon name={resource as Resource} size={16} showRedBorder={true} />
                    );
                })}
            </React.Fragment>
        );
    } else if (action.removeResourceOption) {
        // HACK: all cards using removeResourceOption use numeric values (vs VariableAmount),
        // and this naively assumes that is true
        for (const [resource, amount] of Object.entries(action.removeResourceOption)) {
            if (typeof amount === 'number') {
                return (
                    <React.Fragment>
                        <TextWithSpacing>-</TextWithSpacing>
                        {Array(amount)
                            .fill(null) /* @ts-ignore */
                            .map((_, index) => (
                                <ResourceIcon key={index} name={resource as Resource} size={16} />
                            ))}
                    </React.Fragment>
                );
            }
        }
    } else if (action.removeResource) {
        const elements: Array<React.ReactNode> = [];
        for (const [resource, amount] of Object.entries(action.removeResource)) {
            if (typeof amount === 'number') {
                if (amount <= 3) {
                    elements.push(
                        <React.Fragment>
                            <TextWithSpacing>-</TextWithSpacing>
                            {Array(amount)
                                .fill(null) /* @ts-ignore */
                                .map((_, index) => (
                                    <ResourceIcon
                                        key={index}
                                        name={resource as Resource}
                                        size={16}
                                    />
                                ))}
                        </React.Fragment>
                    );
                } else {
                    elements.push(
                        <React.Fragment>
                            <TextWithSpacing>-{amount}</TextWithSpacing>
                            <ResourceIcon name={resource as Resource} size={16} />
                        </React.Fragment>
                    );
                }
            } else {
                switch (amount) {
                    case VariableAmount.USER_CHOICE:
                        elements.push(
                            <React.Fragment>
                                {resource !== Resource.MEGACREDIT && <InlineText>X</InlineText>}
                                <ResourceIcon name={resource as Resource} size={16} amount="X" />
                            </React.Fragment>
                        );
                        break;
                    case VariableAmount.USER_CHOICE_UP_TO_ONE:
                        elements.push(
                            <React.Fragment>
                                <TextWithSpacing>-</TextWithSpacing>
                                <ResourceIcon name={resource as Resource} size={16} />
                            </React.Fragment>
                        );
                        break;
                    default:
                        throw new Error(
                            'unhandled variable amount in renderLeftSideOfArrow - ' + card?.name
                        );
                }
            }
        }
        return elements;
    } else if (action.decreaseProduction) {
        const elements: Array<React.ReactNode> = [];
        for (const [production, amount] of Object.entries(action.decreaseProduction)) {
            if (typeof amount === 'number') {
                if (amount !== 1) {
                    throw new Error(
                        'unhandled variable amount in renderLeftSideOfArrow - ' + card?.name
                    );
                }
                elements.push(
                    <Flex padding="4px" background="brown">
                        <TextWithSpacing>-</TextWithSpacing>
                        <ResourceIcon name={production as Resource} size={16} />
                    </Flex>
                );
            } else {
                throw new Error(
                    'unhandled variable amount in renderLeftSideOfArrow - ' + card?.name
                );
            }
        }
        return elements;
    } else {
        return null;
    }
}

export const CardAction = ({card}: {card: CardModel}) => {
    if (!card.action) {
        return null;
    }

    const action = card.action;

    function renderArrow() {
        return <TextWithSpacing>{'=>'}</TextWithSpacing>;
    }

    const actions = [...(action.choice ? action.choice : [action])];

    return (
        <ActionWrapper>
            {!action.lookAtCards && <ActionText>{action.text}</ActionText>}
            {actions.map((action, index) => (
                <React.Fragment>
                    {index > 0 && <TextWithSpacing>OR</TextWithSpacing>}
                    <Flex alignItems="center" justifyContent="center" margin="4px">
                        {renderLeftSideOfArrow(action, card)}
                        {renderArrow()}
                        {renderRightSideOfArrow(action, card)}
                    </Flex>
                </React.Fragment>
            ))}
        </ActionWrapper>
    );
};
