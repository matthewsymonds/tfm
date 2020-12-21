import {
    StandardProjectAction,
    standardProjectActions,
    StandardProjectType,
} from 'constants/standard-project';
import {Card, cards} from 'models/card';
import {ServerGameModel} from 'server/api-action-handler';

export class StateHydrator {
    constructor(public game: ServerGameModel, public username: string) {}

    getCard(name: string): Card {
        const card = cards.find(card => card.name === name);
        if (!card) {
            throw new Error('No card found with that name');
        }

        return card;
    }
    getStandardProject(type: StandardProjectType): StandardProjectAction {
        return standardProjectActions.find(action => action.type === type)!;
    }
}
