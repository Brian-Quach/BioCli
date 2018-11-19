let ctrlDown = false;
let outputCount = 0;
let isPrompt = true;
let currTyping = null;
let lineCnt = 0;
let windowWidth;

cmdIn = document.getElementById('cmd_in');
cmdOut = document.getElementById('output');

function send(method, url, data, callback){
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        if (xhr.status !== 200) callback("[" + xhr.status + "] " + xhr.responseText, null);
        else callback(null, JSON.parse(xhr.responseText));
    };
    xhr.open(method, url, true);
    if (!data) xhr.send();
    else{
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }
}
window.addEventListener('load', function() {

    setWindowWidth();
    historySetup();
    welcomeMessage();

});

window.addEventListener('resize', setWindowWidth);

function setWindowWidth(){
    let $char = $('<span>').css({ padding: 0, margin: 0 }).text(String.fromCharCode(160)).appendTo('body'),
        charWidth = $char.width(),
        numberOfChars = parseInt(Math.floor($('body').width() / charWidth ).toFixed(), 10);
    $char.remove();
    windowWidth = numberOfChars-2;
}

function ConsoleInput(type, input) {
    this.inputType = type;
    let params = input.split(" ");
    if (type === 'cmd'){
        this.command = params.shift();
        this.params = params;
    }
    else if (type === 'res'){
        this.response = params.shift();
    }
}

cmdIn.addEventListener("blur", function() {
    cmdIn.focus();
}, true);

cmdIn.addEventListener('keydown', function (e) {
    let key = e.which || e.keyCode;
    if (key === 13) { // Enter
        processCommand(cmdIn.value);
        cmdIn.value = "";
    } else if (key === 38) { // Up
        cmdIn.value = prevCommand();
    } else if (key === 40) { // Down
        cmdIn.value = nextCommand();
    } else if (key === 9) {  // Tab
        e.preventDefault();
        console.log("Tab");
    }
});

document.addEventListener('keydown', function (e) {
    let key = e.which || e.keyCode;
    if (key === 17) { // Ctrl
        e.preventDefault();
        ctrlDown = true;
    } else if (key === 67) { // C
        if (ctrlDown){
            console.log("Ctrl + C");
            quickEscape();
        }
    }
});

document.addEventListener('keyup', function (e) {
    let key = e.which || e.keyCode;
    if (key === 17) {
        e.preventDefault();
        ctrlDown = false;
    }
});



function welcomeMessage(){
    send("GET", "/cli/welcome/", null, function(err, message){
        if (err) printLine("systemError", err);
        typedWelcome(message);
        cmdIn.focus();
    });
}

function createTextSpan(type, text){
    let newElement = document.createElement("span");
    newElement.classList.add(type);
    newElement.id = "out-"+outputCount.toString();
    outputCount++;
    if (text.includes('url{')){
        let textSplit = text.split('url{');
        newElement.textContent = textSplit[0];

        textSplit = textSplit[1].split(',');

        let link = document.createElement('a');
        link.setAttribute('href', textSplit[0]);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');

        textSplit = textSplit[1].split('}');
        link.textContent = textSplit[0];

        newElement.appendChild(link);

        newElement.innerHTML += textSplit[1];
    } else if (text.includes('skill{')){
        let textSplit = text.split('skill{')[1].split(',');
        let skillName = textSplit[0];
        let prof = (textSplit[1]).split('}')[0];

        let skillBar = newSkill(skillName, prof);
        newElement.appendChild(skillBar);
    } else {
        newElement.textContent = text;
    }
    if (text === "" || text === null){
        newElement.appendChild(document.createElement('br'));
    }

        return newElement;
}

function newSkill(skill, proficiency){
    let skillBar = document.createElement('div');
    skillBar.classList.add('skillBar');

    let skillName = document.createElement('div');
    skillName.classList.add('skillName');
    skillName.innerText = skill;

    let profBar = document.createElement('div');
    profBar.classList.add('profBar');

    profBar.innerText = '[' + Array(windowWidth-2).join(String.fromCharCode(160)) + ']';

    let currIndex = -10*lineCnt;
    lineCnt++;
    let maxIndex = Math.floor((proficiency/10)*(windowWidth-2)) + 1;
    let animation = setInterval(frame, Math.floor(600/windowWidth));
    function frame() {
        if (currIndex < 0){
          currIndex++;
        } else if (currIndex >= maxIndex) {
            clearInterval(animation);
        } else {
            currIndex++;
            profBar.innerText = setCharAt(profBar.innerText, currIndex, '#');
        }
    }
    skillBar.appendChild(skillName);
    skillBar.appendChild(profBar);
    return skillBar;
}

function setCharAt(str, index, chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

function processCommand(input){
    let currPrompt = document.getElementById("prompt");
    printLine("userInput", currPrompt.textContent + " " + input);
    saveCommand(input);

    let newInput = new ConsoleInput("cmd", input);


    send("POST", "/cli/sendCmd/", newInput, function(err, sysOut){
        if (err) printLine("systemError", err);
        if (!sysOut.isPrompt){
            if (sysOut.resStatus === 'typedJs'){
                disableInput();
                typedWelcome(sysOut.textOutput);
            } else {
                printLine(sysOut.resStatus, sysOut.textOutput);
            }
        }
    });
}

function printLine(format, text){
    lineCnt = 0;
    if (text.constructor === String) {
        let newLine = document.createElement("div");
        let lineText = createTextSpan(format, text);

        newLine.appendChild(lineText);

        cmdOut.appendChild(newLine);
        window.scrollTo(0,document.body.scrollHeight);
    } else if (text.constructor === Array) {
        for (let lineNumber = 0; lineNumber < text.length; lineNumber++) {
            let newLine = document.createElement("div");
            let lineText = createTextSpan(format, text[lineNumber]);
            newLine.appendChild(lineText);

            cmdOut.appendChild(newLine);
            window.scrollTo(0,document.body.scrollHeight);
        }
    }
}

function typedWelcome(text) {
    let strings = [];
    let next = [];
    if (text === undefined || text.length === 0) {
        allowInput();
        return;
    }else if (text.constructor === String) {
        strings = [text];
        next = [];
    } else if (text.constructor === Array) {
        strings = text.slice(0, 1);
        next = text.slice(1);
    }

    let newLine = document.createElement("div");
    cmdOut.appendChild(newLine);
    let newSpan = document.createElement("span");
    newSpan.classList.add("output");
    newSpan.id = "out-" + outputCount.toString();
    outputCount++;
    newLine.appendChild(newSpan);


    currTyping = new Typed("#"+newSpan.id, {
        strings: strings,
        typeSpeed: 25,
        loop: false,
        cursorChar: '_',
        onComplete: function(self) {
            self.cursor.innerHTML = '';
            currTyping = null;
            setTimeout(function() {
                typedWelcome(next);
            }, 300);

        },
    });
    window.scrollTo(0,document.body.scrollHeight);
}

function userLogin(newUser = "guest") {
    let inPrompt = document.getElementById("prompt");

    inPrompt.textContent = newUser + "@briiquach.com:~$";
}

function quickEscape() {
    if (currTyping != null){
        currTyping.cursor.innerHTML = '';
        currTyping.stop();
        currTyping = null;
    } else if (isPrompt = true){
        //TODO: Stop whatever
        isPrompt = false;
    }
    allowInput();
}

function allowInput() {
    let inputDiv = document.getElementById("input");
    if (inputDiv.classList.contains("hidden")) {
        inputDiv.classList.remove("hidden");
    }
    cmdIn.focus();
}

function disableInput() {
    let inputDiv = document.getElementById("input");
    if (!inputDiv.classList.contains("hidden")){
        inputDiv.classList.add("hidden");
    }
}

let cmdHist, histIndex;

function historySetup(){
    if (localStorage.getItem("cmdHist")){
        cmdHist = JSON.parse(localStorage.getItem("cmdHist"));
        histIndex = cmdHist.length-1;
    } else {
        cmdHist = [];
        histIndex = -1;
    }
}

function saveCommand(command){
    if(command.length !== 0 && command !== cmdHist[cmdHist.length - 1]){
        cmdHist.push(command);
        localStorage.setItem("cmdHist", JSON.stringify(cmdHist));
    }
    histIndex = cmdHist.length;
}

function prevCommand(){
    if (cmdHist.length !== 0){
        if (histIndex === 0) histIndex = cmdHist.length;
        histIndex = histIndex - 1;
        return cmdHist[histIndex];
    } else {
        return "";
    }
}

function nextCommand(){
    if (cmdHist.length !== 0 && cmdHist.length !== histIndex){
        if (histIndex === cmdHist.length - 1) return "";
        histIndex = histIndex + 1;
        return cmdHist[histIndex];
    } else {
        return "";
    }
}