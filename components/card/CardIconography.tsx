import {PlaceColony} from 'actions';
import {Hexagon} from 'components/board/hexagon';
import {Box, Flex} from 'components/box';
import {TradeFleet} from 'components/colony';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {ColonyIcon, TerraformRatingIcon} from 'components/icons/other';
import {PRODUCTION_PADDING} from 'components/icons/production';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {Action, Amount} from 'constants/action';
import {Parameter, TilePlacement, TileType} from 'constants/board';
import {CardSelectionCriteria} from 'constants/card-selection-criteria';
import {Condition, isConditionAmount} from 'constants/conditional-amount';
import {isContestAmount} from 'constants/contest-amount';
import {
    Operation,
    getSymbolForOperation,
    isOperationAmount,
} from 'constants/operation-amount';
import {isProductionAmount} from 'constants/production-amount';
import {PropertyCounter} from 'constants/property-counter';
import {ResourceLocationType, getResourceBorder} from 'constants/resource';
import {isResourceAmount} from 'constants/resource-amount';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {isTileAmount} from 'constants/tile-amount';
import {VariableAmount} from 'constants/variable-amount';
import {
    Card as CardModel,
    doesActionHaveProductionIconography,
} from 'models/card';
import React from 'react';
import Twemoji from 'react-twemoji';
import {isTagAmount} from 'selectors/is-tag-amount';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';
import {renderArrow} from './CardActions';

export const InlineText = styled.span`
    margin: 3px 0;
    height: 16px;
    line-height: 16px;
    display: inline-block;
    min-width: 9px;
    text-align: center;
`;
export const TextWithMargin = styled(InlineText)<{margin?: string}>`
    margin: ${props => props.margin ?? '0 2px'};
`;
export const IconographyRow = styled.div<{isInline?: boolean}>`
    display: ${props => (props.isInline ? 'inline-flex' : 'flex')};
    position: relative;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin: 0;
`;
export const ProductionWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${PRODUCTION_PADDING}px;
    background-color: ${colors.PRODUCTION_BG};
`;
const GroupedProductionWrapper = styled(ProductionWrapper)`
    padding: 0;
`;

type ChangeResourceOpts = {
    isNegative?: boolean;
    useRedBorder?: boolean;
    isInline?: boolean;
    showStealText?: boolean;
    isProduction?: boolean;
    locationType?: ResourceLocationType;
    shouldShowPlus?: boolean;
    showNumericQuantity?: boolean;
};

export function ChangeResourceIconography({
    changeResource,
    resourceOnCard,
    opts,
}: {
    changeResource: PropertyCounter<Resource>;
    resourceOnCard?: Resource;
    opts?: ChangeResourceOpts;
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
    const shouldShowNumericQuantity = (amount: number, resource?: Resource) => {
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

    const shouldShowNegativeSymbol = (r: Resource) =>
        !!opts?.isNegative &&
        !(opts?.isProduction && r === Resource.MEGACREDIT);

    let i = 0;
    for (let [resource, amount] of Object.entries(changeResource)) {
        elements.push(
            <RepresentAmountAndResource
                resourceOnCard={resourceOnCard}
                opts={opts}
                shouldShowNegativeSymbol={shouldShowNegativeSymbol}
                shouldShowNumericQuantity={shouldShowNumericQuantity}
                resource={resource as Resource}
                amount={amount}
                key={i}
            />
        );
        i++;
    }

    let locationTypeIcon: React.ReactNode = null;
    if (opts.locationType) {
        if (
            opts.locationType ===
                ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG ||
            opts.locationType === ResourceLocationType.VENUS_CARD
        ) {
            locationTypeIcon = (
                <Box position="absolute" top="-6px" right="-6px">
                    <TagIcon
                        name={Tag.VENUS}
                        size={12}
                        showRedBorder={opts.useRedBorder}
                    />
                </Box>
            );
        }
    }

    return (
        <IconographyRow className="change-resource" isInline={opts.isInline}>
            {locationTypeIcon}
            {elements.map((el, i) => (
                <Box key={i} className={i > 0 ? 'ml-1.5' : ''}>
                    {el}
                </Box>
            ))}
        </IconographyRow>
    );
}

type ChangeResourceOptionOpts = {
    isNegative?: boolean;
    useRedBorder?: boolean;
    isInline?: boolean;
    showStealText?: boolean;
    isProduction?: boolean;
    locationType?: ResourceLocationType;
    useSlashSeparator?: boolean;
};

export function ChangeResourceOptionIconography({
    changeResourceOption,
    opts,
}: {
    changeResourceOption: PropertyCounter<Resource>;
    opts?: ChangeResourceOptionOpts;
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

    Object.entries(changeResourceOption).forEach(
        ([resource, quantity], index) => {
            if (index > 0) {
                if (opts?.useSlashSeparator) {
                    elements.push(<InlineText>/</InlineText>);
                } else {
                    elements.push(
                        <span className="mx-1 leading-none">or</span>
                    );
                }
            }
            elements.push(
                <ChangeResourceIconography
                    changeResource={{[resource]: quantity}}
                    opts={{...opts, isInline: true}}
                />
            );
        }
    );

    if (opts.isInline && elements.length === 1) {
        return <React.Fragment>{elements[0]}</React.Fragment>;
    }

    return (
        <IconographyRow isInline={opts.isInline}>
            {elements.map((el, i) => (
                <Box key={i} className="flex">
                    {el}
                </Box>
            ))}
        </IconographyRow>
    );
}

export function GainResourceIconography({
    gainResource,
    resourceOnCard,
    opts,
}: {
    gainResource: PropertyCounter<Resource>;
    resourceOnCard?: Resource;
    opts?: ChangeResourceOpts;
}) {
    return (
        <ChangeResourceIconography
            resourceOnCard={resourceOnCard}
            changeResource={gainResource}
            opts={opts}
        />
    );
}

type RepresentAmountAndResourceProps = {
    amount: Amount;
    resource?: Resource;
    resourceOnCard?: Resource;
    shouldShowNumericQuantity?: (
        amount: number,
        resource?: Resource
    ) => boolean;
    shouldShowNegativeSymbol?: (resource?: Resource) => boolean;
    opts: ChangeResourceOpts;
    omitNumerator?: boolean;
    includeBrackets?: boolean;
    omitResourceIconography?: boolean;
};

export function RepresentAmountAndResource(
    props: RepresentAmountAndResourceProps
) {
    const {
        opts,
        amount,
        resource,
        shouldShowNumericQuantity,
        shouldShowNegativeSymbol,
        omitNumerator,
        omitResourceIconography,
    } = props;
    // HACK: this naively assumes all variable amounts are coded as "1 per X", where X may be
    // "3 bacteria", "2 building tags", etc. If we ever want to support "Y per X", we'll need
    // to modify this to determine what value to show as Y (instead of always showing 1)
    const name = resource as Resource;
    const resourceIconElement = omitResourceIconography ? undefined : (
        <ResourceIcon
            name={name}
            size={16}
            showRedBorder={opts.useRedBorder}
            amount={
                resource === Resource.MEGACREDIT
                    ? `${
                          !shouldShowNegativeSymbol?.(resource) &&
                          opts.isNegative
                              ? '-'
                              : ''
                      }${typeof amount === 'number' ? amount : 1}`
                    : undefined
            }
            margin={0}
            border={opts.isProduction ? getResourceBorder(name) : 'none'}
        />
    );
    if (typeof amount === 'number') {
        if (omitResourceIconography) {
            return (
                <Box display="inline-block" fontSize="14px">
                    {amount}
                </Box>
            );
        }
        const showNumericQuantity = shouldShowNumericQuantity?.(
            amount,
            resource
        );
        const prefixElements = [
            ...(opts.showStealText ? ['STEAL'] : []),
            ...(shouldShowNegativeSymbol?.(resource) ? ['-'] : []),
            ...(opts.shouldShowPlus ? ['+'] : []),
            ...(showNumericQuantity ? [amount] : []),
        ];
        let el = (
            <Flex alignItems="center">
                {prefixElements.length > 0 && (
                    <TextWithMargin margin="0 2px 0 0">
                        {prefixElements}
                    </TextWithMargin>
                )}
                {showNumericQuantity || resource === Resource.MEGACREDIT
                    ? resourceIconElement
                    : Array(amount)
                          .fill(null)
                          .map((_, index) => (
                              <Flex
                                  key={index}
                                  marginLeft={index > 0 ? '6px' : '0px'}
                              >
                                  {resourceIconElement}
                              </Flex>
                          ))}
            </Flex>
        );
        return <React.Fragment>{el}</React.Fragment>;
    } else {
        const [multiplierElement, customElement] =
            getMultiplierAndCustomElement(props);
        if (omitNumerator && multiplierElement) {
            return multiplierElement;
        }
        return (
            <Flex justifyContent="center" alignItems="center" flexWrap="wrap">
                {customElement}
                {multiplierElement && resourceIconElement ? (
                    <React.Fragment>
                        {resourceIconElement}
                        {<TextWithMargin>/</TextWithMargin>}
                        {multiplierElement}
                    </React.Fragment>
                ) : (
                    <React.Fragment>{multiplierElement}</React.Fragment>
                )}
            </Flex>
        );
    }
}

function getMultiplierAndCustomElement(
    props: RepresentAmountAndResourceProps
): [React.ReactElement | null, React.ReactElement | null] {
    const {
        amount,
        resource,
        shouldShowNegativeSymbol,
        opts,
        resourceOnCard,
        omitNumerator,
        includeBrackets,
        omitResourceIconography,
    } = props;
    let multiplierElement: React.ReactElement | null = null;
    let customElement: React.ReactElement | null = null;
    if (isTileAmount(amount)) {
        multiplierElement = <TileIcon type={amount.tile} size={16} />;
        return [multiplierElement, customElement];
    }
    switch (amount) {
        case VariableAmount.CITY_TILES_IN_PLAY:
            multiplierElement = <TileIcon type={TileType.CITY} size={16} />;
            break;
        case VariableAmount.TILES_ADJACENT_TO_OCEAN:
            multiplierElement = (
                <Flex alignItems="center" justifyContent="center">
                    <TileIcon type={TileType.ANY_TILE} size={16} />
                    <TileIcon type={TileType.OCEAN} size={16} />
                </Flex>
            );
            break;
        case VariableAmount.EMPTY_AREAS_ADJACENT_TO_PLAYER_TILES:
            multiplierElement = (
                <Flex justifyContent="center">
                    <Box width="16px" height="16px">
                        <Hexagon color={colors.ORANGE} hexRadius={8}></Hexagon>
                    </Box>
                    <TileIcon type={TileType.ANY_TILE} size={16} />
                </Flex>
            );
            break;
        case VariableAmount.ALL_EVENTS:
            multiplierElement = <TagIcon name={Tag.EVENT} size={16} />;
            break;
        case VariableAmount.PLAYER_EVENTS:
            multiplierElement = <TagIcon name={Tag.EVENT} size={16} />;
            break;
        case VariableAmount.ALL_COLONIES:
            multiplierElement = <ColonyIcon size={16} />;
            break;
        case VariableAmount.COLONIES:
            multiplierElement = <ColonyIcon size={16} />;
            break;
        case VariableAmount.PLANT_CONVERSION_AMOUNT:
            customElement = <ResourceIcon name={Resource.PLANT} size={16} />;
            break;

        case VariableAmount.FOUR_IF_THREE_PLANT_TAGS_ELSE_ONE:
            customElement = (
                <Flex flexDirection="column" alignItems="center">
                    <Flex alignItems="center" marginBottom="4px">
                        <ResourceIcon name={Resource.PLANT} size={16} />
                        <span className="ml-1.5">OR</span>
                    </Flex>
                    <Flex alignItems="center" justifyContent="center">
                        <span className="mr-0.5">3</span>
                        <TagIcon name={Tag.PLANT} size={16} />
                        <span className="mx-1">:</span>
                        <span className="mr-0.5">4</span>
                        <ResourceIcon name={Resource.PLANT} size={16} />
                    </Flex>
                </Flex>
            );
            break;
        case VariableAmount.TERRAFORM_RATING:
            customElement = <TerraformRatingIcon size={16} />;
            break;
        case VariableAmount.BLUE_CARD:
            multiplierElement = (
                <Box>
                    <TexturedCard
                        height={20}
                        width={15}
                        borderRadius={2}
                        borderWidth={1}
                        bgColor={colors.CARD_ACTIVE}
                    >
                        <Flex
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                            <TagIcon name={Tag.EARTH} />
                        </Flex>
                    </TexturedCard>
                </Box>
            );
            break;
        case VariableAmount.GREEN_CARD:
            multiplierElement = (
                <Box>
                    <TexturedCard
                        height={20}
                        width={15}
                        borderRadius={2}
                        borderWidth={1}
                        bgColor={colors.CARD_AUTOMATED}
                    >
                        <Flex
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                            <TagIcon name={Tag.EARTH} />
                        </Flex>
                    </TexturedCard>
                </Box>
            );
            break;
        case VariableAmount.CARDS_IN_HAND:
            multiplierElement = (
                <Flex justifyContent="space-around">
                    <TexturedCard
                        height={20}
                        width={15}
                        borderRadius={2}
                        borderWidth={1}
                        bgColor={colors.CARD_EVENT}
                    >
                        <Flex
                            alignItems="center"
                            justifyContent="center"
                            height="100%"
                        >
                            <TagIcon name={Tag.EARTH} />
                        </Flex>
                    </TexturedCard>
                </Flex>
            );
            break;
        case VariableAmount.THREE_IF_THREE_VENUS_TAGS_ELSE_ONE:
            customElement = (
                <Flex flexDirection="column" alignItems="center">
                    <Flex alignItems="center" marginBottom="8px">
                        <ResourceIcon name={Resource.CARD} size={16} />
                        <TextWithMargin>OR</TextWithMargin>
                    </Flex>
                    <Flex alignItems="center" justifyContent="center">
                        <TextWithMargin>3</TextWithMargin>
                        <TagIcon name={Tag.VENUS} size={16} />
                        <TextWithMargin>:</TextWithMargin>
                        <TextWithMargin>3</TextWithMargin>{' '}
                        <ResourceIcon name={Resource.CARD} size={16} />
                    </Flex>
                </Flex>
            );
            break;
        case VariableAmount.MINING_AREA_CELL_HAS_STEEL_BONUS:
        case VariableAmount.MINING_RIGHTS_CELL_HAS_STEEL_BONUS:
            customElement = (
                <React.Fragment>
                    <ResourceIcon
                        border={getResourceBorder(Resource.STEEL)}
                        name={Resource.STEEL}
                        size={16}
                    />
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
                <TagIcon name={Tag.SPACE} size={16} showRedBorder={true} />
            );
            break;
        case VariableAmount.THIRD_FLOATERS:
            multiplierElement = (
                <ResourceIcon name={Resource.FLOATER} size={16} amount={3} />
            );
            break;
        case VariableAmount.FLOATERS:
            multiplierElement = (
                <ResourceIcon name={Resource.FLOATER} size={16} amount={1} />
            );
            break;
        case VariableAmount.CITIES_ON_MARS:
            multiplierElement = <TileIcon type={TileType.CITY} size={16} />;
            break;
        case VariableAmount.CARDS_WITHOUT_TAGS:
            // @ts-ignore
            multiplierElement = <TagIcon name="x" size={16} />;
            break;
        case VariableAmount.USER_CHOICE_MIN_ZERO:
        case VariableAmount.BASED_ON_USER_CHOICE:
            if (resource === Resource.MEGACREDIT) {
                customElement = (
                    <React.Fragment>
                        <TextWithMargin>+</TextWithMargin>
                        <ResourceIcon
                            name={resource as Resource}
                            size={16}
                            amount="X"
                        />
                    </React.Fragment>
                );
            } else {
                customElement = (
                    <React.Fragment>
                        <TextWithMargin>
                            {opts.shouldShowPlus ? '+' : '+X'}
                        </TextWithMargin>
                        <ResourceIcon
                            name={resource as Resource}
                            size={16}
                        ></ResourceIcon>
                    </React.Fragment>
                );
            }
            break;
        case VariableAmount.USER_CHOICE:
            customElement = (
                <React.Fragment>
                    <TextWithMargin>
                        {shouldShowNegativeSymbol?.(resource) && '-'}X
                    </TextWithMargin>
                    <ResourceIcon
                        name={resource as Resource}
                        size={16}
                    ></ResourceIcon>
                </React.Fragment>
            );
            break;
        case VariableAmount.USER_CHOICE_UP_TO_ONE:
            customElement = (
                <React.Fragment>
                    <TextWithMargin>-</TextWithMargin>
                    <ResourceIcon
                        name={resource as Resource}
                        size={16}
                    ></ResourceIcon>
                </React.Fragment>
            );
            break;
        case VariableAmount.TRIPLE_BASED_ON_USER_CHOICE:
            customElement = (
                <ResourceIcon
                    name={resource as Resource}
                    size={16}
                    amount="3X"
                />
            );
            break;
        case VariableAmount.DOUBLE_BASED_ON_USER_CHOICE:
            customElement = (
                <ResourceIcon
                    name={resource as Resource}
                    size={16}
                    amount="2X"
                />
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
                <ResourceIcon name={resourceOnCard!} size={16} />
            );
            break;
        case VariableAmount.RESOURCES_ON_CARD_MAX_4:
            multiplierElement = (
                <Flex
                    display="inline-flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <ResourceIcon name={resourceOnCard!} size={16} />
                    <InlineText>*</InlineText>
                </Flex>
            );
            break;
        case VariableAmount.INFLUENCE:
            const element = (
                <Flex
                    display="inline-flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <InlineText>
                        <Twemoji>👥</Twemoji>
                    </InlineText>
                </Flex>
            );
            if (omitResourceIconography) {
                customElement = element;
            } else {
                multiplierElement = element;
            }
            break;
        case VariableAmount.EACH_PARTY_WITH_AT_LEAST_ONE_DELEGATE:
            multiplierElement = (
                <Flex
                    display="inline-flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <MiniPartyIcon>
                        <Twemoji>👥</Twemoji>
                    </MiniPartyIcon>
                </Flex>
            );
        case VariableAmount.UNIQUE_TAGS:
            customElement = <TagIcon name={Tag.ANY} size={16} />;
            break;
        default:
            if (amount && isTagAmount(amount)) {
                multiplierElement = (
                    <React.Fragment>
                        {amount.dividedBy ? (
                            <InlineText>{amount.dividedBy}</InlineText>
                        ) : null}
                        <TagIcon name={amount.tag} size={16} />
                    </React.Fragment>
                );
            } else if (amount && isOperationAmount(amount)) {
                const operandElements = amount.operands.map(
                    (operand, index) => (
                        <RepresentAmountAndResource
                            {...props}
                            amount={operand}
                            key={index}
                            omitNumerator={omitNumerator || index !== 0}
                            includeBrackets={!omitNumerator}
                            omitResourceIconography={
                                omitResourceIconography || index === 1
                            }
                        />
                    )
                );
                const isMaxOrMin = [Operation.MAX, Operation.MIN].includes(
                    amount.operation
                );

                const parentheses =
                    amount.operation === Operation.SUBTRACT &&
                    amount.operands.some(
                        operand => typeof operand === 'number'
                    );

                const prefix =
                    includeBrackets || parentheses ? (
                        <Box display="inline-block" marginRight="2px">
                            {parentheses ? '(' : '['}
                        </Box>
                    ) : (
                        ''
                    );
                const suffix =
                    includeBrackets || parentheses ? (
                        <Box display="inline-block" marginLeft="2px">
                            {parentheses ? ')' : ']'}
                        </Box>
                    ) : (
                        ''
                    );
                const symbol = (
                    <Box
                        display="inline-block"
                        marginLeft={'4px'}
                        marginRight="4px"
                        fontWeight={!isMaxOrMin ? 'normal' : 'bold'}
                        style={{
                            whiteSpace: 'pre',
                            fontVariant: 'all-small-caps',
                        }}
                    >
                        {getSymbolForOperation(amount.operation)}
                    </Box>
                );
                let internalElements: React.ReactElement[] = [];

                for (let i = 0; i < amount.operands.length; i++) {
                    internalElements.push(operandElements[i]);
                    if (i < amount.operands.length - 1) {
                        internalElements.push(
                            <React.Fragment key={'symbol-' + i}>
                                {symbol}
                            </React.Fragment>
                        );
                    }
                }
                customElement = (
                    <Flex
                        display="inline-flex"
                        justifyContent="center"
                        alignItems="center"
                        flexWrap="wrap"
                    >
                        {prefix}
                        {internalElements}
                        {suffix}
                    </Flex>
                );
            } else if (amount && isProductionAmount(amount)) {
                multiplierElement = (
                    <ProductionIconography
                        card={{increaseProduction: {[amount.production]: 1}}}
                    />
                );
            } else if (amount && isResourceAmount(amount)) {
                multiplierElement = (
                    <GainResourceIconography
                        gainResource={{[amount.resource]: 1}}
                    />
                );
            } else if (amount && isConditionAmount(amount)) {
                switch (amount.condition) {
                    case Condition.TURMOIL:
                        customElement = (
                            <RepresentAmountAndResource
                                {...props}
                                amount={amount.fail}
                            />
                        );
                        break;
                    case Condition.GREATER_THAN_OR_EQUAL_TO:
                        customElement = (
                            <Flex flexDirection="column" alignItems="center">
                                {amount.fail ? (
                                    <Flex
                                        alignItems="center"
                                        marginBottom="8px"
                                    >
                                        <RepresentAmountAndResource
                                            {...props}
                                            amount={amount.fail}
                                        />
                                        <TextWithMargin>OR</TextWithMargin>
                                    </Flex>
                                ) : null}
                                <Flex
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <RepresentAmountAndResource
                                        {...props}
                                        amount={amount.operands[1]}
                                        omitResourceIconography={true}
                                    />
                                    <RepresentAmountAndResource
                                        {...props}
                                        amount={amount.operands[0]}
                                        omitResourceIconography={true}
                                    />
                                    <TextWithMargin margin={'0 0 0 2px'}>
                                        :
                                    </TextWithMargin>
                                    <RepresentAmountAndResource
                                        {...props}
                                        amount={amount.pass}
                                    />
                                </Flex>
                            </Flex>
                        );
                        break;
                }
            } else {
                throw new Error(
                    'variable amount not supported: ' + JSON.stringify(amount)
                );
            }
    }
    return [multiplierElement, customElement];
}

export function GainResourceWhenIncreaseProductionIconography() {
    return (
        <React.Fragment>
            <ProductionIconography
                card={{
                    increaseProduction: {[Resource.ANY_STANDARD_RESOURCE]: 1},
                }}
            />
            <Colon />
            <GainResourceIconography
                gainResource={{[Resource.ANY_STANDARD_RESOURCE]: 1}}
            />
        </React.Fragment>
    );
}

export function Colon() {
    return <TextWithMargin>:</TextWithMargin>;
}

export function Equal() {
    return <TextWithMargin>=</TextWithMargin>;
}

export function GainResourceOptionIconography({
    gainResourceOption,
    opts,
}: {
    gainResourceOption: PropertyCounter<Resource>;
    opts?: ChangeResourceOptionOpts;
}) {
    return (
        <ChangeResourceOptionIconography
            changeResourceOption={gainResourceOption}
            opts={opts}
        />
    );
}

export function RemoveResourceIconography({
    removeResource,
    opts,
}: {
    removeResource: PropertyCounter<Resource>;
    opts?: ChangeResourceOpts;
}) {
    const useRedBorder =
        opts?.locationType &&
        RED_BORDER_RESOURCE_LOCATION_TYPES.includes(opts?.locationType);
    return (
        <ChangeResourceIconography
            changeResource={removeResource}
            opts={{
                ...opts,
                isNegative: true,
                useRedBorder,
            }}
        />
    );
}

export function StealResourceIconography({
    stealResource,
    opts,
}: {
    stealResource: PropertyCounter<Resource>;
    opts?: ChangeResourceOptionOpts;
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

const RED_BORDER_RESOURCE_LOCATION_TYPES = [
    ResourceLocationType.ANY_CARD,
    ResourceLocationType.ANY_PLAYER,
    ResourceLocationType.ANY_PLAYER_WITH_TILE_ADJACENT_TO_MOST_RECENTLY_PLACED_TILE,
    ResourceLocationType.ANY_PLAYER_WITH_VENUS_TAG,
];

export function RemoveResourceOptionIconography({
    removeResourceOption,
    opts,
}: {
    removeResourceOption: PropertyCounter<Resource>;
    opts?: ChangeResourceOptionOpts;
}) {
    const useRedBorder =
        opts?.locationType &&
        RED_BORDER_RESOURCE_LOCATION_TYPES.includes(opts?.locationType);

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

function TilePlacementIconography({
    tilePlacements,
}: {
    tilePlacements: Array<TilePlacement>;
}) {
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

export function IncreaseParameterIconography({
    increaseParameter,
    size = 20,
}: {
    increaseParameter: PropertyCounter<Parameter>;
    size?: number;
}) {
    if (Object.values(increaseParameter).length === 0) {
        return null;
    }

    const elements: Array<React.ReactNode> = [];
    for (const [parameter, amount] of Object.entries(increaseParameter)) {
        if (typeof amount !== 'number') {
            throw new Error(
                'unsupported variable amount in renderIncreaseParameterIconogrophy'
            );
        }
        elements.push(
            ...Array(amount)
                .fill(null)
                .map((_, index) => (
                    <Flex key={index} marginLeft={index > 0 ? '4px' : '0'}>
                        <GlobalParameterIcon
                            parameter={parameter as Parameter}
                            size={size}
                        />
                    </Flex>
                ))
        );
    }
    return (
        <IconographyRow className="increase-parameter">
            {elements}
        </IconographyRow>
    );
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
        <IconographyRow
            className="duplicate-production"
            isInline={opts?.isInline ?? false}
        >
            <TextWithMargin margin="0 2px 0 0">Copy a </TextWithMargin>
            <TagIcon name={Tag.BUILDING} size={16} />
        </IconographyRow>
    );
}

export function ProductionIconography({
    card,
    inline,
}: {
    card: Action;
    inline?: boolean;
}) {
    if (!doesActionHaveProductionIconography(card)) {
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
                <TextWithMargin margin="0 2px 0 0">-</TextWithMargin>
                <ChangeResourceIconography
                    changeResource={card.decreaseProduction ?? {}}
                    opts={{
                        isInline: true,
                        isProduction: true,
                    }}
                />
                {hasDecreaseProduction && hasDecreaseAnyProduction && (
                    <div style={{width: 6}} />
                )}
                <ChangeResourceIconography
                    changeResource={card.decreaseAnyProduction ?? {}}
                    opts={{
                        isInline: true,
                        useRedBorder: true,
                        isProduction: true,
                    }}
                />
            </React.Fragment>
        );
    }
    if (hasIncreaseProduction) {
        for (const [resource, amount] of Object.entries(
            card.increaseProduction ?? {}
        )) {
            if (
                amount ===
                    VariableAmount.MINING_RIGHTS_CELL_HAS_TITANIUM_BONUS ||
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
                        isProduction: true,
                    }}
                />
            );
        }
    }
    if (hasIncreaseProductionOption) {
        rows.push(
            <ChangeResourceOptionIconography
                changeResourceOption={card.increaseProductionOption ?? {}}
                opts={{isInline: true, isProduction: true}}
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
                <Flex
                    flexDirection={inline ? 'row' : 'column'}
                    justifyContent="center"
                    alignItems="center"
                >
                    {rows.map((row, index) => (
                        <Flex
                            key={index}
                            alignItems="center"
                            justifyContent="center"
                            margin={`${PRODUCTION_PADDING}px`}
                            marginTop={
                                index > 0 && !inline
                                    ? '0'
                                    : `${PRODUCTION_PADDING}px`
                            }
                        >
                            {row}
                        </Flex>
                    ))}
                </Flex>
            </GroupedProductionWrapper>
        </IconographyRow>
    );
}

export function IncreaseTerraformRatingIconography({
    increaseTerraformRating,
    red,
}: {
    increaseTerraformRating: Amount | undefined;
    red?: boolean;
}) {
    if (!increaseTerraformRating) return null;

    if (typeof increaseTerraformRating === 'number') {
        if (increaseTerraformRating > 0) {
            return (
                <IconographyRow className="increase-terraform-rating">
                    {Array(increaseTerraformRating)
                        .fill(null)
                        .map((_, index) => (
                            <Flex
                                key={index}
                                margin="0 4px"
                                border={red ? '2px solid red' : 'none'}
                            >
                                <TerraformRatingIcon />
                            </Flex>
                        ))}
                </IconographyRow>
            );
        }
        return null;
    } else {
        if (isTagAmount(increaseTerraformRating)) {
            return (
                <IconographyRow className="increase-terraform-rating">
                    <Box border={red ? '2px solid red' : 'none'}>
                        <TerraformRatingIcon size={16} />
                    </Box>
                    <InlineText>/</InlineText>
                    {increaseTerraformRating.dividedBy ? (
                        <InlineText>
                            {increaseTerraformRating.dividedBy}
                        </InlineText>
                    ) : null}
                    <TagIcon name={increaseTerraformRating.tag} size={16} />
                </IconographyRow>
            );
        }

        if (isContestAmount(increaseTerraformRating)) {
            return (
                <Flex flexDirection="column">
                    <IconographyRow
                        className="increase-terraform-rating"
                        style={{marginLeft: '4px'}}
                    >
                        <Flex alignItems="center" flexWrap="wrap">
                            <Box
                                display="inline-block"
                                style={{fontVariant: 'small-caps'}}
                                marginRight="4px"
                            >
                                {increaseTerraformRating.minimum ? 'min ' : ''}
                            </Box>
                            <RepresentAmountAndResource
                                opts={{}}
                                omitResourceIconography={true}
                                amount={increaseTerraformRating.contest}
                            />
                            <TextWithMargin>:</TextWithMargin>
                        </Flex>
                    </IconographyRow>
                    <IconographyRow
                        style={{marginLeft: '8px', marginTop: '4px'}}
                        className="increase-terraform-rating"
                    >
                        <Flex
                            alignItems="center"
                            flexWrap="wrap"
                            justifyContent="flex-end"
                        >
                            {renderArrow()}
                            <IncreaseTerraformRatingIconography
                                red={red}
                                increaseTerraformRating={
                                    increaseTerraformRating.first
                                }
                            />
                        </Flex>
                    </IconographyRow>
                    {increaseTerraformRating.second ? (
                        <IconographyRow
                            className="increase-terraform-rating"
                            style={{marginTop: '4px'}}
                        >
                            <Flex flexWrap="wrap" justifyContent="flex-end">
                                {renderArrow()}
                                <Box display="inline-block">Second:</Box>
                                <IncreaseTerraformRatingIconography
                                    red={red}
                                    increaseTerraformRating={
                                        increaseTerraformRating.second
                                    }
                                />
                            </Flex>
                        </IconographyRow>
                    ) : null}
                </Flex>
            );
        }
        if (isOperationAmount(increaseTerraformRating)) {
            const amount = increaseTerraformRating;
            const operandElements = amount.operands.map((operand, index) => (
                <RepresentAmountAndResource
                    key={index}
                    amount={operand}
                    omitResourceIconography={true}
                    includeBrackets={true}
                    opts={{}}
                />
            ));
            const symbol = (
                <Flex
                    marginLeft={'4px'}
                    marginRight="4px"
                    alignItems="center"
                    style={{whiteSpace: 'pre', fontVariant: 'all-small-caps'}}
                >
                    {getSymbolForOperation(amount.operation)}
                </Flex>
            );
            let internalElements: React.ReactElement[] = [];

            for (let i = 0; i < amount.operands.length; i++) {
                internalElements.push(operandElements[i]);
                if (i !== amount.operands.length - 1) {
                    internalElements.push(
                        <React.Fragment key={`symbol-` + i}>
                            {symbol}
                        </React.Fragment>
                    );
                }
            }

            return (
                <IconographyRow className="increase-terraform-rating">
                    <Flex alignItems="center" height={'20px'}>
                        {internalElements}
                        <IncreaseTerraformRatingIconography
                            increaseTerraformRating={1}
                            red={red}
                        />
                    </Flex>
                </IconographyRow>
            );
        }

        throw new Error(
            'unsupported variable amount in renderIncreaseTerraformRatingIconography'
        );
    }
}

export function CardSelectionCriteriaIconography({
    cardSelectionCriteria,
}: {
    cardSelectionCriteria: CardSelectionCriteria;
}) {
    switch (cardSelectionCriteria) {
        case CardSelectionCriteria.FLOATER_ICON:
            return <ResourceIcon name={Resource.FLOATER} />;
        case CardSelectionCriteria.PLANT_TAG:
            return <TagIcon name={Tag.PLANT} size={16} />;
        case CardSelectionCriteria.SPACE_TAG:
            return <TagIcon name={Tag.SPACE} size={16} />;
        case CardSelectionCriteria.VENUS_TAG:
            return <TagIcon name={Tag.VENUS} size={16} />;
        default:
            throw spawnExhaustiveSwitchError(cardSelectionCriteria);
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
            throw new Error(
                'Unsupported variable amount of temporary adjustment'
            );
        }

        elements.push(
            <IconographyRow key={elements.length}>
                <GlobalParameterIcon
                    parameter={parameter as Parameter}
                    size={12}
                />
                <TextWithMargin>:</TextWithMargin>
                <InlineText>+/- {adjustment}</InlineText>
            </IconographyRow>
        );
    }

    return <React.Fragment>{elements}</React.Fragment>;
}

function RevealTakeAndDiscardIconography({
    revealTakeAndDiscard,
}: {
    revealTakeAndDiscard: PropertyCounter<CardSelectionCriteria>;
}) {
    return (
        <React.Fragment>
            {Object.entries(revealTakeAndDiscard).map(
                ([cardSelectionCriteria, amount], index) => (
                    <IconographyRow key={index}>
                        <GainResourceIconography
                            gainResource={{[Resource.CARD]: amount}}
                            opts={{isInline: true}}
                        />
                        <InlineText style={{marginLeft: 4}}>*</InlineText>
                        <CardSelectionCriteriaIconography
                            cardSelectionCriteria={
                                cardSelectionCriteria as CardSelectionCriteria
                            }
                        />
                    </IconographyRow>
                )
            )}
        </React.Fragment>
    );
}

function ChoiceIconography({choice}: {choice: Action[]}) {
    const elements: Array<React.ReactNode> = [];
    let index = 0;
    for (const action of choice) {
        elements.push(<BaseActionIconography key={index++} card={action} />);
        if (action !== choice[choice.length - 1]) {
            elements.push(<TextWithMargin key={index++}>or</TextWithMargin>);
        }
    }

    return (
        <Flex alignItems="center" marginBottom="8px">
            {elements}
        </Flex>
    );
}

function StepsIconography({steps}: {steps: Action[]}) {
    const elements: Array<React.ReactNode> = [];
    let index = 0;
    for (const action of steps) {
        elements.push(
            <Flex alignItems="center" key={index++} marginBottom="8px">
                <BaseActionIconography card={action} />
            </Flex>
        );
    }

    return <div>{elements}</div>;
}

function PlaceColonyIconography({placeColony}: {placeColony: PlaceColony}) {
    return (
        <div className="flex items-center mx-2">
            <ColonyIcon />
            {placeColony.mayBeRepeatColony ? '*' : null}
        </div>
    );
}

const IconographyContainer = styled.div`
    &.row-reverse {
        flex-direction: row-reverse;
        & > :not(:last-child) {
            margin-left: 8px;
        }
    }
    &.row {
        flex-direction: row;
        & > :not(:first-child) {
            margin-left: 8px;
        }
    }
    &.column-reverse {
        flex-direction: column-reverse;
        & > :not(:last-child) {
            margin-top: 8px;
        }
    }
    &.column {
        flex-direction: column;
        & > :not(:first-child) {
            margin-top: 8px;
        }
    }
    > div {
        display: flex;
        justify-content: center;
        align-items: center;
    }
`;

export const BaseActionIconography = ({
    card,
    inline,
    reverse,
    shouldShowPlus,
}: {
    card: Action | CardModel;
    inline?: boolean;
    reverse?: boolean;
    shouldShowPlus?: boolean;
}) => {
    const {
        placeColony,
        gainTradeFleet,
        tilePlacements,
        increaseParameter,
        removeResource,
        removeResourceSourceType,
        removeResourceOption,
        gainResource,
        gainResourceOption,
        gainResourceTargetType,
        stealResource,
        increaseTerraformRating,
        decreaseTerraformRating,
        revealTakeAndDiscard,
        opponentsGainResource,
    } = card;
    // This bad code can be alleviated by moving temporaryParameterRequirementAdjustments
    // to the base action type (it currently only exists on cards).
    const temporaryParameterRequirementAdjustments =
        card instanceof CardModel
            ? card.temporaryParameterRequirementAdjustments
            : null;
    const choice = 'choice' in card ? card.choice : null;
    const steps = 'steps' in card ? card.steps : null;

    return (
        <IconographyContainer
            className={
                inline && reverse
                    ? 'row-reverse'
                    : inline
                    ? 'row'
                    : reverse
                    ? 'column-reverse'
                    : 'column'
            }
            style={{
                display: inline ? 'inline-flex' : 'flex',
                position: 'relative',
                alignItems: 'center',
            }}
        >
            {doesActionHaveProductionIconography(card) ||
            tilePlacements ||
            gainTradeFleet ||
            placeColony ? (
                <Flex
                    justifyContent="space-evenly"
                    width="100%"
                    alignItems="center"
                >
                    {gainTradeFleet && (
                        <Box transform="rotate(45deg)">
                            <TradeFleet size={36} />
                        </Box>
                    )}
                    {tilePlacements && (
                        <TilePlacementIconography
                            tilePlacements={tilePlacements}
                        />
                    )}
                    {placeColony && (
                        <PlaceColonyIconography placeColony={placeColony} />
                    )}
                    <ProductionIconography card={card} />
                </Flex>
            ) : null}
            {increaseParameter && (
                <div>
                    <IncreaseParameterIconography
                        increaseParameter={increaseParameter}
                    />
                </div>
            )}
            {choice && (
                <div>
                    <ChoiceIconography choice={choice} />
                </div>
            )}
            {steps && (
                <div>
                    <StepsIconography steps={steps} />
                </div>
            )}
            {removeResource && (
                <div className="flex">
                    <RemoveResourceIconography
                        removeResource={removeResource}
                        opts={{locationType: removeResourceSourceType}}
                    />
                </div>
            )}
            {removeResourceOption && (
                <div>
                    <RemoveResourceOptionIconography
                        removeResourceOption={removeResourceOption}
                        opts={{locationType: removeResourceSourceType}}
                    />
                </div>
            )}
            {gainResource && (
                <React.Fragment>
                    {card instanceof CardModel && card.forcedAction && (
                        <BaseActionIconography card={card.forcedAction} />
                    )}
                    <div>
                        <GainResourceIconography
                            gainResource={gainResource}
                            opts={{shouldShowPlus}}
                        />
                    </div>
                </React.Fragment>
            )}
            {gainResourceOption && (
                <div>
                    <GainResourceOptionIconography
                        gainResourceOption={gainResourceOption}
                        opts={{locationType: gainResourceTargetType}}
                    />
                </div>
            )}
            {opponentsGainResource && (
                <div>
                    <GainResourceIconography
                        gainResource={opponentsGainResource}
                        opts={{
                            locationType: gainResourceTargetType,
                            useRedBorder: true,
                        }}
                    />
                </div>
            )}
            {stealResource && (
                <div>
                    <StealResourceIconography stealResource={stealResource} />
                </div>
            )}
            {increaseTerraformRating && (
                <div>
                    <IncreaseTerraformRatingIconography
                        increaseTerraformRating={increaseTerraformRating}
                    />
                </div>
            )}
            {decreaseTerraformRating && (
                <div>
                    <IncreaseTerraformRatingIconography
                        increaseTerraformRating={decreaseTerraformRating}
                        red={true}
                    />
                </div>
            )}
            {temporaryParameterRequirementAdjustments && (
                <div>
                    <TemporaryAdjustmentIconography
                        temporaryParameterRequirementAdjustments={
                            temporaryParameterRequirementAdjustments
                        }
                    />
                </div>
            )}
            {revealTakeAndDiscard && (
                <div>
                    <RevealTakeAndDiscardIconography
                        revealTakeAndDiscard={revealTakeAndDiscard}
                    />
                </div>
            )}
        </IconographyContainer>
    );
};

const MiniPartyIcon = styled.div`
    border-radius: 15px;
    height: 30px;
    width: 40px;
    background: gray;
    margin: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:first-child {
        width: 40px;
    }
`;
