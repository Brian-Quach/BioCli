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

        let returnString, returnType;

        if (Object.keys(commands).indexOf(input.command) > -1){
            returnString = commands[input.command].apply(null, input.params);
            returnType = "systemOutput";
        } else {
            returnString = "Command not found, use HELP to show available commands"
            returnType = "systemError";
        }

        let output = new ConsoleOut(returnString, returnType, false);

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

    commands.about = function(){
        return "This is the about command!"
    }


};