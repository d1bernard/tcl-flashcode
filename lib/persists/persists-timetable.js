var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('../tclDomain.js');
var persistsLine = require('./persists-line.js');
var persistsStop = require('./persists-stop.js');
var persistsDirection = require('./persists-direction.js');
var persistsFlashcode = require('./persists-flashcode.js');


var rowToTimetable = function (row, callback) {
    var err, stop, direction, line, flashcode, timetable, terminus;
    if (row) {
        stop = domain.stop();
        direction = domain.direction();
        line = domain.line();
        flashcode = domain.flashcode();
        timetable = domain.timeTable();

        stop.id = row.stopId;
        stop.name = row.stopName;

        line.id = row.lineId;
        line.number = row.lineNumber;
        line.type = row.lineType;

        terminus = domain.stop();

        terminus.id = row.terminusId;
        terminus.name = row.terminusName;

        direction.id = row.directionId;
        direction.line = line;
        direction.terminus = terminus;

        flashcode.id = row.flashcodeId;
        flashcode.url = row.flashcodeUrl;
        flashcode.urlid = row.flashcodeUrlid;

        timetable.id =
        timetable.stop = stop;
        timetable.direction = direction;
        timetable.line = line;
        timetable.flashcode = flashcode;
    } else {
        err = "No row define";
    }
    callback(err, timetable);
};


var querySelectAll = "select timetable.id as timetableId, " +
    "line.id as lineId, line.line as lineNumber, line.type as lineType, " +
    "direction.id as directionId, direction.line as directionLine, direction.terminus as directionStop, " +
    "flashcode.id as flashcodeId, flashcode.url as flashcodeUrl, flashcode.urlid as flashcodeUrlid, " +
    "terminus.id as terminusId, terminus.name as terminusName, "+
    "stop.id as stopId, stop.name as stopName " +
    "from timetable " +
    "join stop on timetable.stop = stop.id " +
    "join line on timetable.line = line.id " +
    "join direction on timetable.direction = direction.id " +
    "join stop terminus on direction.terminus = terminus.id " +
    "join flashcode on timetable.flashcode = flashcode.id ";
var orderByAll = "order by stop.name ";
var limitClause = "limit $offset,$pageSize ";
var countClause = "select count(*) as total from ($query)";
var whereClause = "where ";
var andClause = "and "

var buildSelectAllQuery = function (criteria) {
    var query = querySelectAll;
    var sepClause = whereClause;
    var queryCriteria = {};
    var selectAllObeject = {};
    if (criteria && criteria.lineId) {
        query = query + sepClause + " line.id=$lineId "
        queryCriteria.$lineId = criteria.lineId;
        sepClause = andClause;
    }
    if (criteria && criteria.stopId) {
        query = query + sepClause + " stop.id=$stopId "
        queryCriteria.$stopId = criteria.stopId;
        sepClause = andClause;
    }
    if (criteria && criteria.directionId) {
        query = query + sepClause + " direction.id=$directionId "
        queryCriteria.$directionId = criteria.directionId;
        sepClause = andClause;
    }
    selectAllObeject.query = query;
    selectAllObeject.data = queryCriteria;
    return selectAllObeject;
}

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
    countAll : function (mydb, criteria, callback) {
        mydb.serialize(function () {
            var queryCriteria={};
            var selectQueryObject = buildSelectAllQuery(criteria);
            var query = countClause.replace("$query",selectQueryObject.query);
            console.log('into persists-timetable.countAll');
            mydb.get(query, selectQueryObject.data, function (error, row) {
                var count=row.total;
                callback(error, count);
            });
        });
    },
    getAll : function (mydb, criteria, range, callback) {
        console.log('into persists-timetable.getAll');
        mydb.serialize(function () {
            var queryCriteria={};
            var selectQueryObject = buildSelectAllQuery(criteria);
            var query = selectQueryObject.query +orderByAll+limitClause;
            queryCriteria = selectQueryObject.data;
            queryCriteria.$offset = range.offset;
            queryCriteria.$pageSize = range.pageSize;

            mydb.all(query, queryCriteria, function (error, rows) {
                async.mapSeries(rows, rowToTimetable, function (err,results) {
                    error = error||err;
                    callback(error, results);
                });
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