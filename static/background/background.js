class Cycle{
    stat = 0;
    count = 0;
    workTime = 25;
    shortPause = 5;
    longPause = 10;
    timeOut = null;
    working = false;
    description = "";
    constructor(){
    }
    start(){
        this.working = true;
        var ret = null;
        if(this.stat == 0){
            console.log("work");
            ret = this.constructor.work(this.count,this.description);
            this.timeOut = setTimeout(this.start.bind(this),1000*60*this.workTime);
        }else if(this.stat == 1){
            console.log("short");
            openInNewTab();
            ret = this.constructor.short(this.count,this.description);
            this.timeOut = setTimeout(this.start.bind(this),1000*60*this.shortPause);
        }else if(this.stat == 2){
            console.log("long");
            openInNewTab();
            ret = this.constructor.long(this.description);
            this.timeOut = setTimeout(this.start.bind(this),1000*60*this.longPause);
        }
        this.stat = ret[0];
        this.count = ret[1];
        console.log(ret);
    }
    static work(count,description){
        getWorkSpace("work",description);
        return [count == 3? 2:1,++count]
    }
    static short(count,description){
        getWorkSpace("shortPause",description);
        return [0,count];
    }
    static long(description){
        getWorkSpace("longPause",description);
        return [0,0];
    }
    stop(){
        clearTimeout(this.timeOut);
        getCurrentRunning();
        this.working = false;
        this.count = 0;
        this.stat = 0;
    }
    cancel(){
        clearTimeout(this.timeOut);
        this.working = false;
        this.count = 0;
        this.stat = 0;
        chrome.runtime.sendMessage({error:"login to toggl"},  function (response) {
            
        });
    }

}
let run = new Cycle();

function timeEntry(id,desc,tag){
    var entry = {};
    var data = {};
    data.description = desc;
    data.workspace = id;
    data.created_with = "pomodoro";
    data.tags = [tag];
    entry.time_entry = data;
    return JSON.stringify(entry);
}
function startTimeEntry(id,desc,tag){
    const Http = new XMLHttpRequest();
    const url="https://www.toggl.com/api/v8/time_entries/start";
    Http.open("POST", url);
    Http.setRequestHeader("Content-Type", "application/json");
    Http.onload = function () {
        if (Http.readyState == 4 && Http.status == "200") {
            console.log("ok");
        } else {
            run.cancel();
        }
    }
    Http.send(timeEntry(id,desc,tag));

}
function getWorkSpace(tag,description){
    const Http = new XMLHttpRequest();
    const url="https://www.toggl.com/api/v8/workspaces";
    Http.open("GET", url);
    Http.onload = function () {
        if (Http.readyState == 4 && Http.status == "200") {
            var workSpaces = JSON.parse(Http.responseText);
            startTimeEntry(workSpaces[0].id,description,tag);
        } else {
            run.cancel();
        }
    }
    Http.send(null);
}
function stopCurrent(id){
    const Http = new XMLHttpRequest();
    const url="https://www.toggl.com/api/v8/time_entries/"+ id +"/stop";
    Http.open("PUT", url);
    Http.setRequestHeader("Content-Type", "application/json");
    Http.onload = function () {
        if (Http.readyState == 4 && Http.status == "200") {
            console.log("canceled");
        } else {
            run.cancel();
        }
    }
    Http.send(null);
}
function getCurrentRunning(){
    const Http = new XMLHttpRequest();
    const url="https://www.toggl.com/api/v8/time_entries/current";
    Http.open("GET", url);
    Http.onload = function () {
        if (Http.readyState == 4 && Http.status == "200") {
            var data = JSON.parse(Http.responseText);
            if(data.data != null){
                stopCurrent(data.data.id);
            }
        } else {
            run.cancel();
        }
    }
    Http.send(null);
}
function openInNewTab() {
    if(run.working){
        const Http = new XMLHttpRequest();
        const url="https://dog.ceo/api/breeds/image/random";
        Http.open("GET", url);
        Http.onload = function () {
            if (Http.readyState == 4 && Http.status == "200") {
                var dogs = JSON.parse(Http.responseText);
                var htmlCode = '<html><body>' + 
                                    '<h1>Click image!</h1>' +
                                    '<img id="image" src="' + dogs.message+'" onclick="image()"/>'+
                                    '<script language="javascript">function image(){'+
                                    'fetch("https://dog.ceo/api/breeds/image/random")' +
                                    '.then(function(response) {' +
                                        'return response.json();' +
                                    '})' +
                                    '.then(function(myJson) {' +
                                        'document.getElementById("image").src = myJson.message;' +
                                    '});' +
                                    '}</script>' +
                               '</body></html>';
                var url = "data:text/html," + encodeURIComponent(htmlCode);
                chrome.tabs.create({url: url});
            } else {
                console.log("sth went wrong");
            }
        }
        Http.send(null);
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.func == 1){
           sendResponse({working:run.working,work:run.workTime,short:run.shortPause,long:run.longPause,desc:run.description});
        }
        else if(request.func == 2){
            if(request.value == true){
                working = true;
                sendResponse({working:working});
                run.start();
            }
            else{
                working = false;
                sendResponse({working:working});
                run.stop();
            }
        }
        else if(request.func == 3){
            run.workTime = request.value;
            sendResponse({work:run.workTime});
        }
        else if(request.func == 4){
            run.shortPause = request.value;
            sendResponse({short:run.shortPause});

        }
        else if(request.func == 5){
            run.longPause = request.value;
            sendResponse({long:run.longPause});
        }
        else if(request.func == 6){
            run.description = request.value;
            sendResponse({desc:run.description});
        }
    }
);
