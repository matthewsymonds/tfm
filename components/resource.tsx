import styled from 'styled-components';
import {
    getResourceBackgroundColor,
    getResourceColor,
    getResourceSymbol,
    Resource
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

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({name, className}) => (
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
    amount: number;
    production: number;
    resource: Resource;
}

const InlineResourceIcon = styled(ResourceIcon)`
    display: inline-flex;
    margin: 0;
    border: 1px solid gray;
`;

function name(resource: Resource): string {
    return resource.slice('resource'.length);
}

export const ResourceBoardCell: React.FunctionComponent<ResourceBoardCellProps> = ({
    amount,
    production,
    resource
}) => {
    return (
        <ResourceBoardCellBase>
            <table>
                <tbody>
                    <tr>
                        <td>{name(resource)}</td>
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
