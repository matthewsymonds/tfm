import {Action} from './action';

// export interface Effect {
//     addOrRemoveOneResource(resource: Resource, removeResourcesCallback: Function): void;
//     discardThenDraw(): void;
//     drawCard(): void;
//     gainResourceOption(options: Resource[][]): void;
//     // A reference to the condition that triggered the effect.
//     condition: Condition;
//     gainResource(name: Resource, amount: number, target?: CardConfig): void;
//     increaseProduction(name: Resource, amount: number): void;
// }

// export type Condition = {
//     moveType?: MoveType;
//     card?: CardConfig;
//     cost?: number;
//     newTag?: boolean;
//     onMars?: boolean;
//     samePlayer?: boolean;
//     tag?: Tag;
//     tileType?: TileType;
// };

export enum Condition {}

export interface Effect {
    text: string;
    // TODO(matthewwsymonds) mark as non-optional
    condition?: Condition;
    result?: Action;
}
