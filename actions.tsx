import {GameStage} from './constants/game';
import {Tag} from './constants/card-types';
import {Resource} from './constants/resource';

export const SET_CORPORATION = 'SET_CORPORATION';
export const setCorporation = corporation => ({
    type: SET_CORPORATION,
    payload: corporation
});

export const SET_CARDS = 'SET_CARDS';
export const setCards = cards => ({type: SET_CARDS, payload: cards});

export const GO_TO_GAME_STAGE = 'GO_TO_GAME_STAGE';
export const goToGameStage = (stage: GameStage) => ({
    type: GO_TO_GAME_STAGE,
    payload: stage
});

export const REVEAL_AND_DISCARD_TOP_CARD = 'REVEAL_AND_DISCARD_TOP_CARD';
export const revealAndDiscardTopCard = () => ({
    type: REVEAL_AND_DISCARD_TOP_CARD
});

export const ADD_RESOURCE_IF_REVEALED_CARD_HAS_TAG =
    'ADD_RESOURCE_IF_REVEALED_CARD_HAS_TAG';

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

export const GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS =
    'GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS';
export const gainOneMegacreditPerCityOnMars = () => {
    return {
        type: GAIN_ONE_MEGACREDIT_PER_CITY_ON_MARS
    };
};
export const CONFIRM_CORPORATION_AND_CARDS = 'CONFIRM_CORPORATION_AND_CARDS';
export const confirmCorporationAndCards = () => ({
    type: CONFIRM_CORPORATION_AND_CARDS
});
export const CONFIRM_CORPORATION_AND_CARDS = 'CONFIRM_CORPORATION_AND_CARDS';
export const confirmCorporationAndCards = () => ({
    type: CONFIRM_CORPORATION_AND_CARDS
});
