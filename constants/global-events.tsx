import {Action} from './action';
import {Party} from './party';
import {Resource} from './resource-enum';

export interface GlobalEvent {
    delegateOnReveal: Party;
    portentName: string;
    globalEventName: string;
    action: Action;
}

export const GLOBAL_EVENTS: GlobalEvent[] = [
    {
        portentName: 'AI Research',
        delegateOnReveal: Party.SCIENTISTS,
        globalEventName: 'Solarnet Shutdown',
        action: {
            removeResource: {
                [Resource.MEGACREDIT]: 5,
            },
        },
    },
];
