import {Configuration} from 'webpack';
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');

import common from './webpack.config.common';

const config: Configuration = merge.smart(common as any, {
    output: {
        library: 'decimaker',
        libraryTarget: 'commonjs2' as any
    },
    devtool: 'source-map',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.prod.json'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            'dist'
        ])
    ]
}) as any;

export default config;