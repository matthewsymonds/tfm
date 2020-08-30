import styled from 'styled-components';
import {colors} from 'components/ui';

interface BoxProps {
    margin: string;
    marginTop: string;
    marginBottom: string;
    marginLeft: string;
    marginRight: string;
    display: string;
    position: string;
    width: string;
    height: string;
    maxWidth: string;
    maxHeight: string;
    minHeight: string;
    minWidth: string;
    padding: string;
    paddingLeft: string;
    paddingTop: string;
    paddingBottom: string;
    paddingRight: string;
    whiteSpace: string;
    textAlign: string;
    overflowY: string;
    overflowX: string;
    overflow: string;
}

interface FlexProps extends BoxProps {
    display: 'flex';
    flexDirection: string;
    justifyContent: string;
    flex: string;
    alignItems: string;
    flexBasis: string;
}

/* A flexible component to define styles inline */
export const Box = styled.div<BoxProps>`
    // Add more properties here as needed.
    margin: ${props => props.margin};
    margin-top: ${props => props.marginTop};
    margin-bottom: ${props => props.marginBottom};
    margin-left: ${props => props.marginLeft};
    margin-right: ${props => props.marginRight};
    display: ${props => props.display};
    position: ${props => props.position};
    width: ${props => props.width};
    height: ${props => props.height};
    max-width: ${props => props.maxWidth};
    max-height: ${props => props.maxHeight};
    min-height: ${props => props.minHeight};
    min-width: ${props => props.minWidth};
    padding: ${props => props.padding};
    padding-left: ${props => props.paddingLeft};
    padding-top: ${props => props.paddingTop};
    padding-bottom: ${props => props.paddingBottom};
    padding-right: ${props => props.paddingRight};
    white-space: ${props => props.whiteSpace};
    text-align: ${props => props.textAlign};
    overflow-y: ${props => props.overflowY};
    overflow-x: ${props => props.overflowX};
    overflow: ${props => props.overflow};
`;

export const Flex = styled(Box)<FlexProps>`
    display: flex;
    flex-direction: ${props => props.flexDirection};
    justify-content: ${props => props.justifyContent};
    flex: ${props => props.flex};
    align-items: ${props => props.alignItems};
    flex-basis: ${props => props.flexBasis};
`;

export const Panel = styled.div`
    margin-bottom: 16px;
    padding: 8px;
    margin-bottom: 16px;
    padding: 8px;
    border-color: ${colors.PANEL_BORDER};
    border-radius: 9px;
    border-width: 2px;
    border-style: solid;
`;
