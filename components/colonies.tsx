import {COLONIES, getColony} from 'constants/colonies';
import {useTypedSelector} from 'reducer';
import {Flex} from 'components/box';
import {ColonyComponent} from 'components/colony';

export function Colonies() {
    const colonies = useTypedSelector(state => state.common.colonies?.map(getColony));

    if (!colonies) {
        return null;
    }

    return (
        <Flex flexWrap="wrap" overflow="auto">
            {colonies.map(colony => (
                <ColonyComponent colony={colony} key={colony.name} />
            ))}
        </Flex>
    );
}
