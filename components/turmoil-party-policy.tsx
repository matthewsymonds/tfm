import {Flex} from 'components/box';
import {
    renderArrow,
    renderLeftSideOfArrow,
    renderRightSideOfArrow,
} from 'components/card/CardActions';
import {renderExchangeRates, renderTrigger} from 'components/card/CardEffects';
import {Colon} from 'components/card/CardIconography';
import {getPartyConfig, TurmoilParty} from 'constants/party';

export function TurmoilPartyPolicy({partyName}: {partyName: TurmoilParty}) {
    const rulingPartyPolicy = getPartyConfig(partyName);

    if (rulingPartyPolicy.effect) {
        const {effect} = rulingPartyPolicy;
        const {action} = effect;
        if (!action) return null;
        return (
            <Flex>
                {renderTrigger(effect.trigger)}
                <Colon />
                {renderLeftSideOfArrow(action)}
                {renderRightSideOfArrow(action)}
            </Flex>
        );
    }

    if (rulingPartyPolicy.exchangeRates) {
        return (
            <Flex>{renderExchangeRates(rulingPartyPolicy.exchangeRates)}</Flex>
        );
    }

    if (rulingPartyPolicy.action) {
        const {action} = rulingPartyPolicy;
        return (
            <Flex alignItems="center">
                {renderLeftSideOfArrow(action)}
                {renderArrow()}
                {renderRightSideOfArrow(action, undefined, undefined, true)}
            </Flex>
        );
    }

    return null;
}
