import styled from 'styled-components';
import {
    getResourceBackgroundColor,
    getResourceColor,
    getClassName,
    getResourceSymbol,
    Resource,
} from '../constants/resource';

import {Conversion} from '../constants/conversion';

interface ResourceIconBaseProps {
    readonly color: string;
    readonly background: string;
    readonly tall?: boolean;
}

const ResourceIconBase = styled.div<ResourceIconBaseProps>`
  display: inline-block;
  height: ${props => (props.tall ? '38px' : '25px')};
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
        tall={name === Resource.CARD}
        background={getResourceBackgroundColor(name)}
    >
        <span className={getClassName(name)}>{getResourceSymbol(name)}</span>
    </ResourceIconBase>
);

const ResourceBoardCellBase = styled.div`
    display: flex;
    margin: 16px;
    width: 140px;
    align-items: center;
    flex-direction: column;
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

const WideButton = styled.button`
    width: 100%;
`;

export interface ResourceBoardCellProps {
    amount: number;
    production: number;
    resource: Resource;
    conversion: Conversion;
    canDoConversion: boolean;
    doConversion: Function;
}

const InlineResourceIcon = styled(ResourceIcon)`
    display: inline-flex;
    margin: 0;
    border: 1px solid gray;
`;

function name(resource: Resource): string {
    return resource.slice('resource'.length);
}

function getCost(conversion: Conversion) {
    for (const resource in conversion.removeResources) {
        return conversion.removeResources[resource];
    }
}

export const ResourceBoardCell: React.FunctionComponent<ResourceBoardCellProps> = ({
    amount,
    production,
    resource,
    conversion,
    canDoConversion,
    doConversion,
}) => {
    const resourceName = name(resource);
    return (
        <ResourceBoardCellBase>
            <table>
                <tbody>
                    <tr>
                        <td>{resourceName}</td>
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
            {conversion && canDoConversion && (
                <WideButton onClick={() => doConversion(conversion)}>
                    Convert {getCost(conversion)} <InlineResourceIcon name={resource} />
                </WideButton>
            )}
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
