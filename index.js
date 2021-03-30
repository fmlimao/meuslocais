console.clear();
require('dotenv-safe').config();

const express = require('express');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');

const app = express();

if (process.env.APP_DEBUG == 1) {
    app.use(logger('dev', {
        skip: function (req, res) {
            return req.url.indexOf('bower_components') !== -1;
        },
    }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./public'));
app.use(cookieParser());

app.set('views', './src/v1/views');
app.set('view engine', 'ejs');

app.use('/admin', expressLayouts);
app.set('layout', 'admin/layout');

app.use(require('./src/v1/middlewares/json-return'));

app.use(require('./src/routes'));

app.use(require('./src/v1/middlewares/general/error-404'));
app.use(require('./src/v1/middlewares/general/error-500'));

const port = process.env.APP_PORT;

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}

module.exports = app;
