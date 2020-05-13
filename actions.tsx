import {Action, Amount} from './constants/action';
import {Award, Cell, Milestone, Parameter, Tile, TilePlacement} from './constants/board';
import {Discounts} from './constants/discounts';
import {GameStage} from './constants/game';
import {PropertyCounter} from './constants/property-counter';
import {Resource, ResourceLocationType} from './constants/resource';
import {StandardProjectAction} from './constants/standard-project';
import {VariableAmount} from './constants/variable-amount';
import {Card} from './models/card';
import {RootState} from './reducer';

export const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = (corporation: Card, playerIndex: number) => ({
    type: SET_CORPORATION,
    payload: {corporation, playerIndex},
});

export const GO_TO_GAME_STAGE = 'GO_TO_GAME_STAGE';
export const goToGameStage = (stage: GameStage) => ({
    type: GO_TO_GAME_STAGE,
    payload: stage,
});

export const REVEAL_AND_DISCARD_TOP_CARDS = 'REVEAL_AND_DISCARD_TOP_CARDS';
export const revealAndDiscardTopCards = (amount: Amount) => ({
    type: REVEAL_AND_DISCARD_TOP_CARDS,
    payload: {amount},
});

export const DISCARD_REVEALED_CARDS = 'DISCARD_REVEALED_CARDS';
export const discardRevealedCards = () => ({
    type: DISCARD_REVEALED_CARDS,
});

export const DISCARD_CARDS = 'DISCARD_CARDS';
export const discardCards = (cards: Card[], playerIndex: number) => ({
    type: DISCARD_CARDS,
    payload: {cards, playerIndex},
});

export const SET_CARDS = 'SET_CARDS';
export const setCards = (cards: Card[], playerIndex: number) => ({
    type: SET_CARDS,
    payload: {cards, playerIndex},
});

export const SET_SELECTED_CARDS = 'SET_SELECTED_CARDS';
export const setSelectedCards = (cards: Card[], playerIndex: number) => ({
    type: SET_SELECTED_CARDS,
    payload: {cards, playerIndex},
});

export const DRAW_CARDS = 'DRAW_CARDS';
export const drawCards = (numCards: number, playerIndex: number) => ({
    type: DRAW_CARDS,
    payload: {numCards, playerIndex},
});

export const DRAW_POSSIBLE_CARDS = 'DRAW_POSSIBLE_CARDS';
export const drawPossibleCards = (numCards: number, playerIndex: number) => ({
    type: DRAW_POSSIBLE_CARDS,
    payload: {numCards, playerIndex},
});

export const PAY_FOR_CARDS = 'PAY_FOR_CARDS';
export const payForCards = (cards: Card[], playerIndex: number) => ({
    type: PAY_FOR_CARDS,
    payload: {cards, playerIndex},
});

export const DECREASE_PRODUCTION = 'DECREASE_PRODUCTION';
export const decreaseProduction = (resource: Resource, amount: Amount, playerIndex: number) => ({
    type: DECREASE_PRODUCTION,
    payload: {resource, amount, playerIndex},
});

export const INCREASE_PRODUCTION = 'INCREASE_PRODUCTION';
export const increaseProduction = (resource: Resource, amount: Amount, playerIndex: number) => ({
    type: INCREASE_PRODUCTION,
    payload: {resource, amount, playerIndex},
});

export const REMOVE_RESOURCE = 'REMOVE_RESOURCE';
export const removeResource = (resource: Resource, amount: Amount, playerIndex: number) => ({
    type: REMOVE_RESOURCE,
    payload: {resource, amount, playerIndex},
});
export const REMOVE_STORABLE_RESOURCE = 'REMOVE_STORABLE_RESOURCE';
export const removeStorableResource = (
    resource: Resource,
    amount: Amount,
    card: Card,
    playerIndex: number
) => ({
    type: REMOVE_STORABLE_RESOURCE,
    payload: {resource, amount, card, playerIndex},
});

export const GAIN_RESOURCE = 'GAIN_RESOURCE';
export const gainResource = (resource: Resource, amount: Amount, playerIndex: number) => ({
    type: GAIN_RESOURCE,
    payload: {resource, amount, playerIndex},
});
export const GAIN_STORABLE_RESOURCE = 'GAIN_STORABLE_RESOURCE';
export const gainStorableResource = (
    resource: Resource,
    amount: Amount,
    card: Card,
    playerIndex: number
) => ({
    type: GAIN_STORABLE_RESOURCE,
    payload: {resource, amount, card, playerIndex},
});

export const APPLY_DISCOUNTS = 'APPLY_DISCOUNTS';
export const applyDiscounts = (discounts: Discounts, playerIndex: number) => ({
    type: APPLY_DISCOUNTS,
    payload: {discounts, playerIndex},
});

export const PAY_TO_PLAY_CARD = 'PAY_TO_PLAY_CARD';
export const payToPlayCard = (
    card: Card,
    playerIndex: number,
    payment: PropertyCounter<Resource> | undefined
) => ({
    type: PAY_TO_PLAY_CARD,
    payload: {card, playerIndex, payment},
});

export const PAY_TO_PLAY_STANDARD_PROJECT = 'PAY_TO_PLAY_STANDARD_PROJECT';
export const payToPlayStandardProject = (
    standardProjectAction: StandardProjectAction,
    playerIndex: number
) => ({
    type: PAY_TO_PLAY_STANDARD_PROJECT,
    payload: {standardProjectAction, playerIndex},
});

export const CLAIM_MILESTONE = 'CLAIM_MILESTONE';
export const claimMilestone = (milestone: Milestone, playerIndex: number) => ({
    type: CLAIM_MILESTONE,
    payload: {milestone, playerIndex},
});

export const FUND_AWARD = 'FUND_AWARD';
export const fundAward = (award: Award, playerIndex: number) => ({
    type: FUND_AWARD,
    payload: {award, playerIndex},
});

export const MOVE_CARD_FROM_HAND_TO_PLAY_AREA = 'MOVE_CARD_FROM_HAND_TO_PLAY_AREA';
export const moveCardFromHandToPlayArea = (card: Card, playerIndex: number) => ({
    type: MOVE_CARD_FROM_HAND_TO_PLAY_AREA,
    payload: {card, playerIndex},
});

export const ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS = 'ADD_PARAMETER_REQUIREMENT_ADJUSTMENTS';
export const addParameterRequirementAdjustments = (
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
});

export const ASK_USER_TO_PLACE_TILE = 'ASK_USER_TO_PLACE_TILE';
export const askUserToPlaceTile = (tilePlacement: TilePlacement, playerIndex: number) => ({
    type: ASK_USER_TO_PLACE_TILE,
    payload: {playerIndex, tilePlacement},
});

export const ASK_USER_TO_GAIN_RESOURCE = 'ASK_USER_TO_GAIN_RESOURCE';
export const askUserToGainResource = (action: Action, playerIndex: number) => ({
    type: ASK_USER_TO_GAIN_RESOURCE,
    payload: {action, playerIndex},
});

export const ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET = 'ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET';
export const askUserToConfirmResourceTargetLocation = (
    gainResource: PropertyCounter<Resource>,
    gainResourceTargetType: ResourceLocationType,
    card: Card | undefined,
    playerIndex: number
) => {
    return {
        type: ASK_USER_TO_CONFIRM_RESOURCE_GAIN_TARGET,
        payload: {gainResource, gainResourceTargetType, card, playerIndex},
    };
};

export const ASK_USER_TO_REMOVE_RESOURCE = 'ASK_USER_TO_REMOVE_RESOURCE';
export const askUserToRemoveResource = (
    resource: Resource,
    amount: VariableAmount,
    playerIndex: number
) => ({
    type: ASK_USER_TO_REMOVE_RESOURCE,
    payload: {resource, amount, playerIndex},
});

export const ASK_USER_TO_DECREASE_PRODUCTION = 'ASK_USER_TO_DECREASE_PRODUCTION';
export const askUserToDecreaseProduction = (
    resource: Resource,
    amount: VariableAmount,
    playerIndex: number
) => ({
    type: ASK_USER_TO_DECREASE_PRODUCTION,
    payload: {resource, amount, playerIndex},
});

export const ASK_USER_TO_LOOK_AT_CARDS = 'ASK_USER_TO_LOOK_AT_CARDS';
export const askUserToLookAtCards = (
    playerIndex: number,
    amount: number,
    numCardsToTake?: number,
    buyCards?: boolean
) => ({
    type: ASK_USER_TO_LOOK_AT_CARDS,
    payload: {
        playerIndex,
        amount,
        numCardsToTake,
        buyCards,
    },
});

export const BUY_SELECTED_CARDS = 'BUY_SELECTED_CARDS';
export const buySelectedCards = (playerIndex: number) => ({
    type: BUY_SELECTED_CARDS,
    payload: {playerIndex},
});

export const GAIN_SELECTED_CARDS = 'GAIN_SELECTED_CARDS';
export const gainSelectedCards = (playerIndex: number) => ({
    type: GAIN_SELECTED_CARDS,
    payload: {playerIndex},
});

export const PLACE_TILE = 'PLACE_TILE';
export const placeTile = (tile: Tile, cell: Cell, playerIndex: number) => ({
    type: PLACE_TILE,
    payload: {tile, cell, playerIndex},
});

export const INCREASE_PARAMETER = 'INCREASE_PARAMETER';
export const increaseParameter = (parameter: Parameter, amount: number, playerIndex: number) => ({
    type: INCREASE_PARAMETER,
    payload: {parameter, amount, playerIndex},
});

// Player announces she is ready to start round.
export const ANNOUNCE_READY_TO_START_ROUND = 'ANNOUNCE_READY_TO_START_ROUND';
export const announceReadyToStartRound = (playerIndex: number) => ({
    type: ANNOUNCE_READY_TO_START_ROUND,
    payload: {playerIndex},
});

// Increases the action count by 1.
// If the action count is then 3,
// resets actions to 0 and changes the active player.
// If the active player is now the start player,
// increments the turn.
export const COMPLETE_ACTION = 'COMPLETE_ACTION';
export const completeAction = (playerIndex: number) => ({
    type: COMPLETE_ACTION,
    payload: {playerIndex},
});

// If this is the player's first round
export const SKIP_ACTION = 'SKIP_ACTION';
export const skipAction = (playerIndex: number) => ({
    type: SKIP_ACTION,
    payload: {playerIndex},
});

// For debugging
export const START_OVER = 'START_OVER';
export const startOver = () => ({type: START_OVER});

export const MARK_CARD_ACTION_AS_PLAYED = 'MARK_CARD_ACTION_AS_PLAYED';
export const markCardActionAsPlayed = (card: Card, playerIndex: number) => ({
    type: MARK_CARD_ACTION_AS_PLAYED,
    payload: {
        card,
        playerIndex,
    },
});

export const SET_GAME = 'SET_GAME';
export const setGame = (gameState: RootState) => ({type: SET_GAME, payload: {gameState}});
