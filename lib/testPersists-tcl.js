'use strict';
var persists = require('./persists-tcl.js');
var util = require('util');
var domain = require('./tclDomain.js');
var async = require('async');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');

var myLine1 = domain.line();
var myLine2 = domain.line();
var flashcode = {url: 'testurl', urlid: 5};
var err;
var flashCodeId;
var lineId;
myLine1.number = 'C23';
myLine1.type = 'bus';
myLine2.number = 'C23';
myLine2.type = 'bus';



async.series([
    function (callback) {
        console.log('serie1');
        persists.line.merge(db, myLine1, callback);
        console.log('fin serie1');
    },
    function (callback) {
        console.log('serie3');
        persists.line.merge(db, myLine1, callback);
        console.log('fin serie3');
    }],
    function (err, results) {
        console.log('serie2');
        console.log('error : ' + err);
      
        console.log("results :" + util.inspect(results, {showHidden: true, depth: 5}));
//        persists.line.merge(db, myLine2, function (error, line) {
//            console.log("line :" + util.inspect(line, {showHidden: true, depth: 5}));
//        });
        console.log('fin serie2');
//        persists.flashcode.create(db, flashcode, function (error, id) {
//            console.log("flashCodeId :" + id);
//        });
    });

