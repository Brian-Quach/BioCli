module.exports = function(app){

    app.get('/cli/hello/', function (req, res){
        return res.json("hello world!");
    });

};