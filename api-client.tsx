import {setGame, setIsSyncing} from 'actions';
import {makePostCall} from 'api-calls';
import {ApiActionType} from 'client-server-shared/api-action-type';
import {GameActionHandler} from 'client-server-shared/game-action-handler-interface';
import {
    ResourceActionOption,
    serializeResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {Award, Cell, Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction} from 'constants/standard-project';
import {Card} from 'models/card';
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

    private async makeApiCall(type: ApiActionType, payload, retry = true) {
        this.dispatch(setIsSyncing());
        try {
            const result = await makePostCall(this.getPath(), {type, payload});
            this.dispatch(setGame(deserializeState(result.state)));
        } catch (error) {
            // TODO Gracefully fail and tell user to try again.
            if (retry) {
                // retry once.
                return await this.makeApiCall(type, payload, false);
            }
        }
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

    async claimMilestoneAsync(payload: {
        milestone: Milestone;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        await this.makeApiCall(ApiActionType.API_CLAIM_MILESTONE, payload);
    }

    async fundAwardAsync(payload: {
        award: Award;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        await this.makeApiCall(ApiActionType.API_FUND_AWARD, payload);
    }

    async doConversionAsync(payload: {resource: Resource}): Promise<void> {
        await this.makeApiCall(ApiActionType.API_DO_CONVERSION, payload);
    }

    async skipActionAsync(): Promise<void> {
        await this.makeApiCall(ApiActionType.API_SKIP_ACTION, {});
    }

    async completePlaceTileAsync(payload: {cell: Cell}): Promise<void> {
        await this.makeApiCall(ApiActionType.API_COMPLETE_PLACE_TILE, payload);
    }

    async completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void> {
        const serializedOption = serializeResourceActionOption(option);
        const payload = {
            option: serializedOption,
            variableAmount,
        };
        await this.makeApiCall(ApiActionType.API_COMPLETE_CHOOSE_RESOURCE_ACTION_DETAILS, payload);
    }

    async skipChooseResourceActionDetailsAsync() {
        await this.makeApiCall(ApiActionType.API_SKIP_CHOOSE_RESOURCE_ACTION_DETAILS, {});
    }

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

    async confirmCardSelectionAsync({
        selectedCards,
        corporation,
        payment,
    }: {
        selectedCards: Array<Card>;
        corporation: Card;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const payload = {
            cards: selectedCards.map(card => ({name: card.name})),
            corporation: {name: corporation.name},
            payment,
        };
        await this.makeApiCall(ApiActionType.API_CONFIRM_CARD_SELECTION, payload);
    }

    async continueAfterRevealingCardsAsync() {
        const payload = {};
        await this.makeApiCall(ApiActionType.API_CONTINUE_AFTER_REVEALING_CARDS, payload);
    }

    async completeChooseDuplicateProductionAsync(index: number) {
        const payload = {index};
        await this.makeApiCall(ApiActionType.API_COMPLETE_CHOOSE_DUPLICATE_PRODUCTION, payload);
    }

    async skipChooseDuplicateProductionAsync() {
        const payload = {};
        await this.makeApiCall(ApiActionType.API_SKIP_CHOOSE_DUPLICATE_PRODUCTION, payload);
    }
}
