import {Box} from 'components/box';
import {InlineText} from 'components/card/CardIconography';
import {ColonyIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {colors} from 'components/ui';
import {TileType} from 'constants/board';
import {Resource} from 'constants/resource-enum';
import {VariableAmount} from 'constants/variable-amount';
import {Card as CardModel} from 'models/card';
import React from 'react';
import {isTagAmount} from 'selectors/is-tag-amount';
import styled from 'styled-components';

const Circle = styled.div`
    border-radius: 50%;
    height: 40px;
    width: 40px;
    margin: 4px;
    display: flex;
    font-size: 19px;
    background-color: ${colors.CARD_VP_BG};
    color: ${colors.CARD_BORDER_2};
    border: 1px solid ${colors.CARD_BORDER_2};
    font-family: 'Ubuntu Condensed', sans-serif;
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

    const storedResource = card.storedResourceType;

    function renderVariableAmountVictoryPoints() {
        switch (card.victoryPoints) {
            case VariableAmount.RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/</InlineText>
                        {storedResource && <ResourceIcon name={storedResource} size={16} />}
                    </CenteredText>
                );
            case VariableAmount.TWICE_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>2/</InlineText>
                        {storedResource && <ResourceIcon name={storedResource} size={16} />}
                    </CenteredText>
                );
            case VariableAmount.HALF_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/2</InlineText>
                        {storedResource && <ResourceIcon name={storedResource} size={16} />}
                    </CenteredText>
                );
            case VariableAmount.THIRD_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/3</InlineText>
                        {storedResource && <ResourceIcon name={storedResource} size={16} />}
                    </CenteredText>
                );
            case VariableAmount.THIRD_FLOATERS:
                return (
                    <CenteredText>
                        <InlineText>1/3</InlineText>
                        <ResourceIcon name={Resource.FLOATER} size={16} />
                    </CenteredText>
                );
            case VariableAmount.FLOATERS:
                return (
                    <CenteredText>
                        <ResourceIcon name={Resource.FLOATER} size={16} />
                    </CenteredText>
                );
            case VariableAmount.QUARTER_RESOURCES_ON_CARD:
                return (
                    <CenteredText>
                        <InlineText>1/4</InlineText>
                        {storedResource && <ResourceIcon name={storedResource} size={16} />}
                    </CenteredText>
                );
            case VariableAmount.THREE_IF_ONE_OR_MORE_RESOURCES:
                return (
                    <CenteredText>
                        <InlineText>3:</InlineText>
                        {storedResource && <ResourceIcon name={storedResource} size={16} />}
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
                if (card.victoryPoints && isTagAmount(card.victoryPoints)) {
                    return (
                        <CenteredText>
                            <InlineText>1/</InlineText>
                            {card.victoryPoints.dividedBy ? (
                                <InlineText>{card.victoryPoints.dividedBy}</InlineText>
                            ) : null}
                            <TagIcon name={card.victoryPoints.tag} size={16} />
                        </CenteredText>
                    );
                }
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
