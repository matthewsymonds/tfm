import {ReactChild} from 'react';
import {PlayerState} from 'reducer';
import styled from 'styled-components';
import {Tag} from 'constants/tag';
import {getTags, getEventCards} from 'selectors/variable-amount';
import {TagIcon} from 'components/icons/tag';
import {Flex, Box} from 'components/box';

const TagsBase = styled.div`
    display: flex;
    justify-self: flex-start;
    justify-content: flex-end;
    align-items: center;
    height: 40px;
    margin-bottom: 8px;
    font-size: 16px;
`;

interface TagsComponentProps {
    tags: Tag[];
    children: ReactChild;
}

export const TagsComponent = (props: TagsComponentProps) => (
    <TagsBase>
        <Box marginLeft="0" marginRight="auto">
            {props.children}
        </Box>
        {props.tags.map((tag, index) => {
            return <TagIcon key={index} name={tag} size={32} />;
        })}
    </TagsBase>
);

type PlayerTagCounterProps = {
    player: PlayerState;
};

export const PlayerTagCounter = ({player}: PlayerTagCounterProps) => {
    const tagCountsByTagName = getTags(player).reduce((accum, tag) => {
        if (!accum[tag]) {
            accum[tag] = 0;
        }
        accum[tag]++;
        return accum;
    }, {});
    const eventCount = getEventCards(player).length;

    return (
        <Flex display="flex" flexDirection="row">
            {eventCount > 0 && (
                <Flex marginRight="8px">
                    {/* FIX ME */}
                    <TagIcon name={Tag.EVENT} size={16} />: {eventCount}
                </Flex>
            )}
            {Object.keys(tagCountsByTagName).map(tag => (
                <Flex key={tag} marginRight="8px">
                    {/* FIX ME */}
                    <TagIcon name={Tag.EVENT} size={16} />: {tagCountsByTagName[tag]}
                </Flex>
            ))}
        </Flex>
    );
};
