'use strict';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('./tclDomain.js');

(function () {
    var persists = {},
        mLine = {
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
                            persists.line.getById(mydb, line.id, function (err, rLine) {
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
                            persists.line.getByNumber(mydb, pLine.number, function (err, rLine) {
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
                            persists.line.create(mydb, pLine, function (err, rLine) {
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
        },
        mFlashcode = {
            create: function (mydb, flashcode, callback) {
                console.log("create flashcode");
                console.dir(flashcode);

                mydb.serialize(function () {
                    var stmt = mydb.prepare("INSERT INTO flashcode (url,urlid) VALUES ($url,$urlid)");

                    stmt.run({$url: flashcode.url, $urlid: flashcode.urlid}, function (error) {
                        console.log("flashcodecallback.error :" + error);
                        flashcode.id = this.lastID;
                        callback(error, flashcode);
                    });
                    stmt.finalize();

                });
            },
            getById : function (mydb, id, callback) {
                console.log("getById flashcode");
                console.dir(id);

                mydb.serialize(function () {
                    mydb.get("SELECT rowid as id, url, urlid from flashcode where id = $id", {$id : id}, function (error, row) {
                        var flashcode;
                        if (row) {
                            flashcode = domain.flashcode();
                            flashcode.id = row.id;
                            flashcode.url = row.url;
                            flashcode.urlid = row.urlid;
                        }
                        callback(error, flashcode);
                    });
                });
            },
            getByUrl : function (mydb, url, callback) {
                console.log("getByUrl flashcode");
                console.dir(url);

                mydb.serialize(function () {
                    mydb.get("SELECT rowid as id, url, urlid from flashcode where url = $url", {$url : url}, function (error, row) {
                        var flashcode;
                        if (row) {
                            flashcode = domain.flashcode();
                            flashcode.id = row.id;
                            flashcode.url = row.url;
                            flashcode.urlid = row.urlid;
                        }
                        callback(error, flashcode);
                    });
                });
            },
            merge : function (mydb, flashcode, mergeCallback) {
                console.log("merge flashcode");
                console.dir(flashcode);
                async.waterfall([
                    function (callback) {
                        if (flashcode.id) {
                            persists.flashcode.getById(mydb, flashcode.id, function (err, rFlashcode) {
                                if (rFlashcode) {
                                    callback(err, rFlashcode);
                                } else {
                                    callback(err, flashcode);
                                }
                            });
                        } else {
                            callback(null, flashcode);
                        }

                    },
                    function (pFlashcode, callback) {
                        if (pFlashcode.id) {
                            callback(null, pFlashcode);
                        } else {
                            persists.flashcode.getByUrl(mydb, pFlashcode.url, function (err, rFlashcode) {
                                if (rFlashcode) {
                                    callback(err, rFlashcode);
                                } else {
                                    callback(err, pFlashcode);
                                }

                            });


                        }
                    },
                    function (pFlashcode, callback) {
                        if (pFlashcode.id) {
                            callback(null, pFlashcode);
                        } else {
                            persists.flashcode.create(mydb, pFlashcode, function (err, rFlashcode) {
                                callback(err, rFlashcode);
                            });
                        }
                    }
                ],
                    function (err, result) {
                        console.log("fin merge flashcode");
                        console.dir(err);

                        console.dir(err);
                        mergeCallback(err, result);
                    });
            }
        },
        mDirection = {
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
                    mydb.get("SELECT rowid as id, line as lineId, terminus as terminusId from direction where terminus = $terminusId and line = $lineId", {$terminusId : terminusId, $lineId : lineId}, function (error, row) {
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
            merge : function (mydb, direction, mergeCallback) {
                console.log("merge direction");
                console.dir(direction);

                async.waterfall([
                    function (callback) {
                        console.log("before merge line");
                        console.dir(direction);

                        if (direction.line) {
                            persists.line.merge(mydb, direction.line, function (err, rLine) {
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
                            persists.stop.merge(mydb, pDirection.terminus, function (err, rStop) {
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
                            persists.direction.getById(mydb, pDirection.id, function (err, rDirection) {
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
                            persists.direction.getByTerminusAndLine(mydb, pDirection.terminus.id, pDirection.line.id, function (err, rDirection) {
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
                            persists.direction.create(mydb, direction, function (err, rDirection) {
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

        },
        mStop = {
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
            merge : function (mydb, stop, mergeCallback) {
                console.log("merge stop");
                console.dir(stop);

                async.waterfall([
                    function (callback) {
                        console.log("before stop.getById");
                        console.dir(stop);

                        if (stop.id) {
                            persists.stop.getById(mydb, stop.id, function (err, rStop) {
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
                            persists.stop.getByName(mydb, pStop.name, function (err, rStop) {
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
                            persists.stop.create(mydb, pStop, function (err, rStop) {
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
        },
        mTimetable = {
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
                            persists.line.merge(mydb, timetable.line, function (err, rLine) {
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
                            persists.direction.merge(mydb, pTimetable.direction, function (err, rDirection) {
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
                            persists.stop.merge(mydb, pTimetable.stop, function (err, rStop) {
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
                            persists.flashcode.merge(mydb, pTimetable.flashcode, function (err, rFlashcode) {
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
                            persists.timetable.getById(mydb, pTimetable.id, function (err, rTimetable) {
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
                            persists.timetable.getByLineAndStopAndDirection(mydb, pTimetable.line.id, pTimetable.stop.id, pTimetable.flashcode.id, function (err, rTimetable) {
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
                            persists.timetable.create(mydb, pTimetable, function (err, rTimetable) {
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
    persists.line = mLine;
    persists.flashcode = mFlashcode;
    persists.direction = mDirection;
    persists.stop = mStop;
    persists.timetable = mTimetable;
    module.exports = persists;
}());

