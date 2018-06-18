import {Configuration} from 'webpack';

const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const config: Configuration = {

    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.js']
    },
    entry: [ './src/index.ts' ], // Needs to be an array for webpack-hot-client
    // Source maps support ('inline-source-map' also works)
    // devtool: 'inline-source-map',
    devtool: 'eval-source-map',
    mode: 'development',
    output: {
        path: __dirname + '/dist',
        filename: 'index_bundle.js'
    },
    // Add the loader for .ts files.
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
        new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),
        new HardSourceWebpackPlugin(),
    ]
};

export default config;