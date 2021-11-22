import {Parameter} from 'constants/board';

export const colors = {
    DARK_1: 'hsl(0, 0%, 10%)', // darkest
    DARK_2: 'hsl(0, 0%, 20%)',
    DARK_3: '#353535',
    DARK_4: 'hsl(0, 0%, 33%)', // lightest

    LIGHT_1: 'hsl(0, 0%, 100%)', // lightest
    LIGHT_2: 'hsl(0, 0%, 90%)',
    LIGHT_3: 'hsl(0, 0%, 80%)',
    LIGHT_4: 'hsl(0, 0%, 70%)', // darkest

    // text
    TEXT_LIGHT_1: '#ccc',
    TEXT_DARK_1: '#111111',
    TEXT_ERROR: 'maroon',

    // navbar
    NAV_BG_YOUR_TURN: '#48874d',
    NAV_BG_WAITING: '#8e3f3f',
    NAV_BG_PASSED: '#63667d',

    // main content
    MAIN_BG: 'hsl(0, 0%, 16%)',
    LIGHT_BG: 'hsl(15, 5%, 40%)',
    LIGHTEST_BG: 'hsl(15, 5%, 70%)',

    // panels
    PANEL_BORDER: '#505050',

    // board color
    DARK_ORANGE: '#bf5f3f',
    LIGHT_ORANGE: '#cc7f65',

    // resource board
    RESOURCE_COUNTER_BG: '#f7f7f7',

    // logs
    LOG_BG: '#fff',
    LOG_BG_ALT: '#ddd',

    // mars board
    PARAMETERS: {
        [Parameter.TEMPERATURE]: 'hsl(11, 72%, 33%)',
        [Parameter.OXYGEN]: 'hsl(131,43%,32%)',
        [Parameter.OCEAN]: 'hsl(243, 59%, 44%)',
        [Parameter.VENUS]: 'orange',
    },

    // player colors
    PLAYER_COLORS: {
        PLAYER_COLOR_RED: 'hsl(345, 40%, 40%)',
        PLAYER_COLOR_GREEN: 'hsl(125, 30%, 41%)',
        PLAYER_COLOR_BLUE: 'hsl(220, 40%, 50%)',
        PLAYER_COLOR_YELLOW: 'hsl(39,76%,50%)',
        PLAYER_COLOR_GRAY: 'hsl(230, 12%, 45%)',
    },
    PLAYER_BG_COLORS: {
        PLAYER_BG_COLOR_RED: 'hsl(345, 10%, 40%)',
        PLAYER_BG_COLOR_GREEN: 'hsl(125, 10%, 41%)',
        PLAYER_BG_COLOR_BLUE: 'hsl(220, 10%, 50%)',
        PLAYER_BG_COLOR_YELLOW: 'hsl(39,26%,60%)',
        PLAYER_BG_COLOR_GRAY: 'hsl(230, 5%, 50%)',
    },

    // resource colors
    MEGACREDIT: 'gold',
    PRODUCTION_BG: 'hsl(25, 40%, 39%)',

    // cards
    CARD_TEXT: '#f6f1eb',
    CARD_EVENT: 'hsl(0, 60%, 50%)',
    CARD_ACTIVE: 'hsl(230, 70%, 50%)',
    CARD_AUTOMATED: 'hsl(126, 50%, 30%)',
    CARD_CORPORATION: 'hsl(0, 0%, 30%)',
    CARD_PRELUDE: 'hsl(30, 45%, 35%)',
    CARD_BG: 'hsl(30, 80%, 80%)',
    CARD_BORDER_1: 'hsl(0, 0%, 41%)',
    CARD_BORDER_2: 'hsl(260, 4%, 17%)',
    CARD_MAX_REQUIREMENT_BG: '#ff8383',
    CARD_MIN_REQUIREMENT_BG: '#ffca83',
    CARD_VP_BG: 'hsl(15, 60%, 50%)',
    CARD_STORED_RESOURCES_BG: 'hsl(230, 60%, 75%)',
    CARD_GLOBAL_EVENT: '#489cdb',
    GOLD: '#f5923b',
};

export const zIndices = {
    CARD: 20,
};
