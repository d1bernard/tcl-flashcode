"use strict";
var htmlparser = require('htmlparser2');
var util       = require('util');
var select     = require('soupselect').select;
var url        = require('url');
var domain     = require('./tclDomain.js');
(function () {
    var tclParser = {};
    tclParser.parse = function (flashcodeUrl, data, callback) {
        var parser,
            handler;
        console.log('Parsing : \n' + flashcodeUrl);
        handler = new htmlparser.DomHandler(function (error, dom) {
            var flashcode = domain.flashcode(),//flashcode destine a recueillir les donnees a retourner
                stop,
                timeTables = [],
                stopsTags = select(dom, 'div#TITLE p span'),
                lignesIconesTags = select(dom, 'div#CONTENT div.ICONES-dir'),
                notAvailable = select(dom, 'div#CONTENT div.ERROR-flashcode');

            if (error) {
                console.log('erreur detectee');
            } else if (stopsTags && stopsTags.length > 0) {
                flashcode.url = flashcodeUrl;
                //console.log(util.inspect(dom,{ showHidden: true, depth: 10, color:true }));
                //recuperation du nom de l'arret
                stopsTags.forEach(function (stopTag) {
                    //var spans = select(stop,'span');
                    //
                    if (stopTag.children && stopTag.children.length > 0) {
                        stop = domain.stop();
                        stop.name = stopTag.children[0].data;
                    } else {
                        console.log('err : aucun stop :' + flashcodeUrl);
                    }

                });//! for each stop
                //recuperation du numero de bus et de la direction
                lignesIconesTags.forEach(function (ligneIconeTag) {
                    //recuperation des icones
                    var timeTable = domain.timeTable(),
                        ligneImageTags,
                        ligneParsedUrl,
                        typeImageUrl,
                        lignePathname,
                        lignePathParts,
                        typeParsedUrl,
                        typePathParts,
                        typePathname,
                        directionTags,
                        ligneImageUrl,
                        direction = domain.direction(),
                        terminus = domain.stop(),
                        line = domain.line();
                    ligneImageTags = select(ligneIconeTag, 'div.ICONES img');
                    //recuperation de la ligne
                    //
                    if (ligneImageTags[1]) {
                        ligneImageUrl     = ligneImageTags[1].attribs.src;
                        ligneParsedUrl    = url.parse(ligneImageUrl, true);
                        lignePathname     = ligneParsedUrl.pathname;
                        lignePathParts    = lignePathname.split('/');
                        typeImageUrl      = ligneImageTags[0].attribs.src;
                        typeParsedUrl    = url.parse(typeImageUrl, true);
                        typePathname     = typeParsedUrl.pathname;
                        typePathParts    = typePathname.split('/');
                        directionTags    = select(ligneIconeTag, 'ul li p strong');
                        line.number      = lignePathParts[7];
                        line.type        = typePathParts[8];
                        if (directionTags && directionTags.length > 0 && directionTags[0].children &&  directionTags[0].children.length > 0) {
                            terminus.name = directionTags[0].children[0].data;
                            direction.terminus = terminus;
                            direction.line = line;
                        } else {
                            console.log('err : aucune direction :' + flashcodeUrl);
                        }
                        timeTable.stop = stop;
                        timeTable.line = line;
                        timeTable.direction = direction;
                        timeTable.flashcode = flashcode;

                        timeTables.push(timeTable);
                    } else {
                        console.log('err : aucune ligne :' + flashcodeUrl);
                    }
                    //console.log('ligne :' + util.inspect(lignePathParts[7], {showHidden: true, depth: 2}));
                    //recuperation du type
                    //console.log('type :' + util.inspect(typePathParts[8], {showHidden: true, depth: 2}));
                    //recuperation de la direction
                    //console.log('direction :' + util.inspect(directionTags[0].children[0].data, {showHidden: true, depth: 2}));

                }); //! for each line
                flashcode.timeTables = timeTables;

            } //! else
            if (callback) {
                callback(error, flashcode);
            }
        }); //! handler
        parser = new htmlparser.Parser(handler);
        //console.log('data :' + util.inspect(data, {showHidden: true, depth: 5}));
        parser.write(data);
        parser.done();

    }; //! function parse

    module.exports = tclParser;

}());

