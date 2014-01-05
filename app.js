
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var line = require('./routes/line');
var direction = require('./routes/direction');
var stop = require('./routes/stop');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/line/all.json', line.lines_json);
app.get('/direction/line/:id/all.json', direction.directionsByLine_json);
app.get('/stop/line/:lineId/all.json', stop.stopsByLineAndDir_json);
app.get('/stop/line/:lineId/direction/:directionId/all.json', stop.stopsByLineAndDir_json);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
