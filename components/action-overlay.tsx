import Color from 'color';
import React from 'react';
import styled from 'styled-components';
import {BlankButton} from './blank-button';
import {colors} from './ui';

const ActionBar = styled.div`
    height: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    background-color: hsla(0, 0%, 100%, 0.2);
    color: ${colors.TEXT_LIGHT_1};
`;

const ActionOverlayBase = styled.div<{isVisible: boolean}>`
    background-color: ${props =>
        new Color(colors.MAIN_BG).alpha(props.isVisible ? 0.98 : 0).toString()};
    position: ${props => (props.isVisible ? 'absolute' : 'fixed')};
    margin-top: ${props => (props.isVisible ? '0' : `${document.body.scrollHeight}px`)};
    width: 100%;
    height: calc(100% - 72px);
    top: 72px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    transition: all 0.3s;
`;

const ActionOverlayContent = styled.div<{isVisible: boolean}>`
    flex: auto;
    max-width: 600px;
    margin: 16px 8px;
    opacity: ${props => (props.isVisible ? 1 : 0)};
    transition: all 0.3s;
`;

const ActionOverlayToggleButton = styled(BlankButton)`
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 700;
`;

type ActionOverlayProps = {
    children: React.ReactNode;
    promptText: string;
    isVisible: boolean;
    setIsVisible: Function;
};

export const ActionOverlay = (props: ActionOverlayProps) => {
    const {isVisible, setIsVisible, promptText} = props;
    return (
        <ActionOverlayBase isVisible={isVisible}>
            <ActionOverlayContent isVisible={isVisible}>{props.children}</ActionOverlayContent>
        </ActionOverlayBase>
    );
};

export const ActionOverlayTopBar = ({
    promptText,
    setIsVisible,
}: {
    promptText: string;
    setIsVisible: Function;
}) => (
    <ActionBar>
        <span className="ellipsis">{promptText}</span>
        <ActionOverlayToggleButton onClick={() => setIsVisible()} textColor={colors.TEXT_LIGHT_1}>
            Toggle board
        </ActionOverlayToggleButton>
    </ActionBar>
);
