import {GameStage} from './constants/game';
import {Tag, Card} from './constants/card-types';
import {Resource} from './constants/resource';

export const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = (corporation, playerId) => ({
    type: SET_CORPORATION,
    payload: {corporation, playerId}
});

export const SET_CARDS = 'SET_CARDS';
export const setCards = (cards, playerId) => ({type: SET_CARDS, payload: {cards, playerId}});

export const GO_TO_GAME_STAGE = 'GO_TO_GAME_STAGE';
export const goToGameStage = (stage: GameStage) => ({
    type: GO_TO_GAME_STAGE,
    payload: stage
});

export const REVEAL_AND_DISCARD_TOP_CARD = 'REVEAL_AND_DISCARD_TOP_CARD';
export const revealAndDiscardTopCard = () => ({
    type: REVEAL_AND_DISCARD_TOP_CARD
});

export const ADD_RESOURCE_IF_REVEALED_CARD_HAS_TAG = 'ADD_RESOURCE_IF_REVEALED_CARD_HAS_TAG';

export const addResourceIfRevealedCardHasTag = (
    cardName: string,
    resource: Resource,
    tag: Tag
) => ({
    type: ADD_RESOURCE_IF_REVEALED_CARD_HAS_TAG,
    payload: {
        cardName,
        resource,
        tag
    }
});

export const CHANGE_RESOURCE = 'CHANGE_RESOURCE';
export const changeResource = (resource: Resource, amount: number) => {
    return {
        type: CHANGE_RESOURCE,
        payload: {
            resource,
            amount
        }
    };
};

export const GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS = 'GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS';
export const gainOneMegacreditPerCityOnMars = () => {
    return {
        type: GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS
    };
};
export const CONFIRM_CORPORATION_AND_CARDS = 'CONFIRM_CORPORATION_AND_CARDS';
export const confirmCorporationAndCards = (playerId: number) => ({
    type: CONFIRM_CORPORATION_AND_CARDS,
    payload: {playerId}
});

export const PAY_FOR_CARD = 'PAY_FOR_CARD';
export const payForCard = (card: Card, playerId: number) => ({
    type: PAY_FOR_CARD,
    payload: {card, playerId}
});
