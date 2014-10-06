module.exports = function(path) {
    var data = require(path);
    var class_selected = ".is-selected";
    var class_scroll = ".can-scroll";
    var detail_title, tile_title, detail_link, tile_link;

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

        casper.test.comment("Select first tile to make detail show up");
        casper.click(root_selectors.main + " " + tiles_selectors.tile.root);

        casper.test.comment("Check selected tile and detail content");
        detail_title = casper.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
        tile_title = casper.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected + " " +
                                     tiles_selectors.tile.title.root).trim();
        detail_link = casper.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
        tile_link = casper.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

        casper.test.comment("Check detail controls");
        casper.test.assertExists((root_selectors.main + " " + detail_selectors.controls.next + class_scroll),
                                "next control is active");
        casper.test.assertDoesntExist((root_selectors.main + " " + detail_selectors.controls.prev + class_scroll),
                                     "previous control is disabled");

        casper.test.comment("Click on next control and check if detail now refers to next tile");
        casper.click(root_selectors.main + " " + detail_selectors.controls.next);

        casper.then(function() {
            // leaving this here for now for debug purposes
            casper.captureSelector('detail.jpeg', 'html');

            var new_detail_link = casper.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
            casper.test.assertNotEquals(new_detail_link, detail_link, "detail now links to next tile");

            if(data.name !== "Videos" && data.name !== "Images") {
                casper.test.assertEquals(casper.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root + class_selected, 'data-link'),
                                        new_detail_link, "detail now refers to next tile");
            }
        });

        casper.then(function() {
            casper.test.comment("Click on the detail close icon and check if detail is now hidden and no tile is selected");
            casper.click(root_selectors.main + " " + detail_selectors.close);
            casper.test.assertNotVisible((root_selectors.main + " " + detail_selectors.root), "detail is hidden");
            casper.test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "no tile selected");
        });
}
