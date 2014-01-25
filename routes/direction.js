var persists = require('../lib/persists-tcl.js');
var sqlite3 = require('sqlite3').verbose();


/*
 * Get line as json
 */

exports.directionsByLine_json = function(req,res) {
    var lineId = req.params.id;
    var db = new sqlite3.cached.Database('tcl2.db');
    var responseCallback = function(err, directions) {
        if (err) {
            errHandler(err);
        } else {
            res.json(directions);
        }
        
    };
    if (lineId) {
        persists.direction.getByLineId(db, lineId, responseCallback);
    } else {
        persists.direction.getAll(db, responseCallback);
    }
};