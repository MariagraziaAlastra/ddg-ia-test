module.exports = function(path) {
    var data = require(path);
    var class_scroll = ".can-scroll";
    var class_active = ".is-active";
    var class_grid = ".has-tiles--grid";
    var next_items, prev_items, tot_items;

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


    if(!path.match(/no-tiles/)) {
        casper.wait(5000, function() {
            // leaving this here for now for debug purposes
            casper.captureSelector('C:\desktop.jpeg', 'html');
            next_items = parseInt(casper.getElementAttribute((root_selectors.main + " " + tiles_selectors.nav_next), 'data-items'));
            prev_items = parseInt(casper.getElementAttribute((root_selectors.main + " " + tiles_selectors.nav_prev), 'data-items'));

            // If we are passing metabar_regex in JSON file it means there is no metabar count to take tot_items from
            if(data.metabar_regex) {
                tot_items = casper.evaluate(function(selectors) {
                    return __utils__.findAll(selectors.main + " " + tiles_selectors.tile.root).length;
                }, {selectors: root_selectors});

            } else {
                tot_items = parseInt(casper.fetchText(root_selectors.main + " " + metabar_selectors.text.count));
            }

            casper.test.comment("Check tileview navigation");
            casper.test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.nav_prev + class_scroll), "previous navigation is disabled");

            if(data.id === "products") {
                casper.test.assert((next_items === ((tot_items - data.tileview_capacity) + 2)), "next navigation has the correct number of items");
            } else {
                // Fails for Images
                if(tot_items >= data.tileview_capacity) {
                    casper.test.assert((next_items === (tot_items - data.tileview_capacity)),
                                      ("next navigation has " + next_items + " items, should contain " + (tot_items - data.tileview_capacity)));
                } else {
                    casper.test.assert((next_items === 0), "next navigation has the correct number of items");
                }
            }

            casper.test.assert((prev_items === 0), "previous navigation is empty");
            if(next_items > 0) {
                casper.test.assertExists((root_selectors.main + " " + tiles_selectors.nav_next + class_scroll), "next navigation is active");
                casper.test.comment("Click on next navigation and check number of items again");
                casper.click(root_selectors.main + " " + tiles_selectors.nav_next);
                if(next_items >= (data.tileview_capacity * 2)) {
                    casper.test.assert(parseInt(casper.getElementAttribute((root_selectors.main + " " + tiles_selectors.nav_next), 'data-items')) === 
                                      (tot_items - (data.tileview_capacity * 2)), "next navigation has the correct number of items");
                    casper.test.assert(parseInt(casper.getElementAttribute((root_selectors.main + " " + tiles_selectors.nav_prev), 'data-items')) == 
                                      data.tileview_capacity, "previous navigation has the correct number of items");
                } else {
                    casper.test.assert(parseInt(casper.getElementAttribute((root_selectors.main + " " + tiles_selectors.nav_next), 'data-items')) < next_items,
                                      "next navigation has less items now");
                    casper.test.assert(parseInt(casper.getElementAttribute((root_selectors.main + " " + tiles_selectors.nav_prev), 'data-items')) > 0,
                                      "previous navigation has items now");
                }
            }

            if(tot_items >= (data.tileview_capacity * 3)) {
                casper.test.comment("Check grid mode");

                casper.test.comment("Click on the metabar mode button and check if tileview expands to grid");
                casper.click(root_selectors.main + " " + metabar_selectors.mode);
                casper.test.assertExists((root_selectors.main + " " + root_selectors.tiles.tileview_grid), "mode switched to grid");
                casper.test.assertExists((root_selectors.main + " " + root_selectors.tiles.tiles + class_grid), "tileview expanded to grid");

                casper.test.comment("Click again on the metabar mode button and check if tileview collapses");
                casper.click(root_selectors.main + " " + metabar_selectors.mode);
                casper.test.assertDoesntExist((root_selectors.main + " " + root_selectors.tiles.tileview_grid), "mode switched back");
                casper.test.assertDoesntExist((root_selectors.main + " " + root_selectors.tiles.tiles + class_grid), "tileview collapsed");
            }
        });
    } else {
        casper.test.comment("Skip tiles navigation test for IA " + data.name + " - has no tiles");
    }
}
