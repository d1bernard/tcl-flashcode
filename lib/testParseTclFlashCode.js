'use strict';
var tclFlowParser = require('./parseTclFlashCode.js');
var util = require('util');
var fs         = require('fs');
var path = 'toto.txt';
var tclFlow = fs.readFileSync(path).toString();
console.log('tclFlowParser :' + util.inspect(tclFlowParser, {showHidden: true, depth: 5}));
tclFlowParser.parse('http://blblb?id=1', tclFlow, function (err, flashcode) {
    console.log('flashcode :' + util.inspect(flashcode, {showHidden: true, depth: 5}));
});
