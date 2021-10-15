import {Flex} from 'components/box';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {TerraformRatingIcon} from 'components/icons/other';
import {ProductionIcon} from 'components/icons/production';
import {ResourceIcon} from 'components/icons/resource';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {colors} from 'components/ui';
import {Parameter} from 'constants/board';
import {Resource} from 'constants/resource-enum';
import {Tag} from 'constants/tag';
import {Card as CardModel} from 'models/card';
import React from 'react';
import styled from 'styled-components';

const MAX_TAG_SPREAD = 3;

const CardRequirementBase = styled.div<{isMinRequirement: boolean}>`
    border-radius: 1px;
    background-color: ${props =>
        props.isMinRequirement ? colors.CARD_MIN_REQUIREMENT_BG : colors.CARD_MAX_REQUIREMENT_BG};
    display: flex;
    align-items: center;
    position: absolute;
    top: 0px;
    left: 38px;
    padding: 3px;
    font-size: 0.75rem;
    font-weight: 600;
    color: black;
    height: 20px;
`;

// TODO: Consider making the requirements a discriminated union. Although maybe this is a feature,
// not a bug?
function getCardRequirementText(card: CardModel) {
    let text: string | null = null;
    if (card.requiredGlobalParameter) {
        text = String(card.requiredGlobalParameter.min ?? card.requiredGlobalParameter.max);
        if ([Parameter.OXYGEN, Parameter.VENUS].includes(card.requiredGlobalParameter.type)) {
            text += '%';
        }
    } else if (card.requiredProduction !== undefined) {
        // currently all cards with required production only require a single production
        text = null;
    } else if (card.requiredTilePlacements) {
        // for required tile placements, we only show icons
        text = null;
    } else if (card.requiredTags) {
        // for required tags, we only show icons
        text = null;
    } else if (card.minTerraformRating !== undefined) {
        text = String(card.minTerraformRating);
    } else if (card.requiredResources !== undefined) {
        text = null;
    } else {
        throw new Error('Unhandled card requirement text');
    }
    return text;
}

function getCardRequirementIcons(card: CardModel): React.ReactElement {
    if (card.requiredGlobalParameter) {
        return <GlobalParameterIcon parameter={card.requiredGlobalParameter.type} size={16} />;
    } else if (card.requiredProduction) {
        // currently all cards with required production only require a single production
        return <ProductionIcon name={card.requiredProduction} size={16} paddingSize={0} />;
    } else if (card.requiredTilePlacements) {
        // for required tile placements, we only show icons
        return (
            <Flex>
                {card.requiredTilePlacements.map(({type}, index) => (
                    <TileIcon key={index} type={type} size={16} />
                ))}
            </Flex>
        );
    } else if (card.requiredTags) {
        // for required tags, we only show icons
        const tagElements: Array<React.ReactElement> = [];
        for (const [tag, tagCount] of Object.entries(card.requiredTags)) {
            if (typeof tagCount !== 'number') {
                throw new Error('Tag count must be fixed number for required tags');
            }

            if (tagCount > MAX_TAG_SPREAD) {
                tagElements.push(
                    <Flex alignItems="center" justifyContent="center">
                        <span>{tagCount}</span>
                        <TagIcon
                            name={tag as Tag}
                            size={16}
                            emojiAdjustment={2}
                            topEmojiAdjustment={0}
                        />
                    </Flex>
                );
            } else {
                for (let i = 0; i < tagCount; i++) {
                    tagElements.push(
                        <TagIcon
                            key={`${tag}-${i}`}
                            emojiAdjustment={2}
                            topEmojiAdjustment={0}
                            name={tag as Tag}
                            size={16}
                        />
                    );
                }
            }
        }
        return (
            <Flex>
                {tagElements.map((el, i) => (
                    <React.Fragment key={i}>{el}</React.Fragment>
                ))}
            </Flex>
        );
    } else if (card.minTerraformRating !== undefined) {
        return <TerraformRatingIcon size={16} />;
    } else if (card.requiredResources) {
        const tagElements: Array<React.ReactElement> = [];
        for (const [resource, resourceCount] of Object.entries(card.requiredResources ?? {})) {
            if (typeof resourceCount !== 'number') {
                throw new Error('Tag count must be fixed number for required tags');
            }

            if (resourceCount > MAX_TAG_SPREAD) {
                tagElements.push(
                    <Flex alignItems="center" justifyContent="center">
                        <span>{resourceCount}</span>
                        <ResourceIcon name={resource as Resource} size={16} />
                    </Flex>
                );
            } else {
                for (let i = 0; i < resourceCount; i++) {
                    tagElements.push(
                        <ResourceIcon
                            key={`${resource}-${i}`}
                            name={resource as Resource}
                            size={16}
                        />
                    );
                }
            }
        }
        return (
            <Flex>
                {tagElements.map((el, i) => (
                    <React.Fragment key={i}>{el}</React.Fragment>
                ))}
            </Flex>
        );
    } else {
        throw new Error('Unhandled card requirement text');
    }
}

export const CardRequirement = ({card}: {card: CardModel}) => {
    const hasRequirement =
        card.requiredGlobalParameter ||
        card.requiredProduction ||
        card.requiredTilePlacements ||
        card.requiredTags ||
        card.minTerraformRating ||
        card.requiredResources;

    if (!hasRequirement) {
        return null;
    }

    const isMinRequirement = typeof card.requiredGlobalParameter?.min === 'number';

    const text = getCardRequirementText(card);
    const icon = getCardRequirementIcons(card);

    return (
        <CardRequirementBase isMinRequirement={isMinRequirement}>
            {text && <span style={{margin: '0 2px'}}>{text}</span>}
            {icon}
        </CardRequirementBase>
    );
};
