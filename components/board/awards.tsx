import {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {Award} from '../../constants/board';
import {AppContext} from '../../context/app-context';
import {GameState, useTypedSelector} from '../../reducer';
import {BoardActionHeader, BoardActionRow, BoardActionsContainer} from './board-actions';

function getTextForAward(award: Award) {
    switch (award) {
        case Award.BANKER:
            return 'Banker';
        case Award.LANDLORD:
            return 'Landlord';
        case Award.MINER:
            return 'Miner';
        case Award.SCIENTIST:
            return 'Scientist';
        case Award.THERMALIST:
            return 'Thermalist';
        default:
            throw new Error('Unrecognized award');
    }
}

function getPriceForAward(award: Award, state: GameState) {
    const fundedIndex = state.common.fundedAwards.findIndex(claim => claim.award === award);
    if (fundedIndex !== -1) {
        return [8, 14, 20][fundedIndex];
    } else {
        return [8, 14, 20][state.common.fundedAwards.length];
    }
}

function Awards() {
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();

    return (
        <BoardActionsContainer>
            <BoardActionHeader>Awards</BoardActionHeader>
            {Object.values(Award).map(award => {
                const hasBeenFunded = !!state.common.fundedAwards.find(a => a.award === award);
                const text = getTextForAward(award);
                const price = getPriceForAward(award, state);
                return (
                    <BoardActionRow
                        key={award}
                        selectable={context.canFundAward(award, state)}
                        onClick={() => {
                            if (context.canFundAward(award, state)) {
                                context.fundAward(award, state);
                                context.processQueue(dispatch);
                            }
                        }}
                    >
                        <span>{hasBeenFunded ? <s>{text}</s> : text}</span>
                        <span>{price}</span>
                    </BoardActionRow>
                );
            })}
        </BoardActionsContainer>
    );
}

export default Awards;
