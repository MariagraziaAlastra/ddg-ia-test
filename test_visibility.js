module.exports = function(path, fn) {
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

    casper.test.comment("Viewport changed to {width: 1336, height: 768}");
    casper.test.assertVisible(root_selectors.ia_tab, data.name + " IA is shown");

    if(path.match(/no-tiles/)) {
        casper.test.comment("Check if content is visible");
        casper.test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.content), "Content is visible");
        if(data.has_aux) {
            casper.test.comment("Check if Infobox is visible");
            casper.test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox is visible");
        }
    } else {
        if(template_group.tiles) {
            all_groups.tiles.
            default = all_groups.tiles.
            default.concat(template_group.tiles.
                default);
            all_groups.tiles.optional = all_groups.tiles.optional.concat(template_group.tiles.optional);
        }
        if(template_group.detail) {
            all_groups.detail_after.
            default = all_groups.detail_after.
            default.concat(template_group.detail.
                default);
            all_groups.detail_after.optional = all_groups.detail_after.optional.concat(template_group.detail.optional);
        }

        casper.test.comment("Check if metabar is visible");
        casper.test.assertVisible((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar is visible");

        casper.test.comment("Detail shouldn't be visible");
        casper.test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is hidden");
        if(data.has_detail) {
            casper.test.comment("Select tile and see if detail is shown");
            casper.click(root_selectors.main + " " + tiles_selectors.tile.root);
            casper.test.comment("Performed click on the first tile");

            casper.test.comment("Check if detail is visible now");
            casper.test.assertVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is now shown");
        }
    }

    casper.viewport(360, 640).then(function() {
        casper.reload(function() {
            casper.test.comment("Viewport changed to {width: 360, height: 640}");
            casper.test.assertVisible(root_selectors.ia_tab, data.name + " IA is shown");

            if(path.match(/no-tiles/)) {
                casper.test.comment("Check if content is visible");
                casper.test.assertVisible((root_selectors.main + " " + root_selectors.no_tiles.content), "Content is visible");
                if(data.has_aux) {
                    casper.test.comment("Infobox shouldn't be visible");
                    casper.test.assertNotVisible((root_selectors.main + " " + root_selectors.no_tiles.aux), "Infobox is hidden");
                }
            } else {
                if(template_group.tiles) {
                    all_groups.mobile.tiles.
                    default = all_groups.mobile.tiles.
                    default.concat(template_group.tiles.
                        default);
                    all_groups.mobile.tiles.optional = all_groups.mobile.tiles.optional.concat(template_group.tiles.optional);
                }
                if(template_group.detail) {
                    all_groups.detail_after.
                    default = all_groups.detail_after.
                    default.concat(template_group.detail.
                        default);
                    all_groups.detail_after.optional = all_groups.detail_after.optional.concat(template_group.detail.optional);
                }

                casper.test.comment("Metabar shouldn't be visible");
                casper.test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar is hidden");

                var tot_items;
                // If we are passing metabar_regex in JSON file it means there is no metabar count to take tot_items from
                if(data.metabar_regex) {
                    tot_items = casper.evaluate(function(selectors) {
                        return __utils__.findAll(selectors.main + " " + tiles_selectors.tile.root).length;
                    }, {
                        selectors: root_selectors
                    });
                } else {
                    tot_items = parseInt(casper.fetchText(root_selectors.main + " " + metabar_selectors.text.count));
                }

                if(tot_items > 2) {
                    casper.test.comment("Check metabar visibility after expanding content");
                    casper.click(root_selectors.main + " " + tiles_selectors.mobile.root);
                    casper.test.assertVisible((root_selectors.main + " " + root_selectors.tiles.metabar), "Metabar is now visible");
                    casper.test.comment("Click on metabar mode button and check if tileview collapses");
                    casper.click(root_selectors.main + " " + metabar_selectors.mode);
                    casper.test.assertNotVisible((root_selectors.main + " " + root_selectors.tileview), "tileview is hidden");
                } else {
                    casper.test.comment("Skip metabar visibility test on mobile for IA " + data.name + " - has not enough tiles");
                }

                casper.test.comment("Detail shouldn't be visible");
                casper.test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is hidden");

                if(data.has_detail) {
                    casper.test.comment("Select tile and see if detail is shown");
                    casper.click(root_selectors.main + " " + tiles_selectors.tile.root);

                    // On mobile the detail takes more time to show up
                    casper.waitUntilVisible((root_selectors.main + " " + tiles_selectors.tile.root), function() {
                        casper.test.comment("Performed click on the first tile");

                        casper.test.comment("Check if detail is visible now");
                        casper.test.assertVisible((root_selectors.main + " " + root_selectors.tiles.detail), "Detail is now shown");

                        casper.test.comment("Click on the detail close icon and check if detail is now hidden");
                        casper.click(root_selectors.main + " " + detail_selectors.close);
                        casper.test.assertNotVisible((root_selectors.main + " " + root_selectors.tiles.detail), "detail is hidden");
                    });
                }
            }
        });
    });

    casper.run(function() {
        fn();
    });
}
