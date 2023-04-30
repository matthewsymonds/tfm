import type {StorybookConfig} from '@storybook/nextjs';

const config: StorybookConfig = {
    stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        'storybook-addon-next',
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        {
            name: '@storybook/addon-styling',
            options: {
                // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
                // For more details on this addon's options.
                postCss: true,
            },
        },
    ],
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    core: {
        builder: '@storybook/builder-webpack5',
    },
    webpackFinal: async (config, {configType}) => {
        if (!config?.module?.rules) {
            throw new Error('oh no!');
        }
        // Disable the Storybook internal-`.svg`-rule for components loaded from our app.
        config.module.rules
            .filter(rule => {
                if (typeof rule === 'string') {
                    return;
                }
                return rule.test && 'test.svg'.match(rule.test as RegExp);
            })
            // @ts-expect-error
            .forEach(rule => (rule.exclude = /\.svg$/i));

        // add svgr instead
        console.log('config', config.module.rules);
        config.module.rules.unshift({
            test: /\.svg$/i,
            use: ['@svgr/webpack'],
        });
        return config;
    },
};
export default config;
