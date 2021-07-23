import {ResourceActionOption} from 'components/ask-user-to-confirm-resource-action-details';
import {Award, Cell, Milestone, Tile} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction} from 'constants/standard-project';
import {Card} from 'models/card';
import {SupplementalResources} from 'server/api-action-handler';

export type PlayCardAsyncParams = {
    name: string;
    payment?: PropertyCounter<Resource>;
    conditionalPayments?: number[];
    supplementalResources?: SupplementalResources;
};

export interface GameActionHandler {
    playCardAsync(params: PlayCardAsyncParams): Promise<void>;

    playCardActionAsync({
        parent,
        payment,
    }: {
        parent: Card;
        payment?: PropertyCounter<Resource>;
        choiceIndex?: number;
    }): Promise<void>;

    playStandardProjectAsync({
        standardProjectAction,
        payment,
    }: {
        standardProjectAction: StandardProjectAction;
        payment?: PropertyCounter<Resource>;
    }): Promise<void>;

    claimMilestoneAsync({
        milestone,
        payment,
    }: {
        milestone: Milestone;
        payment: PropertyCounter<Resource>;
    }): Promise<void>;

    fundAwardAsync({
        award,
        payment,
    }: {
        award: Award;
        payment: PropertyCounter<Resource>;
    }): Promise<void>;

    doConversionAsync({resource}: {resource: Resource}): Promise<void>;

    skipActionAsync(): Promise<void>;

    completePlaceTileAsync({tile, cell}: {tile: Tile; cell: Cell}): Promise<void>;

    completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void>;

    skipChooseResourceActionDetailsAsync(): Promise<void>;

    completeLookAtCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void>;

    completeChooseDiscardCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void>;

    completeDuplicateProductionAsync({card}: {card: Card}): Promise<void>;

    chooseCorporationAndStartingCardsAsync({
        corporation,
        selectedCards,
    }: {
        corporation: Card;
        selectedCards: Array<Card>;
    }): Promise<void>;

    chooseCardsAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void>;

    chooseCardForDraftRoundAsync({selectedCards}: {selectedCards: Array<Card>}): Promise<void>;

    increaseLowestProductionAsync({production}: {production: Resource}): Promise<void>;

    tradeAsync({
        payment,
        colony,
        tradeIncome,
    }: {
        payment: Resource;
        colony: string;
        tradeIncome: number;
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
}
