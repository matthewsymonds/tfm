import {Action} from './action';
import {EffectTrigger} from './effect-trigger';

export enum Condition {}

export interface Effect {
    trigger?: EffectTrigger;
    action?: Action;
    text?: string; // this is optional exclusively for tharsis right now
}

export type CompleteEffect = Required<Effect>;
