import {Meta, Story} from '@storybook/react';
import {Card, CardContext} from 'components/card/Card';
import {MiniatureCard} from 'components/card/CardToken';
import {CardType, Deck} from 'constants/card-types';
import {cardConfigs} from 'constants/cards';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import {Card as CardModel} from 'models/card';
import React from 'react';
import Masonry, {ResponsiveMasonry} from 'react-responsive-masonry';

export default {
    title: 'Card',
    component: Card,
} as Meta;

const Template: Story<{}> = args => (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {cardConfigs
            // .filter(c => c.revealTakeAndDiscard || c.forcedAction?.revealTakeAndDiscard)
            // .filter(c => c.name === 'Event Analysts')
            .filter(c => [Deck.TURMOIL].includes(c.deck))
            .map(cardConfig => {
                const card = new CardModel(cardConfig);
                card.storedResourceAmount = 3;
                return (
                    <div style={{margin: 4}}>
                        <Card card={card} cardContext={CardContext.NONE} />
                    </div>
                );
            })}
    </div>
);
export const Default = Template.bind({});
Default.args = {};

const MiniCardTemplate: Story<{}> = args => {
    const loggedInPlayer = useLoggedInPlayer();

    return (
        <div style={{width: '100%'}}>
            <ResponsiveMasonry
                columnsCountBreakPoints={{260: 2, 390: 3, 520: 4, 650: 5, 780: 6, 910: 7}}
            >
                <Masonry gutter="6px">
                    {cardConfigs
                        // .filter(c => c.revealTakeAndDiscard || c.forcedAction?.revealTakeAndDiscard)
                        // .filter(c => c.name === 'Vitor')
                        .filter(c => c.type === CardType.ACTIVE)
                        // .filter(c => c.name === 'Mars University')
                        .map(cardConfig => {
                            const card = new CardModel(cardConfig);
                            card.storedResourceAmount = 3;
                            return (
                                <div style={{margin: 4}}>
                                    <MiniatureCard
                                        key={card.name}
                                        card={card}
                                        showCardOnHover={true}
                                        cardOwner={loggedInPlayer}
                                        cardContext={CardContext.PLAYED_CARD}
                                        shouldUseFullWidth={true}
                                    />
                                </div>
                            );
                        })}
                </Masonry>
            </ResponsiveMasonry>
        </div>
    );
};

export const MiniCard = MiniCardTemplate.bind({});
MiniCard.args = {};
