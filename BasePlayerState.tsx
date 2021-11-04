import {PlaceColony} from 'actions';
import {ResourceActionType} from 'components/ask-user-to-confirm-resource-action-details';
import {Tag} from 'constants/tag';
import {AnyAction} from 'redux';
import {Action, Amount, PlayCardParams} from './constants/action';
import {Parameter, TilePlacement} from './constants/board';
import {Discounts} from './constants/discounts';
import {NumericPropertyCounter} from './constants/property-counter';
import {ResourceAndAmount, ResourceLocationType} from './constants/resource';
import {Resource} from './constants/resource-enum';
import {Card} from './models/card';
import {PendingChoice, Resources} from './reducer';

export type BasePlayerState = {
    index: number;
    // For UNMI
    terraformedThisGeneration?: boolean;
    username: string;
    action: number; // 1 or 2.
    terraformRating: number;
    pendingTilePlacement?: TilePlacement;
    pendingResourceActionDetails?: {
        actionType: ResourceActionType;
        resourceAndAmounts: Array<ResourceAndAmount>;
        card: Card;
        playedCard?: Card; // The card that was played and triggered the decision.
        locationType?: ResourceLocationType;
    };
    pendingDuplicateProduction?: {
        tag: Tag;
        card: Card;
    };
    // Vitor
    fundAward?: boolean;
    // e.g. Sell patents, mars university, etc.
    pendingDiscard?: {
        amount: Amount;
        card?: Card;
        playedCard?: Card;
        isFromSellPatents: boolean;
    };
    pendingCardSelection?: {
        possibleCards: Card[];
        // Is the player considering buying the cards they're looking at?
        isBuyingCards?: boolean;
        // In an action that makes you look at cards, specifies how many you can take or buy.
        numCardsToTake?: number | null;
        // During drafting, cards selected thus far are stored here
        draftPicks?: Card[];
    };
    // e.g. "Play a card from hand, ignoring global requirements"
    pendingPlayCardFromHand?: PlayCardParams;

    previousCardsInHand?: number;
    forcedActions: Array<Action>;
    corporation: Card;
    possibleCorporations: Card[];
    cards: Card[];
    playedCards: Card[];
    preludes: Card[];
    possiblePreludes: Card[];
    resources: Resources;

    productions: Resources;
    exchangeRates: {
        [Resource.STEEL]: number;
        [Resource.TITANIUM]: number;
        [Resource.HEAT]: number;
    };
    discounts: Discounts;
    plantDiscount?: number;
    pendingChoice?: PendingChoice;
    pendingNextActionChoice?: AnyAction[];
    pendingActionReplay?: boolean;

    parameterRequirementAdjustments: NumericPropertyCounter<Parameter>;
    temporaryParameterRequirementAdjustments: NumericPropertyCounter<Parameter>;
    gainResourceWhenIncreaseProduction?: number;
    pendingIncreaseLowestProduction?: number;
    // colonies
    fleets: number;

    placeColony?: PlaceColony;
    colonyTileTrackRange?: number;
    // market manipulation
    increaseAndDecreaseColonyTileTracks?: number;
    tradeForFree?: boolean;
    putAdditionalColonyTileIntoPlay?: boolean;
};
