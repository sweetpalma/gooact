const webpack = require("webpack");
const fs = require("fs");
const path = require("path");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
    entry: resolveApp("./index.jsx"),
    target: "web",
    mode: process.env.WEBPACK_SERVE ? "development" : "production",
    devtool: "source-map",
    output: {
        path: resolveApp("./public"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.js|jsx$/,
                loader: "babel-loader"
            }
        ]
    }
};
