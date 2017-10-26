const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const host = '127.0.0.1';
const port = 4000;

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
				test: /\.css/,
				loaders: [
					'style-loader',
					'css-loader'
				]
			},{
				test: /\.js/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: [
						["es2015", {"modules": false}]
					],
					"plugins": ["transform-class-properties"]
				}
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin([
			{
				from: 'src/index.html',
				to: __dirname + '/dist/'
			}
		]),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			debug: false
		}),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
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
		})
	]

};