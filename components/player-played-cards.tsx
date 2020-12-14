import {Flex} from 'components/box';
import {Card as CardComponent, CardContext} from 'components/card/Card';
import {TagIcon} from 'components/icons/tag';
import {Tag} from 'constants/tag';
import {AppContext} from 'context/app-context';
import React, {useContext} from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getTagCountsByName} from 'selectors/player';
import styled from 'styled-components';

const PlayerHandBase = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
`;

export const PlayerPlayedCards = ({player}: {player: PlayerState}) => {
    const state = useTypedSelector(state => state);
    const context = useContext(AppContext);
    const loggedInPlayer = context.getLoggedInPlayer(state);
    const isLoggedInPlayer = player.index === loggedInPlayer.index;
    const tagCountsByTagName = getTagCountsByName(player);

    return (
        <React.Fragment>
            <Flex>
                {Object.keys(tagCountsByTagName).map(tag => (
                    <Flex key={tag} justifyContent="center" alignItems="center" marginRight="8px">
                        <TagIcon name={tag as Tag} />
                        {tagCountsByTagName[tag]}
                    </Flex>
                ))}
            </Flex>
            <PlayerHandBase>
                {player.playedCards.map(card => {
                    return (
                        <div style={{margin: 4}}>
                            <CardComponent
                                card={card}
                                key={card.name}
                                cardOwner={player}
                                cardContext={CardContext.PLAYED_CARD}
                            />
                        </div>
                    );
                })}
            </PlayerHandBase>
        </React.Fragment>
    );
};
