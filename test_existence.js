module.exports = function(path) {
    var data = require(path);
    var class_selected = ".is-selected";

    // Import general template groups JSON file
    var all_groups = require("./json/template_groups/all.json");
    var template_group = {};

    // Import selectors JSON files
    var cw_selectors = require("./json/selectors/cw.json");
    var detail_selectors = require("./json/selectors/detail.json");
    var aux_selectors = require("./json/selectors/infobox.json");
    var metabar_selectors = require("./json/selectors/metabar.json");
    var tiles_selectors = require("./json/selectors/tiles.json");
    var root_selectors = {
        'ia_tab': 'a.zcm__link--' + data.ia_tab_id,
        'main': 'div.zci--' + data.id,
        'tiles': {
            'tileview': 'div.tileview.js-tileview',
            'tileview_grid': 'div.tileview--grid',
            'metabar': 'div.zci__metabar-wrap div.zci__metabar',
            'tiles': 'div.tile-wrap div.zci__main--tiles.tileview__' + data.id,
            'detail': 'div.tile-wrap div.zci__detail div.detail__wrap'
        },
        'no_tiles': {
            'content': 'div.cw',
            'aux': 'div.zci__aux'
        }
    };

    /* Recursively checks the existence of expected nested selectors.
     * If a selector is not expected, checks it doesn't exist.
     * @params: root -> root selector,
     * elements -> object containing root's children,
     * expected_selectors -> object containing default and optional selectors for a specific template group
     */
    function checkSelectors(root, elements, expected_selectors) {
        var error_msg = "";
        for(var key in elements) {
            if(elements[key] !== null && key !== 'root') {
                if((expected_selectors.
                    default.indexOf(key) !== -1) || ((expected_selectors.optional.indexOf(key) !== -1) && data['has_' + key])) {
                    // Leaving this here for debug purposes
                    casper.echo("Expected: " + key);
                    error_msg = " - Expected selector " + key + " does not exist";
                    if(typeof elements[key] === 'object') {
                        var recursive_result = checkSelectors(elements[key].root, elements[key], expected_selectors);
                        recursive_result.msg = (recursive_result.msg !== null)? recursive_result.msg : error_msg;
                        if(!(casper.exists(root + " " + elements[key].root) && recursive_result.pass)) {
                            return {"pass" : false, "msg" : recursive_result.msg};
                        }
                    } else if(typeof elements[key] === 'string') {
                        if(!casper.exists(root + " " + elements[key])) {
                            return {"pass" : false, "msg" : error_msg};
                        }
                    }
                } else {
                    // Leaving this here for debug purposes
                    casper.echo("Unexpected: " + key);
                    error_msg = " - Unexpected selector " + key + " exists";
                    if(typeof elements[key] === 'object') {
                        if(casper.exists(root_selectors.main + " " + root + " " + elements[key].root)) {
                            return {"pass" : false, "msg" : error_msg};
                        }
                    } else if(typeof elements[key] === 'string') {
                        if(casper.exists(root + " " + elements[key])) {
                            casper.test.comment(error_msg);
                            return {"pass" : false, "msg" : error_msg};
                        }
                    }
                }
            }
        }
        return {"pass" : true, "msg" : ""};
    }

    casper.test.assertExists(root_selectors.ia_tab, data.name + " IA is shown");

    if(data.template_group !== "") {
        template_group = require("./json/template_groups/" + data.template_group + ".json");
    }

    if(path.match(/no-tiles/)) {
        var custom_cw = {
            "default": [],
            "optional": []
        };
        var custom_aux = {
            "default": [],
            "optional": []
        };

        if(template_group.cw) {
            custom_cw.default = all_groups.cw.default.concat(template_group.cw.default);
            custom_cw.optional = all_groups.cw.optional.concat(template_group.cw.optional);
        }

        if(template_group.aux) {
            custom_aux.default = all_groups.aux.default.concat(template_group.aux.default);
            custom_aux.optional = all_groups.aux.optional.concat(template_group.aux.optional);
        }

        casper.test.comment("\n" + all_groups.cw.
            default +"\n");
        casper.test.comment("Check if content exists");
        casper.test.assertExists((root_selectors.main + " " + root_selectors.no_tiles.content), "Content exists");

        casper.test.comment("Check content selectors")
        var content_result = checkSelectors(root_selectors.no_tiles.content, cw_selectors, custom_cw);
        casper.test.assert(content_result.pass, "Content's nested elements exist" + content_result.msg);

        if(data.has_aux) {
            casper.test.comment("Check if Infobox exists");
            casper.test.assertExists((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox exists");

            casper.test.comment("Check Infobox selectors")
            var infobox_result = checkSelectors(root_selectors.no_tiles.aux, aux_selectors, custom_aux);
            casper.test.assert(infobox_result.pass, "Infobox's nested elements exist" + infobox_result.msg);
        }
    } else {
        var custom_tiles = {
            "default": [],
            "optional": []
        };
        var custom_detail_after = {
            "default": [],
            "optional": []
        };

        if(template_group.tiles) {
            custom_tiles.default = all_groups.tiles.default.concat(template_group.tiles.default);
            custom_tiles.optional = all_groups.tiles.optional.concat(template_group.tiles.optional);
        }

        if(template_group.detail) {
            custom_detail_after.default = all_groups.detail_after.default.concat(template_group.detail.default);
            custom_detail_after.optional = all_groups.detail_after.optional.concat(template_group.detail.optional);
        }

        casper.test.comment("Check if tileview exists and it's not a grid");
        casper.test.assertExists((root_selectors.main + " " + root_selectors.tiles.tileview), "Tileview exists");
        casper.test.assertDoesntExist((root_selectors.main + " " + root_selectors.tiles.tileview_grid), "Tileview is not a grid");

        casper.test.comment("Check if metabar exists");
        casper.test.assertExists((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar exists");

        casper.test.comment("Check if metabar contains the expected nested elements");
        var metabar_result = checkSelectors(root_selectors.tiles.metabar, metabar_selectors, all_groups.metabar);
        casper.test.assert(metabar_result.pass, "Metabar's expected nested elements exist" + metabar_result.msg);

        casper.test.comment("Check if tiles exist");
        casper.test.assertExists((root_selectors.main + " " + root_selectors.tiles.tiles), "Tiles exist");

        casper.test.comment("Check if tiles contains the expected nested elements");
        var tiles_result = checkSelectors(root_selectors.tiles.tiles, tiles_selectors, custom_tiles);
        casper.test.assert(tiles_result.pass, ("Tiles expected nested elements exist" + tiles_result.msg));

        casper.test.comment("Check that no tile is selected right after page loading");
        casper.test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "No tile is selected");
        if(data.has_detail) {
            casper.test.comment("Check if detail exists");
            casper.test.assertExists((root_selectors.main + " " + root_selectors.tiles.detail), "Detail exists");

            casper.test.comment("Check if detail contains the expected nested elements and its content is empty");
            var detail_result = checkSelectors(root_selectors.tiles.detail, detail_selectors, all_groups.detail_before);
            casper.test.assert(detail_result.pass, "Detail's expected nested elements exist" + detail_result.msg);

            casper.test.comment("Select tile and see if detail content appears");
            casper.click(root_selectors.main + " " + tiles_selectors.tile.root);
            casper.test.assertExists((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "First tile is selected");
            casper.test.assert(checkSelectors(root_selectors.tiles.detail, detail_selectors, custom_detail_after), "Detail's content now exists");

            casper.test.comment("Click on the detail close icon and check that no tile is selected");
            casper.click(root_selectors.main + " " + detail_selectors.close);
            casper.test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "No tile is selected");
        }
    }

    casper.test.comment("Check existence of custom selectors from JSON file");
    for(var key in data.custom_selectors) {
        casper.test.assertExists((root_selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
    }
}
