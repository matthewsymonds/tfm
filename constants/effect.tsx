import {Action} from './action';
import {EffectTrigger} from './effect-trigger';

export enum Condition {}

export interface Effect {
    trigger?: EffectTrigger;
    action?: Action;
    text?: string;
}
