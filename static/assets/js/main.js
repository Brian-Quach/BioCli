cmdIn = document.getElementById('cmd_in');

cmdIn.addEventListener("blur", function() {
    cmdIn.focus();
}, true);

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
    } else if (key === 18) { // Ctrl - Not working (TODO)
        e.preventDefault();
        console.log("Ctrl");
    }
});

function cHandler(e) {
    e.preventDefault();
    let key = e.which || e.keyCode;
    if (key === 67) { // c
        console.log("Ctrl + C");
    }

}
