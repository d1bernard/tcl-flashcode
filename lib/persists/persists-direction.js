var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('../tclDomain.js');
var persistsLine = require('./persists-line.js');
var persistsStop = require('./persists-stop.js');


var rowToDirection = function (row, callback) {
    var err, line, stop, direction;
    if (row) {
        line = domain.line();
        stop = domain.stop();
        line.id = row.lineId;
        line.type = row.lineType;
        line.number = row.lineLine;
        stop.id = row.terminusId;
        stop.name = row.stopName;
        direction = domain.direction();
        direction.line = line;
        direction.terminus = stop;
        direction.id = row.directionId;
    } else {
        err = "No row define";
    }
    callback(err,direction);
    
};


var persistsDirection = {
    create: function (mydb, direction, callback) {
        console.log("create direction");
        console.dir(direction);

        mydb.serialize(function () {
            var stmt = mydb.prepare("INSERT INTO direction (line, terminus) VALUES ($line, $terminus)");
            stmt.run({$line: direction.line.id, $terminus: direction.terminus.id}, function (error) {
                console.log("directioncallback.error :" + error);
                direction.id = this.lastID;
                callback(error, direction);
            });
            stmt.finalize();

        });
    },
    getById : function (mydb, id, callback) {
        console.log("getById direction");
        console.dir(id);
        mydb.serialize(function () {
            mydb.get("SELECT rowid as id, line as lineId, terminus as terminusId from direction where id = $id", {$id : id}, function (error, row) {
                console.log("getById.error :" + error);
                var line,
                    terminus,
                    direction;
                if (row) {
                    line = domain.line();
                    terminus = domain.stop();
                    direction = domain.direction();

                    direction.id = row.id;
                    line.id = row.lineId;
                    terminus.id = row.terminusId;
                    direction.terminus = terminus;
                    direction.line = line;
                }
                callback(error, direction);
            });
        });

    },
    getByTerminusAndLine : function (mydb, terminusId, lineId, callback) {
        console.log("getByTerminusAndLine direction");
        console.dir({terminusid : terminusId, lineId :  lineId});

        mydb.serialize(function () {
            mydb.get("SELECT rowid as id, line as lineId, terminus as terminusId from direction where terminus = $terminusId and line = $lineId",
                        {$terminusId : terminusId, $lineId : lineId}, 
                        function (error, row) {
                            console.log("getByTerminusAndLine.error :" + error);
                            var line,
                                terminus,
                                direction;
                            if (row) {
                                line = domain.line();
                                terminus = domain.stop();
                                direction = domain.direction();
                                direction.id = row.id;
                            
                                line.id = row.lineId;
                                terminus.id = row.terminusId;
                            
                                direction.terminus = terminus;
                                direction.line = line;
                            }
                            callback(error, direction);
                        });
        });

    },
    getAll : function (mydb, callback) {
        mydb.serialize(function () {
            mydb.all("SELECT direction.id as directionId, direction.line as lineId, direction.terminus as terminusId, " +
                    "stop.name as stopName, line.type as lineType, line.line as lineLine " +
                    "from direction " +
                    "join line on direction.line =  line.id " +
                    "join stop on direction.terminus =  stop.id " +
                    " order by stop.name ", function (error, rows) {
                async.mapSeries(rows,rowToDirection,function (err,results) {
                    error = error||err;
                    callback(error, results);    
                });
            });
        });
    },
    getByLineId : function (mydb, lineId, callback) {
        mydb.serialize(function () {
            var query = "SELECT direction.id as directionId, direction.line as lineId, direction.terminus as terminusId, " +
                        "stop.name as stopName, line.type as lineType, line.line as lineLine " +
                        "from direction " +
                        "join line on direction.line =  line.id " +
                        "join stop on direction.terminus =  stop.id " +
                        "where direction.line = $lineId " +
                        " order by stop.name ";
            mydb.all(query, {$lineId : lineId}, function (error, rows) {
                async.mapSeries(rows,rowToDirection,function (err,results) {
                    error = error||err;
                    callback(error, results);    
                });
            });
        });
    },
    merge : function (mydb, direction, mergeCallback) {
        console.log("merge direction");
        console.dir(direction);

        async.waterfall([
            function (callback) {
                console.log("before merge line");
                console.dir(direction);

                if (direction.line) {
                    persistsLine.merge(mydb, direction.line, function (err, rLine) {
                        direction.line = rLine;
                        callback(err, direction);
                    });
                } else {
                    callback('Aucune ligne definie', direction);
                }

            },
            function (pDirection, callback) {
                console.log("before merge terminus");
                console.dir(pDirection);

                if (pDirection.terminus) {
                    persistsStop.merge(mydb, pDirection.terminus, function (err, rStop) {
                        pDirection.terminus = rStop;
                        callback(err, pDirection);
                    });
                } else {
                    callback('Aucun terminus definie', pDirection);
                }
            },
            function (pDirection, callback) {
                console.log("before direction getById");
                console.dir(pDirection);

                if (pDirection.id) {
                    persistsDirection.getById(mydb, pDirection.id, function (err, rDirection) {
                        if (rDirection) {
                            callback(err, rDirection);
                        } else {
                            callback(err, pDirection);
                        }

                        callback(err, rDirection);
                    });
                } else {
                    callback(null, pDirection);
                }
            },
            function (pDirection, callback) {
                console.log("before direction getByTerminusAndLine");
                console.dir(pDirection);

                if (pDirection.id) {
                    callback(null, pDirection);
                } else {
                    persistsDirection.getByTerminusAndLine(mydb, pDirection.terminus.id, pDirection.line.id, function (err, rDirection) {
                        if (rDirection) {
                            callback(err, rDirection);
                        } else {
                            callback(err, pDirection);
                        }
                    });
                }
            },
            function (pDirection, callback) {
                console.log("before create direction");
                console.dir(pDirection);

                if (pDirection.id) {
                    callback(null, pDirection);
                } else {
                    persistsDirection.create(mydb, direction, function (err, rDirection) {
                        callback(err, rDirection);
                    });
                }
            }

        ],
            function (err, result) {

                console.log("fin merge direction");
                console.dir(result);
                console.dir(err);
                mergeCallback(err, result);
            });
    }

};


module.exports = persistsDirection;