document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("error").style.display = "none";

    sendMessage(1,null);
    var work = function(event){
        sendMessage(3,this.value)
    };
    var shortBreak = function(event){
        sendMessage(4,this.value)

    };
    var longBreak = function(event){
        sendMessage(5,this.value)
    };
    var description = function(event){
        sendMessage(6,this.value)
    }
    var start = function(event){
        sendMessage(2,document.getElementById("start").checked);
    }
    document.getElementById("text").addEventListener('input', description);
    document.getElementById("work").addEventListener('input', work);
    document.getElementById("shortBreak").addEventListener('input', shortBreak);
    document.getElementById("longBreak").addEventListener('input', longBreak);
    document.getElementById("start").addEventListener('input', start);
});

function showInputs(bool){
    if(bool){
        document.getElementById("change").style.display = "none";
    }
    else{
        document.getElementById("change").style.display = "block";
    }
}

function sendMessage(number,value){
    if(number == 1){ //isStarted?
        chrome.runtime.sendMessage({func:1},  function (response) {
            document.getElementById("start").checked = response.working;
            showInputs(response.working);
            document.getElementById("workTime").innerHTML = response.work;
            document.getElementById("shortBreakTime").innerHTML = response.short;
            document.getElementById("longBreakTime").innerHTML = response.long;
            document.getElementById("desc").innerHTML = response.desc;
        });
    }
    else if(number == 2){ //start or cancel
        chrome.runtime.sendMessage({func:2, value: value},  function (response) {
            showInputs(response.working);
        });
    }
    else if(number == 3){
        if(value != "")
            chrome.runtime.sendMessage({func:3, value: value},  function (response) {
                document.getElementById("workTime").innerHTML = response.work;
            });
    }
    else if(number == 4){ 
        if(value != "")
            chrome.runtime.sendMessage({func:4, value: value},  function (response) {
                document.getElementById("shortBreakTime").innerHTML = response.short;
            });
    }
    else if(number == 5){ 
        if(value != "")
            chrome.runtime.sendMessage({func:5, value: value},  function (response) {
                document.getElementById("longBreakTime").innerHTML = response.long;
            });
    }
    else if(number == 6){ 
        chrome.runtime.sendMessage({func:6, value: value},  function (response) {
            document.getElementById("desc").innerHTML = response.desc;
        });
    }
}
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        document.getElementById("error").style.display = "block";
        document.getElementById("change").style.display = "block";
        document.getElementById("start").checked = false;
        sendResponse({done:true});
    })
