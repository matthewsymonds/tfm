import {Flex} from 'components/box';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {ColonyIcon, TerraformRatingIcon} from 'components/icons/other';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {Action, Amount} from 'constants/action';
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
export const TextWithMargin = styled(InlineText)<{margin?: string; useMonoFont?: boolean}>`
    font-family: ${props =>
        props.useMonoFont ? 'monospace' : 'inherit'}; // for evenly spaced icon text
    margin: ${props => props.margin ?? '0 4px'};
`;
export const IconographyRow = styled.div<{isInline?: boolean}>`
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: ${props => (props.isInline ? '0' : '4px')};
`;
const ProductionWrapper = styled.div`
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
        opts?.isNegative && !(opts?.isProduction && r === Resource.MEGACREDIT);
    const shouldShowIndividualIcons = (resource: string, amount: number) =>
        amount > 1 && amount <= 3 && resource !== Resource.MEGACREDIT;
    const shouldShowAmount = (r: string, a: number) =>
        a > 1 && !shouldShowIndividualIcons(r, a) && r !== Resource.MEGACREDIT;

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
            const prefixElements = [
                ...(opts.shouldShowStealText ? ['STEAL'] : []),
                ...(shouldShowNegativeSymbol(resource) ? ['-'] : []),
                ...(opts.shouldShowPlus ? ['+'] : []),
                ...(shouldShowAmount(resource, amount) ? [amount] : []),
            ];
            let el = (
                <Flex marginLeft={i > 0 ? '6px' : '0px'}>
                    {prefixElements.length > 0 && (
                        <TextWithMargin useMonoFont={true} margin="0 4px 0 0">
                            {prefixElements}
                        </TextWithMargin>
                    )}
                    {shouldShowIndividualIcons(resource, amount)
                        ? Array(amount)
                              .fill(null)
                              .map((_, index) => (
                                  <Flex key={index} marginLeft={index > 0 ? '6px' : '0px'}>
                                      {resourceIconElement}
                                  </Flex>
                              ))
                        : resourceIconElement}
                </Flex>
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
                            <TextWithMargin>{opts.shouldShowPlus ? '+' : 'X'}</TextWithMargin>
                            <ResourceIcon name={resource as Resource} size={16}></ResourceIcon>
                        </React.Fragment>
                    );
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
        isInline: false,
        shouldShowStealText: false,
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
                opts={{...opts, isInline: true}}
            />
        );
    });

    return <IconographyRow isInline={opts.isInline}>{elements}</IconographyRow>;
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

export function StealResourceIconography({
    stealResource,
    opts,
}: {
    stealResource: PropertyCounter<Resource>;
    opts?: {shouldShowStealText?: boolean};
}) {
    return (
        <ChangeResourceOptionIconography
            changeResourceOption={stealResource}
            opts={{
                shouldShowStealText: opts?.shouldShowStealText ?? true,
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
            <TextWithMargin margin="0 4px 0 0">Copy a </TextWithMargin>
            <TagIcon name={Tag.BUILDING} size={16} />
        </IconographyRow>
    );
}

function ProductionIconography({card}: {card: CardModel}) {
    debugger;
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

    // NOTE: For this aggregated ProductionIconography component (which combines all production
    // deltas into a single block with uniform brown bg), we use the ChangeResource variants
    // instead of ChangeProduction. This is so we don't duplicate the brown background.
    return (
        <IconographyRow>
            <ProductionWrapper>
                <Flex flexDirection="column" justifyContent="center" alignItems="center">
                    {Object.values({
                        ...card.decreaseProduction,
                        ...card.decreaseAnyProduction,
                    }).length > 1 ? (
                        <IconographyRow>
                            <TextWithMargin margin="0 4px 0 0">-</TextWithMargin>
                            <ChangeResourceIconography
                                changeResource={card.decreaseProduction ?? {}}
                                opts={{
                                    isInline: true,
                                }}
                            />
                            <div style={{width: 6}} /> {/* hack for spacing */}
                            <ChangeResourceIconography
                                changeResource={card.decreaseAnyProduction ?? {}}
                                opts={{
                                    isInline: true,
                                    useRedBorder: true,
                                }}
                            />
                        </IconographyRow>
                    ) : (
                        <React.Fragment>
                            <RemoveResourceIconography
                                removeResource={card.decreaseProduction ?? {}}
                                sourceType={undefined}
                            />
                            <RemoveResourceIconography
                                removeResource={card.decreaseAnyProduction ?? {}}
                                sourceType={ResourceLocationType.ANY_PLAYER}
                            />
                        </React.Fragment>
                    )}
                    <GainResourceIconography
                        gainResource={card.increaseProduction ?? {}}
                        opts={{
                            shouldShowPlus,
                        }}
                    />
                    <GainResourceOptionIconography
                        gainResourceOption={card.increaseProductionOption ?? {}}
                    />
                    <DuplicateProductionIconography
                        duplicateProduction={card.duplicateProduction}
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
