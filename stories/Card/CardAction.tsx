import React from 'react';
import {Card, Card as CardModel} from 'models/card';
import {Box, Flex} from 'components/box';
import {CardIconography, InlineText} from 'stories/Card/CardIconography';
import {ResourceIcon} from 'components/icons/resource';
import {Resource} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import styled from 'styled-components';
import {Tag} from 'constants/tag';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {TileType} from 'constants/board';
import {TerraformRatingIcon} from 'components/icons/other';

const ActionText = styled.span`
    font-size: 10px;
`;

export const CardAction = ({card}: {card: CardModel}) => {
    if (!card.action) {
        return null;
    }

    const action = card.action;

    function renderArrow() {
        return '=>';
    }

    function renderLeftSideOfArrow() {
        if (action.cost) {
            return (
                <React.Fragment>
                    <InlineText>{action.cost}</InlineText>
                    <ResourceIcon name={Resource.MEGACREDIT} />
                </React.Fragment>
            );
        } else if (action.removeResource) {
            for (const [resource, amount] of Object.entries(action.removeResource)) {
                if (typeof amount === 'number') {
                    return Array(amount)
                        .fill(null) /* @ts-ignore */
                        .map((_, index) => (
                            <ResourceIcon key={index} name={resource as Resource} size={16} />
                        ));
                } else {
                    switch (amount) {
                        case VariableAmount.USER_CHOICE:
                            return (
                                <React.Fragment>
                                    <InlineText>X</InlineText>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                </React.Fragment>
                            );
                        default:
                            throw new Error(
                                'unhandled variable amount in renderLeftSideOfArrow - ' + card.name
                            );
                    }
                }
            }
        } else if (action.decreaseProduction) {
            for (const [production, amount] of Object.entries(action.decreaseProduction)) {
                if (typeof amount === 'number') {
                    if (amount !== 1) {
                        throw new Error(
                            'unhandled variable amount in renderLeftSideOfArrow - ' + card.name
                        );
                    }
                    return (
                        <Flex padding="4px" background="brown">
                            <InlineText>-</InlineText>
                            <ResourceIcon name={production as Resource} size={16} />
                        </Flex>
                    );
                } else {
                    throw new Error(
                        'unhandled variable amount in renderLeftSideOfArrow - ' + card.name
                    );
                }
            }
        } else {
            return null;
        }
    }

    function renderRightSideOfArrow() {
        if (action.gainResource) {
            for (const [resource, amount] of Object.entries(action.gainResource)) {
                if (typeof amount === 'number') {
                    return (
                        <React.Fragment>
                            <InlineText>{amount}</InlineText>
                            <ResourceIcon name={resource as Resource} size={16} />
                        </React.Fragment>
                    );
                } else {
                    switch (amount) {
                        case VariableAmount.REVEALED_CARD_MICROBE:
                            return (
                                <React.Fragment>
                                    <TagIcon name={Tag.MICROBE} size={16} />
                                    <span>*</span>
                                    <InlineText>:</InlineText>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                </React.Fragment>
                            );
                        case VariableAmount.CITIES_ON_MARS:
                            return (
                                <React.Fragment>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                    <InlineText>/</InlineText>
                                    <TileIcon type={TileType.CITY} size={16} />
                                </React.Fragment>
                            );
                        case VariableAmount.BASED_ON_USER_CHOICE:
                            return (
                                <React.Fragment>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                    <InlineText>X</InlineText>
                                    <TileIcon type={TileType.CITY} size={16} />
                                </React.Fragment>
                            );
                        case VariableAmount.RESOURCES_ON_CARD:
                            return (
                                <React.Fragment>
                                    <ResourceIcon name={resource as Resource} size={16} />
                                    <InlineText>/</InlineText>
                                    <ResourceIcon name={Resource.ANY_STORABLE_RESOURCE} size={16} />
                                </React.Fragment>
                            );
                        default:
                            throw new Error(
                                'unhandled variable amount in renderLeftSideOfArrow - ' + card.name
                            );
                    }
                }
            }
        } else if (action.increaseTerraformRating) {
            if (action.increaseTerraformRating !== 1) {
                throw new Error('render right side of error - ' + card.name);
            }
            return <TerraformRatingIcon size={16} />;
        } else {
            return null;
        }
    }

    return (
        <Flex
            border="1px dashed black"
            margin="3px"
            padding="2px"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
        >
            <ActionText>{action.text}</ActionText>
            <Flex alignItems="center" justifyContent="center" marginTop="4px">
                {renderLeftSideOfArrow()}
                {renderArrow()}
                {renderRightSideOfArrow()}
            </Flex>
        </Flex>
    );
};
