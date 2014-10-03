var scanDir = function(path) {
    var arr = [];
    if (fs.exists(path) && fs.isFile(path)) {
        arr.push(path);
    } else if (fs.isDirectory(path)) {
        fs.list(path).forEach(function(e) {
            if (e !== "." && e !== "..") {
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
var testDetailNav = require("test_detail_navigation");
var testTilesNav = require("test_tiles_navigation");

var curFile = 0;

!function nextTest() {
    if (!paths[curFile]) {
        return console.log("done!");
    }
    var data = require(paths[curFile]);
    console.log("\n ****** Testing " + data.name + " IA ******\n");
    testTilesNav(paths[curFile], function() {
        testDetailNav(paths[curFile], function() {
            testValues(paths[curFile], function() {
                testVisibility(paths[curFile], function() {
                    testExistence(paths[curFile], function() {
                        curFile++;
                        nextTest();
                    });
                });
            });
        });
    });
}();
