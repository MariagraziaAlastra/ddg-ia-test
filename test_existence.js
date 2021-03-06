module.exports = function(path, fn) {
    var data = require(path);

    casper.test.begin(data.name + ' IA - Check elements existence and correct nesting', function suite(test) {
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
            for(var key in elements) {
                if(elements[key] !== null && key !== 'root') {
                    if((expected_selectors.
                        default.indexOf(key) !== -1) || ((expected_selectors.optional.indexOf(key) !== -1) && data['has_' + key])) {
                        // Leaving this here for debug purposes
                        casper.echo("Expected: " + key);
                        if(typeof elements[key] === 'object') {
                            if(!(casper.exists(root + " " + elements[key].root) && checkSelectors(elements[key].root, elements[key], expected_selectors))) {
                                return false;
                            }
                        } else if(typeof elements[key] === 'string') {
                            if(!casper.exists(root + " " + elements[key])) {
                                return false;
                            }
                        }
                    } else {
                        // Leaving this here for debug purposes
                        casper.echo("Unexpected: " + key);
                        if(typeof elements[key] === 'object') {
                            if(casper.exists(root + " " + elements[key].root)) {
                                return false;
                            }
                        } else if(typeof elements[key] === 'string') {
                            if(casper.exists(root + " " + elements[key])) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }


        casper.start("https://bttf.duckduckgo.com/", function() {
            casper.viewport(1336, 768).then(function() {
                this.open("https://bttf.duckduckgo.com/?q=" + data.query).then(function() {
                    test.comment("Viewport changed to {width: 1336, height: 768}");
                    test.assertExists(root_selectors.ia_tab, data.name + " IA is shown");

                    if(data.template_group !== "") {
                        template_group = require("./json/template_groups/" + data.template_group + ".json");
                        test.comment("./json/template_groups/" + data.template_group + ".json");
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

                        test.comment("\n" + all_groups.cw.
                            default +"\n");

                        test.comment("Check if content exists");
                        test.assertExists((root_selectors.main + " " + root_selectors.no_tiles.content), "Content exists");

                        test.comment("Check content selectors")
                        test.assert(checkSelectors(root_selectors.no_tiles.content, cw_selectors, custom_cw),
                            "Content's nested elements exist");

                        if(data.has_aux) {
                            test.comment("Check if Infobox exists");
                            test.assertExists((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox exists");

                            test.comment("Check Infobox selectors")
                            test.assert(checkSelectors(root_selectors.no_tiles.aux, aux_selectors, custom_aux),
                                "Infobox's nested elements exist");
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

                        test.comment("Check if tileview exists and it's not a grid");
                        test.assertExists((root_selectors.main + " " + root_selectors.tiles.tileview), "Tileview exists");
                        test.assertDoesntExist((root_selectors.main + " " + root_selectors.tiles.tileview_grid),
                            "Tileview is not a grid");

                        test.comment("Check if metabar exists");
                        test.assertExists((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar exists");

                        test.comment("Check if metabar contains the expected nested elements");
                        test.assert(checkSelectors(root_selectors.tiles.metabar, metabar_selectors, all_groups.metabar),
                            "Metabar's expected nested elements exist");

                        test.comment("Check if tiles exist");
                        test.assertExists((root_selectors.main + " " + root_selectors.tiles.tiles), "Tiles exist");

                        test.comment("Check if tiles contains the expected nested elements");
                        test.assert(checkSelectors(root_selectors.tiles.tiles, tiles_selectors, custom_tiles),
                            "Tiles expected nested elements exist");

                        test.comment("Check that no tile is selected right after page loading");
                        test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "No tile is selected");

                        if(data.has_detail) {
                            test.comment("Check if detail exists");
                            test.assertExists((root_selectors.main + " " + root_selectors.tiles.detail), "Detail exists");

                            test.comment("Check if detail contains the expected nested elements and its content is empty");
                            test.assert(checkSelectors(root_selectors.tiles.detail, detail_selectors, all_groups.detail_before),
                                "Detail's expected nested elements exist");

                            test.comment("Select tile and see if detail content appears");
                            this.click(root_selectors.main + " " + tiles_selectors.tile.root);
                            test.assertExists((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "First tile is selected");
                            test.assert(checkSelectors(root_selectors.tiles.detail, detail_selectors, custom_detail_after),
                                "Detail's content now exists");

                            test.comment("Click on the detail close icon and check that no tile is selected");
                            this.click(root_selectors.main + " " + detail_selectors.close);
                            test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "No tile is selected");
                        }

                    }

                    test.comment("Check existence of custom selectors from JSON file");
                    for(var key in data.custom_selectors) {
                        test.assertExists((root_selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
                    }

                });
            });
        });

        casper.then(function() {
            casper.viewport(360, 640).then(function() {
                this.reload(function() {
                    test.comment("Viewport changed to {width: 360, height: 640}");
                    test.assertExists(root_selectors.ia_tab, data.name + " IA is shown");

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
                            custom_aux.
                            default = all_groups.aux.default.concat(template_group.aux.default);
                            custom_aux.optional = all_groups.aux.optional.concat(template_group.aux.optional);
                        }

                        test.comment("Check if content exists");
                        test.assertExists((root_selectors.main + " " + root_selectors.no_tiles.content), "Content exists");

                        test.comment("Check content selectors")
                        test.assert(checkSelectors(root_selectors.no_tiles.content, cw_selectors, custom_cw),
                            "Content's nested elements exist");

                        if(data.has_aux) {
                            test.comment("Check if Infobox exists");
                            test.assertExists((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox exists");

                            test.comment("Check Infobox selectors")
                            test.assert(checkSelectors(root_selectors.no_tiles.aux, aux_selectors, custom_aux),
                                "Infobox's nested elements exist");
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
                            var tot_items;
                            // If we are passing metabar_regex in JSON file it means there is no metabar count to take tot_items from
                            if(data.metabar_regex) {
                                tot_items = this.evaluate(function(selectors) {
                                    return __utils__.findAll(selectors.main + " " + tiles_selectors.tile.root).length;
                                }, {selectors: root_selectors});
                            } else {
                                tot_items = parseInt(this.fetchText(root_selectors.main + " " + metabar_selectors.text.count));
                            }

                            if (tot_items > 2) {
                                custom_tiles.default = all_groups.mobile.tiles.default.concat(template_group.tiles.default);
                                custom_tiles.optional = all_groups.mobile.tiles.optional.concat(template_group.tiles.optional);
                            } else {
                                custom_tiles.default = all_groups.tiles.default.concat(template_group.tiles.default);
                                custom_tiles.optional = all_groups.tiles.optional.concat(template_group.tiles.optional);
                            }
                        }
                        if(template_group.detail) {
                            custom_detail_after.default = all_groups.detail_after.default.concat(template_group.detail.default);
                            custom_detail_after.optional = all_groups.detail_after.optional.concat(template_group.detail.optional);
                        }

                        test.comment("Check if tileview exists and it's a grid");
                        test.assertExists((root_selectors.main + " " + root_selectors.tiles.tileview_grid),
                            "Tileview exists and it's a grid");

                        test.comment("Check if metabar exists");
                        test.assertExists((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar exists");

                        test.comment("Check if metabar contains the expected nested elements");
                        test.assert(checkSelectors(root_selectors.tiles.metabar, metabar_selectors, all_groups.metabar),
                            "Metabar's expected nested elements exist");

                        test.comment("Check if tiles exist");
                        test.assertExists((root_selectors.main + " " + root_selectors.tiles.tiles), "Tiles exist");
                        test.comment("Check if tiles contains the expected nested elements");
                        test.assert(checkSelectors(root_selectors.tiles.tiles, tiles_selectors, custom_tiles),
                            "Tiles expected nested elements exist");

                        test.comment("Check that no tile is selected right after page loading");
                        test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "No tile is selected");

                        if(data.has_detail) {
                            test.comment("Check if detail exists");
                            test.assertExists((root_selectors.main + " " + root_selectors.tiles.detail), "Detail exists");

                            test.comment("Check if detail contains the expected nested elements and its content is empty");
                            test.assert(checkSelectors(root_selectors.tiles.detail, detail_selectors, all_groups.detail_before),
                                "Detail's expected nested elements exist");

                            test.comment("Select tile and see if detail content appears");
                            this.click(root_selectors.main + " " + tiles_selectors.tile.root);
                            test.assertExists((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "First tile is selected");
                            test.assert(checkSelectors(root_selectors.tiles.detail, detail_selectors, custom_detail_after),
                                "Detail's content now exists");

                            test.comment("Click on the detail close icon and check that no tile is selected");
                            this.click(root_selectors.main + " " + detail_selectors.close);
                            test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "No tile is selected");
                        }
                    }

                    test.comment("Check existence of custom selectors from JSON file");
                    for(var key in data.custom_selectors) {
                        test.assertExists((root_selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
                    }
                });
            });
        });


        casper.run(function() {
            fn();
            test.done();
        });
    });
}
