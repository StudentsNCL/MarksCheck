var marksCheck = require('../marksCheck');
var running = false;
var outputText = "";
var timeout;

var output;
var config;

onload = function() {
    var toggle = document.getElementById("toggle");
    output = document.getElementById("output");
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action == "opened") {
            chrome.storage.sync.get('config', function(result) {
                config = result.config;
                sendResponse({
                    config: result.config,
                    running: running,
                    output: outputText
                }, function() {});
            });
            return true;
        } else if (request.action == "toggle") {
            config = request.config;
            if (!config.delay)
                config.delay = 5;

            chrome.storage.sync.set({
                'config': config
            }, function() {
                outputText += "<br />Config Saved";
            });

            if (!running) {
                running = true;
                outputText += "<br />Started";
                run();
            } else {
                running = false;
                outputText += "<br />Stopped";
                clearTimeout(timeout);
            }

            sendResponse({
                running: running,
                output: outputText
            });

        }
    });
}




var count = 0;

function run() {
    count++;
    var d = new Date();
    outputText += "<br />" + d + ": Run " + count;
    console.log(d + ": Run " + count);
    marksCheck.checkMarks(config, function(result) {
        if (result.length) {
            var items = [];
            result.forEach(function(module) {
                var item = {
                    title: module.name.split(" - ")[0],
                    message: module.finalMark + " - " + module.decision
                }

                items.push(item);
            });

            outputText += "<br />Marks Released!<br />";
            outputText += JSON.stringify(result);
            chrome.notifications.create("results", {
                type: 'list',
                iconUrl: 'icon.png',
                title: 'Marks Have Been Released!',
                message: "The following marks have been released",
                items: items
            });

            chrome.runtime.sendMessage({
                action: "run",
                output: outputText
            });
        }
    });

    chrome.runtime.sendMessage({
        action: "run",
        output: outputText
    });

    timeout = setTimeout(run, config.delay * 1000 * 60);
}
