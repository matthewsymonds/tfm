import {
    askUserToPlaceTile,
    drawCards,
    increaseParameter,
    increaseProduction,
    increaseTerraformRating,
} from 'actions';
import {Parameter, t, TileType} from './board';
import {Resource} from './resource';

export const PARAMETER_BONUSES = {
    [Parameter.OCEAN]: [],
    [Parameter.OXYGEN]: getOxygenBonuses(),
    [Parameter.TEMPERATURE]: getTemperatureBonuses(),
    [Parameter.VENUS]: getVenusBonuses(),
};

type PlayerIndexCallBack = (playerIndex: number) => {type: string; payload};

function getOxygenBonuses() {
    const oxygenBonuses: Array<PlayerIndexCallBack> = [];
    oxygenBonuses[7] = (playerIndex: number) =>
        increaseParameter(Parameter.TEMPERATURE, 1, playerIndex);
    return oxygenBonuses;
}

function getTemperatureBonuses() {
    const temperatureBonuses: Array<PlayerIndexCallBack> = [];
    const increaseHeatProduction = (playerIndex: number) =>
        increaseProduction(Resource.HEAT, 1, playerIndex);
    temperatureBonuses[-24] = increaseHeatProduction;
    temperatureBonuses[-20] = increaseHeatProduction;

    temperatureBonuses[0] = (playerIndex: number) =>
        askUserToPlaceTile(t(TileType.OCEAN), playerIndex);

    return temperatureBonuses;
}

function getVenusBonuses() {
    const venusBonuses: Array<PlayerIndexCallBack> = [];

    venusBonuses[8] = (playerIndex: number) => drawCards(1, playerIndex);
    venusBonuses[16] = (playerIndex: number) => increaseTerraformRating(1, playerIndex);
    return venusBonuses;
}
