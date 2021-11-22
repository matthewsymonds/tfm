import {Flex} from 'components/box';
import {CardContext} from 'components/card/Card';
import {CardTextToken, MiniatureCard} from 'components/card/CardToken';
import {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card} from 'models/card';
import React, {useRef} from 'react';
import Masonry, {ResponsiveMasonry} from 'react-responsive-masonry';
import {getCard} from 'selectors/get-card';
import {SerializedPlayerState} from 'state-serialization';
import spawnExhaustiveSwitchError from 'utils';

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
                  // special case the "No tag"
                  if (filteredTags.includes(Tag.NONE) && hydratedCard.tags.length === 0) {
                      return true;
                  }
                  return hydratedCard.tags.some(cardTag => filteredTags.includes(cardTag));
              });

    let activeCards: Array<Card> = [];
    let passiveCards: Array<Card> = [];
    filteredCards.forEach(card => {
        const hydratedCard = getCard(card);
        switch (hydratedCard.type) {
            case CardType.PRELUDE:
            case CardType.AUTOMATED:
            case CardType.EVENT:
                passiveCards.push(hydratedCard);
                break;
            case CardType.ACTIVE:
            case CardType.CORPORATION:
                activeCards.push(hydratedCard);
                break;
            case CardType.GLOBAL_EVENT:
                break;
            default:
                throw spawnExhaustiveSwitchError(hydratedCard.type);
        }
    });
    let eventIndex = 0;
    return (
        <Flex flexDirection="column" width="100%" ref={containerRef}>
            <ResponsiveMasonry
                columnsCountBreakPoints={{260: 2, 390: 3, 520: 4, 650: 5, 780: 5, 910: 5}}
            >
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
                                showCardOnHover={!!card.name}
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
