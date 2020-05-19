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
    font-family: serif;
    margin: 2px;
    width: 120px;
    align-items: center;
    padding: 2px;
    border: 2px solid gray;
    border-radius: 4px;
    .row {
        display: flex;
    }
    .amounts {
        margin-left: auto;
        display: inline-flex;
        div {
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
            min-width: 18px;
            padding: 2px;
            height: 21px;
            border: 1px solid lightgray;
            border-radius: 2px;
        }
        .production {
            background: #e3975b;
        }
    }
    div {
        margin-left: 4px;
    }
`;

export interface ResourceBoardCellProps {
    amount: number;
    production: number;
    resource: Resource;
}

export const InlineResourceIcon = styled(ResourceIcon)`
    display: inline-flex;
    flex-shrink: 0;
    margin: 0;
    border: 1px solid gray;
`;

function name(resource: Resource): string {
    return resource.slice('resource'.length);
}

function getCost(conversion: Conversion) {
    for (const resource in conversion.removeResource) {
        return conversion.removeResource[resource];
    }
}

export const ResourceBoardCell: React.FunctionComponent<ResourceBoardCellProps> = ({
    amount,
    production,
    resource,
}) => {
    const resourceName = name(resource);
    return (
        <>
            <ResourceBoardCellBase>
                <InlineResourceIcon name={resource} />
                <div className="amounts">
                    <div className="production">{production}</div>
                    <div>{amount}</div>
                </div>
            </ResourceBoardCellBase>
        </>
    );
};

export const ResourceBoardRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

export const ResourceBoard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: auto;
`;
