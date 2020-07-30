import {Parameter} from 'constants/board';

export const colors = {
    DARK_1: '#111111', // darkest
    DARK_2: '#2b2f2b',
    DARK_3: '#454545', // lightest

    LIGHT_1: '#fff', // lightest
    LIGHT_2: '#ddd',
    LIGHT_3: '#bbb', // darkest

    // text
    TEXT_DARK_1: '#111111',

    // navbar
    NAV_BG: '#3e3f4c',

    // main content
    MAIN_BG: '#af9688',

    // panels
    PANEL_BG: '#3e3f4c',

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
};