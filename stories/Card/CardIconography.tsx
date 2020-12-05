import React from 'react';
import styled from 'styled-components';
import {Card as CardModel} from 'models/card';
import {Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {Resource, ResourceLocationType} from 'constants/resource';
import {VariableAmount} from 'constants/variable-amount';
import {Parameter, TilePlacement, TileType} from 'constants/board';
import {TileIcon} from 'components/icons/tile';
import {TagIcon} from 'components/icons/tag';
import {Tag} from 'constants/tag';
import {ColonyIcon, TerraformRatingIcon} from 'components/icons/other';
import {PropertyCounter} from 'constants/property-counter';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {Action, Amount} from 'constants/action';

export const InlineText = styled.span`
    margin: 3px 0;
    height: 16px;
    line-height: 16px;
`;
export const TextWithSpacing = styled.span<{spacing?: number}>`
    margin: 0 ${props => props.spacing ?? 4}px;
`;
export const IconographyRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
`;
const ProductionWrapper = styled.div<{
    isProduction?: boolean;
    margin?: string;
    useRedBorder?: boolean;
}>`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
    margin: ${props => props.margin ?? 'initial'};
    background-color: ${props => (props.isProduction ? 'brown' : 'initial')};
    border: ${props => (props.useRedBorder ? '2px solid red' : 'initial')};
`;

function _renderChangeResourceIconography(
    changeResource: PropertyCounter<Resource>,
    opts?: {
        isNegative?: boolean;
        isInline?: boolean;
        isSteal?: boolean;
        isProduction?: boolean;
        useRedBorder?: boolean;
    }
) {
    opts = {
        isNegative: false,
        isInline: false,
        isSteal: false,
        isProduction: false,
        useRedBorder: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];
    const useResourceResourceBorder = opts.useRedBorder && !opts.isProduction;
    const useProductionRedBorder = opts.useRedBorder && opts.isProduction;

    let i = 0;
    for (let [resource, amount] of Object.entries(changeResource)) {
        const resourceIconElement = (
            <ResourceIcon
                name={resource as Resource}
                size={16}
                showRedBorder={useResourceResourceBorder}
                amount={
                    resource === Resource.MEGACREDIT && typeof amount === 'number'
                        ? `${amount}`
                        : undefined
                }
            />
        );
        if (typeof amount === 'number') {
            elements.push(
                <ProductionWrapper
                    margin={i > 0 ? '0 0 0 4px' : '0'}
                    isProduction={opts.isProduction}
                    useRedBorder={useProductionRedBorder}
                >
                    <TextWithSpacing spacing={2}>
                        {opts.isSteal ? 'STEAL ' : ''}
                        {opts.isNegative ? '-' : null}
                        {resource === Resource.MEGACREDIT || amount === 1 ? null : amount}
                    </TextWithSpacing>
                    {resourceIconElement}
                </ProductionWrapper>
            );
        } else {
            let multiplierElement: React.ReactElement | null = null;
            let customElement: React.ReactElement | null = null;
            switch (amount) {
                case VariableAmount.CITY_TILES_IN_PLAY:
                    multiplierElement = <TileIcon type={TileType.CITY} size={16} />;
                    break;
                case VariableAmount.ALL_EVENTS:
                    multiplierElement = <TagIcon name={Tag.EVENT} size={16} />;
                    break;
                case VariableAmount.JOVIAN_TAGS:
                    multiplierElement = <TagIcon name={Tag.JOVIAN} size={16} />;
                    break;
                case VariableAmount.ALL_COLONIES:
                    multiplierElement = <ColonyIcon size={16} />;
                    break;
                case VariableAmount.COLONIES:
                    multiplierElement = <ColonyIcon size={16} />;
                    break;

                case VariableAmount.FOUR_IF_THREE_PLANT_TAGS_ELSE_ONE:
                    customElement = (
                        <Flex flexDirection="column" alignItems="center">
                            <Flex>
                                <ResourceIcon name={Resource.PLANT} size={16} />
                                <InlineText>OR</InlineText>
                            </Flex>
                            <Flex>
                                <InlineText>3</InlineText>
                                <TagIcon name={Tag.PLANT} size={16} />
                                <InlineText>:</InlineText>
                                <InlineText>4</InlineText>{' '}
                                <ResourceIcon name={Resource.PLANT} size={16} />
                            </Flex>
                        </Flex>
                    );
                    break;
                case VariableAmount.EARTH_TAGS:
                    multiplierElement = <TagIcon name={Tag.EARTH} size={16} />;
                    break;
                case VariableAmount.MINING_AREA_CELL_HAS_STEEL_BONUS:
                case VariableAmount.MINING_RIGHTS_CELL_HAS_STEEL_BONUS:
                    customElement = (
                        <React.Fragment>
                            <ResourceIcon name={Resource.STEEL} size={16} />
                            <InlineText>OR</InlineText>
                            <ResourceIcon name={Resource.TITANIUM} size={16} />
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.MINING_AREA_CELL_HAS_TITANIUM_BONUS:
                case VariableAmount.MINING_RIGHTS_CELL_HAS_TITANIUM_BONUS:
                    // we handle it in the _STEEL_BONUS variants of these enum values
                    customElement = null;
                    multiplierElement = null;
                    break;
                case VariableAmount.OPPONENTS_SPACE_TAGS:
                    multiplierElement = (
                        <TagIcon name={Tag.SPACE} size={16} borderOverride="2px solid red" />
                    );
                    break;
                case VariableAmount.POWER_TAGS:
                    multiplierElement = <TagIcon name={Tag.POWER} size={16} />;
                    break;
                case VariableAmount.THIRD_RESOURCES_ON_CARD:
                    multiplierElement = <ColonyIcon size={16} />;
                    break;
                case VariableAmount.PLANT_TAGS:
                    multiplierElement = <TagIcon name={Tag.PLANT} size={16} />;
                    break;
                case VariableAmount.SPACE_TAGS:
                    multiplierElement = <TagIcon name={Tag.SPACE} size={16} />;
                    break;
                case VariableAmount.VENUS_TAGS:
                    multiplierElement = <TagIcon name={Tag.VENUS} size={16} />;
                    break;
                case VariableAmount.CITIES_ON_MARS:
                    multiplierElement = <TileIcon type={TileType.CITY} size={16} />;
                    break;
                case VariableAmount.CARDS_WITHOUT_TAGS:
                    // @ts-ignore
                    multiplierElement = <TagIcon name="x" size={16} />;
                    break;
                case VariableAmount.HALF_MICROBE_TAGS:
                    multiplierElement = (
                        <React.Fragment>
                            <InlineText>2</InlineText>
                            <TagIcon name={Tag.MICROBE} size={16} />;
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.HALF_BUILDING_TAGS:
                    multiplierElement = (
                        <React.Fragment>
                            <InlineText>2</InlineText>
                            <TagIcon name={Tag.BUILDING} size={16} />
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.VENUS_AND_EARTH_TAGS:
                    multiplierElement = (
                        <React.Fragment>
                            <TagIcon name={Tag.VENUS} size={16} />;
                            <TagIcon name={Tag.EARTH} size={16} />;
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.USER_CHOICE_MIN_ZERO:
                case VariableAmount.BASED_ON_USER_CHOICE:
                    multiplierElement = <InlineText>X</InlineText>;
                    break;

                default:
                    throw new Error('variable amount not supported: ' + amount);
            }

            elements.push(
                <Flex
                    justifyContent="center"
                    alignItems="center"
                    marginLeft={i > 0 ? '4px' : 'initial'}
                    style={{
                        backgroundColor: opts.isProduction ? 'brown' : 'initial',
                    }}
                >
                    {opts.isNegative && <span>-</span>}
                    {customElement}
                    {multiplierElement && (
                        <React.Fragment>
                            {resourceIconElement}
                            <TextWithSpacing>/</TextWithSpacing>
                            {multiplierElement}
                        </React.Fragment>
                    )}
                </Flex>
            );
        }
        i++;
    }

    if (opts.isInline) {
        return <React.Fragment>{elements}</React.Fragment>;
    } else {
        return <IconographyRow>{elements}</IconographyRow>;
    }
}

function _renderChangeResourceOptionIconography(
    changeResourceOption: PropertyCounter<Resource>,
    opts?: {
        isNegative?: boolean;
        useRedBorder?: boolean;
        isInline?: boolean;
        isSteal?: boolean;
        isProduction?: boolean;
    }
) {
    opts = {
        useRedBorder: false,
        isNegative: false,
        isInline: true,
        isSteal: false,
        isProduction: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];

    for (const [resource, quantity] of Object.entries(changeResourceOption)) {
        elements.push(_renderChangeResourceIconography({[resource]: quantity}, opts));
        elements.push(<TextWithSpacing>or</TextWithSpacing>);
    }

    // remove the final "or"
    elements.splice(elements.length - 1, 1);

    return <IconographyRow>{elements}</IconographyRow>;
}

function renderGainResourceIconography(gainResource) {
    return _renderChangeResourceIconography(gainResource);
}

function renderGainResourceOptionIconography(gainResourceOption: PropertyCounter<Resource>) {
    return _renderChangeResourceOptionIconography(gainResourceOption, {isInline: true});
}

function renderRemoveResourceIconography(
    removeResource: PropertyCounter<Resource>,
    removeResourceSourceType: ResourceLocationType | undefined
) {
    const useRedBorder =
        removeResourceSourceType &&
        [ResourceLocationType.THIS_CARD, ResourceLocationType.ANY_CARD_OWNED_BY_YOU].includes(
            removeResourceSourceType
        );
    return _renderChangeResourceIconography(removeResource, {
        isNegative: true,
        useRedBorder,
        isInline: false,
    });
}

function renderStealResourceIconography(stealResource: PropertyCounter<Resource>) {
    return _renderChangeResourceOptionIconography(stealResource, {
        isSteal: true,
    });
}

function renderRemoveResourceOptionIconography(
    removeResourceOption: PropertyCounter<Resource>,
    removeResourceSourceType: ResourceLocationType | undefined
) {
    const useRedBorder =
        removeResourceSourceType &&
        [ResourceLocationType.THIS_CARD, ResourceLocationType.ANY_CARD_OWNED_BY_YOU].includes(
            removeResourceSourceType
        );
    return _renderChangeResourceOptionIconography(removeResourceOption, {
        isNegative: true,
        useRedBorder,
        isInline: true,
    });
}

function renderTilePlacementIconography(tilePlacements: Array<TilePlacement>) {
    return (
        <IconographyRow>
            {tilePlacements.map((tilePlacement, index) => {
                return <TileIcon key={index} type={tilePlacement.type} size={40} />;
            })}
        </IconographyRow>
    );
}

export function renderIncreaseProductionIconography(increaseProduction: PropertyCounter<Resource>) {
    return _renderChangeResourceIconography(increaseProduction, {isProduction: true});
}

function renderIncreaseProductionOptionIconography(
    increaseProductionOption: PropertyCounter<Resource>
) {
    return _renderChangeResourceOptionIconography(increaseProductionOption, {
        isInline: true,
        isProduction: true,
    });
}

function renderDecreaseProductionIconography(decreaseProduction: PropertyCounter<Resource>) {
    return _renderChangeResourceIconography(decreaseProduction, {
        isProduction: true,
        isNegative: true,
    });
}

function renderDecreaseAnyProductionIconography(decreaseAnyProduction: PropertyCounter<Resource>) {
    return _renderChangeResourceIconography(decreaseAnyProduction, {
        isProduction: true,
        isNegative: true,
        useRedBorder: true,
    });
}
function renderIncreaseParameterIconography(increaseParameter: PropertyCounter<Parameter>) {
    const elements: Array<React.ReactNode> = [];
    for (const [parameter, amount] of Object.entries(increaseParameter)) {
        if (typeof amount !== 'number') {
            throw new Error('unsupported variable amount in renderIncreaseParameterIconogrophy');
        }
        elements.push(
            <Flex justifyContent="center" alignItems="center">
                <InlineText>{amount}</InlineText>
                <GlobalParameterIcon parameter={parameter as Parameter} size={16} />
            </Flex>
        );
    }
    return elements.length > 0 ? (
        <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            border="1px solid black"
            background="cream"
            width="fit-content"
            style={{
                alignSelf: 'center',
            }}
        >
            {elements}
        </Flex>
    ) : null;
}

function renderDuplicateProductionIconography(duplicateProduction: Tag | undefined) {
    return (
        duplicateProduction && (
            <IconographyRow>
                <InlineText>Copy a </InlineText>
                <ProductionWrapper margin="4px" isProduction={true}>
                    <TagIcon name={Tag.BUILDING} size={16} />
                </ProductionWrapper>
            </IconographyRow>
        )
    );
}
function renderIncreaseTerraformRatingIconography(increaseTerraformRating: Amount | undefined) {
    if (typeof increaseTerraformRating === 'number') {
        if (increaseTerraformRating > 0) {
            return (
                <IconographyRow>
                    {Array(increaseTerraformRating)
                        .fill(null)
                        .map(_ => (
                            <Flex margin="0 4px">
                                <TerraformRatingIcon />
                            </Flex>
                        ))}
                </IconographyRow>
            );
        }
        return null;
    } else {
        if (increaseTerraformRating === VariableAmount.JOVIAN_TAGS) {
            return (
                <IconographyRow>
                    <TerraformRatingIcon size={16} />
                    <InlineText>/</InlineText>
                    <TagIcon name={Tag.JOVIAN} size={16} />
                </IconographyRow>
            );
        } else {
            throw new Error(
                'unsupported variable amount in renderIncreaseTerraformRatingIconography'
            );
        }
    }
}

/**
 * removeResource
 * removeResourceOption
 * gainResource
 * gainResourceOption
 * tile placements
 * steal resource
 * increaseProduction
 * increaseProductionOption
 * duplicateProduction
 * decreaseProduction
 * decreaseAnyProduction
 * increaseParameter
 *
 * increaseTerraformRating
 */
export const CardIconography = ({card}: {card: CardModel | Action}) => {
    return (
        <Flex flexDirection="column">
            {renderTilePlacementIconography(card.tilePlacements ?? [])}
            {renderRemoveResourceIconography(
                card.removeResource ?? {},
                card.removeResourceSourceType
            )}
            {renderRemoveResourceOptionIconography(
                card.removeResourceOption ?? {},
                card.removeResourceSourceType
            )}
            {renderGainResourceIconography(card.gainResource)}
            {renderGainResourceOptionIconography(card.gainResourceOption ?? {})}
            {renderStealResourceIconography(card.stealResource ?? {})}
            {renderIncreaseProductionIconography(card.increaseProduction ?? {})}
            {renderIncreaseProductionOptionIconography(card.increaseProductionOption ?? {})}
            {renderDecreaseProductionIconography(card.decreaseProduction ?? {})}
            {renderDecreaseAnyProductionIconography(card.decreaseAnyProduction ?? {})}
            {renderDuplicateProductionIconography(card.duplicateProduction)}
            {renderIncreaseParameterIconography(card.increaseParameter ?? {})}
            {renderIncreaseTerraformRatingIconography(card.increaseTerraformRating)}
        </Flex>
    );
};
