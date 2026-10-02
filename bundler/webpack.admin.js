const path = require('path');

module.exports = {
    mode: 'production',
    entry: path.resolve(__dirname, '../admin/index.tsx'),
    output: {
        path: path.resolve(__dirname, '../static/admin'),
        filename: 'admin.bundle.js',
        clean: false,
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                    },
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                type: 'asset/inline',
            },
        ],
    },
};
