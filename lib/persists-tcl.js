'use strict';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('./tclDomain.js');
var persistsLine = require("./persists/persists-line.js");
var persistsStop = require("./persists/persists-stop.js");
var persistsDirection = require("./persists/persists-direction.js");
var persistsFlashcode = require("./persists/persists-flashcode.js");
var persistsTimetable = require("./persists/persists-timetable.js");

(function () {
    var persists = {};
    persists.line = persistsLine;
    persists.flashcode = persistsFlashcode;
    persists.direction = persistsDirection;
    persists.stop = persistsStop;
    persists.timetable = persistsTimetable;
    module.exports = persists;
}());

