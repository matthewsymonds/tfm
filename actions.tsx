import {GameStage} from './constants/game';
import {Tag} from './constants/tag';
import {Card} from './models/card';
import {Resource} from './constants/resource';
import {TilePlacement, Tile, Cell, Parameter} from './constants/board';
import {StandardProjectAction} from './constants/standard-project';
import {Amount, Action, VariableAmount} from './constants/action';
import {PropertyCounter} from './constants/property-counter';

export const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = (corporation: Card, playerIndex: number) => ({
    type: SET_CORPORATION,
    payload: {corporation, playerIndex}
});

export const GO_TO_GAME_STAGE = 'GO_TO_GAME_STAGE';
export const goToGameStage = (stage: GameStage) => ({
    type: GO_TO_GAME_STAGE,
    payload: stage
});

export const REVEAL_AND_DISCARD_TOP_CARD = 'REVEAL_AND_DISCARD_TOP_CARD';
export const revealAndDiscardTopCard = () => ({
    type: REVEAL_AND_DISCARD_TOP_CARD
});

export const DISCARD_CARDS = 'DISCARD_CARDS';
export const discardCards = (cards: Card[], playerIndex: number) => ({
    type: DISCARD_CARDS,
    payload: {cards, playerIndex}
});

export const SET_CARDS = 'SET_CARDS';
export const setCards = (cards: Card[], playerIndex: number) => ({
    type: SET_CARDS,
    payload: {cards, playerIndex}
});

export const DRAW_CARDS = 'DRAW_CARDS';
export const drawCards = (numCards: number, playerIndex: number) => ({
    type: DRAW_CARDS,
    payload: {numCards, playerIndex}
});

export const PAY_FOR_CARDS = 'PAY_FOR_CARDS';
export const payForCards = (cards: Card[], playerIndex: number) => ({
    type: PAY_FOR_CARDS,
    payload: {cards, playerIndex}
});

export const DECREASE_PRODUCTION = 'DECREASE_PRODUCTION';
export const decreaseProduction = (resource: Resource, amount: number, playerIndex: number) => ({
    type: DECREASE_PRODUCTION,
    payload: {resource, amount, playerIndex}
});

export const INCREASE_PRODUCTION = 'INCREASE_PRODUCTION';
export const increaseProduction = (resource: Resource, amount: number, playerIndex: number) => ({
    type: INCREASE_PRODUCTION,
    payload: {resource, amount, playerIndex}
});

export const REMOVE_RESOURCE = 'REMOVE_RESOURCE';
export const removeResource = (resource: Resource, amount: number, playerIndex: number) => ({
    type: REMOVE_RESOURCE,
    payload: {resource, amount, playerIndex}
});

export const GAIN_RESOURCE = 'GAIN_RESOURCE';
export const gainResource = (resource: Resource, amount: Amount, playerIndex: number) => ({
    type: GAIN_RESOURCE,
    payload: {resource, amount, playerIndex}
});

export const PAY_TO_PLAY_CARD = 'PAY_TO_PLAY_CARD';
export const payToPlayCard = (
    card: Card,
    playerIndex: number,
    payment: PropertyCounter<Resource> | undefined
) => ({
    type: PAY_TO_PLAY_CARD,
    payload: {card, playerIndex, payment}
});

export const PAY_TO_PLAY_STANDARD_PROJECT = 'PAY_TO_PLAY_STANDARD_PROJECT';
export const payToPlayStandardProject = (
    standardProjectAction: StandardProjectAction,
    playerIndex: number
) => ({
    type: PAY_TO_PLAY_STANDARD_PROJECT,
    payload: {standardProjectAction, playerIndex}
});

export const MOVE_CARD_FROM_HAND_TO_PLAY_AREA = 'MOVE_CARD_FROM_HAND_TO_PLAY_AREA';
export const moveCardFromHandToPlayArea = (card: Card, playerIndex: number) => ({
    type: MOVE_CARD_FROM_HAND_TO_PLAY_AREA,
    payload: {card, playerIndex}
});

export const ASK_USER_TO_PLACE_TILE = 'ASK_USER_TO_PLACE_TILE';
export const askUserToPlaceTile = (tilePlacement: TilePlacement, playerIndex: number) => ({
    type: ASK_USER_TO_PLACE_TILE,
    payload: {playerIndex, tilePlacement}
});

export const ASK_USER_TO_REMOVE_RESOURCE = 'ASK_USER_TO_REMOVE_RESOURCE';
export const askUserToRemoveResource = (
    resource: Resource,
    amount: VariableAmount,
    playerIndex: number
) => ({
    type: ASK_USER_TO_REMOVE_RESOURCE,
    payload: {resource, amount, playerIndex}
});

export const PLACE_TILE = 'PLACE_TILE';
export const placeTile = (tile: Tile, cell: Cell, playerIndex: number) => ({
    type: PLACE_TILE,
    payload: {tile, cell, playerIndex}
});

export const INCREASE_PARAMETER = 'INCREASE_PARAMETER';
export const increaseParameter = (parameter: Parameter, amount: number, playerIndex: number) => ({
    type: INCREASE_PARAMETER,
    payload: {parameter, amount, playerIndex}
});

// For debugging
export const START_OVER = 'START_OVER';
export const startOver = () => ({type: START_OVER});

export const MARK_CARD_ACTION_AS_PLAYED = 'MARK_CARD_ACTION_AS_PLAYED';
export const markCardActionAsPlayed = (card: Card, playerIndex: number) => ({
    type: MARK_CARD_ACTION_AS_PLAYED,
    payload: {
        card,
        playerIndex
    }
});
