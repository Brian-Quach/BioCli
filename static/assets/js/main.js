cmdIn = document.getElementById('cmd_in');

cmdIn.addEventListener("blur", function() {
    cmdIn.focus();
}, true);

let ctrlDown = false;

cmdIn.addEventListener('keydown', function (e) {
    let key = e.which || e.keyCode;
    if (key === 13) { // Enter
        console.log(cmdIn.value);
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
})