import {Parameter} from './board';

/* Resets the parameter requirement adjustments */
export const zeroParameterRequirementAdjustments = () => ({
    [Parameter.OCEAN]: 0,
    [Parameter.OXYGEN]: 0,
    [Parameter.TEMPERATURE]: 0,
    [Parameter.VENUS]: 0,
});
