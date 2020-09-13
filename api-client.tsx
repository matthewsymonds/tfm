import {ApiActionType} from 'client-server-shared/api-action-type';
import {GameActionHandler} from 'client-server-shared/game-action-handler-interface';
import {Card} from 'models/card';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {Action} from 'constants/action';
import {StandardProjectAction} from 'constants/standard-project';
import {Milestone, Award, Tile, Cell} from 'constants/board';
import {ResourceActionOption} from 'components/ask-user-to-confirm-resource-action-details';
import {setGame} from 'actions';
import {makePostCall} from 'api-calls';
import {deserializeState} from 'state-serialization';

export class ApiClient implements GameActionHandler {
    constructor(private readonly dispatch: Function) {}
    async playCardAsync({
        card,
        payment,
    }: {
        card: Card;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const payload = {
            name: card.name,
            payment,
        };

        await this.makeApiCall(ApiActionType.API_PLAY_CARD, payload);
    }

    private async makeApiCall(type: ApiActionType, payload) {
        const result = await makePostCall(this.getPath(), {type, payload});

        this.dispatch(setGame(deserializeState(result.state)));
    }

    private getPath(): string {
        const gameName = this.getGameName();

        return `/api/games/${gameName}/play`;
    }

    private getGameName() {
        const pathParts = window.location.pathname.split('/');
        return pathParts[2];
    }

    async playCardActionAsync({
        action,
        parent,
        payment,
        choiceIndex,
    }: {
        action: Action;
        parent: Card;
        payment?: PropertyCounter<Resource>;
        choiceIndex?: number;
    }): Promise<void> {}

    async playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async claimMilestoneAsync({
        milestone,
        payment,
    }: {
        milestone: Milestone;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async fundAwardAsync({
        award,
        payment,
    }: {
        award: Award;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async skipActionAsync(): Promise<void> {}

    async completePlaceTileAsync({tile, cell}: {tile: Tile; cell: Cell}): Promise<void> {}

    async completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void> {}

    async completeLookAtCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void> {}

    async completeChooseDiscardCardsAsync({
        selectedCards,
    }: {
        selectedCards: Array<Card>;
    }): Promise<void> {}

    async completeDuplicateProductionAsync({card}: {card: Card}): Promise<void> {}

    async chooseCorporationAndStartingCardsAsync({
        corporation,
        selectedCards,
    }: {
        corporation: Card;
        selectedCards: Array<Card>;
    }): Promise<void> {}

    async chooseCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void> {}

    async chooseCardForDraftRoundAsync({
        selectedCards,
    }: {
        selectedCards: Array<Card>;
    }): Promise<void> {}
}