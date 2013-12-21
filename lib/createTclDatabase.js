'use strict';
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('tcl.db');

db.serialize(function () {
    db.run("create table if not exists flashcode (id INTEGER PRIMARY KEY,url TEXT(1000),urlid INTEGER)");
    db.run("create table if not exists line (id INTEGER PRIMARY KEY,line TEXT(20), type TEXT(20))");
    db.run("create table if not exists direction (id INTEGER PRIMARY KEY,line INTEGER,terminus INTERGER)");
    db.run("create table if not exists stop (id INTEGER PRIMARY KEY,name TEXT(100))");
    db.run("create table if not exists timetable (id INTEGER PRIMARY KEY,stop INTEGER,line INTEGER,flashcode INTEGER, direction INTEGER)");


});

db.close();
