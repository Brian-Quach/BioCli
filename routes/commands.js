module.exports = function(app){

    function ConsoleOut(text, status, isPrompt) {
        this.textOutput = text;
        this.resStatus = status;
        this.isPrompt = isPrompt;
    }

    app.post('/cli/sendCmd/', function (req, res, next){
        //TODO: Create non-standard return types
        let input = req.body;
        let returnString = "You sent: " + input.inputValue + " as a " + input.inputType + "!";
        let output = new ConsoleOut(returnString, "systemOutput", false);
        return res.json(output);
    });

};