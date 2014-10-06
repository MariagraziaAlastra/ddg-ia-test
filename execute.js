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

!function nextTest() {
    var path = paths[curFile];
    if(!path) {
        return console.log("done!");
    }

    var data = require(path);
    console.log("\n ****** Testing " + data.name + " IA ******\n");

    testValues(path, function() {
        if (!path.match(/no-tiles/)) {
            // These tests are only for IAs with tiles
            testDetailNav(path, function() {
                testTilesNav(path, function() {
                    if (!tiles_done) {
                        testExistence(path, function() {
                            testVisibility(path, function() {

                                console.log("\n ****** tiles_done: " + tiles_done + " " + data.name + " IA ******\n");
                                tiles_done = true;
                                curFile++;
                                nextTest();
                            });
                        });
                    } else {
                        curFile++;
                        nextTest();
                    }
                });
            });
        } else {
            if (!no_tiles_done) {
                testExistence(path, function() {
                    testVisibility(path, function() {

                                console.log("\n ****** tiles_done: " + no_tiles_done + " " + data.name + " IA ******\n");
                        no_tiles_done = true;
                        curFile++;
                        nextTest();
                    });
                });
            } else {
                curFile++;
                nextTest();
            }
        }
    });
}();
