import {useState} from 'react';
import {PlayerState} from 'reducer';

export function PreludeSelection({player}: {player: PlayerState}) {
    const {possiblePreludes} = player;
    if (possiblePreludes.length === 0) {
        return null;
    }

    const [selectedCards, setSelectedCards] = useState(possiblePreludes.slice(0, 2));
}
