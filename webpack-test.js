"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

/*
 const extractStyle_Vendor = new ExtractTextPlugin(AbsolutePathPrefix + "static/css/vendor.css");
 const extractStyle_App = new ExtractTextPlugin(AbsolutePathPrefix + "static/css/[name].css");
 */
const extractStyle_Vendor = new ExtractTextPlugin("static/css/[name]-vendor.css");
const extractStyle_App = new ExtractTextPlugin("static/css/[name].css");

/**********************************************************************************************************************/
module.exports = {

    devtool: "source-map",
    devServer: {
        colors: true,
        historyApiFallback: true,
        inline: true,
    },

    resolve: {
        extensions: ["", ".js", ".ts", ".json", ".html", ".less"],

        alias: {
            /**
             * Own package alias
             */
            "src": path.join(__dirname, "src"),


        }
    },

    entry: {
    },

    output: {
        path: path.resolve(__dirname, "dev"),
        filename: "static/js/[name].js"
    },

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "html?attrs=img:src link:href script:src"
            },

            // Process Vendor JS files.
            {
                test: /vendor.*\.js$/,
                //test: /jquery\.js$/,
                loader: "file?name=static/vendor/js/[name]-[hash:5].[ext]"
                //loader: "file!extract!imports?jQuery=jquery,$=jquery,this=>window!raw"
            },
            // Process Vendor JS files.
            {
                //test: /\/lib\/vendor.*\.js/,
                test: /bootstrap\.js$/,
                loader: "file?name=static/vendor/js/[name].[ext]"
                //loader: "file!script!imports?this=window"
            }
        ]
    },

    plugins: [

        // This helps ensure the builds are consistent if source hasn't changed:
        new webpack.optimize.OccurrenceOrderPlugin(),

        /**
         * 使用html模板文件进行创建
         */
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: "src/test/index.html",
            chunks: ["index"]
        }),

        new CleanWebpackPlugin(["dev"], {
            root: __dirname,
            verbose: false,
        }),

    ],

    postcss: function () {
        return [require("autoprefixer")];
    },

};