var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('../tclDomain.js');


var rowToStop = function (row, callback) {
    var err, stop;
    if (row) {
        stop = domain.stop();
        stop.id = row.stopId;
        stop.name = row.stopName;
    } else {
        err = "No row define";
    }
    callback(err,stop);
};

var persistsStop = {
    create: function (mydb, stop, callback) {
        console.log("create stop");
        console.dir(stop);

        mydb.serialize(function () {
            var stmt = mydb.prepare("INSERT INTO stop (name) VALUES ($name)");
            stmt.run({$name : stop.name}, function (error) {
                console.log("stop.error :" + error);
                stop.id = this.lastID;
                callback(error, stop);
            });
            stmt.finalize();

        });
    },
    getById : function (mydb, id, callback) {
        console.log("getById stop");
        console.dir(id);

        mydb.serialize(function () {
            mydb.get("SELECT rowid as id, name from stop where id = $id", {$id : id}, function (error, row) {
                var stop;
                if (row) {
                    stop = domain.stop();
                    stop.id = row.id;
                    stop.name = row.name;
                }
                callback(error, stop);
            });
        });
    },
    getByName : function (mydb, name, callback) {
        console.log("getByName stop");
        console.dir(name);

        mydb.serialize(function () {
            mydb.get("SELECT rowid as id, name from stop where name = $name", {$name : name}, function (error, row) {
                var stop;
                if (row) {
                    stop = domain.stop();
                    stop.id = row.id;
                    stop.name = row.name;
                }
                callback(error, stop);
            });
        });
    },
    getByLineId : function (mydb, lineId, callback) {
        mydb.serialize(function () {
            var query = "select id as stopId, name as stopName " +
                        "from stop " +
                        "where exists (" +
                        "       select 1 " +
                        "       from timetable " +
                        "       where stop.id = timetable.stop " +
                        "         and timetable.line = $lineId" +
                        ") " +
                        "order by stop.name";
            mydb.all(query, {$lineId : lineId}, function (error, rows) {
                async.mapSeries(rows, rowToStop, function (err,results) {
                    error = error||err;
                    callback(error, results);    
                });
            });
        });
    },
    getByLineIdAndDirectionId : function (mydb, lineId, directionId, callback) {
        mydb.serialize(function () {
            var query = "select id as stopId, name as stopName " +
                        "from stop " +
                        "where exists (" +
                        "       select 1 " +
                        "       from timetable " +
                        "       where stop.id = timetable.stop " +
                        "         and timetable.line = $lineId" +
                        "         and timetable.direction = $directionId" +
                        ") " +
                        "order by stop.name";
            mydb.all(query, {$lineId : lineId, $directionId : directionId}, function (error, rows) {
                async.mapSeries(rows, rowToStop, function (err,results) {
                    error = error||err;
                    callback(error, results);    
                });
            });
        });
    },
    getAll : function (mydb, lineId, directionId, callback) {
        mydb.serialize(function () {
            var query = "select id as stopId, name as stopName " +
                        "from stop " +
                        "order by stop.name";
            mydb.all(query, function (error, rows) {
                async.mapSeries(rows, rowToStop, function (err,results) {
                    error = error||err;
                    callback(error, results);    
                });
            });
        });
    },
    merge : function (mydb, stop, mergeCallback) {
        console.log("merge stop");
        console.dir(stop);

        async.waterfall([
            function (callback) {
                console.log("before stop.getById");
                console.dir(stop);

                if (stop.id) {
                    persistsStop.getById(mydb, stop.id, function (err, rStop) {
                        if (rStop) {
                            callback(err, rStop);
                        } else {
                            callback(err, stop);
                        }
                    });
                } else {
                    callback(null, stop);
                }

            },
            function (pStop, callback) {
                console.log("before stop.getByName");
                console.dir(stop);

                if (pStop.id) {
                    callback(null, pStop);
                } else {
                    persistsStop.getByName(mydb, pStop.name, function (err, rStop) {
                        if (rStop) {
                            callback(err, rStop);
                        } else {
                            callback(err, pStop);
                        }
                    });
                }
            },
            function (pStop, callback) {
                console.log("before stop.create");
                console.dir(stop);

                if (pStop.id) {
                    callback(null, pStop);
                } else {
                    persistsStop.create(mydb, pStop, function (err, rStop) {
                        callback(err, rStop);
                    });
                }
            }
        ],
            function (err, result) {
                console.log("fin merge stop");
                console.dir(result);
                console.dir(err);
                mergeCallback(err, result);
            });
    }
};

module.exports = persistsStop;