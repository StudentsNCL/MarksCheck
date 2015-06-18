var output;
var config;
onload = function() {
    var toggle = document.getElementById("toggle");
    output = document.getElementById("output");

    /**
     * Load previously saved config data
     */
    chrome.runtime.sendMessage({
        action: "opened"
    }, function(response) {
        if (response.config) {
            config = response.config;
            document.getElementById("student_no").value = config.student_no;
            document.getElementById("sechash").value = config.sechash;
            document.getElementById("stage").value = config.stage;
            document.getElementById("stage_1_year").value = config.stage_1_year;
            document.getElementById("delay").value = config.delay;
            document.getElementById("email").value = config.notifications.email;
            document.getElementById("slack_url").value = config.notifications.slack_url;
            document.getElementById("slack_user").value = config.notifications.slack_user;
        }

        if (response.running) {
            output.innerHTML = response.output;
            toggle.value = "Stop";
        }
    });

    toggle.onclick = function() {
        config = {
            student_no: document.getElementById("student_no").value,
            sechash: document.getElementById("sechash").value,
            stage: parseInt(document.getElementById("stage").value),
            stage_1_year: parseInt(document.getElementById("stage_1_year").value),
            delay: parseInt(document.getElementById("delay").value),
            notifications: {
                email: document.getElementById("email").value,
                server_email: "markscheck@localhost",
                slack_url: document.getElementById("slack_url").value,
                slack_user: document.getElementById("slack_user").value
            }
        }
        chrome.runtime.sendMessage({
            action: "toggle",
            config: config
        }, function(response) {
            if (response.running) {
                toggle.value = "Stop"
            } else {
                toggle.value = "Start"
            }

            output.innerHTML = response.output;
        });
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action == "run") {
            output.innerHTML = request.output;
        }
    });
}