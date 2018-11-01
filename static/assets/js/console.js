let ctrlDown = false;
let outputCount = 0;
let isPrompt = true;

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

cmdIn.addEventListener('keydown', function (e) {
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
        }
    }
});

cmdIn.addEventListener('keyup', function (e) {
    let key = e.which || e.keyCode;
    if (key === 17) {
        e.preventDefault();
        ctrlDown = false;
    }
});

//TODO - Startup
welcomeMessage();


function welcomeMessage(){
    typeLine("Hello there!!");

    isPrompt = false;
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

    console.log(newInput);

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

function typeLine(text){
    let newLine = document.createElement("div");
    cmdOut.appendChild(newLine);
    let newSpan = document.createElement("span");
    newSpan.classList.add("output");
    newSpan.id = "out-"+outputCount.toString();
    outputCount++;
    newLine.appendChild(newSpan);

    new Typed("#"+newSpan.id, {
        strings: [text],
        typeSpeed: 30,
        loop: false,
        cursorChar: '_',
        onComplete: function(self) {
            self.cursor.innerHTML = '';
            printLine("systemOutput",cmdIn.value);
            cmdIn.value = "";
        },
    });
    window.scrollTo(0,document.body.scrollHeight);
}

function userLogin(newUser = "guest") {
    let inPrompt = document.getElementById("prompt");

    inPrompt.textContent = newUser + "@briiquach.com:~$";
}
