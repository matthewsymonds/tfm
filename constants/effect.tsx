import {ActionWithSteps} from './action';
import {EffectTrigger} from './effect-trigger';

export enum Condition {}

export interface Effect {
    trigger?: EffectTrigger;
    action?: ActionWithSteps;
    text?: string; // this is optional exclusively for tharsis right now
}
