import {ResourceActionType} from 'components/ask-user-to-confirm-resource-action-details';
import {CardSelectionCriteria} from 'constants/card-selection-criteria';
import {ExchangeRates} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {SupplementalResources} from 'server/api-action-handler';
import {SerializedCard} from 'state-serialization';
import {Action, Amount, PlayCardParams} from './constants/action';
import {Award, Cell, Milestone, Parameter, Tile, TilePlacement} from './constants/board';
import {Discounts} from './constants/discounts';
import {PropertyCounter} from './constants/property-counter';
import {Resource, ResourceAndAmount, ResourceLocationType} from './constants/resource';
import {StandardProjectAction} from './constants/standard-project';
import {GameState} from './reducer';
import {withMatcher} from './with-matcher';

const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = withMatcher((corporation: SerializedCard, playerIndex: number) => ({
    type: SET_CORPORATION,
    payload: {corporation, playerIndex},
}));

const REVEAL_AND_DISCARD_TOP_CARDS = 'REVEAL_AND_DISCARD_TOP_CARDS';
export const revealAndDiscardTopCards = withMatcher((amount: number, playerIndex: number) => ({
    type: REVEAL_AND_DISCARD_TOP_CARDS,
    payload: {amount, playerIndex},
}));

const REVEAL_TAKE_AND_DISCARD = 'REVEAL_TAKE_AND_DISCARD';
export const revealTakeAndDiscard = withMatcher(
    (revealTakeAndDiscard: PropertyCounter<CardSelectionCriteria>, playerIndex: number) => ({
        type: REVEAL_TAKE_AND_DISCARD,
        payload: {
            revealTakeAndDiscard,
            playerIndex,
        },
    })
);

const DISCARD_REVEALED_CARDS = 'DISCARD_REVEALED_CARDS';
export const discardRevealedCards = withMatcher(() => ({
    type: DISCARD_REVEALED_CARDS,
    payload: {},
}));

const DISCARD_CARDS = 'DISCARD_CARDS';
export const discardCards = withMatcher((cards: SerializedCard[], playerIndex: number) => ({
    type: DISCARD_CARDS,
    payload: {cards, playerIndex},
}));

const ADD_CARDS = 'ADD_CARDS';
export const addCards = withMatcher((cards: SerializedCard[], playerIndex: number) => ({
    type: ADD_CARDS,
    payload: {cards, playerIndex},
}));

const SET_PRELUDES = 'SET_PRELUDES';
export const setPreludes = withMatcher((preludes: SerializedCard[], playerIndex: number) => ({
    type: SET_PRELUDES,
    payload: {playerIndex, preludes},
}));

const ASK_USER_TO_CHOOSE_PRELUDE = 'ASK_USER_TO_CHOOSE_PRELUDE';
export const askUserToChoosePrelude = withMatcher((amount: number, playerIndex: number) => ({
    type: ASK_USER_TO_CHOOSE_PRELUDE,
    payload: {playerIndex, amount},
}));

const DISCARD_PRELUDES = 'DISCARD_PRELUDES';
export const discardPreludes = withMatcher((playerIndex: number) => ({
    type: DISCARD_PRELUDES,
    payload: {playerIndex},
}));

const ASK_USER_TO_FUND_AWARD = 'ASK_USER_TO_FUND_AWARD';
export const askUserToFundAward = withMatcher((playerIndex: number) => ({
    type: ASK_USER_TO_FUND_AWARD,
    payload: {playerIndex},
}));

const PAY_FOR_CARDS = 'PAY_FOR_CARDS';
export const payForCards = withMatcher(
    (cards: SerializedCard[], playerIndex: number, payment?: PropertyCounter<Resource>) => ({
        type: PAY_FOR_CARDS,
        payload: {cards, playerIndex, payment},
    })
);

const DRAFT_CARD = 'DRAFT_CARD';
export const draftCard = withMatcher((card: SerializedCard, playerIndex: number) => ({
    type: DRAFT_CARD,
    payload: {card, playerIndex},
}));

const DECREASE_PRODUCTION = 'DECREASE_PRODUCTION';
export const decreaseProduction = withMatcher(
    (
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        targetPlayerIndex: number = playerIndex
    ) => ({
        type: DECREASE_PRODUCTION,
        payload: {resource, amount, playerIndex, targetPlayerIndex},
    })
);

const INCREASE_PRODUCTION = 'INCREASE_PRODUCTION';
export const increaseProduction = withMatcher(
    (resource: Resource, amount: Amount, playerIndex: number) => ({
        type: INCREASE_PRODUCTION,
        payload: {resource, amount, playerIndex},
    })
);

const ASK_USER_TO_INCREASE_LOWEST_PRODUCTION = 'ASK_USER_TO_INCREASE_LOWEST_PRODUCTION';
export const askUserToIncreaseLowestProduction = withMatcher(
    (amount: number, playerIndex: number) => ({
        type: ASK_USER_TO_INCREASE_LOWEST_PRODUCTION,
        payload: {amount, playerIndex},
    })
);

const COMPLETE_INCREASE_LOWEST_PRODUCTION = 'COMPLETE_INCREASE_LOWEST_PRODUCTION';
export const completeIncreaseLowestProduction = withMatcher((playerIndex: number) => ({
    type: COMPLETE_INCREASE_LOWEST_PRODUCTION,
    payload: {playerIndex},
}));

const REMOVE_RESOURCE = 'REMOVE_RESOURCE';
export const removeResource = withMatcher(
    (
        resource: Resource,
        amount: number,
        sourcePlayerIndex: number,
        playerIndex: number,
        supplementalResources?: SupplementalResources
    ) => ({
        type: REMOVE_RESOURCE,
        payload: {resource, amount, sourcePlayerIndex, playerIndex, supplementalResources},
    })
);
const REMOVE_STORABLE_RESOURCE = 'REMOVE_STORABLE_RESOURCE';
export const removeStorableResource = withMatcher(
    (resource: Resource, amount: number, playerIndex: number, card: SerializedCard) => ({
        type: REMOVE_STORABLE_RESOURCE,
        payload: {resource, amount, card, playerIndex},
    })
);

export const GAIN_RESOURCE = 'GAIN_RESOURCE';
export const gainResource = withMatcher(
    (resource: Resource, amount: Amount, playerIndex: number) => ({
        type: GAIN_RESOURCE,
        payload: {resource, amount, playerIndex},
    })
);

const GAIN_STORABLE_RESOURCE = 'GAIN_STORABLE_RESOURCE';
export const gainStorableResource = withMatcher(
    (resource: Resource, amount: Amount, card: SerializedCard, playerIndex: number) => ({
        type: GAIN_STORABLE_RESOURCE,
        payload: {resource, amount, card, playerIndex},
    })
);

const STEAL_RESOURCE = 'STEAL_RESOURCE';
export const stealResource = withMatcher(
    (resource: Resource, amount: Amount, playerIndex: number, victimPlayerIndex: number) => ({
        type: STEAL_RESOURCE,
        payload: {resource, amount, victimPlayerIndex, playerIndex},
    })
);

const STEAL_STORABLE_RESOURCE = 'STEAL_STORABLE_RESOURCE';
export const stealStorableResource = withMatcher(
    (
        resource: Resource,
        amount: Amount,
        playerIndex: number,
        sourceCard: SerializedCard,
        targetCard: SerializedCard
    ) => ({
        type: STEAL_STORABLE_RESOURCE,
        payload: {resource, amount, sourceCard, targetCard, playerIndex},
    })
);

const APPLY_DISCOUNTS = 'APPLY_DISCOUNTS';
export const applyDiscounts = withMatcher((discounts: Discounts, playerIndex: number) => ({
    type: APPLY_DISCOUNTS,
    payload: {discounts, playerIndex},
}));

const SET_PLANT_DISCOUNT = 'SET_PLANT_DISCOUNT';
export const setPlantDiscount = withMatcher((plantDiscount: number, playerIndex: number) => ({
    type: SET_PLANT_DISCOUNT,
    payload: {plantDiscount, playerIndex},
}));

const APPLY_EXCHANGE_RATE_CHANGES = 'APPLY_EXCHANGE_RATE_CHANGES';
export const applyExchangeRateChanges = withMatcher(
    (cardName: string, exchangeRates: ExchangeRates, playerIndex: number) => ({
        type: APPLY_EXCHANGE_RATE_CHANGES,
        payload: {cardName, exchangeRates, playerIndex},
    })
);

const PAY_TO_PLAY_CARD = 'PAY_TO_PLAY_CARD';
export const payToPlayCard = withMatcher(
    (
        card: SerializedCard,
        playerIndex: number,
        payment: PropertyCounter<Resource> | undefined,
        conditionalPayments: number[] | undefined
    ) => ({
        type: PAY_TO_PLAY_CARD,
        payload: {card, playerIndex, payment, conditionalPayments},
    })
);

const PAY_TO_PLAY_CARD_ACTION = 'PAY_TO_PLAY_CARD_ACTION';
export const payToPlayCardAction = withMatcher(
    (
        action: Action,
        playerIndex: number,
        parentCard: SerializedCard,
        payment: PropertyCounter<Resource> | undefined
    ) => ({
        type: PAY_TO_PLAY_CARD_ACTION,
        payload: {action, playerIndex, parentCard, payment},
    })
);

const PAY_TO_PLAY_STANDARD_PROJECT = 'PAY_TO_PLAY_STANDARD_PROJECT';
export const payToPlayStandardProject = withMatcher(
    (
        standardProjectAction: StandardProjectAction,
        payment: PropertyCounter<Resource>,
        playerIndex: number
    ) => ({
        type: PAY_TO_PLAY_STANDARD_PROJECT,
        payload: {standardProjectAction, payment, playerIndex},
    })
);

const CLAIM_MILESTONE = 'CLAIM_MILESTONE';
export const claimMilestone = withMatcher(
    (milestone: Milestone, payment: PropertyCounter<Resource>, playerIndex: number) => ({
        type: CLAIM_MILESTONE,
        payload: {milestone, payment, playerIndex},
    })
);

const FUND_AWARD = 'FUND_AWARD';
export const fundAward = withMatcher(
    (award: Award, payment: PropertyCounter<Resource>, playerIndex: number) => ({
        type: FUND_AWARD,
        payload: {award, payment, playerIndex},
    })
);

const MOVE_CARD_FROM_HAND_TO_PLAY_AREA = 'MOVE_CARD_FROM_HAND_TO_PLAY_AREA';
export const moveCardFromHandToPlayArea = withMatcher(
    (card: SerializedCard, playerIndex: number) => ({
        type: MOVE_CARD_FROM_HAND_TO_PLAY_AREA,
        payload: {card, playerIndex},
    })
);

const ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS = 'ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS';
export const addParameterRequirementAdjustments = withMatcher(
    (
        parameterRequirementAdjustments: PropertyCounter<Parameter>,
        temporaryParameterRequirementAdjustments: PropertyCounter<Parameter>,
        playerIndex: number
    ) => ({
        type: ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS,
        payload: {
            parameterRequirementAdjustments,
            temporaryParameterRequirementAdjustments,
            playerIndex,
        },
    })
);

const ASK_USER_TO_PLACE_TILE = 'ASK_USER_TO_PLACE_TILE';
export const askUserToPlaceTile = withMatcher(
    (tilePlacement: TilePlacement, playerIndex: number) => {
        return {
            type: ASK_USER_TO_PLACE_TILE,
            payload: {playerIndex, tilePlacement},
        };
    }
);

const ASK_USER_TO_DISCARD_CARDS = 'ASK_USER_TO_DISCARD_CARDS';
export const askUserToDiscardCards = withMatcher(
    (
        playerIndex: number,
        amount: Amount,
        card?: SerializedCard,
        playedCard?: SerializedCard,
        isFromSellPatents?: boolean
    ) => ({
        type: ASK_USER_TO_DISCARD_CARDS,
        payload: {playerIndex, amount, card, playedCard, isFromSellPatents},
    })
);

const ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS = 'ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS';
export const askUserToChooseResourceActionDetails = withMatcher(
    (
        payload:
            | {
                  actionType: ResourceActionType;
                  resourceAndAmounts: Array<ResourceAndAmount>;
                  card: SerializedCard;
                  playedCard?: SerializedCard;
                  playerIndex: number;
                  locationType?: ResourceLocationType;
              }
            | undefined
    ) => {
        if (!payload) {
            return {
                type: ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
            };
        }

        return {
            type: ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
            payload,
        };
    }
);

const ASK_USER_TO_DUPLICATE_PRODUCTION = 'ASK_USER_TO_DUPLICATE_PRODUCTION';
export const askUserToDuplicateProduction = withMatcher(
    (payload: {tag: Tag; card: SerializedCard; playerIndex: number} | undefined) => {
        if (!payload) {
            return {
                type: ASK_USER_TO_DUPLICATE_PRODUCTION,
            };
        }

        return {
            type: ASK_USER_TO_DUPLICATE_PRODUCTION,
            payload,
        };
    }
);

const SKIP_CHOICE = 'SKIP_CHOICE';
export const skipChoice = withMatcher((playerIndex: number) => ({
    type: SKIP_CHOICE,
    payload: {playerIndex},
}));

const ASK_USER_TO_MAKE_ACTION_CHOICE = 'ASK_USER_TO_MAKE_ACTION_CHOICE';

export const askUserToMakeActionChoice = withMatcher(
    (choice: Action[], card: SerializedCard, playedCard: SerializedCard, playerIndex: number) => ({
        type: ASK_USER_TO_MAKE_ACTION_CHOICE,
        payload: {
            choice,
            card,
            playedCard,
            playerIndex,
        },
    })
);

const MAKE_ACTION_CHOICE = 'MAKE_ACTION_CHOICE';
export const makeActionChoice = withMatcher((playerIndex: number) => ({
    type: MAKE_ACTION_CHOICE,
    payload: {
        playerIndex,
    },
}));

const ASK_USER_TO_LOOK_AT_CARDS = 'ASK_USER_TO_LOOK_AT_CARDS';
export const askUserToLookAtCards = withMatcher(
    (playerIndex: number, amount: number, numCardsToTake?: number, buyCards?: boolean) => ({
        type: ASK_USER_TO_LOOK_AT_CARDS,
        payload: {
            playerIndex,
            amount,
            numCardsToTake,
            buyCards,
        },
    })
);

const PLACE_TILE = 'PLACE_TILE';
export const placeTile = withMatcher((tile: Tile, cell: Cell, playerIndex: number) => ({
    type: PLACE_TILE,
    payload: {tile, cell, playerIndex},
}));

const INCREASE_PARAMETER = 'INCREASE_PARAMETER';
export const increaseParameter = withMatcher(
    (parameter: Parameter, amount: number, playerIndex: number) => ({
        type: INCREASE_PARAMETER,
        payload: {parameter, amount, playerIndex},
    })
);

const INCREASE_TERRAFORM_RATING = 'INCREASE_TERRAFORM_RATING';
export const increaseTerraformRating = withMatcher((amount: Amount, playerIndex: number) => ({
    type: INCREASE_TERRAFORM_RATING,
    payload: {amount, playerIndex},
}));

// Player announces she is ready to start round.
const ANNOUNCE_READY_TO_START_ROUND = 'ANNOUNCE_READY_TO_START_ROUND';
export const announceReadyToStartRound = withMatcher((playerIndex: number) => ({
    type: ANNOUNCE_READY_TO_START_ROUND,
    payload: {playerIndex},
}));

// Increases the action count by 1.
// If the action count is then 3,
// resets actions to 0 and changes the active player.
// If the active player is now the start player,
// increments the turn.
const COMPLETE_ACTION = 'COMPLETE_ACTION';
export const completeAction = withMatcher((playerIndex: number) => ({
    type: COMPLETE_ACTION,
    payload: {playerIndex},
}));

// If this is the player's first action.
const SKIP_ACTION = 'SKIP_ACTION';
export const skipAction = withMatcher((playerIndex: number) => ({
    type: SKIP_ACTION,
    payload: {playerIndex},
}));

const MARK_CARD_ACTION_AS_PLAYED = 'MARK_CARD_ACTION_AS_PLAYED';
export const markCardActionAsPlayed = withMatcher(
    (card: SerializedCard, playerIndex: number, shouldLog: boolean = true) => ({
        type: MARK_CARD_ACTION_AS_PLAYED,
        payload: {
            card,
            playerIndex,
            shouldLog,
        },
    })
);

const SET_GAME = 'SET_GAME';
export const setGame = withMatcher((gameState: GameState | null) => ({
    type: SET_GAME,
    payload: {gameState},
}));

const ADD_FORCED_ACTION_TO_PLAYER = 'ADD_FORCED_ACTION_TO_PLAYER';
export const addForcedActionToPlayer = withMatcher((playerIndex: number, forcedAction: Action) => ({
    type: ADD_FORCED_ACTION_TO_PLAYER,
    payload: {
        playerIndex,
        forcedAction,
    },
}));

const REMOVE_FORCED_ACTION_FROM_PLAYER = 'REMOVE_FORCED_ACTION_FROM_PLAYER';
export const removeForcedActionFromPlayer = withMatcher(
    (playerIndex: number, forcedAction: Action) => ({
        type: REMOVE_FORCED_ACTION_FROM_PLAYER,
        payload: {
            playerIndex,
            forcedAction,
        },
    })
);

const ASK_USER_TO_USE_BLUE_CARD_ACTION_ALREADY_USED_THIS_GENERATION =
    'ASK_USER_TO_USE_BLUE_CARD_ACTION_ALREADY_USED_THIS_GENERATION';
export const askUserToUseBlueCardActionAlreadyUsedThisGeneration = withMatcher(
    (playerIndex: number) => ({
        type: ASK_USER_TO_USE_BLUE_CARD_ACTION_ALREADY_USED_THIS_GENERATION,
        payload: {playerIndex},
    })
);

const USE_BLUE_CARD_ACTION_ALREADY_USED_THIS_GENERATION =
    'USE_BLUE_CARD_ACTION_ALREADY_USED_THIS_GENERATION';
export const useBlueCardActionAlreadyUsedThisGeneration = withMatcher((playerIndex: number) => ({
    type: USE_BLUE_CARD_ACTION_ALREADY_USED_THIS_GENERATION,
    payload: {playerIndex},
}));

const GAIN_RESOURCE_WHEN_INCREASE_PRODUCTION = 'GAIN_RESOURCE_WHEN_INCREASE_PRODUCTION';
export const gainResourceWhenIncreaseProduction = withMatcher((playerIndex: number) => ({
    type: GAIN_RESOURCE_WHEN_INCREASE_PRODUCTION,
    payload: {playerIndex},
}));

const ASK_USER_TO_PLAY_CARD_FROM_HAND = 'ASK_USER_TO_PLAY_CARD_FROM_HAND';
export const askUserToPlayCardFromHand = withMatcher(
    (playCardParams: PlayCardParams, playerIndex: number) => ({
        type: ASK_USER_TO_PLAY_CARD_FROM_HAND,
        payload: {playerIndex, playCardParams},
    })
);

// Client side action that disables UI while waiting for a response from the server.
const SET_IS_SYNCING = 'SET_IS_SYNCING';
export const setIsSyncing = withMatcher(() => ({
    type: SET_IS_SYNCING,
    payload: {},
}));

// Client side action that disables UI while waiting for a response from the server.
const SET_IS_NOT_SYNCING = 'SET_IS_NOT_SYNCING';
export const setIsNotSyncing = withMatcher(() => ({
    type: SET_IS_NOT_SYNCING,
    payload: {},
}));

const MOVE_FLEET = 'MOVE_FLEET';
export const moveFleet = withMatcher((colony: string, playerIndex: number) => ({
    type: MOVE_FLEET,
    payload: {colony, playerIndex},
}));

const SELECT_PLAYER_TO_RECEIVE_COLONY_BONUS = 'SELECT_PLAYER_TO_RECEIVE_COLONY_BONUS';
export const selectPlayerToReceiveColonyBonus = withMatcher((opponentPlayerIndex: number) => ({
    type: SELECT_PLAYER_TO_RECEIVE_COLONY_BONUS,
    payload: {opponentPlayerIndex},
}));

export const RETURN_CONTROL_TO_CURRENT_PLAYER_AFTER_OPPONENTS_RECEIVE_COLONY_BONUS =
    'RETURN_CONTROL_TO_CURRENT_PLAYER_AFTER_OPPONENTS_RECEIVE_COLONY_BONUS';

export const returnControlToCurrentPlayerAfterOpponentsReceiveColonyBonus = withMatcher(
    (playerIndex: number) => ({
        type: RETURN_CONTROL_TO_CURRENT_PLAYER_AFTER_OPPONENTS_RECEIVE_COLONY_BONUS,
        payload: {playerIndex},
    })
);

const MOVE_COLONY_TILE_TRACK = 'MOVE_COLONY_TILE_TRACK';
export const moveColonyTileTrack = withMatcher((colony: string, location: number) => ({
    type: MOVE_COLONY_TILE_TRACK,
    payload: {colony, location},
}));

const ASK_USER_TO_BUILD_COLONY = 'ASK_USER_TO_PLACE_COLONY';
export type PlaceColony = {mayBeRepeatColony: boolean};
export const askUserToPlaceColony = withMatcher(
    (placeColony: PlaceColony, playerIndex: number) => ({
        type: ASK_USER_TO_BUILD_COLONY,
        payload: {placeColony, playerIndex},
    })
);

const BUILD_COLONY = 'BUILD_COLONY';
export const placeColony = withMatcher((colony: string, playerIndex: number) => ({
    type: BUILD_COLONY,
    payload: {colony, playerIndex},
}));

const INCREASE_COLONY_TILE_TRACK_RANGE = 'INCREASE_COLONY_TILE_TRACK_RANGE';
export const increaseColonyTileTrackRange = withMatcher(
    (quantity: number, playerIndex: number) => ({
        type: INCREASE_COLONY_TILE_TRACK_RANGE,
        payload: {quantity, playerIndex},
    })
);

const ASK_USER_TO_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS =
    'ASK_USER_TO_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS';
export const askUserToIncreaseAndDecreaseColonyTileTracks = withMatcher(
    (quantity: number, playerIndex: number) => ({
        type: ASK_USER_TO_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS,
        payload: {quantity, playerIndex},
    })
);

const INCREASE_AND_DECREASE_COLONY_TILE_TRACKS = 'INCREASE_AND_DECREASE_COLONY_TILE_TRACKS';
export const increaseAndDecreaseColonyTileTracks = withMatcher(
    (increase: string, decrease: string, playerIndex: number) => ({
        type: INCREASE_AND_DECREASE_COLONY_TILE_TRACKS,
        payload: {increase, decrease, playerIndex},
    })
);

const ASK_USER_TO_TRADE_FOR_FREE = 'ASK_USER_TO_TRADE_FOR_FREE';
export const askUserToTradeForFree = withMatcher((playerIndex: number) => ({
    type: ASK_USER_TO_TRADE_FOR_FREE,
    payload: {playerIndex},
}));

const COMPLETE_TRADE_FOR_FREE = 'COMPLETE_TRADE_FOR_FREE';
export const completeTradeForFree = withMatcher((playerIndex: number) => ({
    type: COMPLETE_TRADE_FOR_FREE,
    payload: {playerIndex},
}));

const GAIN_TRADE_FLEET = 'GAIN_TRADE_FLEET';
export const gainTradeFleet = withMatcher((playerIndex: number) => ({
    type: GAIN_TRADE_FLEET,
    payload: {playerIndex},
}));

const ASK_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY =
    'ASK_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY';
export const askUserToPutAdditionalColonyTileIntoPlay = withMatcher((playerIndex: number) => ({
    type: ASK_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY,
    payload: {playerIndex},
}));

const COMPLETE_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY =
    'COMPLETE_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY';
export const completeUserToPutAdditionalColonyTileIntoPlay = withMatcher(
    (colony: string, playerIndex: number) => ({
        type: COMPLETE_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY,
        payload: {playerIndex, colony},
    })
);

export const PAUSE_ACTIONS = [
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
    ASK_USER_TO_LOOK_AT_CARDS,
    REVEAL_AND_DISCARD_TOP_CARDS,
    ASK_USER_TO_DISCARD_CARDS,
    ASK_USER_TO_MAKE_ACTION_CHOICE,
    ASK_USER_TO_DUPLICATE_PRODUCTION,
    ASK_USER_TO_INCREASE_LOWEST_PRODUCTION,
    ASK_USER_TO_CHOOSE_PRELUDE,
    ASK_USER_TO_FUND_AWARD,
    ASK_USER_TO_BUILD_COLONY,
    ASK_USER_TO_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS,
    ASK_USER_TO_TRADE_FOR_FREE,
    ASK_USER_TO_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY,
];
