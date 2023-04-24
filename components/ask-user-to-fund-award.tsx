import {PlayerState} from 'reducer';

export function AskUserToFundAward({player}: {player: PlayerState}) {
    return <h2 className="text-2xl">Please fund an award.</h2>;
}
