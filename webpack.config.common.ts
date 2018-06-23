import {Configuration} from 'webpack';

const config: Configuration = {

    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.js']
    },
    entry: './src/index.ts',
    output: {
        path: __dirname + '/dist',
        filename: 'index.js'
    },
    // Add the loader for .ts files.
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ] 
            }
        ]
    }
};

export default config;