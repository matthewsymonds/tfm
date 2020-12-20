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

type PlayerIndexCallBackBase = (playerIndex: number) => {type: string; payload; name: string};
type PlayerIndexCallBack = PlayerIndexCallBackBase | undefined;

function getOxygenBonuses() {
    const oxygenBonuses: Array<PlayerIndexCallBack> = [];
    oxygenBonuses[7] = (playerIndex: number) => ({
        ...increaseParameter(Parameter.TEMPERATURE, 1, playerIndex),
        name: 'Increase temperature 1 step',
    });
    return oxygenBonuses;
}

function getTemperatureBonuses() {
    const temperatureBonuses: Array<PlayerIndexCallBack> = [];
    const increaseHeatProduction = (playerIndex: number) => ({
        ...increaseProduction(Resource.HEAT, 1, playerIndex),
        name: 'Increase your heat production 1 step',
    });
    temperatureBonuses[-24] = increaseHeatProduction;
    temperatureBonuses[-20] = increaseHeatProduction;

    temperatureBonuses[0] = (playerIndex: number) => ({
        ...askUserToPlaceTile(t(TileType.OCEAN), playerIndex),
        name: 'Place an ocean tile',
    });

    return temperatureBonuses;
}

function getVenusBonuses() {
    const venusBonuses: Array<PlayerIndexCallBack> = [];

    venusBonuses[8] = (playerIndex: number) => ({...drawCards(1, playerIndex), name: 'Draw card'});
    venusBonuses[16] = (playerIndex: number) => ({
        ...increaseTerraformRating(1, playerIndex),
        name: 'Increase your terraform rating 1 step',
    });
    return venusBonuses;
}
