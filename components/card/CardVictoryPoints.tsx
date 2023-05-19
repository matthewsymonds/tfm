import {Box} from 'components/box';
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
import {u} from 'utils';

const Circle = styled.div`
    border-radius: 20px;
    height: 40px;
    min-width: 40px;
    padding: 0 8px;
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
    font-size: 1.3rem;
    line-height: 1.3rem;
    font-weight: 700;
`;

export const CardVictoryPoints = ({card}: {card: CardModel}) => {
    if (!card.victoryPoints) {
        return null;
    }

    const storedResource = card.storedResourceType;

    function renderVariableAmountVictoryPoints() {
        switch (card.victoryPoints) {
            case VariableAmount.RESOURCES_ON_CARD:
                u.assert(storedResource);
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={storedResource}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.TWICE_RESOURCES_ON_CARD:
                u.assert(storedResource);
                return (
                    <CenteredText>
                        <span className="mr-0.5">2/</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={storedResource}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.HALF_RESOURCES_ON_CARD:
                u.assert(storedResource);
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/2</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={storedResource}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.THIRD_RESOURCES_ON_CARD:
                u.assert(storedResource);
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/3</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={storedResource}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.THIRD_FLOATERS:
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/3</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={Resource.FLOATER}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.FLOATERS:
                return (
                    <CenteredText>
                        <ResourceIcon
                            border="1px solid #000"
                            name={Resource.FLOATER}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.QUARTER_RESOURCES_ON_CARD:
                u.assert(storedResource);
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/4</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={storedResource}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.THREE_IF_ONE_OR_MORE_RESOURCES:
                u.assert(storedResource);
                return (
                    <CenteredText>
                        <span className="mr-0.5">3 :</span>
                        <ResourceIcon
                            border="1px solid #000"
                            name={storedResource}
                            size={16}
                        />
                    </CenteredText>
                );
            case VariableAmount.OCEANS_ADJACENT_TO_CAPITAL:
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/</span>
                        <TileIcon type={TileType.OCEAN} size={16} />
                        <span>*</span>
                    </CenteredText>
                );
            case VariableAmount.CITY_TILES_ADJACENT_TO_COMMERCIAL_DISTRICT:
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/</span>
                        <TileIcon type={TileType.CITY} size={16} />
                        <span>*</span>
                    </CenteredText>
                );
            case VariableAmount.THIRD_ALL_CITIES:
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/3</span>
                        <TileIcon type={TileType.CITY} size={16} />
                    </CenteredText>
                );
            case VariableAmount.HALF_ALL_COLONIES:
                return (
                    <CenteredText>
                        <span className="mr-0.5">1/2</span>
                        <ColonyIcon size={16} />
                    </CenteredText>
                );
            default:
                if (card.victoryPoints && isTagAmount(card.victoryPoints)) {
                    return (
                        <CenteredText>
                            <span className="mr-0.5">1/</span>
                            {card.victoryPoints.dividedBy ? (
                                <span>{card.victoryPoints.dividedBy}</span>
                            ) : null}
                            <TagIcon name={card.victoryPoints.tag} size={16} />
                        </CenteredText>
                    );
                }
                throw new Error(
                    `Unsupported variable amount victory points ${card.victoryPoints}`
                );
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
