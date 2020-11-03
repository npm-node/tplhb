const express = require('express');
const tplHb = require('../index');
const path = require('path');

const app = express();

tplHb(app, {
    viewsPath: path.resolve(__dirname, 'views'),
    helpers: {},
    partialsDirectoryName: 'partials',
    getTemplateFromCache: true
});
