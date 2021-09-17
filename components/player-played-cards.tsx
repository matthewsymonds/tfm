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

    const corporationAndPreludeCards: Array<Card> = [];
    const greenCards: Array<Card> = [];
    const redCards: Array<Card> = [];
    const blueCards: Array<Card> = [];
    filteredCards.forEach(card => {
        const hydratedCard = getCard(card);
        switch (hydratedCard.type) {
            case CardType.CORPORATION:
            case CardType.PRELUDE:
                corporationAndPreludeCards.push(hydratedCard);
                break;
            case CardType.EVENT:
                redCards.push(hydratedCard);
                break;
            case CardType.AUTOMATED:
                greenCards.push(hydratedCard);
                break;
            case CardType.ACTIVE:
                blueCards.push(hydratedCard);
                break;
            default:
                throw spawnExhaustiveSwitchError(hydratedCard.type);
        }
    });

    return (
        <Flex flexDirection="column" width="100%" ref={containerRef}>
            <ResponsiveMasonry columnsCountBreakPoints={{300: 2, 450: 3, 600: 4, 750: 5, 900: 6}}>
                <Masonry>
                    {/* Corporation & preludes */}
                    {corporationAndPreludeCards.map((card, index) => (
                        <Flex margin="4px" key={card.name}>
                            <CardTextToken
                                margin="0"
                                card={card}
                                showCardOnHover={true}
                                shouldUseFullWidth={true}
                            />
                        </Flex>
                    ))}

                    {/* Events */}
                    {isLoggedInPlayer ? (
                        redCards.map((card, index) => (
                            <Flex margin="4px" key={card.name}>
                                <CardTextToken
                                    margin="0"
                                    card={card}
                                    showCardOnHover={true}
                                    shouldUseFullWidth={true}
                                />
                            </Flex>
                        ))
                    ) : (
                        <Flex margin="4px">
                            <CardTextTokenBase color={colors.CARD_EVENT} margin="0px">
                                {redCards.length} Events
                            </CardTextTokenBase>
                        </Flex>
                    )}

                    {/* Blue cards */}
                    {blueCards.map((card, index) => (
                        <Flex margin="4px" key={card.name}>
                            <MiniatureCard
                                card={card}
                                showCardOnHover={true}
                                cardOwner={player}
                                cardContext={CardContext.PLAYED_CARD}
                                shouldUseFullWidth={true}
                            />
                        </Flex>
                    ))}

                    {/* Green cards */}
                    {greenCards.map((card, index) => (
                        <Flex margin="4px" key={card.name}>
                            <CardTextToken
                                margin="0"
                                card={card}
                                showCardOnHover={true}
                                shouldUseFullWidth={true}
                            />
                        </Flex>
                    ))}
                </Masonry>
            </ResponsiveMasonry>
        </Flex>
    );
}

export default PlayerPlayedCards;
