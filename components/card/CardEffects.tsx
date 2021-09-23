import {Flex} from 'components/box';
import {renderLeftSideOfArrow, renderRightSideOfArrow} from 'components/card/CardActions';
import {
    Colon,
    Equal,
    GainResourceWhenIncreaseProductionIconography,
    IconographyRow,
    InlineText,
    TextWithMargin,
} from 'components/card/CardIconography';
import {CardText} from 'components/card/CardText';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {ColonyIcon, TradeIcon, VictoryPointIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {Action} from 'constants/action';
import {Parameter, TileType} from 'constants/board';
import {EffectTrigger} from 'constants/effect-trigger';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {Card as CardModel, doesCardHaveDiscounts, doesCardHaveTriggerAction} from 'models/card';
import React from 'react';
import {useTypedSelector} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-venus';
import styled from 'styled-components';

const EffectText = styled(CardText)``;

const EffectWrapper = styled.div`
    display: flex;
    position: relative;
    padding: 4px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const IconizedText = styled.div`
    border: 2px solid black;
    background: gold;
    padding: 4px;
    border-radius: 3px;
    font-size: 1rem;
    width: min-content;
`;

function renderCardCost(cardCost: number) {
    return (
        <>
            <ResourceIcon name={Resource.CARD} size={16} />
            <>*</>
            <Colon /> <ResourceIcon name={Resource.MEGACREDIT} size={16} amount={`${cardCost}`} />
        </>
    );
}

export const CardEffects = ({card, showEffectText}: {card: CardModel; showEffectText: boolean}) => {
    const venus = useTypedSelector(isPlayingVenus);

    // Bail early if there's nothing to show
    if (!card.effects) {
        return null;
    }

    const {effects} = card;

    function renderDiscounts() {
        if (!card.discounts && !card.plantDiscount) {
            return null;
        }

        const elements: Array<React.ReactNode> = [];

        if (
            Object.keys(card.discounts.tags).length > 0 ||
            Object.keys(card.discounts.cards).length > 0
        ) {
            const tags = {...card.discounts.tags, ...card.discounts.cards};
            Object.keys(tags).forEach((tag, index) => {
                if (index > 0) {
                    elements.push(<TextWithMargin>/</TextWithMargin>);
                }
                elements.push(<TagIcon name={tag as Tag} size={16} />);
            });
        }

        if (card.discounts.card) {
            elements.push(<ResourceIcon name={Resource.CARD} size={16} />);
        }

        if (card.discounts.trade) {
            elements.push(<TradeIcon size={24} />);
        }

        if (card.plantDiscount) {
            elements.push(
                <React.Fragment>
                    <TextWithMargin>{8 - card.plantDiscount}</TextWithMargin>
                    <ResourceIcon name={Resource.PLANT} size={16} />
                </React.Fragment>
            );
        }

        elements.push(<Colon />);

        if (card.discounts.card) {
            elements.push(
                <ResourceIcon
                    name={Resource.MEGACREDIT}
                    size={16}
                    amount={`${card.discounts.card}`}
                />
            );
        }

        if (card.discounts.trade > 0) {
            elements.push(
                <React.Fragment>
                    <InlineText>-{card.discounts.trade}</InlineText>
                </React.Fragment>
            );
        }

        if (
            Object.keys(card.discounts.tags).length !== 0 ||
            Object.keys(card.discounts.cards).length !== 0
        ) {
            const amount = Object.values({...card.discounts.tags, ...card.discounts.cards})[0];
            elements.push(
                <ResourceIcon name={Resource.MEGACREDIT} size={16} amount={`-${amount}`} />
            );
        }

        if (card.plantDiscount) {
            elements.push(<TileIcon type={TileType.GREENERY} size={20} />);
        }

        return (
            <React.Fragment>
                {elements.map((el, i) => (
                    <React.Fragment key={i}>{el}</React.Fragment>
                ))}
            </React.Fragment>
        );
    }

    function renderConditionalPayment() {
        const {conditionalPayment} = card;
        if (!conditionalPayment) {
            return null;
        }
        return (
            <React.Fragment>
                <TagIcon name={conditionalPayment.tag} size={16} />
                <Colon />
                <ResourceIcon
                    name={card.storedResourceType ?? Resource.ANY_STORABLE_RESOURCE}
                    size={16}
                />
                <Equal />
                <ResourceIcon
                    name={Resource.MEGACREDIT}
                    size={16}
                    amount={conditionalPayment.rate}
                />
            </React.Fragment>
        );
    }

    function renderUseStoredResourceAsHeat() {
        const {useStoredResourceAsHeat} = card;
        if (!useStoredResourceAsHeat) {
            return null;
        }
        return (
            <React.Fragment>
                <ResourceIcon
                    name={card.storedResourceType ?? Resource.ANY_STORABLE_RESOURCE}
                    size={16}
                />
                <Equal />
                <InlineText>{useStoredResourceAsHeat}</InlineText>
                <ResourceIcon name={Resource.HEAT} size={16} />
            </React.Fragment>
        );
    }

    function renderTrigger(trigger: EffectTrigger | undefined) {
        if (trigger?.tags) {
            return (
                <Flex>
                    {trigger?.tags.map((tag, index) => (
                        <React.Fragment key={`${tag}-${index}`}>
                            {index > 0 && <TextWithMargin>/</TextWithMargin>}
                            <TagIcon name={tag} size={16} />
                        </React.Fragment>
                    ))}
                </Flex>
            );
        } else if (trigger?.cardTags) {
            return (
                <Flex>
                    {trigger?.cardTags.map((tag, index) => (
                        <TagIcon
                            name={tag}
                            size={16}
                            key={index}
                            margin={index > 0 ? '0 0 0 4px' : '0'}
                        />
                    ))}
                </Flex>
            );
        } else if (trigger?.placedTile) {
            return (
                <React.Fragment>
                    <TileIcon type={trigger?.placedTile} size={16} />
                    {trigger?.onMars && <TextWithMargin>*</TextWithMargin>}
                </React.Fragment>
            );
        } else if (trigger?.cost) {
            return (
                <React.Fragment>
                    <ResourceIcon
                        name={Resource.MEGACREDIT}
                        size={16}
                        amount={`${trigger?.cost}`}
                    />
                    <ResourceIcon name={Resource.CARD} size={16} margin="0px 0px 0px 4px" />
                </React.Fragment>
            );
        } else if (trigger?.increasedParameter) {
            return <GlobalParameterIcon parameter={trigger?.increasedParameter} size={16} />;
        } else if (trigger?.standardProject) {
            // todo: Make this look nicer
            return <IconizedText>STANDARD PROJECTS</IconizedText>;
        } else if (trigger?.steelOrTitaniumPlacementBonus) {
            return (
                <Flex>
                    <ResourceIcon name={Resource.STEEL} size={16} />
                    <TextWithMargin>/</TextWithMargin>
                    <ResourceIcon name={Resource.TITANIUM} size={16} />
                </Flex>
            );
        } else if (trigger?.nonNegativeVictoryPointsIcon) {
            return <VictoryPointIcon size={20}>?</VictoryPointIcon>;
        } else if (trigger?.newTag) {
            return <TagIcon name={Tag.ANY} size={16} />;
        } else if (trigger?.placedColony) {
            return <ColonyIcon size={16} />;
        }

        let parameterRequirementAdjustments = Object.keys(
            card.parameterRequirementAdjustments ?? {}
        ) as Parameter[];

        if (!venus) {
            parameterRequirementAdjustments = parameterRequirementAdjustments.filter(
                parameter => parameter !== Parameter.VENUS
            );
        }

        if (card.increaseColonyTileTrackRange) {
            return <TradeIcon size={24} />;
        }

        if (parameterRequirementAdjustments.length > 0) {
            const elements: Array<React.ReactNode> = [];
            parameterRequirementAdjustments.map((parameter, index) => {
                if (index > 0) {
                    elements.push(<TextWithMargin>/</TextWithMargin>);
                }
                elements.push(<GlobalParameterIcon parameter={parameter} size={16} />);
            });
            return (
                <Flex justifyContent="center" alignItems="center">
                    {elements.map((el, i) => (
                        <React.Fragment key={i}>{el}</React.Fragment>
                    ))}
                </Flex>
            );
        }

        return null;
    }

    function renderAction(action: Action | undefined) {
        if (action?.choice) {
            return (
                <Flex alignItems="center">
                    {action?.choice.map((actionChoice, index) => (
                        <React.Fragment key={index}>
                            {index > 0 && <TextWithMargin>or</TextWithMargin>}
                            {renderAction(actionChoice)}
                        </React.Fragment>
                    ))}
                </Flex>
            );
        }
        if (card.parameterRequirementAdjustments) {
            return (
                <InlineText>+/-{Object.values(card.parameterRequirementAdjustments)[0]}</InlineText>
            );
        }

        if (card.increaseColonyTileTrackRange) {
            return <InlineText>+{card.increaseColonyTileTrackRange}</InlineText>;
        }

        if (!action) {
            return null;
        }

        return (
            <React.Fragment>
                {renderLeftSideOfArrow(action, card)}
                {renderRightSideOfArrow(action, card)}
            </React.Fragment>
        );
    }

    function renderExchangeRates() {
        return (
            <Flex flexDirection="column">
                {Object.entries(card.exchangeRates).map(([resource, amount], index) => (
                    <IconographyRow key={resource} style={{marginTop: index > 0 ? '4px' : '0px'}}>
                        <ResourceIcon name={resource as Resource} size={16} />
                        <TextWithMargin>:</TextWithMargin>
                        {resource !== Resource.HEAT && <TextWithMargin>+</TextWithMargin>}
                        <ResourceIcon name={Resource.MEGACREDIT} size={16} amount={`${amount}`} />
                    </IconographyRow>
                ))}
            </Flex>
        );
    }

    // We use the CardEffects component for more than just traditional effects with triggers
    // and actions - it's the catch-all component for all passive logistics.
    return (
        <React.Fragment>
            {effects.map((effect, index) => (
                <EffectWrapper key={index}>
                    {effect.text && showEffectText && (
                        <EffectText style={{marginBottom: 4}}>{effect.text}</EffectText>
                    )}
                    <Flex alignItems="center" justifyContent="center" flexWrap="wrap">
                        {/* Exchange rates (e.g. Advanced Alloys) */}
                        {Object.keys(card.exchangeRates).length > 0 && renderExchangeRates()}

                        {/* Modified card cost (e.g. Polyphemos) */}
                        {card.cardCost && renderCardCost(card.cardCost)}

                        {/* Card discounts (e.g. Research Outpost) */}
                        {doesCardHaveDiscounts(card) && renderDiscounts()}

                        {/* Manutech's special power */}
                        {card.gainResourceWhenIncreaseProduction && (
                            <GainResourceWhenIncreaseProductionIconography />
                        )}

                        {/* Conditional payments (e.g. Dirigibles) */}
                        {card.conditionalPayment && renderConditionalPayment()}

                        {/* Use stored resource as heat (e.g. Stormcraft) */}
                        {card.useStoredResourceAsHeat && renderUseStoredResourceAsHeat()}

                        {/* Standard trigger/action effects (e.g. Point Luna) */}
                        {doesCardHaveTriggerAction(card) && (
                            <React.Fragment>
                                {renderTrigger(effect.trigger)}
                                <Colon />
                                {renderAction(effect.action)}
                            </React.Fragment>
                        )}
                    </Flex>
                </EffectWrapper>
            ))}
        </React.Fragment>
    );
};
