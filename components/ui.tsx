import {Parameter} from 'constants/board';

export const colors = {
    DARK_1: '#111111', // darkest
    DARK_2: '#2b2f2b',
    DARK_3: '#454545', // lightest

    LIGHT_1: '#fff', // lightest
    LIGHT_2: '#ddd',
    LIGHT_3: '#bbb', // darkest

    // text
    TEXT_LIGHT_1: '#ccc',
    TEXT_DARK_1: '#111111',

    // navbar
    NAV_BG_YOUR_TURN: '#48874d',
    NAV_BG_WAITING: '#8e3f3f',
    NAV_BG_PASSED: '#63667d',

    // main content
    MAIN_BG: '#393939',

    // panels
    PANEL_BORDER: '#999',

    // accordions inside of panel
    ACCORDION_HEADER: '#bf5f3f',
    ACCORDION_BG: '#FAE2CF',

    // resource board
    RESOURCE_COUNTER_BG: '#f7f7f7',

    // cards
    CARD_BG: '#f7f7f7',
    CORPORATION_BG: '#f7f7f7',

    // logs
    LOG_BG: '#fff',
    LOG_BG_ALT: '#ddd',

    // mars board
    PARAMETERS: {
        [Parameter.TEMPERATURE]: 'red',
        [Parameter.OXYGEN]: 'green',
        [Parameter.OCEAN]: 'blue',
        [Parameter.VENUS]: 'orange',
    },

    PLAYER_COLOR_RED: 'hsl(345, 40%, 40%)',
    PLAYER_COLOR_GREEN: 'hsl(124.8, 30.4%, 40.6%)',
    PLAYER_COLOR_BLUE: 'hsl(220, 40%, 50%)',
    PLAYER_COLOR_YELLOW: 'hsl(50, 60%, 60%)',
    PLAYER_COLOR_GRAY: 'hsl(233.1, 11.6%, 43.9%)',
};
