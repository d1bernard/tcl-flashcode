'use strict';
var persists = require('../lib/persists-tcl.js');
var sqlite3 = require('sqlite3').verbose();



var errHandler = function (e) {
    if (e) {
        console.dir(e);
        console.log(e.stack);
        console.log("Got error: " + e.message);
        
    }
};

/*
 * Get line as json
 */

exports.lines_json = function(req,res) {
    var db = new sqlite3.cached.Database('tcl.db');
    var responseCallback = function(err, lines) {
        if (err) {
            errHandler(err);
        } else {
            res.json(lines);
        }
        
    };
    persists.line.getAll(db, responseCallback);
    
};