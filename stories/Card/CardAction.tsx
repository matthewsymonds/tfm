import {Box, Flex} from 'components/box';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {Action} from 'constants/action';
import {Parameter, TileType} from 'constants/board';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {
    renderDecreaseProductionIconography,
    renderGainResourceIconography,
    renderGainResourceOptionIconography,
    renderIncreaseProductionIconography,
    renderRemoveResourceIconography,
    renderRemoveResourceOptionIconography,
    TextWithSpacing,
} from 'stories/Card/CardIconography';
import styled from 'styled-components';

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
        return renderGainResourceIconography(action.stealResource, {isInline: true});
    } else if (action.gainResourceOption) {
        return renderGainResourceOptionIconography(action.gainResourceOption);
    } else if (action.increaseProduction) {
        return renderIncreaseProductionIconography(action.increaseProduction);
    } else if (action.gainResource) {
        return renderGainResourceIconography(action.gainResource, {
            isInline: true,
            shouldShowPlus:
                action.removeResource?.[Resource.CARD] === VariableAmount.USER_CHOICE_UP_TO_ONE,
        });
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
                        <GlobalParameterIcon
                            parameter={parameter as Parameter}
                            key={index}
                            size={16}
                        />
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
        return renderRemoveResourceOptionIconography(
            action.removeResourceOption,
            action.removeResourceSourceType
        );
    } else if (action.removeResource) {
        return renderRemoveResourceIconography(
            action.removeResource,
            action.removeResourceSourceType,
            {
                isInline: true,
            }
        );
    } else if (action.decreaseProduction) {
        return renderDecreaseProductionIconography(action.decreaseProduction, {isInline: true});
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
