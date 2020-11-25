import React from 'react';
import {GlobalStyles} from 'pages/_app';

export const parameters = {
    actions: {argTypesRegex: '^on[A-Z].*'},
};

const withGlobalStyles = (Story, context) => {
    return (
        <React.Fragment>
            <GlobalStyles />
            <Story {...context} />
        </React.Fragment>
    );
};

export const decorators = [withGlobalStyles];
