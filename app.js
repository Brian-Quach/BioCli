const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static('static'));

const mongoose = require('mongoose');
const mongoDb = 'mongodb://admin:password@briiquach.com:27020/profile'
//const mongoDb = 'mongodb://localhost:27017/profile'

mongoose.connect(mongoDb, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

require('./routes/commands')(app);

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
    next();
});

const PORT = 3000;
app.listen(PORT, () =>{
    console.log("Started server on port", PORT);
});