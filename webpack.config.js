const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
    {
        context: path.join(__dirname, ""),
        entry: ["@babel/polyfill", "./src/js/index.js"],
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules|bower_components)/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            plugins: ['react-html-attrs'],
                            presets: ['@babel/preset-react', '@babel/preset-env']
                        }
                    }]
                },
                {
                    test: /\.scss$/, 
                    use: [
                        'style-loader',
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        'css-loader',
                        'sass-loader'
                    ],
                },
                {
                    test: /\.(jpg|png|ico)$/,
                    use: 'url-loader'
                },
            ]
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: "index.min.js"
        },
        plugins: [
            new MiniCssExtractPlugin({
              filename: 'style.css',
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'src/img/', to: './img' },
                    { from: 'manifest.json', to: './' },
                ]
            }),
        ],
        optimization: {
            minimizer: [new TerserJSPlugin({}),new OptimizeCSSAssetsPlugin({})],
        },
    }
];