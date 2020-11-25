import {Card as CardModel} from 'models/card';
import React from 'react';
import {Box, Flex} from 'components/box';
import styled from 'styled-components';
import {VariableAmount} from 'constants/variable-amount';
import {InlineText} from 'stories/Card/CardIconography';
import {TileType} from 'constants/board';
import {TileIcon} from 'components/icons/tile';
import {Tag} from 'constants/tag';
import {TagIcon} from 'components/icons/tag';
import {ColonyIcon} from 'components/icons/other';

const Circle = styled.div`
    border-radius: 50%;
    border: 2px solid orangered;
    height: 40px;
    width: 40px;
    margin: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CenteredText = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const CardVictoryPoints = ({card}: {card: CardModel}) => {
    if (!card.victoryPoints) {
        return null;
    }

    function renderVariableAmountVictoryPoints() {
        switch (card.victoryPoints) {
            case VariableAmount.RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/</InlineText>
                        <div style={{width: 16, height: 16, backgroundColor: 'silver'}} />
                    </CenteredText>
                );
            case VariableAmount.TWICE_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>2/</InlineText>
                        <div style={{width: 16, height: 16, backgroundColor: 'silver'}} />
                    </CenteredText>
                );
            case VariableAmount.HALF_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/2</InlineText>
                        <div style={{width: 16, height: 16, backgroundColor: 'silver'}} />
                    </CenteredText>
                );
            case VariableAmount.THIRD_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/3</InlineText>
                        <div style={{width: 16, height: 16, backgroundColor: 'silver'}} />
                    </CenteredText>
                );
            case VariableAmount.QUARTER_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/4</InlineText>
                        <div style={{width: 16, height: 16, backgroundColor: 'silver'}} />
                    </CenteredText>
                );
            case VariableAmount.THREE_IF_ONE_OR_MORE_RESOURCES:
                return (
                    <CenteredText>
                        <InlineText>3:</InlineText>
                        <div style={{width: 16, height: 16, backgroundColor: 'silver'}} />
                    </CenteredText>
                );
            case VariableAmount.OCEANS_ADJACENT_TO_CAPITAL:
                return (
                    <CenteredText>
                        <InlineText>1/</InlineText>
                        <TileIcon type={TileType.OCEAN} size={16} />
                        <InlineText>*</InlineText>
                    </CenteredText>
                );
            case VariableAmount.JOVIAN_TAGS:
                return (
                    <CenteredText>
                        <InlineText>1/</InlineText>
                        <TagIcon name={Tag.JOVIAN} size={16} />
                    </CenteredText>
                );
            case VariableAmount.CITY_TILES_ADJACENT_TO_COMMERCIAL_DISTRICT:
                return (
                    <CenteredText>
                        <InlineText>1/</InlineText>
                        <TileIcon type={TileType.CITY} size={16} />
                        <InlineText>*</InlineText>
                    </CenteredText>
                );
            case VariableAmount.THIRD_ALL_CITIES:
                return (
                    <CenteredText>
                        <InlineText>1/3</InlineText>
                        <TileIcon type={TileType.CITY} size={16} />
                    </CenteredText>
                );
            case VariableAmount.HALF_ALL_COLONIES:
                return (
                    <CenteredText>
                        <InlineText>1/2</InlineText>
                        <ColonyIcon size={16} />
                    </CenteredText>
                );
            default:
                throw new Error(`Unsupported variable amount victory points ${card.victoryPoints}`);
        }
    }

    return (
        <Box position="absolute" right="0" bottom="0">
            <Circle>
                {typeof card.victoryPoints === 'number' ? (
                    <CenteredText>{card.victoryPoints}</CenteredText>
                ) : (
                    renderVariableAmountVictoryPoints()
                )}
            </Circle>
        </Box>
    );
};
