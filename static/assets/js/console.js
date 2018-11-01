let ctrlDown = false;
let outputCount = 0;
let isPrompt = true;
let currTyping = null;

cmdIn = document.getElementById('cmd_in');
cmdOut = document.getElementById('output');

function send(method, url, data, callback){
    var xhr = new XMLHttpRequest();
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

function ConsoleInput(type, value) {
    this.inputType = type;
    this.inputValue = value;
}

cmdIn.addEventListener("blur", function() {
    cmdIn.focus();
}, true);

document.addEventListener('keydown', function (e) {
    let key = e.which || e.keyCode;
    if (key === 13) { // Enter
        processCommand(cmdIn.value);
        cmdIn.value = "";
    } else if (key === 38) { // Up
        console.log("Up");
    } else if (key === 40) { // Down
        console.log("Down");
    } else if (key === 9) {  // Tab
        e.preventDefault();
        console.log("Tab");
    } else if (key === 17) { // Ctrl
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

//TODO - Startup
welcomeMessage();


function welcomeMessage(){
    typedWelcome(["Hello there!! Welcome and stuff!! (This is a welcome message!!!)",
    "*Testing multi-line messages*",
    "FYI - you can use CTRL+C to end this early (Assuming it works)",
    "So yeahh.. currently, this doesn't do anything.",
    "It just repeats whatever you send, but capitalized!",
    "Go ahead and type something:"]);
    cmdIn.focus();
}

function createTextSpan(type, text){
    let newElement = document.createElement("span");
    newElement.classList.add(type);
    newElement.id = "out-"+outputCount.toString();
    outputCount++;
    newElement.textContent = text;

    return newElement;
}


function processCommand(input){
    let currPrompt = document.getElementById("prompt");
    printLine("userInput", currPrompt.textContent + " " + input);

    let newInput = new ConsoleInput("cmd", input);


    send("POST", "/cli/sendCmd/", newInput, function(err, sysOut){
        if (err) printLine("systemError", err);
        if (!sysOut.isPrompt) printLine(sysOut.resStatus, sysOut.textOutput);
    });
}

function printLine(format, text){
    let newLine = document.createElement("div");
    let lineText = createTextSpan(format, text);
    newLine.appendChild(lineText);

    cmdOut.appendChild(newLine);
    window.scrollTo(0,document.body.scrollHeight);
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