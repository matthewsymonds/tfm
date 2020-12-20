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
export const IconographyRow = styled.div<{isInline?: boolean}>`
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: ${props => (props.isInline ? '0' : '4px')};
`;
const ProductionWrapper = styled.div<>`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    background-color: brown;
`;

export function ChangeResourceIconography({
    changeResource,
    opts,
}: {
    changeResource: PropertyCounter<Resource>;
    opts?: {
        isNegative?: boolean;
        isInline?: boolean;
        shouldShowStealText?: boolean;
        isProduction?: boolean;
        shouldShowPlus?: boolean;
        useRedBorder?: boolean;
    };
}) {
    if (Object.keys(changeResource).length === 0) {
        return null;
    }

    opts = {
        isNegative: false,
        isInline: false,
        shouldShowStealText: false,
        isProduction: false,
        shouldShowPlus: false,
        useRedBorder: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];
    const shouldShowNegativeSymbol = (r: string) =>
        opts?.isNegative && (opts?.isProduction || r !== Resource.MEGACREDIT);
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
            let el = (
                <React.Fragment>
                    {prefixElements.length > 0 && (
                        <TextWithSpacing spacing={2}>{prefixElements}</TextWithSpacing>
                    )}
                    {shouldShowIndividualIcons(resource, amount)
                        ? Array(amount)
                              .fill(null)
                              .map((_, index) => <div key={index}>{resourceIconElement}</div>)
                        : resourceIconElement}
                </React.Fragment>
            );
            if (opts.isProduction) {
                elements.push(<ProductionWrapper>{el}</ProductionWrapper>);
            } else {
                elements.push(el);
            }
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
                            <IconographyRow>
                                <ResourceIcon name={Resource.PLANT} size={16} />
                                <TextWithSpacing>OR</TextWithSpacing>
                            </IconographyRow>
                            <IconographyRow>
                                <InlineText>3</InlineText>
                                <TagIcon name={Tag.PLANT} size={16} />
                                <TextWithSpacing>:</TextWithSpacing>
                                <InlineText>4</InlineText>{' '}
                                <ResourceIcon name={Resource.PLANT} size={16} />
                            </IconographyRow>
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
                    key={i}
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

    return (
        <IconographyRow className="change-resource" isInline={opts.isInline}>
            {elements}
        </IconographyRow>
    );
}

export function ChangeResourceOptionIconography({
    changeResourceOption,
    opts,
}: {
    changeResourceOption: PropertyCounter<Resource>;
    opts?: {
        isNegative?: boolean;
        useRedBorder?: boolean;
        isInline?: boolean;
        shouldShowStealText?: boolean;
        isProduction?: boolean;
        useSlashSeparator?: boolean;
    };
}) {
    if (Object.keys(changeResourceOption).length === 0) {
        return null;
    }

    opts = {
        useRedBorder: false,
        isNegative: false,
        isInline: true,
        shouldShowStealText: false,
        isProduction: false,
        useSlashSeparator: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];

    Object.entries(changeResourceOption).forEach(([resource, quantity], index) => {
        if (index > 0) {
            elements.push(
                <TextWithSpacing>{opts?.useSlashSeparator ? '/' : 'or'}</TextWithSpacing>
            );
        }
        elements.push(
            <ChangeResourceIconography changeResource={{[resource]: quantity}} opts={opts} />
        );
    });

    return <IconographyRow>{elements}</IconographyRow>;
}

export function GainResourceIconography({
    gainResource,
    opts,
}: {
    gainResource: PropertyCounter<Resource>;
    opts?: {
        isInline?: boolean;
        shouldShowPlus?: boolean;
    };
}) {
    return <ChangeResourceIconography changeResource={gainResource} opts={opts} />;
}

export function GainResourceOptionIconography({
    gainResourceOption,
    opts,
}: {
    gainResourceOption: PropertyCounter<Resource>;
    opts?: {
        useSlashSeparator?: boolean;
    };
}) {
    return (
        <ChangeResourceOptionIconography
            changeResourceOption={gainResourceOption}
            opts={{isInline: true, useSlashSeparator: opts?.useSlashSeparator ?? false}}
        />
    );
}

export function RemoveResourceIconography({
    removeResource,
    sourceType,
    opts,
}: {
    removeResource: PropertyCounter<Resource>;
    sourceType: ResourceLocationType | undefined;
    opts?: {isInline: boolean};
}) {
    const useRedBorder =
        sourceType &&
        [
            // ResourceLocationType.THIS_CARD,
            // ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
            ResourceLocationType.ANY_PLAYER,
        ].includes(sourceType);
    return (
        <ChangeResourceIconography
            changeResource={removeResource}
            opts={{
                isNegative: true,
                useRedBorder,
                isInline: opts?.isInline ?? false,
            }}
        />
    );
}

function StealResourceIconography({stealResource}: {stealResource: PropertyCounter<Resource>}) {
    return (
        <ChangeResourceOptionIconography
            changeResourceOption={stealResource}
            opts={{
                shouldShowStealText: true,
                useRedBorder: true,
            }}
        />
    );
}

export function RemoveResourceOptionIconography({
    removeResourceOption,
    sourceType,
}: {
    removeResourceOption: PropertyCounter<Resource>;
    sourceType?: ResourceLocationType | undefined;
}) {
    const useRedBorder =
        sourceType &&
        [
            // ResourceLocationType.THIS_CARD,
            // ResourceLocationType.ANY_CARD_OWNED_BY_YOU,
            ResourceLocationType.ANY_PLAYER,
        ].includes(sourceType);

    return (
        <ChangeResourceOptionIconography
            changeResourceOption={removeResourceOption}
            opts={{
                isNegative: true,
                useRedBorder,
                isInline: true,
            }}
        />
    );
}

function TilePlacementIconography({tilePlacements}: {tilePlacements: Array<TilePlacement>}) {
    if (tilePlacements.length === 0) {
        return null;
    }

    return (
        <IconographyRow className="tile-placements">
            {tilePlacements.map((tilePlacement, index) => {
                return (
                    <Flex margin="0 4px" key={index}>
                        <TileIcon type={tilePlacement.type} size={40} />
                    </Flex>
                );
            })}
        </IconographyRow>
    );
}

export function IncreaseProductionIconography({
    increaseProduction,
    opts,
}: {
    increaseProduction: PropertyCounter<Resource>;
    opts?: {
        shouldShowPlus?: boolean;
    };
}) {
    return (
        <ChangeResourceIconography
            changeResource={increaseProduction}
            opts={{...opts, isProduction: true}}
        />
    );
}

function IncreaseProductionOptionIconography({
    increaseProductionOption,
    opts,
}: {
    increaseProductionOption: PropertyCounter<Resource>;
    opts?: {isInline?: boolean};
}) {
    if (Object.keys(increaseProductionOption).length < 1) {
        return null;
    }

    if (opts?.isInline) {
        return (
            <ChangeResourceOptionIconography
                changeResourceOption={increaseProductionOption}
                opts={{
                    isInline: true,
                    isProduction: true,
                }}
            />
        );
    }
    return (
        <IconographyRow className="change-resource-option">
            {
                <ChangeResourceOptionIconography
                    changeResourceOption={increaseProductionOption}
                    opts={{
                        isInline: true,
                        isProduction: true,
                    }}
                />
            }
        </IconographyRow>
    );
}

export function DecreaseProductionIconography({
    decreaseProduction,
    opts,
}: {
    decreaseProduction: PropertyCounter<Resource>;
    opts?: {isInline?: boolean};
}) {
    return (
        <ChangeResourceIconography
            changeResource={decreaseProduction}
            opts={{
                isProduction: true,
                isNegative: true,
                isInline: opts?.isInline ?? false,
            }}
        />
    );
}

function DecreaseAnyProductionIconography({
    decreaseAnyProduction,
    opts,
}: {
    decreaseAnyProduction: PropertyCounter<Resource>;
    opts?: {isInline?: boolean};
}) {
    return (
        <ChangeResourceIconography
            changeResource={decreaseAnyProduction}
            opts={{
                isProduction: true,
                isNegative: true,
                useRedBorder: true,
                isInline: opts?.isInline ?? false,
            }}
        />
    );
}
export function IncreaseParameterIconography({
    increaseParameter,
}: {
    increaseParameter: PropertyCounter<Parameter>;
}) {
    if (Object.values(increaseParameter).length === 0) {
        return null;
    }

    const elements: Array<React.ReactNode> = [];
    for (const [parameter, amount] of Object.entries(increaseParameter)) {
        if (typeof amount !== 'number') {
            throw new Error('unsupported variable amount in renderIncreaseParameterIconogrophy');
        }
        elements.push(
            ...Array(amount)
                .fill(null)
                .map((_, index) => (
                    <GlobalParameterIcon key={index} parameter={parameter as Parameter} size={16} />
                ))
        );
    }
    return <IconographyRow className="increase-parameter">{elements}</IconographyRow>;
}

function DuplicateProductionIconography({
    duplicateProduction,
}: {
    duplicateProduction: Tag | undefined;
}) {
    if (!duplicateProduction) return null;

    return (
        <IconographyRow className="duplicate-production">
            <InlineText>Copy a </InlineText>
            <TagIcon name={Tag.BUILDING} size={16} />
        </IconographyRow>
    );
}

function ProductionIconography({cardOrAction}: {cardOrAction: CardModel | Action}) {
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
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                    {Object.values({
                        ...cardOrAction.decreaseProduction,
                        ...cardOrAction.decreaseAnyProduction,
                    }).length > 0 && (
                        <IconographyRow>
                            <RemoveResourceIconography
                                removeResource={cardOrAction.decreaseProduction ?? {}}
                                sourceType={undefined}
                                opts={{
                                    isInline: true,
                                }}
                            />
                            <RemoveResourceIconography
                                removeResource={cardOrAction.decreaseAnyProduction ?? {}}
                                sourceType={ResourceLocationType.ANY_PLAYER}
                                opts={{
                                    isInline: true,
                                }}
                            />
                        </IconographyRow>
                    )}
                    <GainResourceIconography
                        gainResource={cardOrAction.increaseProduction ?? {}}
                        opts={{
                            shouldShowPlus,
                        }}
                    />
                    <GainResourceOptionIconography
                        gainResourceOption={cardOrAction.increaseProductionOption ?? {}}
                    />
                    <DuplicateProductionIconography
                        duplicateProduction={cardOrAction.duplicateProduction}
                    />
                </Flex>
            </ProductionWrapper>
        </IconographyRow>
    );
}

function IncreaseTerraformRatingIconography({
    increaseTerraformRating,
}: {
    increaseTerraformRating: Amount | undefined;
}) {
    if (!increaseTerraformRating) return null;

    if (typeof increaseTerraformRating === 'number') {
        if (increaseTerraformRating > 0) {
            return (
                <IconographyRow className="increase-terraform-rating">
                    {Array(increaseTerraformRating)
                        .fill(null)
                        .map((_, index) => (
                            <Flex key={index} margin="0 4px">
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

function TemporaryAdjustmentIconography({
    temporaryParameterRequirementAdjustments,
}: {
    temporaryParameterRequirementAdjustments: PropertyCounter<Parameter>;
}) {
    if (Object.keys(temporaryParameterRequirementAdjustments).length === 0) {
        return null;
    }

    const elements: Array<React.ReactNode> = [];
    for (const [parameter, adjustment] of Object.entries(
        temporaryParameterRequirementAdjustments
    )) {
        if (typeof adjustment !== 'number') {
            throw new Error('Unsupported variable amount of temporary adjustment');
        }

        elements.push(
            <IconographyRow>
                <GlobalParameterIcon parameter={parameter as Parameter} size={12} />
                <TextWithSpacing>:</TextWithSpacing>
                <InlineText>+/- {adjustment}</InlineText>
            </IconographyRow>
        );
    }

    return elements;
}

export const CardIconography = ({card}: {card: CardModel}) => {
    return (
        <Flex flexDirection="column" alignItems="center">
            <Flex justifyContent="space-evenly" width="100%">
                <TilePlacementIconography tilePlacements={card.tilePlacements} />
                <ProductionIconography cardOrAction={card} />
            </Flex>
            <RemoveResourceIconography
                removeResource={card.removeResource}
                sourceType={card.removeResourceSourceType}
            />
            <RemoveResourceOptionIconography
                removeResourceOption={card.removeResourceOption}
                sourceType={card.removeResourceSourceType}
            />
            <GainResourceIconography gainResource={card.gainResource} />
            <GainResourceOptionIconography gainResourceOption={card.gainResourceOption} />
            <StealResourceIconography stealResource={card.stealResource} />
            <IncreaseParameterIconography increaseParameter={card.increaseParameter} />
            <IncreaseTerraformRatingIconography
                increaseTerraformRating={card.increaseTerraformRating}
            />
            <TemporaryAdjustmentIconography
                temporaryParameterRequirementAdjustments={
                    card.temporaryParameterRequirementAdjustments
                }
            />
        </Flex>
    );
};
