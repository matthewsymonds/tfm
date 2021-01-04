import {ResourceActionType} from 'components/ask-user-to-confirm-resource-action-details';
import {ExchangeRates} from 'constants/card-types';
import {Tag} from 'constants/tag';
import {SerializedCard} from 'state-serialization';
import {Action, Amount} from './constants/action';
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

const SET_CARDS = 'SET_CARDS';
export const setCards = withMatcher((cards: SerializedCard[], playerIndex: number) => ({
    type: SET_CARDS,
    payload: {cards, playerIndex},
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

const REMOVE_RESOURCE = 'REMOVE_RESOURCE';
export const removeResource = withMatcher(
    (resource: Resource, amount: number, sourcePlayerIndex: number, playerIndex: number) => ({
        type: REMOVE_RESOURCE,
        payload: {resource, amount, sourcePlayerIndex, playerIndex},
    })
);
const REMOVE_STORABLE_RESOURCE = 'REMOVE_STORABLE_RESOURCE';
export const removeStorableResource = withMatcher(
    (resource: Resource, amount: number, playerIndex: number, card: SerializedCard) => ({
        type: REMOVE_STORABLE_RESOURCE,
        payload: {resource, amount, card, playerIndex},
    })
);

const GAIN_RESOURCE = 'GAIN_RESOURCE';
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
    (exchangeRates: ExchangeRates, playerIndex: number) => ({
        type: APPLY_EXCHANGE_RATE_CHANGES,
        payload: {exchangeRates, playerIndex},
    })
);

const PAY_TO_PLAY_CARD = 'PAY_TO_PLAY_CARD';
export const payToPlayCard = withMatcher(
    (
        card: SerializedCard,
        playerIndex: number,
        payment: PropertyCounter<Resource> | undefined
    ) => ({
        type: PAY_TO_PLAY_CARD,
        payload: {card, playerIndex, payment},
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

// Client side action that disables UI while waiting for a response from the server.
const SET_IS_SYNCING = 'SET_IS_SYNCING';
export const setIsSyncing = withMatcher(() => ({
    type: SET_IS_SYNCING,
    payload: {},
}));

export const PAUSE_ACTIONS = [
    ASK_USER_TO_PLACE_TILE,
    ASK_USER_TO_CHOOSE_RESOURCE_ACTION_DETAILS,
    ASK_USER_TO_LOOK_AT_CARDS,
    REVEAL_AND_DISCARD_TOP_CARDS,
    ASK_USER_TO_DISCARD_CARDS,
    ASK_USER_TO_MAKE_ACTION_CHOICE,
    ASK_USER_TO_DUPLICATE_PRODUCTION,
];
