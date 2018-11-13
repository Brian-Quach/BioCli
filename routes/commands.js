const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = function(app){

    const database = mongoose.connection;
    database.on('error', console.error.bind(console, 'MongoDB connection error:'));
    database.once('open', function() {
        console.log("Database Connection Established!");
    });

    let Commands = mongoose.model('Command',
        new Schema({
            command: String,
            description: String,
            usage: String,
            args: [{
                param: String,
                desc: String
            }]
        }),
        'commands');

    let About = mongoose.model('About',
        new Schema({
            firstname: String,
            lastname: String,
            title: String,
            email: String,
            phone: String,
            website: String,
            summary: String,
            location: {
                address: String,
                city: String,
                country: String,
                region: String,
                postalcode: String
            }
        }),
        'about');

    let Experience = mongoose.model('Experience',
        new Schema({
            company: String,
            position: String,
            location: String,
            start: String,
            end: String,
            highlights: [String]
        }),
        'experience');

    let Skills = mongoose.model('Skill',
        new Schema({
            category: String,
            skill: String,
            proficiency: Number
        }),
        'skills');

    let Contact = mongoose.model('Contact',
        new Schema({
            method: String,
            contact: String,
            url: String
        }),
        'contact');

    let Education = mongoose.model('Education',
        new Schema({
            institution: String,
            degree: String,
            start: String,
            end: String,
            description: String
        }),
        'education');

    let Content = mongoose.model('Content',
        new Schema({
            type: String,
            value: [String]
        }),
        'content');



    function ConsoleOut(text, status, isPrompt) {
        this.textOutput = text;
        this.resStatus = status;
        this.isPrompt = isPrompt;
    }

    app.post('/cli/sendCmd/', function (req, res){
        //TODO: Create non-standard return types
        let input = req.body;

        let returnString, returnType;
        if (Object.keys(commands).indexOf(input.command) > -1){

            commands[input.command].apply(null, input.params).then((returnString) => {
                let output = new ConsoleOut(returnString, "systemOutput", false);
                return res.json(output);
            });

        } else {
            returnString = "Command not found, use HELP to show available commands"
            returnType = "systemError";
            let output = new ConsoleOut(returnString, returnType, false);
            return res.json(output);
        }
    });

    app.get('/cli/welcome/', function (req, res){
        Content.findOne({type: "Welcome"}, function(err, content){
            if (err) return;

            let welcomeText = content.value;
            return res.json(welcomeText);
        })
    });



    let commands = {};

    commands.help = async function(command = null){
        return new Promise(function(resolve, reject){
            let response;
            if (command === null){
                Commands.find({}, function(err, commands){
                    if (err) reject(err);
                    response = ['Type `help cmd` to find out more about the command `cmd`', '', ''];
                    commands.forEach( function(cmd) {
                        let nextLine = cmd.command;
                        nextLine = nextLine + ' - ' + cmd.description;
                        response.push(nextLine);
                    } );
                    resolve(response);
                });
            } else {
                Commands.findOne({command: command}, function(err, cmd){
                    if (err) return resolve('`' + command + '` not found, please try again!');
                    if (cmd == null) return resolve('`' + command + '` not found, please try again!');
                    response = [command + ": " + cmd.usage, cmd.description];
                    if (cmd.args.length !== 0){
                        response.push('');
                        response.push('Arguments:');
                        cmd.args.forEach(function(arg){
                            let nextLine = arg.param + ": " + arg.desc;
                            response.push(nextLine);
                        });
                    }
                    resolve(response);
                });
            }
        });
    };

    commands.about = async function(){
        return new Promise(function(resolve, reject){{

            resolve("This is the about command!");
        }});
    };


};