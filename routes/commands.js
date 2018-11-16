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
            pronoun: String,
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
            method_lower: String,
            contact: String,
            url: String
        }),
        'contact');

    let Message = mongoose.model('Message',
        new Schema({
            name: String,
            email: String,
            date: String,
            Content: String
        }),
        'messages');

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

        let returnString;
        if (Object.keys(commands).indexOf(input.command.toLowerCase()) > -1){

            commands[input.command.toLowerCase()].apply(null, input.params).then((output) => {
                return res.json(output);
            });

        } else {
            returnString = "Command not found, use HELP to show available commands";
            let output = sysErr(returnString);
            return res.json(output);
        }
    });

    app.get('/cli/welcome/', function (req, res){
        Content.findOne({type: "Welcome"}, function(err, content){
            if (err) return;
            if (content == null){
                return res.json("Hello!");
            }

            let welcomeText = content.value;
            return res.json(welcomeText);
        })
    });



    let commands = {};

    commands.get = async function(section = null, args = null){
        return new Promise(function(resolve){
            if (section === null){
                Content.findOne({type: 'Get'}, function(err, response){
                    if (err || (response == null)) return resolve("Could not get response.");
                    return resolve(sysOut(response.value));
                });
            } else {
                section = section.toLowerCase();
                let filters = {};
                let response = [];
                switch (section) {
                    case 'summary':
                        resolve(commands.about(null));
                        break;
                    case 'skills':
                        Skills.find(filters, function(err, skillsList){
                            // TODO: Format properly
                            skillsList.forEach(function(skill){
                                response.push(skill.skill);
                            });
                            resolve(sysOut(response));
                        });
                        break;
                    case 'experience':
                        Experience.find(filters, function(err, experienceList){
                            // TODO: Format
                            experienceList.forEach(function(experience){
                                response.push(experience.position + ' at ' + experience.company);
                            });
                            resolve(sysOut(response));
                        });
                        break;
                    case 'education':
                        Education.find({}, function(err, educationList){
                            // TODO: Format
                            educationList.forEach(function(education){
                                response.push(education.degree + ' from ' + education.institution);
                            });
                            resolve(sysOut(response));
                        });
                        break;
                    case 'projects':
                        resolve(sysOut('*Placeholder*'));
                        break;
                    case 'interests':
                        resolve(sysOut('*Placeholder*'));
                        break;
                    default:
                        resolve(sysOut(section + ' is not an option, please try again.'));
                }
            }
        });
    };


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
                    resolve(sysOut(response));
                });
            } else {
                Commands.findOne({command: command.toLowerCase()}, function(err, cmd){
                    if (err) return resolve(sysOut('`' + command + '` not found, please try again!'));
                    if (cmd == null) return resolve(sysOut('`' + command + '` not found, please try again!'));
                    response = [command + ": " + cmd.usage, cmd.description];
                    if (cmd.args.length !== 0){
                        response.push('');
                        response.push('Arguments:');
                        cmd.args.forEach(function(arg){
                            let nextLine = arg.param + ": " + arg.desc;
                            response.push(nextLine);
                        });
                    }
                    resolve(sysOut(response));
                });
            }
        });
    };

    commands.about = async function(info = null){
        return new Promise(function(resolve, reject){
            if (info == null){
                About.find({}, function(err, profile){
                    if (err) return reject(err);
                    if (profile.length === 0) return resolve(sysOut("Could not find profile"));
                    profile = profile[0];
                    let response = [profile.firstname + ' ' + profile.lastname + ' is a ' + profile.summary]
                    response.push(profile.firstname + ' is currently based in ' + profile.location.city + ', ' +
                        profile.location.country + ' as a ' + profile.title);

                    resolve(sysOut(response));
                })
            } else {
                // Temp: Too lazy to do rn
                resolve(commands.about(null));
            }
        });
    };

    commands.contact = async function(method = null){
        return new Promise(function(resolve, reject){
            if (method == null){
                Contact.find({}, function(err, contacts){
                    if (err) return reject(err);
                    let response = [];
                    response.push('Please specific method of contact from one of the following:');

                    let contactOptions = "";
                    contacts.forEach(function(contactInfo){
                        contactOptions = contactOptions + " " + contactInfo.method;
                    });

                    response.push(contactOptions);
                    response.push('');
                    response.push('Or use `contact message` to leave me a message!');

                    resolve(sysOut(response))
                });
            } else if (method.toLowerCase() === 'message') {
                let response = ['This feature is in progress, just email me :('];


                resolve(sysOut(response));
            } else {
                Contact.findOne({method_lower: method.toLowerCase()}, function(err, contactInfo){
                    if (err) return reject(err);
                    if (contactInfo == null) return resolve('Sorry, I do not use ' + method +' :(');

                    let handle;
                    if (contactInfo.url){
                        handle = 'url{'+contactInfo.url+',' + contactInfo.contact + '}'
                    } else {
                        handle = contactInfo.contact;
                    }

                    let response = ['I\'m ' + handle + ' on ' + contactInfo.method + '!'];
                    resolve(sysOut(response));
                })
            }
        });
    }

    commands.test = async function(arg = null){
        return new Promise(function(resolve){
            let responseString = ["This is a response string", "With two lines..", "Ohwait, threelines!"];
            let resStatus = "systemOut";

            if (arg) resStatus = arg;
            resolve(new ConsoleOut(responseString, resStatus, false));
        });
    }

    function sysOut(text){
        return new ConsoleOut(text, 'systemOut', false);
    }
    function sysErr(text){
        return new ConsoleOut(text, 'systemError', false);
    }
};
