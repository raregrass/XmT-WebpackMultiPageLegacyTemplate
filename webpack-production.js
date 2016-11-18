"use strict";

/**
 * All units processed by webpack will have a relative url,
 * because it'll be re-written to reflect the change of build path.
 * On the contrast, the assets should be absolute url cause we
 * have no way to simply re-write those base url.
 */

const glob = require("glob");
const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const extractStyle_App = new ExtractTextPlugin("static/css/[name]-[hash:5].css");

/**********************************************************************************************************************/
const srcRootPath = "src";
const distRootPath = "dist";

let webpackConfig = {
    resolve: {
        extensions: ["", ".js", ".ts", ".json", ".html", ".less"],

        alias: {
            /**
             * Own package alias
             */
            "src": path.join(__dirname, srcRootPath),

            "lib": "src/lib",
            "media": "lib/media",
            "vendor": "lib/vendor",
        }
    },

    entry: {},

    output: {
        //publicPath: "/static/",
        path: path.resolve(__dirname, distRootPath),
        filename: "static/js/[name]-[chunkhash:5].js"
    },

    module: {
        loaders: [
            // Import HTML parser to include image, css and js file parser.
            {
                test: /\.html$/,
                loader: "html?attrs=img:src link:href script:src"
            },

            // Process vendor CSS files.
            {
                test: /\.css$/,
                loader: "file?name=/static/vendor/css/[hash:8].[ext]!extract!css",
            },

            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            {
                test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
                loader: 'file',
                query: {
                    // 使用绝对路径，解决font的定位问题
                    name: "/static/vendor/font/[hash:8].[ext]"
                }
            },

            // Process Vendor JS files.
            {
                test: /vendor.*\.js$/,
                loader: "file?name=/static/vendor/js/[hash:8].[ext]"
            },

            // "url" loader works just like "file" loader but it also embeds
            // assets smaller than specified size as data URLs to avoid requests.
            {
                test: /\.(mp4|webm|wav|mp3|m4a|aac|oga|ico|jpg|jpeg|png|gif)$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: "/static/media/[name]-[hash:5].[ext]"
                }
            },

            // Process less files.
            {
                test: /\.less$/,
                loader: extractStyle_App.extract("css?sourceMap!postcss!less?sourceMap"),
            },

            // Process ts files.
            {
                test: /\.ts$/,
                loaders: [
                    "ts-loader"
                ],
                exclude: /node_modules/
            },
        ]
    },

    plugins: [
        // Define env variable
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify("production")
        }),

        // This helps ensure the builds are consistent if source hasn't changed:
        new webpack.optimize.OccurrenceOrderPlugin(),

        // Extract our own less style and process sourcemap.
        extractStyle_App,

        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            except: ['$', 'exports', 'require']
        }),

        new CopyWebpackPlugin([
            {
                from: "./src/lib/3D-model",
                to: "static/3D-model"
            }
        ]),

        new CleanWebpackPlugin(["dev", "dist"], {
            root: __dirname,
            verbose: false,
        }),
    ],

    postcss: function () {
        return [require("autoprefixer")];
    },

};


let result = glob.sync("**/*.html", {
    cwd: path.resolve(__dirname, srcRootPath)
});

result.map((p) => {
    let parsed = path.parse(p);

    let entryKey;
    let entryValue;
    if (parsed.dir === "home") {
        entryKey = "index";
    } else {
        entryKey = parsed.dir + "/" + parsed.name;
    }

    entryValue = "./" + srcRootPath + "/" + parsed.dir + "/" + parsed.name + ".ts";
    webpackConfig.entry[entryKey] = entryValue;

    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            filename: entryKey + ".html",
            template: srcRootPath + "/" + p,
            chunks: [entryKey]
        })
    );
});

module.exports = webpackConfig;