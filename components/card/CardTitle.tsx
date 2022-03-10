import {colors} from 'components/ui';
import {CardType} from 'constants/card-types';
import styled from 'styled-components';
import spawnExhaustiveSwitchError from 'utils';

export function getCardTitleColorForType(type: CardType) {
    switch (type) {
        case CardType.ACTIVE:
            return colors.CARD_ACTIVE;
        case CardType.EVENT:
            return colors.CARD_EVENT;
        case CardType.AUTOMATED:
            return colors.CARD_AUTOMATED;
        case CardType.PRELUDE:
            return colors.CARD_PRELUDE;
        case CardType.CORPORATION:
            return colors.CARD_CORPORATION;
        case CardType.GLOBAL_EVENT:
            return colors.CARD_GLOBAL_EVENT;
        default:
            throw spawnExhaustiveSwitchError(type);
    }
}

export const GenericCardTitleBar = styled.div<{
    bgColor: string;
    justifyContent?: string;
    textAlign?: string;
    padding?: string;
    marginTop?: string;
}>`
    display: flex;
    position: relative;
    align-items: center;
    justify-content: ${props => props.justifyContent ?? 'center'};
    padding: ;
    margin-top: ${props => props.marginTop ?? '26px'};
    border-top: 1px solid ${colors.CARD_BORDER_2};
    border-bottom: 1px solid ${colors.CARD_BORDER_2};
    font-family: 'Ubuntu Condensed', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #f6f1eb;
    padding: ${props => props.padding ?? '8px 0'};
    text-align: ${props => props.textAlign ?? 'center'};
    background-color: ${props => props.bgColor};
`;

export const CardTitleBar = ({
    type,
    children,
}: {
    type: CardType;
    children: React.ReactNode;
}) => {
    return (
        <GenericCardTitleBar bgColor={getCardTitleColorForType(type)}>
            {children}
        </GenericCardTitleBar>
    );
};
