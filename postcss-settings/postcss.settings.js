const cssnano = require('cssnano');

//ENV
const mode = process.env.NODE_ENV;
const serverRuns = process.env.SERVER_RUNS == 'true' //true if webpack dev server runs
const isProduction = mode == 'production';
const isDevelopment = !isProduction;

//Lists of plugins
let productionPlugins = []
let developmentPlugins = []
//For production:
if (isProduction) {
    productionPlugins = [
        cssnano(
            {
                preset: ['default', {
                    discardComments: {
                        removeAll: true,
                    },
                }]
            }
        ),
    ]
}

//For development:
if (isDevelopment) {
    developmentPlugins = [
        // ...
    ]
}


module.exports = {
    syntax: 'postcss-scss',
    plugins: [
        // Common plugins:
        "autoprefixer",
    ].concat(productionPlugins).concat(developmentPlugins),
};