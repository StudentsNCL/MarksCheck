var request = require('request');
var cheerio = require('cheerio');
var gcm = require('node-gcm');
var nodemailer = require('nodemailer');
var Slack = require('node-slack');

var config;
var previous = [];

var count = 0;

module.exports.checkMarks = function checkMarks(options, callback) {
    config = options;
    var URL = "https://ness.ncl.ac.uk/student/assessmentSummary/stageSummary.php?source=2&sechash="
            + config.sechash + "&studentnumber=" + config.student_no + "&reportyear="
            + (config.stage_1_year + (config.stage - 1)) + "&reportstage=" + config.stage;
    count++;
    request(URL, function(error, response, html){

        if (!error){
            var $ = cheerio.load(html);

            var modules = [];

            $("#report-results-container tr").each(function() {
                var row = $(this).children();

                var module = {
                    name:        $(row[0]).text().trim(),
                    credits:     $(row[1]).text().trim(),
                    year:        $(row[2]).text().trim(),
                    attempt:     $(row[3]).text().trim(),
                    attemptMark: $(row[4]).text().trim(),
                    finalMark:   $(row[5]).text().trim(),
                    decision:    $(row[6]).text().trim(),
                    attendance:  $(row[7]).text().trim(),
                };

                modules.push(module);

            });

            var changed = [];

            for (var i = 0; i < previous.length; i++) {
                var old = previous[i];
                var current = modules[i];

                /**
                 * Check if a mark has changed or been released
                 */
                if (current && old.finalMark != current.finalMark) {
                    changed.push(current);
                }
            }

            /**
             * Check if any marks have changed
             */
            if (changed.length) {
                console.log("Modules changed");
                console.log(changed);

                if (config.notifications.gcm_key && config.notifications.gcm_regid)
                    notifyGCM();

                if (config.notifications.email)
                    notifyEmail(changed);

                if (config.notifications.slack_url)
                    notifySlack(changed);

            }

            if (typeof callback === 'function')
                callback(changed);

            previous = modules;
        }
        else {
            console.log("An error occured when connecting");
            console.log(error);
        }
    });
}

function notifyGCM() {
    /**
     * Send message using Google Cloud Messaging service (GCM)
     */

    console.log("Sending GCM Message");
    var message = new gcm.Message();
    message.addData("info", "Marks have been released");


    /**
     * GCM API KEY
     */
    var sender = new gcm.Sender(config.notifications.gcm_key);

    /**
     * Send the message to each device via GCM
     */
    sender.send(message, [config.notifications.gcm_regid]);


}

function notifyEmail(changed) {
    var message = '<h1>Module marks have just been released or updated</h1><br /><p>The following marks have changed or been released:</p><table style="width:100%"><thead><tr style="margin-bottom:5px"><th>Module</th><th>Mark</th><th>Decision</th></tr></thead>';
    changed.forEach(function(module) {
        message += "<tr><td>" + module.name + "</td><td>" + module.finalMark + "</td><td>" + module.decision + "</td></tr>";
    });
    console.log("Sending email");
    var transporter = nodemailer.createTransport();
    transporter.sendMail({
        from: "Marks Check <" + config.notifications.server_email + ">",
        to: config.notifications.email,
        subject: "A mark has been released or changed",
        html: message
    },
    function(error, info){
        if (error) {
            var d = new Date();
            console.log(d + " - error sending email");
            console.log(error);
        }
    });
}

function notifySlack(changed) {
    var slack = new Slack(config.notifications.slack_url, {});

    var text = "*Marks have been released*\n";
    changed.forEach(function(module) {
        text += "\n" + module.name + " - *" + module.finalMark + "* (" + module.decision + ")";
    });
    console.log("Sending slack message");

    slack.send({
        text: text,
        channel: config.notifications.slack_user,
        username: "MarksCheck"
    });
}


