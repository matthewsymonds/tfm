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
    height: calc(100% - 84px);
    top: 84px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: visible;
    transition: all 0.3s;
`;

const ActionOverlayContent = styled.div<{isVisible: boolean}>`
    flex: auto;
    width: 660px;
    max-width: 100%;
    margin: 0px 8px;
    padding: 16px 0px;
    opacity: ${props => (props.isVisible ? 1 : 0)};
    transition: all 0.3s;
    overflow-y: auto;
    @media (max-width: 660px) {
        padding: 8px 0px;
    }
`;

const ActionOverlayToggleButton = styled(BlankButton)`
    font-family: 'Ubuntu Condensed', sans-serif;
`;

type ActionOverlayProps = {
    children: React.ReactNode;
    isVisible: boolean;
};

export const ActionOverlay = (props: ActionOverlayProps) => {
    const {isVisible} = props;
    return (
        <ActionOverlayBase isVisible={isVisible}>
            <ActionOverlayContent isVisible={isVisible}>{props.children}</ActionOverlayContent>
        </ActionOverlayBase>
    );
};

export const ActionOverlayTopBar = ({
    promptText,
    setIsVisible,
    hideOverlay,
}: {
    promptText: string;
    setIsVisible: Function;
    hideOverlay: boolean;
}) => (
    <ActionBar>
        <span className="ellipsis">{promptText}</span>
        {hideOverlay ? null : (
            <ActionOverlayToggleButton
                onClick={() => setIsVisible()}
                textColor={colors.TEXT_LIGHT_1}
            >
                Toggle board
            </ActionOverlayToggleButton>
        )}
    </ActionBar>
);
