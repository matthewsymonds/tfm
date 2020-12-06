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
    margin: 4px 0;
`;
const ProductionWrapper = styled.div<{
    margin?: string;
    useRedBorder?: boolean;
}>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 6px;
    background-color: brown;
    border: ${props => (props.useRedBorder ? '2px solid red' : 'initial')};
`;

export function renderChangeResourceIconography(
    changeResource: PropertyCounter<Resource>,
    _opts?: {
        isNegative?: boolean;
        isInline?: boolean;
        shouldShowStealText?: boolean;
        isProduction?: boolean;
        shouldShowPlus?: boolean;
        useRedBorder?: boolean;
    }
) {
    if (Object.keys(changeResource).length === 0) {
        return null;
    }

    const opts = {
        isNegative: false,
        isInline: false,
        shouldShowStealText: false,
        isProduction: false,
        shouldShowPlus: false,
        useRedBorder: false,
        ..._opts,
    };
    const elements: Array<React.ReactNode> = [];
    const shouldShowNegativeSymbol = (r: string) =>
        opts.isNegative && (opts.isProduction || r !== Resource.MEGACREDIT);
    const shouldShowIndividualIcons = (resource: string, amount: number) =>
        amount <= 3 && resource !== Resource.MEGACREDIT;
    const shouldShowAmount = (r: string, a: number) =>
        a > 1 && !shouldShowIndividualIcons(r, a) && r !== Resource.MEGACREDIT;

    let i = 0;
    for (let [resource, amount] of Object.entries(changeResource)) {
        const resourceIconElement = (
            <ResourceIcon
                name={resource as Resource}
                size={16}
                showRedBorder={opts.useRedBorder}
                amount={
                    resource === Resource.MEGACREDIT && typeof amount === 'number'
                        ? `${!opts.isProduction && opts.isNegative ? '-' : ''}${amount}`
                        : undefined
                }
            />
        );
        if (typeof amount === 'number') {
            const prefixElements = [
                ...(opts.shouldShowStealText ? ['STEAL'] : []),
                ...(shouldShowNegativeSymbol(resource) ? ['-'] : []),
                ...(opts.shouldShowPlus ? ['+'] : []),
                ...(shouldShowAmount(resource, amount) ? [amount] : []),
            ];
            elements.push(
                <React.Fragment>
                    {prefixElements.length > 0 && (
                        <TextWithSpacing spacing={2}>{prefixElements}</TextWithSpacing>
                    )}
                    {shouldShowIndividualIcons(resource, amount)
                        ? Array(amount)
                              .fill(null)
                              .map(() => resourceIconElement)
                        : resourceIconElement}
                </React.Fragment>
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
                            <TagIcon name={Tag.MICROBE} size={16} />
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
                    customElement = (
                        <React.Fragment>
                            <InlineText>{opts.shouldShowPlus ? '+' : 'X'}</InlineText>
                            <ResourceIcon name={resource as Resource} size={16}></ResourceIcon>
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.USER_CHOICE:
                    customElement = (
                        <React.Fragment>
                            <InlineText>X</InlineText>
                            <ResourceIcon name={resource as Resource} size={16}></ResourceIcon>
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.USER_CHOICE_UP_TO_ONE:
                    customElement = (
                        <React.Fragment>
                            <InlineText>-</InlineText>
                            <ResourceIcon name={resource as Resource} size={16}></ResourceIcon>
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.TRIPLE_BASED_ON_USER_CHOICE:
                    customElement = (
                        <ResourceIcon name={resource as Resource} size={16} amount="3X" />
                    );
                    break;
                case VariableAmount.REVEALED_CARD_MICROBE:
                    customElement = (
                        <React.Fragment>
                            <TagIcon name={Tag.MICROBE} size={16} />
                            <span>*</span>
                            <TextWithSpacing>:</TextWithSpacing>
                            <ResourceIcon name={resource as Resource} size={16} />
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.RESOURCES_ON_CARD:
                    multiplierElement = (
                        <ResourceIcon name={Resource.ANY_STORABLE_RESOURCE} size={16} />
                    );
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
        return <IconographyRow className="change-resource">{elements}</IconographyRow>;
    }
}

export function renderChangeResourceOptionIconography(
    changeResourceOption: PropertyCounter<Resource>,
    opts?: {
        isNegative?: boolean;
        useRedBorder?: boolean;
        isInline?: boolean;
        shouldShowStealText?: boolean;
        isProduction?: boolean;
    }
) {
    if (Object.keys(changeResourceOption).length === 0) {
        return null;
    }

    opts = {
        useRedBorder: false,
        isNegative: false,
        isInline: true,
        shouldShowStealText: false,
        isProduction: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];

    Object.entries(changeResourceOption).forEach(([resource, quantity], index) => {
        if (index > 0) {
            elements.push(<InlineText>/</InlineText>);
        }
        elements.push(renderChangeResourceIconography({[resource]: quantity}, opts));
    });

    return <IconographyRow>{elements}</IconographyRow>;
}

export function renderGainResourceIconography(
    gainResource,
    opts?: {
        isInline?: boolean;
        shouldShowPlus?: boolean;
    }
) {
    return renderChangeResourceIconography(gainResource, opts);
}

export function renderGainResourceOptionIconography(gainResourceOption: PropertyCounter<Resource>) {
    return renderChangeResourceOptionIconography(gainResourceOption, {isInline: true});
}

export function renderRemoveResourceIconography(
    removeResource: PropertyCounter<Resource>,
    removeResourceSourceType: ResourceLocationType | undefined,
    opts?: {isInline: boolean}
) {
    const useRedBorder =
        removeResourceSourceType &&
        [
            ResourceLocationType.THIS_CARD,
            ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
            ResourceLocationType.ANY_PLAYER,
        ].includes(removeResourceSourceType);
    return renderChangeResourceIconography(removeResource, {
        isNegative: true,
        useRedBorder,
        isInline: opts?.isInline ?? false,
    });
}

function renderStealResourceIconography(stealResource: PropertyCounter<Resource>) {
    return renderChangeResourceOptionIconography(stealResource, {
        shouldShowStealText: true,
    });
}

export function renderRemoveResourceOptionIconography(
    removeResourceOption: PropertyCounter<Resource>,
    removeResourceSourceType?: ResourceLocationType | undefined
) {
    const useRedBorder =
        removeResourceSourceType &&
        [ResourceLocationType.THIS_CARD, ResourceLocationType.ANY_CARD_OWNED_BY_YOU].includes(
            removeResourceSourceType
        );
    return renderChangeResourceOptionIconography(removeResourceOption, {
        isNegative: true,
        useRedBorder,
        isInline: true,
    });
}

function renderTilePlacementIconography(tilePlacements: Array<TilePlacement>) {
    if (tilePlacements.length === 0) {
        return null;
    }

    return (
        <IconographyRow className="tile-placements">
            {tilePlacements.map((tilePlacement, index) => {
                return (
                    <Flex margin="0 4px">
                        <TileIcon key={index} type={tilePlacement.type} size={40} />
                    </Flex>
                );
            })}
        </IconographyRow>
    );
}

export function renderIncreaseProductionIconography(
    increaseProduction: PropertyCounter<Resource>,
    opts?: {
        shouldShowPlus?: boolean;
    }
) {
    return renderChangeResourceIconography(increaseProduction, {...opts, isProduction: true});
}

function renderIncreaseProductionOptionIconography(
    increaseProductionOption: PropertyCounter<Resource>,
    opts?: {isInline?: boolean}
) {
    if (Object.keys(increaseProductionOption).length < 1) {
        return null;
    }

    if (opts?.isInline) {
        return renderChangeResourceOptionIconography(increaseProductionOption, {
            isInline: true,
            isProduction: true,
        });
    }
    return (
        <IconographyRow className="change-resource-option">
            {renderChangeResourceOptionIconography(increaseProductionOption, {
                isInline: true,
                isProduction: true,
            })}
        </IconographyRow>
    );
}

export function renderDecreaseProductionIconography(
    decreaseProduction: PropertyCounter<Resource>,
    opts?: {isInline?: boolean}
) {
    return renderChangeResourceIconography(decreaseProduction, {
        isProduction: true,
        isNegative: true,
        isInline: opts?.isInline ?? false,
    });
}

function renderDecreaseAnyProductionIconography(
    decreaseAnyProduction: PropertyCounter<Resource>,
    opts?: {isInline?: boolean}
) {
    return renderChangeResourceIconography(decreaseAnyProduction, {
        isProduction: true,
        isNegative: true,
        useRedBorder: true,
        isInline: opts?.isInline ?? false,
    });
}
function renderIncreaseParameterIconography(increaseParameter: PropertyCounter<Parameter>) {
    if (Object.values(increaseParameter).length === 0) {
        return null;
    }

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
    return <IconographyRow className="increase-parameter">{elements}</IconographyRow>;
}

function renderDuplicateProductionIconography(duplicateProduction: Tag | undefined) {
    return (
        duplicateProduction && (
            <IconographyRow className="duplicate-production">
                <InlineText>Copy a </InlineText>
                <TagIcon name={Tag.BUILDING} size={16} />
            </IconographyRow>
        )
    );
}

function renderProductionIconography(cardOrAction: CardModel | Action) {
    if (cardOrAction instanceof CardModel && !cardOrAction.hasProductionChange) {
        return null;
    }

    if (
        !(cardOrAction instanceof CardModel) &&
        !cardOrAction.decreaseProduction &&
        !cardOrAction.decreaseAnyProduction &&
        !cardOrAction.increaseProduction &&
        !cardOrAction.increaseProductionOption &&
        !cardOrAction.duplicateProduction
    ) {
        return null;
    }

    const shouldShowPlus =
        Object.values({
            ...cardOrAction.decreaseProduction,
            ...cardOrAction.decreaseAnyProduction,
        }).length > 0;

    return (
        <IconographyRow>
            <ProductionWrapper>
                {Object.values({
                    ...cardOrAction.decreaseProduction,
                    ...cardOrAction.decreaseAnyProduction,
                }).length > 0 && (
                    <IconographyRow>
                        {renderDecreaseProductionIconography(
                            cardOrAction.decreaseProduction ?? {},
                            {
                                isInline: true,
                            }
                        )}
                        {renderDecreaseAnyProductionIconography(
                            cardOrAction.decreaseAnyProduction ?? {},
                            {
                                isInline: true,
                            }
                        )}
                    </IconographyRow>
                )}
                {renderIncreaseProductionIconography(cardOrAction.increaseProduction ?? {}, {
                    shouldShowPlus,
                })}
                {renderIncreaseProductionOptionIconography(
                    cardOrAction.increaseProductionOption ?? {}
                )}
                {renderDuplicateProductionIconography(cardOrAction.duplicateProduction)}
            </ProductionWrapper>
        </IconographyRow>
    );
}

function renderIncreaseTerraformRatingIconography(increaseTerraformRating: Amount | undefined) {
    if (typeof increaseTerraformRating === 'number') {
        if (increaseTerraformRating > 0) {
            return (
                <IconographyRow className="increase-terraform-rating">
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
                <IconographyRow className="increase-terraform-rating">
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

export const CardIconography = ({card}: {card: CardModel}) => {
    return (
        <Flex flexDirection="column" alignItems="center">
            <Flex justifyContent="space-evenly" width="100%">
                {renderTilePlacementIconography(card.tilePlacements)}
                {renderProductionIconography(card)}
            </Flex>
            {renderRemoveResourceIconography(card.removeResource, card.removeResourceSourceType)}
            {renderRemoveResourceOptionIconography(
                card.removeResourceOption,
                card.removeResourceSourceType
            )}
            {renderGainResourceIconography(card.gainResource)}
            {renderGainResourceOptionIconography(card.gainResourceOption)}
            {renderStealResourceIconography(card.stealResource)}
            {renderIncreaseParameterIconography(card.increaseParameter)}
            {renderIncreaseTerraformRatingIconography(card.increaseTerraformRating)}
        </Flex>
    );
};
