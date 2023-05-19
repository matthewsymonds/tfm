import {Meta, Story} from '@storybook/react';
import {Card, CardContext} from 'components/card/Card';
import {MiniatureCard} from 'components/card/CardToken';
import {GlobalEventCard} from 'components/turmoil';
import {CardType, Deck} from 'constants/card-types';
import {cardConfigs} from 'constants/cards';
import {GLOBAL_EVENTS} from 'constants/global-events';
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
            // .filter(c => c.name === 'Tardigrades')
            // .filter(c => [Deck.VENUS].includes(c.deck))
            .map(cardConfig => {
                const card = new CardModel(cardConfig);
                card.storedResourceAmount = 3;
                return (
                    <div style={{margin: 4}} key={card.name}>
                        <Card card={card} cardContext={CardContext.NONE} />
                    </div>
                );
            })}
    </div>
);
export const Default = Template.bind({});
Default.args = {};

const GlobalEventsTemplate: Story<{}> = args => (
    <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {GLOBAL_EVENTS
            // .filter(c => c.revealTakeAndDiscard || c.forcedAction?.revealTakeAndDiscard)
            // .filter(c => c.name === 'Tardigrades')
            // .filter(c => [Deck.VENUS].includes(c.deck))
            .map(globalEvent => {
                return (
                    <div style={{margin: 4}} key={globalEvent.top.name}>
                        <GlobalEventCard name={globalEvent.top.name} />
                    </div>
                );
            })}
    </div>
);
export const GlobalEvents = GlobalEventsTemplate.bind({});
GlobalEvents.args = {};

const MiniCardTemplate: Story<{}> = args => {
    const loggedInPlayer = useLoggedInPlayer();

    return (
        <div style={{width: '100%'}}>
            <ResponsiveMasonry
                columnsCountBreakPoints={{
                    260: 2,
                    390: 3,
                    520: 4,
                    650: 5,
                    780: 6,
                    910: 7,
                }}
            >
                <Masonry gutter="6px">
                    {cardConfigs
                        // .filter(c => c.revealTakeAndDiscard || c.forcedAction?.revealTakeAndDiscard)
                        // .filter(c => c.name === 'Vitor')
                        // .filter(c => c.type === CardType.ACTIVE)
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
