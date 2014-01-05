var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('../tclDomain.js');
var persistsLine = require('./persists-line.js');
var persistsStop = require('./persists-stop.js');
var persistsDirection = require('./persists-direction.js');
var persistsFlashcode = require('./persists-flashcode.js');

var persistsTimetable = {
    create: function (mydb, timetable, callback) {
        console.log("timetable.create");
        console.dir(timetable);

        mydb.serialize(function () {
            var stmt = mydb.prepare("INSERT INTO timetable (stop, line, direction, flashcode) VALUES ($stop, $line, $direction, $flashcode)");
            stmt.run({$stop: timetable.stop.id,
                     $line : timetable.line.id,
                     $direction : timetable.direction.id,
                     $flashcode : timetable.flashcode.id},
                     function (error) {
                    console.log("timetable.error :" + error);
                    timetable.id = this.lastID;
                    callback(error, timetable);
                });
            stmt.finalize();

        });
    },
    getByLineAndStopAndDirection : function (mydb, lineId, stopId, directionId, callback) {
        console.log("merge getByLineAndStopAndDirection");

        mydb.serialize(function () {
            mydb.get("SELECT rowid as id, line as lineId, stop as stopId, direction as directionId, flashcode as flashcodeId from timetable where line = $lineId and stop = $stopId and direction = $directionId",
                   {$lineId : lineId,
                    $stopId : stopId,
                    $directionId : directionId
                    },
                    function (error, row) {
                    var line,
                        stop,
                        direction,
                        flashcode,
                        timeTable;
                    if (row) {
                        line = domain.line();
                        stop = domain.stop();
                        direction = domain.direction();
                        flashcode = domain.flashcode();
                        timeTable = domain.timeTable();

                        line.id = row.lineId;
                        stop.id = row.stopId;
                        flashcode.id = row.flashcodeId;
                        direction.id = row.directionId;
                        timeTable.id = row.id;
                        timeTable.line = line;
                        timeTable.direction = direction;
                        timeTable.flashcode = flashcode;
                        timeTable.stop = stop;
                    }

                    callback(error, timeTable);
                });
        });

    },
    merge : function (mydb, timetable, mergeCallback) {
        console.log("merge time table");
        console.dir(timetable);
        async.waterfall([
            function (callback) {
                console.log("before timetable line.merge");
                console.dir(timetable);

                if (timetable.line) {
                    persistsLine.merge(mydb, timetable.line, function (err, rLine) {
                        timetable.line = rLine;
                        callback(err, timetable);
                    });
                } else {
                    callback('Aucune ligne definie', timetable);
                }

            },
            function (pTimetable, callback) {
                console.log("before timetable direction.merge");
                console.dir(timetable);

                if (pTimetable.direction) {
                    persistsDirection.merge(mydb, pTimetable.direction, function (err, rDirection) {
                        pTimetable.direction = rDirection;
                        callback(err, pTimetable);
                    });
                } else {
                    callback('Aucune direction definie', pTimetable);
                }
            },
            function (pTimetable, callback) {
                console.log("before timetable stop.merge");
                console.dir(timetable);

                if (pTimetable.stop) {
                    persistsStop.merge(mydb, pTimetable.stop, function (err, rStop) {
                        pTimetable.stop = rStop;
                        callback(err, pTimetable);
                    });
                } else {
                    callback('Aucun stop definie', pTimetable);
                }
            },
            function (pTimetable, callback) {
                console.log("before timetable flashcode.merge");
                console.dir(timetable);

                if (pTimetable.flashcode) {
                    persistsFlashcode.merge(mydb, pTimetable.flashcode, function (err, rFlashcode) {
                        pTimetable.flashcode = rFlashcode;
                        callback(err, pTimetable);
                    });
                } else {
                    callback('Aucun flashcode definie', pTimetable);
                }
            },
            function (pTimetable, callback) {
                console.log("before timetable timetable.getById");
                console.dir(timetable);

                if (pTimetable.id) {
                    persistsTimetable.getById(mydb, pTimetable.id, function (err, rTimetable) {
                        if (rTimetable) {
                            callback(err, rTimetable);
                        } else {
                            callback(err, pTimetable);
                        }
                    });
                } else {
                    callback(null, pTimetable);
                }
            },
            function (pTimetable, callback) {
                console.log("before timetable timetable.getByLineAndStopAndDirection");
                console.dir(timetable);

                if (pTimetable.id) {
                    callback(null, pTimetable);
                } else {
                    persistsTimetable.getByLineAndStopAndDirection(mydb, pTimetable.line.id, pTimetable.stop.id, pTimetable.flashcode.id, function (err, rTimetable) {
                        if (rTimetable) {
                            callback(err, rTimetable);
                        } else {
                            callback(err, pTimetable);
                        }

                    });
                }
            },
            function (pTimetable, callback) {
                console.log("before timetable timetable.create");
                console.dir(timetable);

                if (pTimetable.id) {
                    callback(null, pTimetable);
                } else {
                    persistsTimetable.create(mydb, pTimetable, function (err, rTimetable) {
                        callback(err, rTimetable);
                    });
                }
            }

        ],
            function (err, result) {
                console.log("fin merge timetable");
                console.dir(result);
                console.dir(err);
                mergeCallback(err, result);
            });

    },
    getById : function (mydb, id, callback) {
        console.log("timetable.getById");
        console.dir(id);

        mydb.serialize(function () {
            mydb.get("SELECT rowid as id, line as lineId, stop as stopId, direction as direstionId, flashcode as flashcodeId from timetable where id = $id", {$id : id}, function (error, row) {
                var line,
                    stop,
                    direction,
                    flashcode,
                    timeTable;
                if (row) {
                    line = domain.line();
                    stop = domain.stop();
                    direction = domain.direction();
                    flashcode = domain.flashcode();
                    timeTable = domain.timeTable();
                    line.id = row.lineId;
                    stop.id = row.stopId;
                    flashcode.id = row.flashcodeId;
                    direction.id = row.directionId;
                    timeTable.id = row.id;
                    timeTable.line = line;
                    timeTable.direction = direction;
                    timeTable.flashcode = flashcode;
                    timeTable.stop = stop;
                }


                callback(error, timeTable);
            });
        });
    }

};

module.exports = persistsTimetable;