var fs = require('fs');
var marksCheck = require('./marksCheck');

/**
 * Load config file
 */
var config = {};
if (fs.existsSync('config.json')) {
    var file = fs.readFileSync('config.json', 'utf8');
    config = JSON.parse(file);
}
else {
    console.warn("No config file found - Exiting");
    process.exit(1);
}

var count = 0;

function run() {
    count++;
    var d = new Date();
    console.log(d + ": Run " + count);
    marksCheck.checkMarks(config);

    setTimeout(run, config.delay * 1000 * 60);
}

run()
