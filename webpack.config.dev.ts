import {Configuration} from 'webpack';
const merge = require('webpack-merge');

import common from './webpack.config.common';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

const config: Configuration = merge.smart(common as any, {
    devtool: 'eval-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'thread-loader',
                        options: {
                            workers: 4,
                            poolTimeout: Number.POSITIVE_INFINITY
                        }
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            happyPackMode: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HardSourceWebpackPlugin(),
        new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
    ]
}) as any;

export default config;