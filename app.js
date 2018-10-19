const express = require('express');
const app = express();

//app.use(express.static('static'));

//var bodyParser = require('body-parser');
//app.use(bodyParser.json());

app.use(express.static('static'));

// app.get('/', function (req, res) {
//     res.send('Hello World')
// });

app.get('/cli/command/', function (req, res){
    let cmd = req.body.cmd;
    return res.json("hello world!");
});

app.use(function (req, res, next){
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

app.use(function (req, res, next){
    console.log("HTTP Response", res.statusCode);
});

const PORT = 3000;
app.listen(PORT, () =>{
    console.log("Started server on port", PORT);
});