'use strict';
var http = require('http');
var util = require('util');
var async = require('async');
var sqlite3 = require('sqlite3').verbose();
var tclFlowParser = require('./lib/parseTclFlashCode.js');
var persists = require('./lib/persists-tcl.js');
var domain = require('./lib/tclDomain.js');
var argv = require('optimist')
    .usage('Usage: $0 --min [num] --max [num]')
    .default({min: 1, max: 10000})
    .argv;

var db = new sqlite3.cached.Database('tcl2.db');
var url,
    i = 0,
    req,
    reqHandler,
    errHandler;
var errHandler = function (e) {
    if (e) {
        console.dir(e);
        console.log(e.stack);
        console.log("Got error: " + e.message);
        
    }
};
var saveTimeTable = function (timetable, callback) {
    persists.timetable.merge(db, timetable, callback);
};
var reqHandler = function (flashcodeUrl) {
    var respHandler;
    respHandler = function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data = data + chunk;
        });
        res.on('end', function () {
            tclFlowParser.parse(flashcodeUrl, data, function (err, flashcode) {
                console.log('flashcode :' + util.inspect(flashcode, {showHidden: true, depth: 5}));
                if (flashcode.timeTables) {
                	async.eachSeries(flashcode.timeTables, saveTimeTable, errHandler);
                }
            });
        });
    };
    return respHandler;
};

for (i = argv.min; i < argv.max; i = i + 1) {
    url = "http://m.tcl.fr/flashcode/flashcode.do?code=" + i;
    req = http.get(url, reqHandler(url));
    req.on('error', errHandler);
    req.end();
    
    
}

