import Color from 'color';
import {GameStage} from 'constants/game';
import {usePrevious} from 'hooks/use-previous';
import React, {useEffect, useState} from 'react';
import {useTypedSelector} from 'reducer';
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
    position: absolute;
    margin-top: ${props => (props.isVisible ? '0' : `${document.body.scrollHeight}px`)};
    top: 72px;
    height: calc(100% - 72px);
    width: 100%;
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
    showBoardFirst: boolean;
    actionBarPromptText?: string | null;
    children: React.ReactNode;
};

export const ActionOverlay = (props: ActionOverlayProps) => {
    const [isVisible, setIsVisible] = useState(!props.showBoardFirst);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const prevShowBoardFirst = usePrevious(props.showBoardFirst);

    useEffect(() => {
        // If the overlay is already showing, and it leads to another pending action
        // (e.g. placing a city tile from a prelude), we want to hide the overlay
        // to let the user see the map. This does that.
        if (
            typeof prevShowBoardFirst === 'boolean' &&
            !prevShowBoardFirst &&
            props.showBoardFirst === true
        ) {
            setIsVisible(false);
        }
    }, [prevShowBoardFirst, props.showBoardFirst]);

    let promptText: string | null;
    if (gameStage === GameStage.CORPORATION_SELECTION) {
        promptText = 'Choose your corporation and starting cards';
    } else if (gameStage === GameStage.END_OF_GAME) {
        promptText = null;
    } else if (props.actionBarPromptText) {
        promptText = props.actionBarPromptText;
    } else {
        promptText = 'Complete your action';
    }

    return (
        <React.Fragment>
            <ActionBar>
                <span className="ellipsis">{promptText}</span>
                <ActionOverlayToggleButton
                    onClick={() => setIsVisible(!isVisible)}
                    textColor={colors.TEXT_LIGHT_1}
                >
                    Toggle board
                </ActionOverlayToggleButton>
            </ActionBar>
            <ActionOverlayBase isVisible={isVisible}>
                <ActionOverlayContent isVisible={isVisible}>{props.children}</ActionOverlayContent>
            </ActionOverlayBase>
        </React.Fragment>
    );
};
