import styled from 'styled-components';
import {
  Resource,
  getResourceSymbol,
  getResourceColor,
  getResourceBackgroundColor
} from '../constants/resource';

interface ResourceIconBaseProps {
  readonly color: string;
  readonly background: string;
}

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
  display: inline-block;
  height: 25px;
  width 25px;
  text-align: center;
  margin: 4px;
  font-size: 17px;
  font-weight: bold;
  color: ${props => props.color};
  background: ${props => props.background};
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface ResourceIconProps {
  name: Resource;
  className?: string;
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({
  name,
  className
}) => (
  <ResourceIconBase
    color={getResourceColor(name)}
    className={className}
    background={getResourceBackgroundColor(name)}>
    <span>{getResourceSymbol(name)}</span>
  </ResourceIconBase>
);

const ResourceBoardCellBase = styled.div`
  display: flex;
  margin: 16px;
  width: 140px;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid gray;
  border-radius: 4px;
  table {
    padding: 8px;
    width: 100%;
  }
  td:last-child {
    text-align: right;
  }
`;

export interface ResourceBoardCellProps {
  name: string;
  amount: number;
  production: number;
  resource: Resource;
  setProduction: (n: number) => void;
  setAmount: (n: number) => void;
}

const InlineResourceIcon = styled(ResourceIcon)`
  display: inline-flex;
  margin: 0;
  border: 1px solid gray;
`;

export const ResourceBoardCell: React.FunctionComponent<ResourceBoardCellProps> = ({
  name,
  amount,
  production,
  resource
}) => {
  return (
    <ResourceBoardCellBase>
      <table>
        <tbody>
          <tr>
            <td>{name}</td>
            <td>
              <InlineResourceIcon name={resource} />
            </td>
          </tr>
          <tr>
            <td>Production</td>
            <td>{production}</td>
          </tr>
          <tr>
            <td>Amount</td>
            <td>{amount}</td>
          </tr>
        </tbody>
      </table>
    </ResourceBoardCellBase>
  );
};

export const ResourceBoardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ResourceBoard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
