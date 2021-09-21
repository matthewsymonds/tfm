import {Flex} from 'components/box';
import {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import {Card} from 'models/card';
import {CardContext} from 'components/card/Card';
import {Tag} from 'constants/tag';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useRef} from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedPlayerState} from 'state-serialization';
import spawnExhaustiveSwitchError from 'utils';
import {CardTextToken, CardTextTokenBase, MiniatureCard} from 'components/card/CardToken';
import Masonry, {ResponsiveMasonry} from 'react-responsive-masonry';

function PlayerPlayedCards({
    player,
    tagFilterConfig,
}: {
    player: SerializedPlayerState;
    tagFilterConfig: TagFilterConfig;
}) {
    const {filterMode, filteredTags} = tagFilterConfig;
    const loggedInPlayer = useLoggedInPlayer();
    const isLoggedInPlayer = player.index === loggedInPlayer.index;
    const containerRef = useRef<HTMLDivElement>(null);
    const filteredCards =
        filterMode === TagFilterMode.ALL
            ? player.playedCards
            : player.playedCards.filter(card => {
                  const hydratedCard = getCard(card);
                  if (filterMode === TagFilterMode.GREEN) {
                      return hydratedCard.type === CardType.AUTOMATED;
                  }
                  if (filterMode === TagFilterMode.BLUE) {
                      return hydratedCard.type === CardType.ACTIVE;
                  }
                  // Make sure event cards are only listed for opponents if
                  // an event tag filter is clicked.
                  if (
                      hydratedCard.tags.includes(Tag.EVENT) &&
                      !filteredTags.includes(Tag.EVENT) &&
                      !isLoggedInPlayer
                  ) {
                      return false;
                  }
                  return hydratedCard.tags.some(cardTag => filteredTags.includes(cardTag));
              });

    let activeCards: Array<Card> = [];
    let passiveCards: Array<Card> = [];
    filteredCards.forEach(card => {
        const hydratedCard = getCard(card);
        switch (hydratedCard.type) {
            case CardType.CORPORATION:
            case CardType.PRELUDE:
            case CardType.AUTOMATED:
            case CardType.EVENT:
                passiveCards.push(hydratedCard);
                break;
            case CardType.ACTIVE:
                activeCards.push(hydratedCard);
                break;
            default:
                throw spawnExhaustiveSwitchError(hydratedCard.type);
        }
    });
    let eventIndex = 0;
    return (
        <Flex flexDirection="column" width="100%" ref={containerRef}>
            <ResponsiveMasonry columnsCountBreakPoints={{300: 2, 450: 3, 600: 4, 750: 5, 900: 6}}>
                <Masonry gutter="6px">
                    {activeCards.map(card => {
                        return (
                            <MiniatureCard
                                key={card.name}
                                card={card}
                                showCardOnHover={true}
                                cardOwner={player}
                                cardContext={CardContext.PLAYED_CARD}
                                shouldUseFullWidth={true}
                            />
                        );
                    })}
                    {passiveCards.map(card => {
                        return (
                            <CardTextToken
                                margin="0"
                                card={card}
                                key={
                                    isLoggedInPlayer
                                        ? card.name
                                        : player.username + '-event-' + eventIndex++
                                }
                                showCardOnHover={true}
                                shouldUseFullWidth={true}
                            />
                        );
                    })}
                </Masonry>
            </ResponsiveMasonry>
        </Flex>
    );
}

export default PlayerPlayedCards;
