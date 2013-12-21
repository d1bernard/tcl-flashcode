'use strict';
(function () {
    var oDomain = {},
        oLine = function (init) {
            var that = {
                id : null,
                number : null,
                type : null
            };

            return that;
        },
        oFlashcode = function () {
            var that = {
                id : null,
                url : null,
                urlid : null
            };
            return that;
        },
        oStop = function () {
            var that = {
                id : null,
                name : null
            };
            return that;

        },
        oDirection = function () {
            var that = {
                id : null,
                line : null,
                terminus : null
            };
            return that;
        },
        oTimeTable = function () {
            var that = {
                id : null,
                stop : null,
                line : null,
                direction : null,
                flashcode : null
            };
            return that;
        };

    oDomain.stop = oStop;
    oDomain.flashcode = oFlashcode;
    oDomain.line = oLine;
    oDomain.direction = oDirection;
    oDomain.timeTable = oTimeTable;
    module.exports = oDomain;

}());
