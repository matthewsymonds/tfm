const path = require('path');

module.exports = {
    stories: [
        '../stories/**/*.stories.mdx',
        '../stories/**/*.stories.@(js|jsx|ts|tsx)',
    ],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-postcss',
    ],
    webpackFinal: async (config, {configType}) => {
        config.resolve.modules = [
            path.resolve(__dirname, '..'),
            'node_modules',
        ];

        return config;
    },
    babel: async options => {
        return {
            ...options,
            plugins: options.plugins.filter(
                x =>
                    !(
                        typeof x === 'string' &&
                        x.includes('plugin-transform-classes')
                    )
            ),
        };
    },
};
