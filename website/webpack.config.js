const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');
const webpack = require('webpack');
const moment = require('moment');
const esm = require('esm')(module);
const config = esm(`./src/config.${process.env.NODE_ENV}.js`);

// avoid node js without window variable exception
const fs = require('fs');
const htmlElement = require('html-element');
const convert = require('jstoxmlparser');
if (!global.window) {
    global.window = global;
}
if (!global.HTMLElement) {
    global.HTMLElement = htmlElement.Element;
}
const routingRules = esm('./src/routing-rule.js');
const currentPath = config.APP_CONFIG.FRONT_END_URL;
const result = [];

for (let i = 0; i < routingRules.RoutingRule.length; i++) {
    recursiveGeneratePath(currentPath, routingRules.RoutingRule[i]);
}

function recursiveGeneratePath (currentPath, routingRule) {
    if (!routingRule.skipSitemap) {
        const existsData = result.filter(item => {
            return item.loc === currentPath + routingRule.path;
        });
        if (existsData.length === 0 && (currentPath + routingRule.path) !== config.APP_CONFIG.FRONT_END_URL) {
            result.push({
                loc: currentPath + routingRule.path,
                changefreq: 'weekly',
                lastmod: moment().format('YYYY-MM-DD')
            });
        }
    }
    if (routingRule.children) {
        for (let i = 0; i < routingRule.children.length; i++) {
            recursiveGeneratePath(currentPath + routingRule.path, routingRule.children[i]);
        }
    }
}

const sitemap = convert.toXML({
    _name: 'urlset',
    _content: {
        url: result
    },
    _attrs: {
        xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9'
    }
}, {
    header: false,
    indent: '    '
});
fs.writeFileSync(path.join(__dirname, '/src/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n${sitemap}`);

// generate css from sass
const scssFiles = recursiveExtractCssFile('./');
const sass = require('node-sass');
for (let i = 0; i < scssFiles.length; i++) {
    const outputFileName = path.dirname(scssFiles[i]) + path.basename(scssFiles[i]).replace(path.extname(scssFiles[i]), '.css');
    if (outputFileName.indexOf('node_modules/') !== -1) {
        continue;
    }
    sass.render({
        file: scssFiles[i],
        outFile: outputFileName,
        includePaths: ['node_modules/']
    }, (error, result) => { // node-style callback from v3.0.0 onwards
        if (error) {
            console.error(error);
            return;
        }
        fs.writeFile(outputFileName, result.css, function (err) {
            if (err) {
                console.error(err);
            }
        });
    });
}

function recursiveExtractCssFile (folder) {
    const result = extractCssFile(folder);
    fs.readdirSync(folder, {
        withFileTypes: true
    }).forEach((file) => {
        if (file.isDirectory()) {
            result.push(...recursiveExtractCssFile(`${folder}${file.name}/`));
        }
    });
    return result;
}

function extractCssFile (folder) {
    return fs.readdirSync(folder, {
        withFileTypes: true
    }).map(file => {
        if (!file.isDirectory() && path.extname(file.name) === '.scss') {
            return folder + '/' + file.name;
        }
        return undefined;
    }).filter((item) => {
        return item !== undefined;
    });
}

const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');

module.exports = {
    entry: './src/app-for-build.js',
    output: {
        filename: 'app.[hash].js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '/'
    },
    optimization: {
        minimizer: [
            new TerserJSPlugin({}),
            new CssMinimizerPlugin()
        ]
    },
    module: {
        rules: [{
            test: /\.html$/i,
            use: [{
                loader: 'string-replace-loader',
                options: {
                    multiple: [
                        {
                            search: '{GA_PROPERTY_ID}',
                            replace: config.APP_CONFIG.GA_PROPERTY_ID
                        }
                    ]
                }
            }]
        }, {
            test: /\.scss$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        }, {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
        }, {
            test: /\.html$/i,
            loader: 'html-loader',
            options: {
                minimize: true
            }
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new RemoveEmptyScriptsPlugin(),
        new MiniCssExtractPlugin({
            filename: 'app.[hash].css'
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new HtmlWebpackPlugin({
            template: './src/build/index.html',
            filename: 'index.html'
        }),
        new CopyPlugin({
            patterns: [{
                from: './ssl',
                to: './ssl'
            }, {
                from: './server.js',
                to: './server.js'
            }, {
                from: './src/third-party',
                to: './third-party'
            }, {
                from: './src/config.*.js',
                to: './'
            }, {
                from: './src/assets',
                to: './assets'
            }, {
                from: './src/sitemap.xml',
                to: './'
            }]
        }),
        new PurgecssPlugin({
            paths: glob.sync('./**/*.html', { nodir: true })
        })
    ]
};
