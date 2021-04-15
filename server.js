'use strict';
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http');
const request = require('request');
const server = http.createServer(app);

const helmet = require('helmet');

app.set('trust proxy', true);

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(helmet.frameguard());

app.get('/get', (req, res) => {
    var x = request.get(req.query.url).pipe(res);
});

app.get('/', (request, response) => {
    response.status(200).sendFile(__dirname + '/public/index.html');
});

app.listen(8080);