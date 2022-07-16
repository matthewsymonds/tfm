import {Box} from 'components/box';
import {getPartyConfig, TurmoilParty, UNITY} from 'constants/party';
import styled from 'styled-components';
import Twemoji from 'react-twemoji';
import {colors} from 'components/ui';

export function PartySymbol({
    party,
    margin = '0',
    size = 50,
}: {
    party: TurmoilParty;
    margin?: string;
    size?: number;
}) {
    const {color, symbol} = getPartyConfig(party);
    const baseSymbol = <span>{symbol}</span>;

    return (
        <PartyBase
            background={color}
            margin={margin}
            size={size}
            className={party === UNITY ? 'unity' : ''}
        >
            {symbol === '♂' ? (
                <Box
                    fontFamily='"Source Sans Pro", Segoe UI Symbol'
                    fontSize="1.4em"
                >
                    {baseSymbol}
                </Box>
            ) : (
                <Twemoji>{baseSymbol}</Twemoji>
            )}
        </PartyBase>
    );
}

const PartyBase = styled.div<{
    background: string;
    margin: string;
    size: number;
}>`
    color: #eee;
    border-radius: ${props => props.size * 0.5}px;
    line-height: ${props => props.size * 0.7}px;
    height: ${props => props.size * 0.7}px;
    width: ${props => props.size}px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.size * 0.4}px;
    background: ${props => props.background};
    margin: ${props => props.margin};
    border: 1px solid ${colors.DARK_4};

    &.unity > * {
        position: relative;
        left: -${props => props.size * 0.1}px;
        letter-spacing: -${props => props.size * 0.2}px;
    }
`;
