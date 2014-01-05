'use strict';
var tclModule = angular.module('tcl',[]);


tclModule.controller('criteriaCtrl', function($scope,$http){
  $http.get('/line/all.json').success(function(data) {
    $scope.lines = data;
  });
  
  $scope.$watch('criteria.line', function(lineId) {
      if (lineId) {
          $http.get('/direction/line/'+lineId+'/all.json').success(function(data) {
                $scope.directions = data;
          });
          $http.get('/stop/line/'+lineId+'/all.json').success(function(data) {
                $scope.stops = data;
          });
      }
  });
  $scope.$watch('criteria.direction', function(directionId) {
	  var lineId = $scope.criteria.line;
      if (directionId) {
          $http.get('/stop/line/'+lineId+'/direction/'+directionId+'/all.json').success(function(data) {
                $scope.stops = data;
          });
      }
  });
});
