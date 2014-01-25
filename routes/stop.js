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

exports.stopsByLineAndDir_json = function(req,res) {    
    var lineId = req.params.lineId;
    var directionId = req.params.directionId;
    var db = new sqlite3.cached.Database('tcl2.db');
    var responseCallback = function(err, stops) {
        if (err) {
            errHandler(err);
        } else {
            res.json(stops);
        }
        
    };
    if (lineId && directionId) {
        persists.stop.getByLineIdAndDirectionId(db, lineId, directionId, responseCallback);
    } else if (lineId) {
        persists.stop.getByLineId(db, lineId, responseCallback);
    } else {
        persists.stop.getAll(db, responseCallback);
    }
};