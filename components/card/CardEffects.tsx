import {Flex} from 'components/box';
import {renderLeftSideOfArrow, renderRightSideOfArrow} from 'components/card/CardActions';
import {IconographyRow, InlineText, TextWithMargin} from 'components/card/CardIconography';
import {CardText} from 'components/card/CardText';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {Action} from 'constants/action';
import {Parameter, TileType} from 'constants/board';
import {EffectTrigger} from 'constants/effect-trigger';
import {Resource} from 'constants/resource';
import {Tag} from 'constants/tag';
import {Card as CardModel, doesCardHaveDiscounts} from 'models/card';
import React from 'react';
import styled from 'styled-components';

const EffectText = styled(CardText)``;

const EffectWrapper = styled.div`
    display: flex;
    border: 2px dashed red;
    margin: 3px;
    padding: 6px;
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

export const CardEffects = ({card}: {card: CardModel}) => {
    if (card.effects.length < 1) {
        return null;
    }

    const {effects} = card;

    function renderColon(key: number = 0) {
        return <TextWithMargin key={key}>:</TextWithMargin>;
    }

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
            elements.push(<IconizedText>TRADE</IconizedText>);
        }

        if (card.plantDiscount) {
            elements.push(
                <React.Fragment>
                    <TextWithMargin>{8 - card.plantDiscount}</TextWithMargin>
                    <ResourceIcon name={Resource.PLANT} size={16} />
                </React.Fragment>
            );
        }

        elements.push(renderColon(elements.length));

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
                        <TagIcon name={tag} size={16} key={index} />
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
                    <ResourceIcon name={Resource.CARD} size={16} marginLeft={4} />
                </React.Fragment>
            );
        } else if (trigger?.increaseParameter) {
            return <GlobalParameterIcon parameter={trigger?.increaseParameter} size={16} />;
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
        }

        if (Object.keys(card.parameterRequirementAdjustments).length > 0) {
            const elements: Array<React.ReactNode> = [];
            [Parameter.OCEAN, Parameter.OXYGEN, Parameter.TEMPERATURE].map((parameter, index) => {
                if (index > 0) {
                    elements.push(<TextWithMargin>/</TextWithMargin>);
                }
                elements.push(<GlobalParameterIcon parameter={parameter} size={16} />);
            });
            return (
                <Flex>
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
                            {index > 0 && <InlineText>or</InlineText>}
                            {renderAction(actionChoice)}
                        </React.Fragment>
                    ))}
                </Flex>
            );
        }
        if (Object.keys(card.parameterRequirementAdjustments).length > 0) {
            return (
                <InlineText>+/-{Object.values(card.parameterRequirementAdjustments)[0]}</InlineText>
            );
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
                {Object.entries(card.exchangeRates).map(([resource, amount]) => (
                    <IconographyRow key={resource}>
                        <ResourceIcon name={resource as Resource} size={16} />
                        <TextWithMargin>:</TextWithMargin>
                        {resource !== Resource.HEAT && <TextWithMargin>+</TextWithMargin>}
                        <ResourceIcon name={Resource.MEGACREDIT} size={16} amount={`${amount}`} />
                    </IconographyRow>
                ))}
            </Flex>
        );
    }

    return (
        <React.Fragment>
            {effects.map((effect, index) => (
                <EffectWrapper key={index}>
                    {effect.text && <EffectText>{effect.text}</EffectText>}
                    <Flex alignItems="center" justifyContent="center" marginTop="4px">
                        {Object.keys(card.exchangeRates).length > 0 ? (
                            <React.Fragment>{renderExchangeRates()}</React.Fragment>
                        ) : doesCardHaveDiscounts(card) ? (
                            <React.Fragment>{renderDiscounts()}</React.Fragment>
                        ) : (
                            <React.Fragment>
                                {renderTrigger(effect.trigger)}
                                {renderColon()}
                                {renderAction(effect.action)}
                            </React.Fragment>
                        )}
                    </Flex>
                </EffectWrapper>
            ))}
        </React.Fragment>
    );
};
