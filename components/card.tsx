import styled from 'styled-components';
import {Card} from '../constants/card-types';

const CardComponentBase = styled.div<CardComponentBaseProps>`
  border-radius: 4px;
  padding: 10px;
  padding-bottom: 16px;
  border: 2px solid gray;
  color: ${props => (props.canToggle ? 'black' : 'gray')};
  width: ${props => (props.orientation === 'horizontal' ? '350px' : '220px')};
  background: ${props => (props.selected ? '#cccccc' : 'rgb(245, 245, 245)')};
  cursor: ${props =>
    props.canToggle || props.selected ? 'pointer' : 'cursor'};
  margin-left: 20px;
  margin-top: 40px;
  flex-shrink: 0;
  &:last-child {
    margin-right: 20px;
  }
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  button {
    visibility: ${props => (props.canToggle ? 'visible' : 'hidden')};
  }
`;

interface CardComponentBaseProps {
  canToggle: boolean;
  selected: boolean;
  orientation: string;
}

interface CardComponentProps extends CardComponentBaseProps {
  content: Card;
  onSelect: (card: Card) => void;
}

const Name = styled.div`
  margin: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Text = styled.div`
  margin: 20px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`;

export const CardComponent: React.FunctionComponent<CardComponentProps> = props => {
  const {content, canToggle, onSelect, selected} = props;
  const {name, oneTimeText, actionOrEffectText, cost} = content;

  const handleSelect = () => {
    if (!canToggle) {
      return;
    }

    onSelect(content);
  };
  return (
    <CardComponentBase
      canToggle={canToggle}
      selected={selected}
      onClick={handleSelect}
      orientation={props.orientation}>
      <Name>{name}</Name>
      {cost !== undefined && <Text>Cost: {cost}€</Text>}
      {oneTimeText && <Text>{oneTimeText}</Text>}
      {actionOrEffectText && <Text>{actionOrEffectText}</Text>}
      <button>{selected ? 'Unselect' : 'Select'}</button>
    </CardComponentBase>
  );
};
