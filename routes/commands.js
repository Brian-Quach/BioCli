module.exports = function(app){

    function ConsoleOut(text, status, isPrompt) {
        this.textOutput = text;
        this.resStatus = status;
        this.isPrompt = isPrompt;
    }

    app.post('/cli/sendCmd/', function (req, res){
        //TODO: Create non-standard return types
        let input = req.body;
        console.log("Recieved:", input.command);
        // TODO: check that "input.command" is a command

        let returnString = commands[input.command].apply(null, input.params);

        let output = new ConsoleOut(returnString, "systemOutput", false);
        return res.json(output);
    });



    let commands = {};

    commands.help = function(command = null){
        if (command === null){
            return "This is a help text";
        } else {
            return "This is the help text for " + command;
        }
    }


};