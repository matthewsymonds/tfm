import {Flex} from 'components/box';
import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {TerraformRatingIcon} from 'components/icons/other';
import {ProductionIcon} from 'components/icons/production';
import {TagIcon} from 'components/icons/tag';
import {TileIcon} from 'components/icons/tile';
import {colors} from 'components/ui';
import {Parameter} from 'constants/board';
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

function getCardRequirementText(card: CardModel) {
    let text: string | null = null;
    if (card.requiredGlobalParameter) {
        text = String(card.requiredGlobalParameter.min ?? card.requiredGlobalParameter.max);
        if (card.requiredGlobalParameter.type === Parameter.OXYGEN) {
            text += '%';
        }
    } else if (card.requiredProduction !== undefined) {
        // currently all cards with required production only require a single production
        text = null;
    } else if (card.requiredTilePlacements.length > 0) {
        // for required tile placements, we only show icons
        text = null;
    } else if (Object.keys(card.requiredTags).length > 0) {
        // for required tags, we only show icons
        text = null;
    } else if (card.minTerraformRating !== undefined) {
        text = String(card.minTerraformRating);
    } else {
        throw new Error('Unhandled card requirement text');
    }
    return text;
}

function getCardRequirementIcons(card: CardModel): React.ReactElement {
    if (card.requiredGlobalParameter !== undefined) {
        return <GlobalParameterIcon parameter={card.requiredGlobalParameter.type} size={16} />;
    } else if (card.requiredProduction !== undefined) {
        // currently all cards with required production only require a single production
        return <ProductionIcon name={card.requiredProduction} size={16} paddingSize={0} />;
    } else if (card.requiredTilePlacements.length > 0) {
        // for required tile placements, we only show icons
        return (
            <Flex>
                {card.requiredTilePlacements.map(({type}, index) => (
                    <TileIcon key={index} type={type} size={16} />
                ))}
            </Flex>
        );
    } else if (Object.keys(card.requiredTags).length > 0) {
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
                        <TagIcon name={tag as Tag} size={12} />
                    </Flex>
                );
            } else {
                for (let i = 0; i < tagCount; i++) {
                    tagElements.push(<TagIcon key={`${tag}-${i}`} name={tag as Tag} size={16} />);
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
    } else {
        throw new Error('Unhandled card requirement text');
    }
}

export const CardRequirement = ({card}: {card: CardModel}) => {
    const hasRequirement =
        card.requiredGlobalParameter !== undefined ||
        card.requiredProduction !== undefined ||
        card.requiredTilePlacements.length > 0 ||
        Object.keys(card.requiredTags).length > 0 ||
        card.minTerraformRating !== undefined;

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
