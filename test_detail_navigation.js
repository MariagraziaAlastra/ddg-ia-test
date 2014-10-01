casper.test.begin('Check detail navigation', function suite(test) {
    // This is just for testing - the path should actually be passed as a command-line arg
    var path = "./json/tiles/bbc.json";
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
        'tiles' : {
            'tileview': 'div.tileview.js-tileview',
            'tileview_grid': 'div.tileview--grid',
            'metabar' : 'div.zci__metabar-wrap div.zci__metabar',
            'tiles' : 'div.tile-wrap div.zci__main--tiles.tileview__' + data.id,
            'detail' : 'div.tile-wrap div.zci__detail div.detail__wrap'
        },
        'no_tiles' : {
            'content': 'div.cw',
            'aux': 'div.zci__aux'
        }
    };

    casper.start("https://bttf.duckduckgo.com/", function() {
        casper.viewport(1336, 768).then(function() {
            this.open("https://bttf.duckduckgo.com/?q=" + data.query).then(function() {
                test.comment("Viewport changed to {width: 1336, height: 768}");

                if (!path.match(/no-tiles/)) {
                    if (data.has_detail) {
                        test.comment("Select first tile to make detail show up");
                        this.click(root_selectors.main + " " + tiles_selectors.tile.root);

                        test.comment("Check selected tile and detail content");
                        detail_title = this.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
                        tile_title = this.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected +
                                     " " + tiles_selectors.tile.title.root).trim();
                        detail_link = this.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
                        tile_link = this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

                        test.comment("Check detail controls");
                        test.assertExists((root_selectors.main + " " + detail_selectors.controls.next + class_scroll),
                                         "next control is active");
                        test.assertDoesntExist((root_selectors.main + " " + detail_selectors.controls.prev + class_scroll),
                                              "previous control is disabled");

                        test.comment("Click on next control and check if detail now refers to next tile");
                        this.click(root_selectors.main + " " + detail_selectors.controls.next);
                        var new_detail_link = this.getElementAttribute(root_selectors.main + " " +
                                              detail_selectors.content.body.root + " " + 'a', 'href');
                        test.assertNotEquals(new_detail_link, detail_link, "detail now links to a different show");

                        if (data.name !== "Videos" && data.name !== "Images") {
                            test.assertEquals(this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root +
                                             class_selected, 'data-link'), new_detail_link, "detail now refers to next tile");
                        }

                        test.comment("Click on the detail close icon and check if detail is now hidden and no tile is selected");
                        this.click(root_selectors.main + " " + detail_selectors.close);
                        test.assertNotVisible((root_selectors.main + " " + detail_selectors.root), "detail is hidden");
                        test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "no tile selected");
                    }
                }
            });
        });
    });

    casper.then(function() {
        casper.viewport(360, 640).then(function() {
            this.reload(function() {
                test.comment("Viewport changed to {width: 360, height: 640}");

                if (!path.match(/no-tiles/)) {
                    if (data.has_detail) {
                        test.comment("Select first tile to make detail show up");
                        this.click(root_selectors.main + " " + tiles_selectors.tile.root);

                        test.comment("Check selected tile and detail content");
                        detail_title = this.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
                        tile_title = this.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected +
                                     " " + tiles_selectors.tile.title.root).trim();
                        detail_link = this.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
                        tile_link = this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

                        test.comment("Check detail controls");
                        test.assertExists((root_selectors.main + " " + detail_selectors.controls.next + class_scroll),
                                         "next control is active");
                        test.assertDoesntExist((root_selectors.main + " " + detail_selectors.controls.prev + class_scroll),
                                              "previous control is disabled");

                        test.comment("Click on next control and check if detail now refers to next tile");
                        this.click(root_selectors.main + " " + detail_selectors.controls.next);
                        var new_detail_link = this.getElementAttribute(root_selectors.main + " " +
                                              detail_selectors.content.body.root + " " + 'a', 'href');
                        test.assertNotEquals(new_detail_link, detail_link, "detail now links to a different show");

                        if (data.name !== "Videos" && data.name !== "Images") {
                            test.assertEquals(this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root +
                                             class_selected, 'data-link'), new_detail_link, "detail now refers to next tile");
                        }

                        test.comment("Click on the detail close icon and check if detail is now hidden and no tile is selected");
                        this.click(root_selectors.main + " " + detail_selectors.close);
                        test.assertNotVisible((root_selectors.main + " " + detail_selectors.root), "detail is hidden");
                        test.assertDoesntExist((root_selectors.main + " " + tiles_selectors.tile.root + class_selected), "no tile selected");
                    }
                }
            });
        });
    });


    casper.run(function() {
        test.done();
    });
});
