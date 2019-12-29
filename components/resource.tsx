import styled from 'styled-components';
import {
  Resource,
  getResourceColor,
  getResourceSymbol,
  getResourceBackgroundColor
} from '../constants/resource';

interface ResourceBaseProps {
  readonly color: string;
  readonly background: string;
}

const ResourceBase = styled.div<ResourceBaseProps>`
  display: inline-block;
  height: 20px;
  width: 20px;
  margin: 4px;
  font-size: 17px;
  font-weight: bold;
  color: ${props => props.color};
  background: ${props => props.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
`;

interface ResourceIconProps {
  name: Resource;
}

export const ResourceIcon: React.FunctionComponent<ResourceIconProps> = ({
  name
}) => (
  <ResourceBase
    color={getResourceColor(name)}
    background={getResourceBackgroundColor(name)}>
    <span>{getResourceSymbol(name)}</span>
  </ResourceBase>
);
