const glob = require("glob");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

function getEntry(globPath, pathDir) {
    let files = glob.sync(globPath);
    let entries = {},
        entry, dirname, basename, pathname, extname;

    for (let i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);
        pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] = ['./' + entry];
    }
    return entries;
}

let webpackConfig = {
    entry: {},
    plugins: []
};

const srcRootPath = "src";

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