import {ResourceActionOption} from 'components/ask-user-to-confirm-resource-action-details';
import {Payment} from 'constants/action';
import {Award, Cell, Milestone, Tile} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {StandardProjectAction} from 'constants/standard-project';
import {SupplementalResources} from 'server/api-action-handler';
import {SerializedCard} from 'state-serialization';

export type PlayCardAsyncParams = {
    name: string;
    payment?: PropertyCounter<Resource>;
    conditionalPayments?: number[];
    supplementalResources?: SupplementalResources;
};

export interface GameActionHandler {
    playCardAsync({
        name,
        payment,
        conditionalPayments,
        supplementalResources,
    }: PlayCardAsyncParams): Promise<void>;

    playCardActionAsync({
        parent,
        payment,
        supplementalResources,
        choiceIndex,
    }: {
        parent: SerializedCard;
        payment?: PropertyCounter<Resource>;
        supplementalResources?: SupplementalResources;
        choiceIndex?: number;
    }): Promise<void>;

    playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment: Payment;
    }): Promise<void>;

    claimMilestoneAsync(payload: {
        milestone: Milestone;
        payment?: PropertyCounter<Resource>;
    }): Promise<void>;

    fundAwardAsync(payload: {award: Award; payment?: PropertyCounter<Resource>}): Promise<void>;

    doConversionAsync(payload: {
        resource: Resource;
        supplementalResources?: SupplementalResources;
    }): Promise<void>;

    skipActionAsync(): Promise<void>;
    passGenerationAsync(): Promise<void>;

    completePlaceTileAsync(payload: {cell: Cell}): Promise<void>;

    completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void>;

    skipChooseResourceActionDetailsAsync(): Promise<void>;

    completeDuplicateProductionAsync({card}: {card: SerializedCard}): Promise<void>;

    confirmCardSelectionAsync({
        selectedCards,
        selectedPreludes,
        corporation,
        payment,
    }: {
        selectedCards: Array<SerializedCard>;
        selectedPreludes: Array<SerializedCard>;
        corporation: SerializedCard;
        payment?: PropertyCounter<Resource>;
    }): Promise<void>;

    continueAfterRevealingCardsAsync(): Promise<void>;

    completeChooseDuplicateProductionAsync(index: number): Promise<void>;

    skipChooseDuplicateProductionAsync(): Promise<void>;

    increaseLowestProductionAsync({production}: {production: Resource}): Promise<void>;

    tradeAsync({
        colony,
        payment,
        numHeat,
        tradeIncome,
    }: {
        payment: Resource;
        colony: string;
        tradeIncome: number;
        numHeat?: number;
    }): Promise<void>;

    tradeForFreeAsync({colony, tradeIncome}: {colony: string; tradeIncome: number}): Promise<void>;

    completePlaceColonyAsync({colony}: {colony: string}): Promise<void>;

    completeIncreaseAndDecreaseColonyTileTracksAsync({
        increase,
        decrease,
    }: {
        increase: string;
        decrease: string;
    }): Promise<void>;

    completePutAdditionalColonyTileIntoPlayAsync({colony}: {colony: string}): Promise<void>;

    completeChooseNextActionAsync(actionIndex: number, payment?: Payment): Promise<void>;

    startOverAsync(): Promise<void>;
}
