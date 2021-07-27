import {Action} from './action';
import {Parameter, t, TileType} from './board';
import {Resource} from './resource';

export const PARAMETER_BONUSES = {
    [Parameter.OCEAN]: [],
    [Parameter.OXYGEN]: getOxygenBonuses(),
    [Parameter.TEMPERATURE]: getTemperatureBonuses(),
    [Parameter.VENUS]: getVenusBonuses(),
};

type PlayerIndexCallBackBase = Action & {name: string};
type PlayerIndexCallBack = PlayerIndexCallBackBase | undefined;

function getOxygenBonuses() {
    const oxygenBonuses: Array<PlayerIndexCallBack> = [];
    oxygenBonuses[7] = {
        name: 'Increase temperature 1 step',
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
    };
    return oxygenBonuses;
}

function getTemperatureBonuses() {
    const temperatureBonuses: Array<PlayerIndexCallBack> = [];
    const increaseHeatProduction = {
        increaseProduction: {[Resource.HEAT]: 1},
        name: 'Increase your heat production 1 step',
    };
    temperatureBonuses[-24] = increaseHeatProduction;
    temperatureBonuses[-20] = increaseHeatProduction;

    temperatureBonuses[0] = {tilePlacements: [t(TileType.OCEAN)], name: 'Place an ocean tile'};

    return temperatureBonuses;
}

function getVenusBonuses() {
    const venusBonuses: Array<PlayerIndexCallBack> = [];

    venusBonuses[8] = {
        gainResource: {[Resource.CARD]: 1},
        name: 'Draw card',
    };
    venusBonuses[16] = {
        increaseTerraformRating: 1,
        name: 'Increase your terraform rating 1 step',
    };
    return venusBonuses;
}
