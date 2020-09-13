import {setGame} from 'actions';
import {makePostCall} from 'api-calls';
import {ApiActionType} from 'client-server-shared/api-action-type';
import {GameActionHandler} from 'client-server-shared/game-action-handler-interface';
import {ResourceActionOption} from 'components/ask-user-to-confirm-resource-action-details';
import {Award, Cell, Milestone, Tile} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction} from 'constants/standard-project';
import {Card} from 'models/card';
import {deserializeState} from 'state-serialization';
import {Conversion} from 'constants/conversion';

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
        parent,
        payment,
        choiceIndex,
    }: {
        parent: Card;
        payment?: PropertyCounter<Resource>;
        choiceIndex?: number;
    }): Promise<void> {
        const payload = {
            name: parent.name,
            payment,
            choiceIndex,
        };

        await this.makeApiCall(ApiActionType.API_PLAY_CARD_ACTION, payload);
    }

    async playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const payload = {
            standardProjectActionType: standardProjectAction.type,
            payment,
        };

        await this.makeApiCall(ApiActionType.API_PLAY_STANDARD_PROJECT, payload);
    }

    async claimMilestoneAsync({
        milestone,
        payment,
    }: {
        milestone: Milestone;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const payload = {
            milestone,
            payment,
        };
        await this.makeApiCall(ApiActionType.API_CLAIM_MILESTONE, payload);
    }

    async fundAwardAsync({
        award,
        payment,
    }: {
        award: Award;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {}

    async doConversionAsync({conversion}: {conversion: Conversion}): Promise<void> {}

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
