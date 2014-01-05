var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');
var async = require('async');
var util = require('util');
var domain = require('../tclDomain.js');



var persistsFlashcode = {
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
                    persistsFlashcode.getById(mydb, flashcode.id, function (err, rFlashcode) {
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
                    persistsFlashcode.getByUrl(mydb, pFlashcode.url, function (err, rFlashcode) {
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
                    persistsFlashcode.create(mydb, pFlashcode, function (err, rFlashcode) {
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
};

module.exports = persistsFlashcode;        
