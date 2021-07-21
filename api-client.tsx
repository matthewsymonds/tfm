import {setGame, setIsNotSyncing} from 'actions';
import {makeGetCall, makePostCall} from 'api-calls';
import {ApiActionType} from 'client-server-shared/api-action-type';
import {GameActionHandler} from 'client-server-shared/game-action-handler-interface';
import {playGame} from 'client-server-shared/play-game';
import {
    ResourceActionOption,
    serializeResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {Award, Cell, Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction} from 'constants/standard-project';
import {AnyAction, Store} from 'redux';
import {ApiActionHandler} from 'server/api-action-handler';
import {StateHydrator} from 'server/state-hydrator';
import {SerializedCard} from 'state-serialization';

export class ApiClient implements GameActionHandler {
    actionHandler: ApiActionHandler;
    stateHydrator: StateHydrator;
    constructor(
        private readonly dispatch: (action: AnyAction) => void,
        username: string,
        private readonly store: Store
    ) {
        const queue = [];
        const game = {
            queue: queue,
            state: store.getState(),
            players: store.getState().players.map(player => player.username),
            name: this.getGameName(),
        };
        this.actionHandler = new ApiActionHandler(
            game,
            username,
            dispatch,
            /* ignoreSyncing = */ true
        );
        this.stateHydrator = new StateHydrator(game, username);

        store.subscribe(() => {
            const state = store.getState();
            this.actionHandler.state = state;
        });
    }
    async playCardAsync({
        serializedCard,
        payment,
        conditionalPayments,
    }: {
        serializedCard: SerializedCard;
        payment?: PropertyCounter<Resource>;
        conditionalPayments?: number[];
    }): Promise<void> {
        const payload = {
            name: serializedCard.name,
            payment,
            conditionalPayments,
        };

        await this.makeApiCall(ApiActionType.API_PLAY_CARD, payload);
    }

    processingActions: Function[] = [];

    private async makeApiCall(type: ApiActionType, payload, retry = true) {
        const {actionCount} = this.store.getState();

        playGame(
            type,
            payload,
            this.actionHandler,
            this.stateHydrator,
            this.actionHandler.state
        ).catch(async error => {
            const apiPath = '/api' + window.location.pathname;

            const result = await makeGetCall(apiPath);
            this.dispatch(setGame(result.state));
        });
        this.processingActions.push(async () => {
            try {
                const result = await makePostCall(this.getPath(), {
                    type,
                    payload,
                    actionCount,
                });
                if (this.processingActions.length <= 1) {
                    this.dispatch(setGame(result.state));
                }
            } catch (error) {
                // TODO Gracefully fail and tell user to try again.
                if (retry) {
                    // retry once.
                    return await this.makeApiCall(type, payload, false);
                }
            }
            this.dispatch(setIsNotSyncing());
        });

        if (this.processingActions.length > 1) {
            return;
        }

        while (this.processingActions.length > 0) {
            const action = this.processingActions[0];
            if (action) {
                await action();
                this.processingActions.shift();
            }
        }
    }

    private getPath(): string {
        const gameName = this.getGameName();

        return `/api/games/${gameName}/play`;
    }

    private getGameName() {
        return this.store.getState().name;
    }

    async playCardActionAsync({
        parent,
        payment,
        choiceIndex,
    }: {
        parent: SerializedCard;
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
        payment: PropertyCounter<Resource>;
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

    async skipPlayCardFromHandAsync() {
        await this.makeApiCall(ApiActionType.API_SKIP_ACTION, {});
    }

    async completeLookAtCardsAsync({
        selectedCards,
    }: {
        selectedCards: Array<SerializedCard>;
    }): Promise<void> {}

    async completeChooseDiscardCardsAsync({
        selectedCards,
    }: {
        selectedCards: Array<SerializedCard>;
    }): Promise<void> {}

    async completeDuplicateProductionAsync({card}: {card: SerializedCard}): Promise<void> {}

    async chooseCorporationAndStartingCardsAsync({
        corporation,
        selectedCards,
    }: {
        corporation: SerializedCard;
        selectedCards: Array<SerializedCard>;
    }): Promise<void> {}

    async chooseCardsAsync({
        selectedCards,
    }: {
        selectedCards: Array<SerializedCard>;
    }): Promise<void> {}

    async chooseCardForDraftRoundAsync({
        selectedCards,
    }: {
        selectedCards: Array<SerializedCard>;
    }): Promise<void> {}

    async confirmCardSelectionAsync({
        selectedCards,
        selectedPreludes,
        corporation,
        payment,
    }: {
        selectedCards: Array<SerializedCard>;
        selectedPreludes: Array<SerializedCard>;
        corporation: SerializedCard;
        payment?: PropertyCounter<Resource>;
    }): Promise<void> {
        const payload = {
            cards: selectedCards.map(card => ({name: card.name})),
            preludes: selectedPreludes.map(card => ({name: card.name})),
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

    async increaseLowestProductionAsync({production}: {production: Resource}) {
        const payload = {production};
        await this.makeApiCall(ApiActionType.API_INCREASE_LOWEST_PRODUCTION, payload);
    }

    async tradeAsync({
        colony,
        payment,
        tradeIncome,
    }: {
        colony: string;
        payment: Resource;
        tradeIncome: number;
    }) {
        const payload = {colony, payment, tradeIncome};
        await this.makeApiCall(ApiActionType.API_TRADE, payload);
    }

    async completePlaceColonyAsync({colony}: {colony: string}) {
        const payload = {colony};
        await this.makeApiCall(ApiActionType.API_COMPLETE_BUILD_COLONY, payload);
    }

    async completeIncreaseAndDecreaseColonyTileTracksAsync({
        increase,
        decrease,
    }: {
        increase: string;
        decrease: string;
    }) {
        const payload = {increase, decrease};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS,
            payload
        );
    }
}
