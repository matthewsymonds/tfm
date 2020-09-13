import {ServerGameModel} from 'server/api-action-handler';
import {cards, Card} from 'models/card';

export class StateHydrator {
    constructor(public game: ServerGameModel, public username: string) {}

    getCard(name: string): Card {
        const card = cards.find(card => card.name === name);
        if (!card) {
            throw new Error('No card found with that name');
        }

        return card;
    }
}
