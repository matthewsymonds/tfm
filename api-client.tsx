import {
    setGame,
    setIsMakingPlayRequest,
    setIsNotMakingPlayRequest,
    setIsNotSyncing,
    setIsSyncing,
} from 'actions';
import {makePostCall} from 'api-calls';
import {ApiActionType} from 'client-server-shared/api-action-type';
import {
    GameActionHandler,
    PlayCardAsyncParams,
} from 'client-server-shared/game-action-handler-interface';
import {playGame} from 'client-server-shared/play-game';
import {
    ResourceActionOption,
    serializeResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {Payment} from 'constants/action';
import {Cell} from 'constants/board';
import {Conversion} from 'constants/conversion';
import {
    NumericPropertyCounter,
    PropertyCounter,
} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {StandardProjectAction} from 'constants/standard-project';
import {batch} from 'react-redux';
import {toast} from 'react-toastify';
import {AnyAction, Store} from 'redux';
import {
    ApiActionHandler,
    SupplementalResources,
} from 'server/api-action-handler';
import {SerializedCard} from 'state-serialization';

export class ApiClient implements GameActionHandler {
    actionHandler: ApiActionHandler;
    constructor(
        private readonly dispatch: (action: AnyAction) => void,
        username: string,
        private readonly store: Store
    ) {
        const state = store.getState();
        const queue = [];
        const game = {
            queue,
            state,
            players: state.players.map(player => player.username),
            name: state.name,
        };
        this.actionHandler = new ApiActionHandler(
            game,
            username,
            dispatch,
            /* ignoreSyncing = */ true
        );

        store.subscribe(() => {
            const state = store.getState();
            if (!state) return;
            const queue = [];
            const game = {
                queue,
                state,
                players: state.players.map(player => player.username),
                name: state.name,
            };
            this.actionHandler = new ApiActionHandler(
                game,
                username,
                dispatch,
                /* ignoreSyncing = */ true
            );
        });
    }
    async playCardAsync({
        name,
        payment,
        conditionalPayments,
        supplementalResources,
    }: PlayCardAsyncParams): Promise<void> {
        const payload: PlayCardAsyncParams = {
            name,
            payment,
        };

        if (conditionalPayments) {
            payload.conditionalPayments = conditionalPayments;
        }

        if (supplementalResources) {
            payload.supplementalResources = supplementalResources;
        }

        await this.makeApiCall(ApiActionType.API_PLAY_CARD, payload);
    }

    processingActions: Function[] = [];

    private async makeApiCall(type: ApiActionType, payload, retry = true) {
        const {actionCount, name} = this.store.getState();
        this.store.dispatch(setIsMakingPlayRequest());
        batch(() => {
            this.store.dispatch(setIsSyncing());
            try {
                playGame(
                    type,
                    payload,
                    this.actionHandler,
                    this.actionHandler.state
                );
            } catch (error) {
                this.logError(error, payload, type);
            }

            this.store.dispatch(setIsNotSyncing());
        });

        this.processingActions.push(async () => {
            try {
                const result = await makePostCall(this.getPath(), {
                    type,
                    payload,
                    actionCount,
                });
                if (typeof result !== 'object' || !('state' in result)) {
                    if ('error' in result) {
                        toast(<div>{result.error}</div>);
                        throw new Error('API call failed');
                    } else if ('alert' in result) {
                        // Should wait for lock to resolve.
                        toast(<div>{result.alert}</div>);
                        return;
                    }
                }
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
        this.store.dispatch(setIsNotMakingPlayRequest());
    }

    private getPath(): string {
        const gameName = this.getGameName();

        return `/api/games/${gameName}/play`;
    }

    private async logError(
        error: Error | unknown,
        payload: Object,
        type: ApiActionType
    ) {
        try {
            const apiPath = '/api/log-error';
            let errorString = '';
            if (error instanceof Error) {
                errorString += error.toString();
                errorString += '; ';
                errorString += error?.stack ?? '';
            } else {
                errorString = JSON.stringify(error);
            }
            errorString = errorString.split('\n')[0];
            await makePostCall(apiPath, {
                gameName: name,
                error: errorString,
                attemptedAction: {
                    type,
                    payload,
                },
            });
            toast(<div>{errorString}</div>);
        } catch (error) {
            console.log(
                'there was an error while attempting to log error',
                error
            );
        }
    }

    private getGameName() {
        return this.store.getState().name;
    }

    async playCardActionAsync({
        parent,
        payment,
        // Exclusively for StormCraft
        supplementalResources,
        choiceIndex,
    }: {
        parent: SerializedCard;
        payment?: PropertyCounter<Resource>;
        supplementalResources?: SupplementalResources;
        choiceIndex?: number;
    }): Promise<void> {
        const payload = {
            name: parent.name,
            payment,
            supplementalResources,
            choiceIndex,
        };

        await this.makeApiCall(ApiActionType.API_PLAY_CARD_ACTION, payload);
    }

    async playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment: Payment;
    }): Promise<void> {
        const payload = {
            standardProjectActionType: standardProjectAction.type,
            payment,
        };

        await this.makeApiCall(
            ApiActionType.API_PLAY_STANDARD_PROJECT,
            payload
        );
    }

    async claimMilestoneAsync(payload: {
        milestone: string;
        payment: NumericPropertyCounter<Resource>;
    }): Promise<void> {
        await this.makeApiCall(ApiActionType.API_CLAIM_MILESTONE, payload);
    }

    async fundAwardAsync(payload: {
        award: string;
        payment: NumericPropertyCounter<Resource>;
    }): Promise<void> {
        await this.makeApiCall(ApiActionType.API_FUND_AWARD, payload);
    }

    async doConversionAsync(payload: {conversion: Conversion}): Promise<void> {
        await this.makeApiCall(ApiActionType.API_DO_CONVERSION, payload);
    }

    async skipActionAsync(): Promise<void> {
        await this.makeApiCall(ApiActionType.API_SKIP_ACTION, {});
    }

    async passGenerationAsync(): Promise<void> {
        await this.makeApiCall(ApiActionType.API_PASS_GENERATION, {});
    }

    async completePlaceTileAsync(payload: {cell: Cell}): Promise<void> {
        await this.makeApiCall(ApiActionType.API_COMPLETE_PLACE_TILE, payload);
    }

    async completeRemoveTileAsync(payload: {cell: Cell}): Promise<void> {
        await this.makeApiCall(ApiActionType.API_COMPLETE_REMOVE_TILE, payload);
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
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_CHOOSE_RESOURCE_ACTION_DETAILS,
            payload
        );
    }

    async skipChooseResourceActionDetailsAsync() {
        await this.makeApiCall(
            ApiActionType.API_SKIP_CHOOSE_RESOURCE_ACTION_DETAILS,
            {}
        );
    }

    async completeDuplicateProductionAsync({
        card,
    }: {
        card: SerializedCard;
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
        await this.makeApiCall(
            ApiActionType.API_CONFIRM_CARD_SELECTION,
            payload
        );
    }

    async continueAfterRevealingCardsAsync() {
        const payload = {};
        await this.makeApiCall(
            ApiActionType.API_CONTINUE_AFTER_REVEALING_CARDS,
            payload
        );
    }

    async completeChooseDuplicateProductionAsync(index: number) {
        const payload = {index};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_CHOOSE_DUPLICATE_PRODUCTION,
            payload
        );
    }

    async skipChooseDuplicateProductionAsync() {
        const payload = {};
        await this.makeApiCall(
            ApiActionType.API_SKIP_CHOOSE_DUPLICATE_PRODUCTION,
            payload
        );
    }

    async increaseLowestProductionAsync({production}: {production: Resource}) {
        const payload = {production};
        await this.makeApiCall(
            ApiActionType.API_INCREASE_LOWEST_PRODUCTION,
            payload
        );
    }

    async gainStandardResourcesAsync({
        resources,
    }: {
        resources: NumericPropertyCounter<Resource>;
    }) {
        const payload = {resources};
        await this.makeApiCall(
            ApiActionType.API_GAIN_STANDARD_RESOURCES,
            payload
        );
    }

    async tradeAsync({
        colony,
        payment,
        numHeat,
        tradeIncome,
    }: {
        colony: string;
        payment: Resource;
        tradeIncome: number;
        numHeat?: number;
    }) {
        const payload = {colony, payment, tradeIncome, numHeat: numHeat || 0};
        await this.makeApiCall(ApiActionType.API_TRADE, payload);
    }

    async tradeForFreeAsync({
        colony,
        tradeIncome,
    }: {
        colony: string;
        tradeIncome: number;
    }) {
        const payload = {colony, tradeIncome};
        await this.makeApiCall(ApiActionType.API_TRADE_FOR_FREE, payload);
    }

    async completePlaceColonyAsync({colony}: {colony: string}) {
        const payload = {colony};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_BUILD_COLONY,
            payload
        );
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

    async completePutAdditionalColonyTileIntoPlayAsync({
        colony,
    }: {
        colony: string;
    }) {
        const payload = {colony};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY,
            payload
        );
    }

    async completeChooseNextActionAsync(
        actionIndex: number,
        payment?: Payment
    ) {
        const payload = {actionIndex, payment};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_CHOOSE_NEXT_ACTION,
            payload
        );
    }

    async lobbyAsync(party: string, payment: Payment) {
        const payload = {party, payment};
        await this.makeApiCall(ApiActionType.API_LOBBY, payload);
    }

    async completeExchangeNeutralNonLeaderDelegateAsync(party: string) {
        const payload = {party};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_EXCHANGE_NEUTRAL_NON_LEADER_DELEGATE,
            payload
        );
    }

    async completePlaceDelegatesInOnePartyAsync(party: string) {
        const payload = {party};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_PLACE_DELEGATE_IN_ONE_PARTY,
            payload
        );
    }

    async completeRemoveNonLeaderDelegateAsync(party: string, index: number) {
        const payload = {party, index};
        await this.makeApiCall(
            ApiActionType.API_COMPLETE_REMOVE_NON_LEADER_DELEGATE,
            payload
        );
    }

    async doRulingPolicyActionAsync(payment: Payment) {
        const payload = {payment};
        await this.makeApiCall(
            ApiActionType.API_DO_RULING_POLICY_ACTION,
            payload
        );
    }

    async startOverAsync() {
        const payload = {};
        await this.makeApiCall(ApiActionType.API_START_OVER, payload);
    }

    async setNotesAsync(notes: string) {
        const payload = {notes};
        await this.makeApiCall(ApiActionType.API_SET_NOTES, payload);
    }
}
