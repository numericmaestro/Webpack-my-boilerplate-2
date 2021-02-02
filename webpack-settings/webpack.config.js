'use strict';

const path = require('path');
const copyWepbackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


//PATHS
//__dirname = ..../rootPath/webpack-settings
const PATHS = (function () {
    //general
    const root = { path: path.resolve(__dirname, '../'), alias: "@root" };
    const src = { path: path.resolve(root.path, './src'), alias: "@src" };
    const dist = { path: path.resolve(root.path, './dist'), alias: "@dist" };
    //assets
    const assets = { path: path.resolve(src.path, './assets'), alias: "@assets" };
    const styles = { path: path.resolve(assets.path, './styles'), alias: "@styles" };
    const fonts = { path: path.resolve(assets.path, './fonts'), alias: "@fonts" };
    const images = { path: path.resolve(assets.path, './images'), alias: "@images" };
    //html
    const html = { path: path.resolve(src.path, './html'), alias: "@html" };
    const includes = { path: path.resolve(html.path, './includes'), alias: "@includes" };
    const pages = { path: path.resolve(html.path, './pages'), alias: "@pages" };
    const templates = { path: path.resolve(html.path, './templates'), alias: "@templates" };
    const mixins = { path: path.resolve(html.path, './mixins'), alias: "@mixins" };
    //static
    const staticPath = { path: path.resolve(src.path, './static'), alias: "@static" };
    return {
        root,
        src,
        dist,
        assets,
        styles,
        fonts,
        images,
        html,
        includes,
        pages,
        templates,
        staticPath,
    }

})();
const ALIAS = (function () {
    const pathArray = Object.values(PATHS);
    const result = {};
    pathArray.forEach(el => {
        if (el.alias)
            result[el.alias] = el.path
    });
    return result
})();

//ENV
const mode = process.env.NODE_ENV;
const serverRuns = process.env.SERVER_RUNS == 'true' //true if webpack dev server runs
const isProduction = mode == 'production';
const isDevelopment = !isProduction;


//CONSOLE OUTPUT SETTINGS
//Possible values: 'detailed', 'verbose', 'normal', 'none', 'minimal', 'errors-warnings', 'errors-only'
function resolveStats() {
    if (serverRuns) //npm start
        return 'errors-only'
    else if (isProduction) //npm run build
        return 'errors-warnings'
    else //npm run build-dev (there is no server and dev mode)
        return 'normal'
}

module.exports = {
    context: PATHS.src.path,
    stats: resolveStats(),
    entry: {
        indexPage: path.resolve(PATHS.src.path, 'index.js'),
        notfoundPage: path.resolve(PATHS.src.path, 'notfound.js'),
    },
    output: {
        path: PATHS.dist.path,
        filename: isProduction ? '[name]_[contenthash].bundle.js' : '[name].js',
        publicPath: '',
    },
    resolve: {
        alias: ALIAS,
    },
    devtool: isDevelopment ? 'inline-source-map' : undefined,
    module: {
        rules: [
            {
                test: /\.s?css/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: ''
                        }
                    },
                    {
                        loader: 'css-loader',
                    },
                    "sass-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                config: path.resolve(PATHS.root.path, './postcss-settings/postcss.settings.js')
                            }
                        }
                    },
                ]
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: "defaults" }]
                        ]
                    }
                }
            },
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]',
                    },
                },
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    attributes: true,
                },
            },
            {
                test: /\.pug/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            attributes: true,
                        }
                    },
                    {
                        loader: 'pug-html-loader',
                        options: {
                            data: {}
                        }
                    }
                ],
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(
            {
                filename: isProduction ? '[name]_[contenthash].css' : '[name].css'
            }
        ),
        // new copyWepbackPlugin({
        //     patterns: [
        //         {
        //             from: path.resolve(srcPath, './public'),
        //             to: path.resolve(distPath, './public'),
        //         },
        //         // { from: "any", to: "destination" },
        //     ]
        // }),
        new HTMLWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(PATHS.pages.path, 'index.pug'),
            chunks: ['indexPage'],
            minify: isProduction,
            cache: true,
        }),
        new HTMLWebpackPlugin({
            filename: 'notfound.html',
            template: path.resolve(PATHS.pages.path, 'notfound.pug'),
            chunks: ['notfoundPage'],
            minify: isProduction,
            cache: true,
        }),
        new CleanWebpackPlugin(),
    ],
    devServer: {
        stats: "errors-only",
        contentBase: PATHS.dist.path,
        watchContentBase: true,
        // clientLogLevel: 'silent',
        index: 'index.html',
        compress: true,
        hot: true,
        open: true,
        port: 9000
    }
};
