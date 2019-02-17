const path = require("path");
const process = require("process");
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const host = '127.0.0.1';
const port = 4000;

let production = process.env.NODE_ENV === 'production';

let plugins = [
    new CopyWebpackPlugin([
        {
            from: 'src/index.html',
            to: __dirname + '/dist/'
        }
    ]),
];

if (production) {
    plugins.push(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }));

    plugins.push(new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }));

    plugins.push(new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
            screw_ie8: true,
            keep_fnames: true
        },
        compress: {
            screw_ie8: true,
            warnings: false
        },
        comments: false
    }));
}

module.exports = {
    entry: {
        app: './src/app.js',
        shadower: [
            './src/shadower.js',
        ]
    },
    output: {
        path: path.resolve(__dirname, './dist/'),
        filename: '[name].js',
        library: "Shadower"
        // library: "[name]",
    },
    devtool: false,
    devServer: {
        contentBase: [
            path.join(__dirname, "dist")
        ],
        overlay: {
            warnings: true,
            errors: true
        },
        historyApiFallback: true,
        host: host,
        port: port
    },
    module: {
        rules: [
            {
                test: /\.(css|styl)/,
                loaders: [
                    'style-loader',
                    'css-loader',
                    'stylus-loader',
                ]
            }, {
                test: /\.js/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        ["es2015", { "modules": false }]
                    ],
                    "plugins": ["transform-class-properties"]
                }
            }, {
                test: /\.(jpe?g|png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                use: 'base64-inline-loader?limit=150000&name=[name].[ext]'
            }
        ]
    },
    plugins: plugins

};
