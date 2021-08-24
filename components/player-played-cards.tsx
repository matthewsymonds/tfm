import {Flex} from 'components/box';
import {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useRef} from 'react';
import {getCard} from 'selectors/get-card';
import {SerializedPlayerState} from 'state-serialization';
import {CardTextToken} from './card/CardToken';

function PlayerPlayedCards({
    player,
    tagFilterConfig,
}: {
    player: SerializedPlayerState;
    tagFilterConfig: TagFilterConfig;
}) {
    const {filterMode, filteredTags} = tagFilterConfig;
    const loggedInPlayer = useLoggedInPlayer();
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
                      player.index !== loggedInPlayer.index
                  ) {
                      return false;
                  }
                  return hydratedCard.tags.some(cardTag => filteredTags.includes(cardTag));
              });

    let eventIndex = 0;

    return (
        <div style={{width: '100%'}} ref={containerRef}>
            <Flex flexWrap="wrap">
                {filteredCards.map((card, index) => (
                    <Flex
                        margin="4px"
                        key={card.name === '' ? player.username + '-' + eventIndex++ : card.name} // How do do this for events??
                    >
                        <CardTextToken
                            margin="0"
                            card={getCard(card)}
                            showCardOnHover={true}
                            variant="pill"
                        />
                    </Flex>
                ))}
            </Flex>
        </div>
    );
}

export default PlayerPlayedCards;
