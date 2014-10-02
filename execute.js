var scanDir = function (path) {
    var arr = [];
    if (fs.exists(path) && fs.isFile(path)) {
        arr.push(path);
    } else if (fs.isDirectory(path)) {
        fs.list(path).forEach(function (e) {
            if ( e !== "." && e !== ".." ) {
                arr = arr.concat(scanDir(path + '/' + e));
            }
        });
    }
    return arr;
};

var fs = require('fs');
var base_path = fs.workingDirectory + "/Documents/GitHub/ddg-ia-test/";
var path_tiles = base_path + "json/tiles";
var path_no_tiles = base_path + "json/no-tiles";
var paths = [];
var curFile = 0;
var checkExistence = require("test_existence.js");
paths = scanDir(path_no_tiles);
paths = paths.concat(scanDir(path_tiles));

!function nextTest() {
    if (!paths[curFile]) { 
        return console.log("done!"); 
    }
    checkExistence(paths[curFile], function(){
        curFile++;
        nextTest();
    });
}();
