var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('../tclDomain.js');

var persistsLine = {
                create : function (mydb, line, callback) {
                    mydb.serialize(function () {
                        var stmt = mydb.prepare("INSERT INTO line (line, type) VALUES ($line, $type)");
                        stmt.run({$line : line.number, $type : line.type}, function (error) {
                            console.log("linecallback.error :" + error);
                            line.id = this.lastID;
                            callback(error, line);
                        });
                        stmt.finalize();
                    });
                },
                getAll : function (mydb, callback) {
                    mydb.serialize(function () {
                        mydb.all("SELECT rowid as id,line,type from line order by type, line", function (error, rows) {
                            var rowToLine = function (row, callback) {
                                var err,line;
                                if (row) {
                                    line = domain.line();
                                    line.id = row.id;
                                    line.type = row.type;
                                    line.number = row.line;
                                } else {
                                    err = "No row define";
                                }
                                callback(err,line);
                                
                            };
                            async.mapSeries(rows,rowToLine,function (err,results) {
                                error = error||err;
                                callback(error, results);    
                            });
                        });
                    });
                },
                getByNumber : function (mydb, lineNumber, callback) {
                    mydb.serialize(function () {
                        mydb.get("SELECT rowid as id,line,type from line where line = $line", {$line : lineNumber}, function (error, row) {
                            var line;
                            if (row) {
                                line = domain.line();
                                line.id = row.id;
                                line.type = row.type;
                                line.number = row.line;
                            }
    
                            callback(error, line);
                        });
                    });
    
                },
                
                getById : function (mydb, lineId, callback) {
                    mydb.serialize(function () {
                        mydb.get("SELECT rowid as id,line,type from line where line = $id", {$id : lineId}, function (error, row) {
    
                            var line;
                            if (row) {
                                line = domain.line();
                                line.id = row.id;
                                line.type = row.type;
                                line.number = row.line;
                            }
    
                            callback(error, line);
                        });
                    });
    
                },
                merge : function (mydb, line, mergeCallback) {
                    console.log("merge line");
                    console.dir(line);
    
                    async.waterfall([
                        function (callback) {
                            if (line.id) {
                                persistsLine.getById(mydb, line.id, function (err, rLine) {
                                    if (rLine) {
                                        callback(err, rLine);
                                    } else {
                                        callback(err, line);
                                    }
                                });
                            } else {
                                callback(null, line);
                            }
    
                        },
                        function (pLine, callback) {
                            console.log("before getByNumber line");
                            console.dir(pLine);
    
                            if (pLine && pLine.id) {
                                callback(null, pLine);
                            } else {
                                persistsLine.getByNumber(mydb, pLine.number, function (err, rLine) {
                                    if (rLine) {
                                        callback(err, rLine);
                                    } else {
                                        callback(err, line);
                                    }
                                });
    
    
                            }
                        },
                        function (pLine, callback) {
                            if (pLine.id) {
                                callback(null, pLine);
                            } else {
                                persistsLine.create(mydb, pLine, function (err, rLine) {
                                    callback(err, rLine);
                                });
                            }
                        }
                    ],
                        function (err, result) {
                            console.log("fin merge line");
                            console.dir(err);
                            console.dir(err);
    
                            mergeCallback(err, result);
                        });
                }
};

module.exports = persistsLine;