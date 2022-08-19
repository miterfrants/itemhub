'use strict';
const fs = require('fs');
const nodemon = require('nodemon');
const bs = require('browser-sync');
const open = require('open');

fs.copyFileSync(`./src/config.${process.env.NODE_ENV}.js`, './src/config.js');

/**
 * nodemon will execute ./extractCssFiles.js after scss files changed.
 * setting parameters: https://github.com/remy/nodemon/blob/master/lib/config/load.js#L236.
 * */
nodemon({
    script: './extractCssFiles.js',
    watch: ['src/'],
    ext: 'scss',
    ignore: ['config.js', 'config.*.js', '*.css']
});

/**
 * browser will reload after html,css,js files changed.
 * setting parameters: https://browsersync.io/docs/options.
 * */

bs.init({
    files: ['./src/**/*.{html,css,js}'],
    watchOptions: {
        ignored: ['node_modules', 'config.js', 'config.*.js', './src/**/*.scss']
    },
    ui: false,
    server: {
        baseDir: 'src',
        index: 'index.html',
        middleware: (req, res, next) => {
            const pathname = req.url.split('?')[0];
            if (req.url.length > 1 && pathname.endsWith('/')) {
                req.url = '/';
            }
            next();
        }
    },
    port: 80,
    // https: {
    //     key: './ssl/key.pem',
    //     cert: './ssl/server.crt'
    // },
    host: 'dev.itemhub.io',
    open: false
});

console.log('if u can\'n see anything, plesae add dev.itemhub.io domain name to your etc/hosts');
open('http://dev.itemhub.io');
