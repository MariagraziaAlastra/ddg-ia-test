module.exports = function(path, fn) {
    casper.test.begin('Check elements visibility', function suite(test) {

        var data = require(path);

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

        /* Recursively checks the visibility of expected nested selectors.
         * If a selector is not expected, checks it's not visible.
         * @params: root -> root selector,
         * elements -> object containing root's children,
         * expected_selectors -> object containing default and optional selectors for a specific template group
         */
        function checkVisibility(root, elements, expected_selectors) {
            for (var key in elements) {
                if (elements[key] !== null && key !== 'root') {
                    if (((expected_selectors.default.indexOf(key) !== -1) || ((expected_selectors.optional.indexOf(key) !== -1) && data['has_' + key])) &&
                       (expected_selectors.not_visible.indexOf(key) === -1)) {
                        // Leaving this here for debug purposes
                        casper.echo("Expected: " + key);
                        if (typeof elements[key] === 'object') {
                            if (!(casper.visible(root + " " + elements[key].root) && checkVisibility(elements[key].root, elements[key], expected_selectors))) {
                                return false;
                            }
                        } else if (typeof elements[key] === 'string') {
                            if (!casper.visible(root + " " + elements[key])) {
                                return false;
                            }
                        }
                    } else {
                        // Leaving this here for debug purposes
                        casper.echo("Unexpected: " + key);
                        if (typeof elements[key] === 'object') {
                            if (casper.visible(root + " " + elements[key].root)) {
                                return false;
                            }
                        } else if (typeof elements[key] === 'string') {
                            if (casper.visible(root + " " + elements[key])) {
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
                    test.assertVisible(root_selectors.ia_tab, data.name + " IA is shown");

                    if (data.template_group !== "") {
                        template_group = require("./json/template_groups/" + data.template_group + ".json");
                    }

                    if (path.match(/no-tiles/)) {
                        if (template_group.cw) {
                            all_groups.cw.default = all_groups.cw.default.concat(template_group.cw.default);
                            all_groups.cw.optional = all_groups.cw.optional.concat(template_group.cw.optional);
                        }

                        if (template_group.aux) {
                            all_groups.aux.default = all_groups.aux.default.concat(template_group.aux.default);
                            all_groups.aux.optional = all_groups.aux.optional.concat(template_group.aux.optional);
                        }

                        test.comment("Check if content is visible");
                        test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.content), "Content is visible");

                        test.comment("Check content selectors")
                        test.assert(checkVisibility(root_selectors.no_tiles.content, cw_selectors, all_groups.cw),
                            "Content's nested elements are visible");

                        if (data.has_aux) {
                            test.comment("Check if Infobox is visible");
                            test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox is visible");

                            test.comment("Check Infobox selectors")
                            test.assert(checkVisibility(root_selectors.no_tiles.aux, aux_selectors, all_groups.aux),
                                "Infobox's nested elements are visible");
                        }
                    } else {
                        if (template_group.tiles) {
                            all_groups.tiles.default = all_groups.tiles.default.concat(template_group.tiles.default);
                            all_groups.tiles.optional = all_groups.tiles.optional.concat(template_group.tiles.optional);
                        }
                        if (template_group.detail) {
                            all_groups.detail_after.default = all_groups.detail_after.default.concat(template_group.detail.default);
                            all_groups.detail_after.optional = all_groups.detail_after.optional.concat(template_group.detail.optional);
                        }

                        test.comment("Check if tileview is visible and it's not a grid");
                        test.assertVisible((root_selectors.main + " " + root_selectors.tiles.tileview), "Tileview is visible");
                        test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.tileview_grid),
                            "Tileview is not a grid");

                        test.comment("Check if metabar is visible");
                        test.assertVisible((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar is visible");

                        test.comment("Check if metabar contains the expected nested elements");
                        test.assert(checkVisibility(root_selectors.tiles.metabar, metabar_selectors, all_groups.metabar),
                            "Metabar's expected nested elements are visible");

                        test.comment("Check if tiles are visible");
                        test.assertVisible((root_selectors.main + " " + root_selectors.tiles.tiles), "Tiles are visible");

                        test.comment("Check if tiles expected nested elements are visible");
                        test.assert(checkVisibility(root_selectors.tiles.tiles, tiles_selectors, all_groups.tiles),
                            "Tiles expected nested elements are visible");

                        test.comment("Detail shouldn't be visible");
                        test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is hidden");

                        if (data.has_detail) {
                            test.comment("Select tile and see if detail is shown");
                            this.click(root_selectors.main + " " + tiles_selectors.tile.root);
                            test.comment("Performed click on the first tile");

                            test.comment("Check if detail is visible now");
                            test.assertVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is now shown");
                            test.assert(checkVisibility(root_selectors.tiles.detail, detail_selectors, all_groups.detail_after),
                                "Detail content is now shown");
                        }

                    }

                    test.comment("Check visibility of custom selectors from JSON file");
                    for (var key in data.custom_selectors) {
                        test.assertVisible((root_selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
                    }

                });
            });
        });

        casper.then(function() {
            casper.viewport(360, 640).then(function() {
                this.reload(function() {
                    test.comment("Viewport changed to {width: 360, height: 640}");
                    test.assertVisible(root_selectors.ia_tab, data.name + " IA is shown");

                    if (data.template_group !== "") {
                        template_group = require("./json/template_groups/" + data.template_group + ".json");
                    }

                    if (path.match(/no-tiles/)) {
                        if (template_group.cw) {
                            all_groups.cw.default = all_groups.cw.default.concat(template_group.cw.default);
                            all_groups.cw.optional = all_groups.cw.optional.concat(template_group.cw.optional);
                        }

                        if (template_group.aux) {
                            all_groups.aux.default = all_groups.aux.default.concat(template_group.aux.default);
                            all_groups.aux.optional = all_groups.aux.optional.concat(template_group.aux.optional);
                        }

                        test.comment("Check if content is visible");
                        test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.content), "Content is visible");

                        test.comment("Check content selectors")
                        test.assert(checkVisibility(root_selectors.no_tiles.content, cw_selectors, all_groups.cw),
                            "Content's nested elements are visible");

                        if (data.has_aux) {
                            test.comment("Check if Infobox is visible");
                            test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox is visible");

                            test.comment("Check Infobox selectors")
                            test.assert(checkVisibility(root_selectors.no_tiles.aux, aux_selectors, all_groups.aux),
                                "Infobox's nested elements are visible");
                        }
                    } else {
                        if (template_group.tiles) {
                            all_groups.mobile.tiles.default = all_groups.mobile.tiles.default.concat(template_group.tiles.default);
                            all_groups.mobile.tiles.optional = all_groups.mobile.tiles.optional.concat(template_group.tiles.optional);
                        }
                        if (template_group.detail) {
                            all_groups.detail_after.default = all_groups.detail_after.default.concat(template_group.detail.default);
                            all_groups.detail_after.optional = all_groups.detail_after.optional.concat(template_group.detail.optional);
                        }

                        test.comment("Check if tileview is visible and it's a grid");
                        test.assertVisible((root_selectors.main + " " + root_selectors.tiles.tileview_grid),
                            "Tileview is visible and it's a grid");

                        test.comment("Check if tiles are visible");
                        test.assertVisible((root_selectors.main + " " + root_selectors.tiles.tiles), "Tiles are visible");

                        test.comment("Check if tiles expected nested elements are visible");
                        test.assert(checkVisibility(root_selectors.tiles.tiles, tiles_selectors, all_groups.mobile.tiles),
                            "Tiles expected nested elements are visible");

                        test.comment("Metabar shouldn't be visible");
                        test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar is hidden");

                        test.comment("Check metabar visibility after expanding content");
                        this.click(root_selectors.main + " " + tiles_selectors.mobile.root);
                        test.assertVisible((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar is now visible");
                        test.assert(checkVisibility(root_selectors.tiles.metabar, metabar_selectors, all_groups.metabar),
                            "Metabar nested elements are now visible");

                        test.comment("Click on metabar mode button and check if tileview collapses");
                        this.click(root_selectors.main + " " + metabar_selectors.mode);
                        test.assertNotVisible((root_selectors.main + " " + root_selectors.tileview), "tileview is hidden");

                        test.comment("Detail shouldn't be visible");
                        test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is hidden");

                        if (data.has_detail) {
                            test.comment("Select tile and see if detail is shown");
                            this.click(root_selectors.main + " " + tiles_selectors.tile.root);
                            // On mobile the detail takes more time to show up
                            this.waitUntilVisible((root_selectors.main + " " + tiles_selectors.tile.root), function() {
                                test.comment("Performed click on the first tile");

                                test.comment("Check if detail is visible now");
                                test.assertVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is now shown");
                                test.assert(checkVisibility(root_selectors.tiles.detail, detail_selectors, all_groups.detail_after),
                                    "Detail content is now shown");

                                // Placed here in case some custom selectors are in the detail
                                test.comment("Check visibility of custom selectors from JSON file");
                                for (var key in data.custom_selectors) {
                                    test.assertVisible((root_selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
                                }

                                test.comment("Click on the detail close icon and check if detail is now hidden");
                                this.click(root_selectors.main + " " + detail_selectors.close);
                                test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.detail), "detail is hidden");
                            });
                        }

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
