import {Flex} from 'components/box';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {ColonyIcon, TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {Amount} from 'constants/action';
import {Parameter, TilePlacement, TileType} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource, ResourceLocationType} from 'constants/resource';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {Card as CardModel} from 'models/card';
import React from 'react';
import styled from 'styled-components';

export const InlineText = styled.span`
    margin: 3px 0;
    height: 16px;
    line-height: 16px;
`;
export const TextWithMargin = styled(InlineText)<{margin?: string; fontSize?: string}>`
    font-size: ${props => props.fontSize ?? '12px'};
    margin: ${props => props.margin ?? '0 4px'};
`;
export const IconographyRow = styled.div<{isInline?: boolean}>`
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: ${props => (props.isInline ? '0' : '4px')};
`;
const PRODUCTION_PADDING = 6;
const ProductionWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${PRODUCTION_PADDING}px;
    background-color: brown;
`;
const GroupedProductionWrapper = styled(ProductionWrapper)`
    padding: 0;
`;

export function ChangeResourceIconography({
    changeResource,
    opts,
}: {
    changeResource: PropertyCounter<Resource>;
    opts?: {
        isNegative?: boolean;
        isInline?: boolean;
        showStealText?: boolean;
        isProduction?: boolean;
        shouldShowPlus?: boolean;
        useRedBorder?: boolean;
        showNumericQuantity?: boolean;
    };
}) {
    if (Object.keys(changeResource).length === 0) {
        return null;
    }

    opts = {
        isNegative: false,
        isInline: false,
        showStealText: false,
        isProduction: false,
        shouldShowPlus: false,
        useRedBorder: false,
        showNumericQuantity: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];
    const shouldShowNegativeSymbol = (r: string) =>
        opts?.isNegative && !(opts?.isProduction && r === Resource.MEGACREDIT);
    const getShouldShowNumericQuantity = (resource: string, amount: number) => {
        // never show number for MC (its special-cased and always shown in the icon itself)
        if (resource === Resource.MEGACREDIT) return false;
        // if the caller explicitly requested it, show number
        if (opts?.showNumericQuantity) return true;
        // if the total number of resources being adjusted is more than 6, show number
        if (
            Object.values(changeResource).reduce<number>(
                (acc, cur) => acc + (typeof cur === 'number' ? cur : 0),
                0
            ) > 6
        )
            return true;
        // if the number for this specific resource type is more than 3, show number
        if (amount > 3) return true;
        // fallback to showing individual icons
        return false;
    };

    let i = 0;
    for (let [resource, amount] of Object.entries(changeResource)) {
        // HACK: this naively assumes all variable amounts are coded as "1 per X", where X may be
        // "3 bacteria", "2 building tags", etc. If we ever want to support "Y per X", we'll need
        // to modify this to determine what value to show as Y (instead of always showing 1)
        const resourceIconElement = (
            <ResourceIcon
                name={resource as Resource}
                size={16}
                showRedBorder={opts.useRedBorder}
                amount={
                    resource === Resource.MEGACREDIT
                        ? `${!shouldShowNegativeSymbol(resource) && opts.isNegative ? '-' : ''}${
                              typeof amount === 'number' ? amount : 1
                          }`
                        : undefined
                }
                margin={0}
            />
        );
        if (typeof amount === 'number') {
            const shouldShowNumericQuantity = getShouldShowNumericQuantity(resource, amount);
            const prefixElements = [
                ...(opts.showStealText ? ['STEAL'] : []),
                ...(shouldShowNegativeSymbol(resource) ? ['-'] : []),
                ...(opts.shouldShowPlus ? ['+'] : []),
                ...(shouldShowNumericQuantity ? [amount] : []),
            ];
            let el = (
                <Flex marginLeft={i > 0 ? '6px' : '0px'}>
                    {prefixElements.length > 0 && (
                        <TextWithMargin margin="0 4px 0 0" fontSize="12px">
                            {prefixElements}
                        </TextWithMargin>
                    )}
                    {shouldShowNumericQuantity || resource === Resource.MEGACREDIT
                        ? resourceIconElement
                        : Array(amount)
                              .fill(null)
                              .map((_, index) => (
                                  <Flex key={index} marginLeft={index > 0 ? '6px' : '0px'}>
                                      {resourceIconElement}
                                  </Flex>
                              ))}
                </Flex>
            );
            if (opts.isProduction) {
                elements.push(<ProductionWrapper>{el}</ProductionWrapper>);
            } else {
                elements.push(<React.Fragment>{el}</React.Fragment>);
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
                            <Flex alignItems="center" marginBottom="8px">
                                <ResourceIcon name={Resource.PLANT} size={16} />
                                <TextWithMargin>OR</TextWithMargin>
                            </Flex>
                            <Flex alignItems="center" justifyContent="center">
                                <TextWithMargin>3</TextWithMargin>
                                <TagIcon name={Tag.PLANT} size={16} />
                                <TextWithMargin>:</TextWithMargin>
                                <TextWithMargin>4</TextWithMargin>{' '}
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
                            <TextWithMargin>OR</TextWithMargin>
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
                    multiplierElement = <TagIcon name={Tag.SPACE} size={16} showRedBorder={true} />;
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
                    if (resource === Resource.MEGACREDIT) {
                        customElement = (
                            <React.Fragment>
                                <TextWithMargin>+</TextWithMargin>
                                <ResourceIcon name={resource as Resource} size={16} amount="X" />
                            </React.Fragment>
                        );
                    } else {
                        customElement = (
                            <React.Fragment>
                                <TextWithMargin>{opts.shouldShowPlus ? '+' : 'X'}</TextWithMargin>
                                <ResourceIcon name={resource as Resource} size={16}></ResourceIcon>
                            </React.Fragment>
                        );
                    }
                    break;
                case VariableAmount.USER_CHOICE:
                    customElement = (
                        <React.Fragment>
                            <TextWithMargin>X</TextWithMargin>
                            <ResourceIcon name={resource as Resource} size={16}></ResourceIcon>
                        </React.Fragment>
                    );
                    break;
                case VariableAmount.USER_CHOICE_UP_TO_ONE:
                    customElement = (
                        <React.Fragment>
                            <TextWithMargin>-</TextWithMargin>
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
                            <TextWithMargin>:</TextWithMargin>
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
                            <TextWithMargin>/</TextWithMargin>
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
            {elements.map((el, i) => (
                <React.Fragment key={i}>{el}</React.Fragment>
            ))}
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
        showStealText?: boolean;
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
        isInline: false,
        showStealText: false,
        isProduction: false,
        useSlashSeparator: false,
        ...opts,
    };
    const elements: Array<React.ReactNode> = [];

    Object.entries(changeResourceOption).forEach(([resource, quantity], index) => {
        if (index > 0) {
            elements.push(<TextWithMargin>{opts?.useSlashSeparator ? '/' : 'or'}</TextWithMargin>);
        }
        elements.push(
            <ChangeResourceIconography
                changeResource={{[resource]: quantity}}
                opts={{...opts, isInline: true, showNumericQuantity: true}}
            />
        );
    });

    return (
        <IconographyRow isInline={opts.isInline}>
            {elements.map((el, i) => (
                <React.Fragment key={i}>{el}</React.Fragment>
            ))}
        </IconographyRow>
    );
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
        isInline?: boolean;
    };
}) {
    return (
        <ChangeResourceOptionIconography
            changeResourceOption={gainResourceOption}
            opts={{
                isInline: opts?.isInline ?? false,
                useSlashSeparator: opts?.useSlashSeparator ?? false,
            }}
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
    const useRedBorder = sourceType && sourceType === ResourceLocationType.ANY_PLAYER;
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

export function StealResourceIconography({
    stealResource,
    opts,
}: {
    stealResource: PropertyCounter<Resource>;
    opts?: {showStealText?: boolean};
}) {
    return (
        <ChangeResourceOptionIconography
            changeResourceOption={stealResource}
            opts={{
                showStealText: opts?.showStealText ?? true,
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
    const useRedBorder = sourceType && sourceType === ResourceLocationType.ANY_PLAYER;

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
                    <Flex marginLeft={index > 0 ? '4px' : '0'}>
                        <GlobalParameterIcon
                            key={index}
                            parameter={parameter as Parameter}
                            size={16}
                        />
                    </Flex>
                ))
        );
    }
    return <IconographyRow className="increase-parameter">{elements}</IconographyRow>;
}

function DuplicateProductionIconography({
    duplicateProduction,
    opts,
}: {
    duplicateProduction: Tag | undefined;
    opts?: {
        isInline?: boolean;
    };
}) {
    if (!duplicateProduction) return null;

    return (
        <IconographyRow className="duplicate-production" isInline={opts?.isInline ?? false}>
            <TextWithMargin margin="0 4px 0 0">Copy a </TextWithMargin>
            <TagIcon name={Tag.BUILDING} size={16} />
        </IconographyRow>
    );
}

function ProductionIconography({card}: {card: CardModel}) {
    if (
        Object.keys({
            ...card.decreaseProduction,
            ...card.decreaseAnyProduction,
            ...card.increaseProduction,
            ...card.increaseProductionOption,
        }).length === 0 &&
        !card.duplicateProduction
    ) {
        return null;
    }

    const shouldShowPlus =
        Object.values({
            ...card.decreaseProduction,
            ...card.decreaseAnyProduction,
        }).length > 0;

    const hasDecreaseProduction =
        Object.values({
            ...card.decreaseProduction,
        }).length > 0;
    const hasDecreaseAnyProduction =
        Object.values({
            ...card.decreaseAnyProduction,
        }).length > 0;
    const hasIncreaseProduction =
        Object.values({
            ...card.increaseProduction,
        }).length > 0;
    const hasIncreaseProductionOption =
        Object.values({
            ...card.increaseProductionOption,
        }).length > 0;
    const hasDuplicateProduction = !!card.duplicateProduction;

    let rows: Array<React.ReactNode> = [];
    if (hasDecreaseProduction || hasDecreaseAnyProduction) {
        rows.push(
            <React.Fragment>
                <TextWithMargin margin="0 4px 0 0">-</TextWithMargin>
                <ChangeResourceIconography
                    changeResource={card.decreaseProduction ?? {}}
                    opts={{
                        isInline: true,
                    }}
                />
                {hasDecreaseProduction && hasDecreaseAnyProduction && <div style={{width: 6}} />}
                <ChangeResourceIconography
                    changeResource={card.decreaseAnyProduction ?? {}}
                    opts={{
                        isInline: true,
                        useRedBorder: true,
                    }}
                />
            </React.Fragment>
        );
    }
    if (hasIncreaseProduction) {
        for (const [resource, amount] of Object.entries(card.increaseProduction)) {
            if (
                amount === VariableAmount.MINING_RIGHTS_CELL_HAS_TITANIUM_BONUS ||
                amount === VariableAmount.MINING_AREA_CELL_HAS_TITANIUM_BONUS
            ) {
                // hack due to how we render mining rights/area iconography
                continue;
            }
            rows.push(
                <ChangeResourceIconography
                    changeResource={{[resource]: amount}}
                    opts={{
                        shouldShowPlus,
                        isInline: true,
                    }}
                />
            );
        }
    }
    if (hasIncreaseProductionOption) {
        rows.push(
            <ChangeResourceOptionIconography
                changeResourceOption={card.increaseProductionOption ?? {}}
                opts={{isInline: true}}
            />
        );
    }
    if (hasDuplicateProduction) {
        rows.push(
            <DuplicateProductionIconography
                duplicateProduction={card.duplicateProduction}
                opts={{isInline: true}}
            />
        );
    }

    // NOTE: For this aggregated ProductionIconography component (which combines all production
    // deltas into a single block with uniform brown bg), we use the ChangeResource variants
    // instead of ChangeProduction. This is so we don't duplicate the brown background.
    return (
        <IconographyRow>
            <GroupedProductionWrapper>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                    {rows.map((row, index) => (
                        <Flex
                            key={index}
                            alignItems="center"
                            justifyContent="center"
                            margin={`${PRODUCTION_PADDING}px`}
                            marginTop={index > 0 ? '0' : `${PRODUCTION_PADDING}px`}
                        >
                            {row}
                        </Flex>
                    ))}
                </Flex>
            </GroupedProductionWrapper>
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
            <IconographyRow key={elements.length}>
                <GlobalParameterIcon parameter={parameter as Parameter} size={12} />
                <TextWithMargin>:</TextWithMargin>
                <InlineText>+/- {adjustment}</InlineText>
            </IconographyRow>
        );
    }

    return <React.Fragment>{elements}</React.Fragment>;
}

export const CardIconography = ({card}: {card: CardModel}) => {
    return (
        <Flex flexDirection="column" alignItems="center">
            <Flex justifyContent="space-evenly" width="100%">
                <TilePlacementIconography tilePlacements={card.tilePlacements} />
                <ProductionIconography card={card} />
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
