import {Flex} from 'components/box';
import {getCardTitleColorForType} from 'components/card/CardTitle';
import {TagFilterConfig, TagFilterMode} from 'components/player-tag-counts';
import TexturedCard from 'components/textured-card';
import {CardType} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useRef, useState} from 'react';
import {usePopper} from 'react-popper';
import {getCard} from 'selectors/get-card';
import {SerializedCard, SerializedPlayerState} from 'state-serialization';
import styled from 'styled-components';
import {CardTextToken} from './card/CardToken';

const CARD_TOKEN_WIDTH = 50;
const CARD_TOKEN_HEIGHT = 40;

function PlayerPlayedCards({
    player,
    playerPanelRef,
    tagFilterConfig,
}: {
    player: SerializedPlayerState;
    playerPanelRef: React.RefObject<HTMLDivElement>;
    tagFilterConfig: TagFilterConfig;
}) {
    const [hoveredCardIndex, setHoveredCardIndex] = useState<null | number>(null);
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
    const hoveredCard = hoveredCardIndex === null ? null : getCard(filteredCards[hoveredCardIndex]);
    const popperElement = useRef<HTMLDivElement>(null);

    const {styles, attributes, forceUpdate} = usePopper(
        playerPanelRef.current,
        popperElement.current,
        {
            placement: 'bottom',
            modifiers: [
                {
                    name: 'preventOverflow',
                    options: {
                        padding: 8,
                    },
                },
            ],
        }
    );

    function _setHoveredCardIndex(indexOrNull: null | number) {
        setHoveredCardIndex(indexOrNull);
        setTimeout(() => {
            forceUpdate?.();
        }, 0);
    }

    let eventIndex = 0;

    return (
        <div style={{width: '100%'}} ref={containerRef}>
            <Flex flexWrap="wrap" onMouseLeave={() => _setHoveredCardIndex(null)}>
                {filteredCards.map((card, index) => (
                    <Flex
                        margin="4px"
                        key={card.name === '' ? player.username + '-' + eventIndex++ : card.name} // How do do this for events??
                        onMouseEnter={() => _setHoveredCardIndex(index)}
                        onMouseLeave={() => _setHoveredCardIndex(null)}
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
            <div
                ref={popperElement}
                style={{
                    ...styles.popper,
                    zIndex: 10,
                }}
                {...attributes.popper}
            >
                {/* {hoveredCard && <LiveCardComponent card={hoveredCard ?? dummyCard} />}{' '} */}
            </div>
        </div>
    );
}

const CardTokenTitleBar = styled.div<{bgColor: string}>`
    position: relative;
    display: flex;
    align-items: center;
    top: 10px;
    padding: 0 3px;
    height: 20px;
    background-color: ${props => props.bgColor};
    cursor: default;
`;

function CardToken({card: serializedCard}: {card: SerializedCard}) {
    const card = getCard(serializedCard);

    return (
        <TexturedCard
            height={CARD_TOKEN_HEIGHT}
            width={CARD_TOKEN_WIDTH}
            style={{margin: '0 2px 2px 0'}}
            borderRadius={2}
        >
            <CardTokenTitleBar className="display" bgColor={getCardTitleColorForType(card.type)}>
                <span
                    style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        color: 'white',
                        fontSize: '9px',
                    }}
                >
                    {card.name}
                </span>
            </CardTokenTitleBar>
        </TexturedCard>
    );
}

export default PlayerPlayedCards;
