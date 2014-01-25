/**
 * Created by dominique on 05/01/14.
 */
'use strict';
var persists = require('../lib/persists-tcl.js');
var sqlite3 = require('sqlite3').verbose();
var async = require('async');

var computeRange = function (page, pageSize) {
    var range = {},
        offset,
        pageSize;
    offset = (page-1) * pageSize ;

    range.offset = offset;
    range.pageSize = pageSize;
    return range;
};


var errHandler = function (e) {
    if (e) {
        console.dir(e);
        console.log(e.stack);
        console.log("Got error: " + e.message);

    }
};

exports.timetables_json = function(req,res) {
    var lineId = req.query.line;
    var directionId = req.query.direction;
    var stopId = req.query.stop;
    var page, pageSize, range = {};
    var db = new sqlite3.cached.Database('tcl2.db');
    var criteria = {};
    var responseCallback = function(err, results) {
        if (err) {
            errHandler(err);
        } else {
            var timetables = results[1];
            var count = results[0];
            var toSend = {
                total: count,
                data: timetables
            };
            res.json(toSend);
        }
    };


    page = parseInt(req.query.page, 10)||1;
    pageSize = parseInt(req.query.pageSize, 10)||10;

    range = computeRange(page, pageSize);

    criteria.lineId = lineId;
    criteria.directionId = directionId;
    criteria.stopId = stopId;

        //persists.timetable.getByCriteria(db, lineId, directionId, stopId, responseCallback);
        async.parallel(
            [
                function (callback) {
                    console.log("series1");
                    persists.timetable.countAll(db, criteria, callback);
                },
                function (callback) {
                    console.log("series2");
                    persists.timetable.getAll(db, criteria, range,  callback);
                }
            ],
            responseCallback
        );
};


