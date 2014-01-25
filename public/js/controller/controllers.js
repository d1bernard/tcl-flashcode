'use strict';
var tclModule = angular.module('tcl', ['ngGrid']);


tclModule.controller('criteriaCtrl', function ($scope, $http) {

    $scope.timetables = {};

    $scope.totalServerItems = 0;

    $scope.pagingOptions = {
        pageSizes: [25],
        pageSize: 25,
        currentPage: 1
    };

    var columnDefs = [
        {field: 'line.type', displayName: 'Type', width: 80},
        {field: 'line.number', displayName: 'Number', width: 80},
        {field: 'direction.terminus.name', displayName: 'Direction', width: 200},
        {field: 'stop.name', displayName: 'Name', width: 200},
        {field: 'flashcode.url', displayName: 'Link', width: 80,
            //cellTemplate: '<div><a href="{{row.entity[col.field]}}">{{row.entity[col.field]}}</a></div>',
            cellTemplate: '<div><div class="ngCellText"><a href="{{row.getProperty(col.field)}}"><img src="/img/Black_Connect.png" width="15px" height="15px"/></a></div></div>'}
    ];

    $scope.gridOptions = {
        data: 'timetables',
        columnDefs: columnDefs,
        plugins: [new ngGridFlexibleHeightPlugin()],
        enablePaging: true,
        showFooter: true,
        pagingOptions: $scope.pagingOptions,
        totalServerItems: 'totalServerItems'

    };


    $scope.criteria = {};


    $http.get('/line/all.json').success(function (data) {
        $scope.lines = data;
    });

    $scope.$watch('criteria.line', function (lineId) {
        if (lineId) {
            $http.get('/direction/line/' + lineId + '/all.json').success(function (data) {
                $scope.directions = data;
            });
            $http.get('/stop/line/' + lineId + '/all.json').success(function (data) {
                $scope.stops = data;
            });

        }
        $scope.criteria.direction = undefined;
        $scope.criteria.stop = undefined;

    });

    $scope.$watch('criteria.direction', function (directionId) {
        var lineId = $scope.criteria.line;
        if (directionId) {
            $http.get('/stop/line/' + lineId + '/direction/' + directionId + '/all.json').success(function (data) {
                $scope.stops = data;
            });
        }
        $scope.criteria.stop = undefined;
    });


    $scope.setPagingData = function (data, page, pageSize) {

        $scope.timetables = data.data;
        $scope.totalServerItems = data.total;
        $scope.pagingOptions.currentPage = page;
        $scope.currentPage = 1;
        ////$scope.pagingOptions.totalServerItems = data.total;
//        if (!$scope.$$phase) {
//            $scope.$apply();
//        }
    };

    $scope.getPagedDataAsync = function (pageSize, page, lineId, directionId, stopId) {
        var url = '/timetable/all.json?',
            separator = '',
            querySep = '&';

        if (pageSize) {
            url = url + separator + "pageSize=" + pageSize;
            separator = querySep;
        }
        if (page) {
            url = url + separator + "page=" + page;
            separator = querySep;
        }

        if (lineId) {
            url = url + separator + "line=" + lineId;
            separator = querySep;
        }
        if (directionId) {
            url = url + separator + "direction=" + directionId;
            separator = querySep;
        }

        if (stopId) {
            url = url + separator + "stop=" + stopId;
            separator = querySep;
        }


        $http.get(url).success(function (data) {
            $scope.setPagingData(data, page, pageSize);
        });

    };

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);


    $scope.$watch('pagingOptions', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
        }
    }, true);

    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

    $scope.search = function () {
        var lineId = $scope.criteria.line;
        var directionId = $scope.criteria.direction;
        var stopId = $scope.criteria.stop;
        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, lineId, directionId, stopId);
    };
});
