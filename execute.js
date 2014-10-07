var scanDir = function(path) {
    var arr = [];
    if(fs.exists(path) && fs.isFile(path)) {
        arr.push(path);
    } else if(fs.isDirectory(path)) {
        fs.list(path).forEach(function(e) {
            if(e !== "." && e !== "..") {
                arr = arr.concat(scanDir(path + '/' + e));
            }
        });
    }
    return arr;
};

// Retrieve all IAs JSON files
var fs = require('fs');
var base_path = fs.workingDirectory + "/Documents/GitHub/ddg-ia-test/";
var path_tiles = base_path + "json/tiles";
var path_no_tiles = base_path + "json/no-tiles";
var paths = [];
paths = scanDir(path_no_tiles);
paths = paths.concat(scanDir(path_tiles));

// Require test files
var testVisibility = require("test_visibility.js");
var testExistence = require("test_existence.js");
var testValues = require("test_values.js");
var testDetailNav = require("test_detail_navigation.js");
var testTilesNav = require("test_tiles_navigation.js");

var curFile = 0;
var tiles_done = false;
var no_tiles_done = false;

! function nextTest() {
    var path = paths[curFile];
    if(!path) {
        return;
    }

    var data = require(path);

    casper.test.begin("\n ****** Testing " + data.name + " IA ******\n", function suite(test) {

        if (data.status !== "live") {
            curFile++;
            naxtTest();
        }

        var ia_tab = 'a.zcm__link--' + data.ia_tab_id;
        casper.options.viewportSize = {
            width: 1336,
            height: 768
        };

        casper.start("https://bttf.duckduckgo.com/?q=" + data.query, function() {
            test.comment("\n Test " + data.name + " IA content values \n");
            casper.wait(2500, function() {
                testValues(path);
            });
        });

        casper.then(function() {
            if(!path.match(/no-tiles/)) {
                if (data.has_detail) {
                    test.comment("\n Test " + data.name + " IA detail navigation \n");
                    testDetailNav(path);
                } else {
                    test.comment("Skip detail navigation test for " + data.name + " - has no detail");
                }
            } else {
                test.comment("Skip detail navigation test for " + data.name + " - has no tiles");
            }
        });

        casper.then(function() {
            if(!path.match(/no-tiles/)) {
                test.comment("\n Test " + data.name + " IA tiles navigation \n");
                testTilesNav(path);
            } else {
                test.comment("Skip tiles navigation test for " + data.name + " - has no tiles");
            }
        });

        casper.then(function() {
            if(!path.match(/no-tiles/) && !tiles_done || path.match(/no-tiles/) && !no_tiles_done) {
                test.comment("\n Test " + data.name + " IA elements existence and correct nesting \n");
                testExistence(path);
            }
        });

        casper.then(function() {
            if(!path.match(/no-tiles/) && !tiles_done || path.match(/no-tiles/) && !no_tiles_done) {
                if (path.match(/no-tiles/)) {
                    no_tiles_done = true;
                } else {
                    tiles_done = true;
                }

                test.comment("\n Test " + data.name + " IA elements visibility \n");
                testVisibility(path);
            }
        });

        casper.run(function() {
            test.done();
        });
    });

    curFile++;
    nextTest();
}();
