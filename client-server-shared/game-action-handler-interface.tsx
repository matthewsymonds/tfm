import {Card} from 'models/card';
import {Action} from 'constants/action';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction} from 'constants/standard-project';
import {Milestone, Award, Cell, Tile} from 'constants/board';
import {ResourceActionOption} from 'components/ask-user-to-confirm-resource-action-details';

export interface GameActionHandler {
    playCardAsync({
        card,
        payment,
    }: {
        card: Card;
        payment?: PropertyCounter<Resource>;
    }): Promise<void>;

    playCardActionAsync({
        action,
        parent,
        payment,
        choiceIndex,
    }: {
        action: Action;
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
        payment?: PropertyCounter<Resource>;
    }): Promise<void>;

    fundAwardAsync({
        award,
        payment,
    }: {
        award: Award;
        payment?: PropertyCounter<Resource>;
    }): Promise<void>;

    skipActionAsync(): Promise<void>;

    completePlaceTileAsync({tile, cell}: {tile: Tile; cell: Cell}): Promise<void>;

    completeChooseResourceActionDetailsAsync({
        option,
        variableAmount,
    }: {
        option: ResourceActionOption;
        variableAmount: number;
    }): Promise<void>;

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
}
