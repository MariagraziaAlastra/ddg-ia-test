module.exports = function(path, fn) {
    var data = require(path);
    var class_selected = ".is-selected";
    var moreAt_selector, detail_title, tile_title, detail_link, tile_link;

    // Regexes
    var metabar_regex = /^Showing\s[0-9]+\s((([A-Za-z]+\+?)+|([A-Z]\.)+)\s)*for(\s([A-Za-z]+|[A-Z]))*$/;
    var moreAt_regex = new RegExp(data.moreAt_regex);
    var price_regex = /^..*[0-9][0-9]*(,|\.)[0-9][0-9]$/;

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

    if(path.match(/no-tiles/)) {
        if(data.template_group === "info") {
            moreAt_selector = cw_selectors.main_detail.body.links_info.link_moreAt.root;
        } else {
            moreAt_selector = cw_selectors.main_detail.body.moreAt.root;
        }
    } else {
        moreAt_selector = metabar_selectors.moreAt.root;
    }

    if(data.template_group !== "") {
        casper.test.comment("Check moreAt text and URL");
        casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + moreAt_selector).trim(), moreAt_regex, "moreAt text value is correct");
        casper.test.assertEquals(casper.getElementAttribute(root_selectors.main + " " + moreAt_selector, 'href'), data.moreAt_url, "moreAt URL is correct");
    }

    if(!path.match(/no-tiles/)) {
        casper.test.comment("Check metabar text");
        if(!data.metabar_regex) {
            casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), metabar_regex,
                                   "metabar text value is correct");
        } else {
            casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), new RegExp(data.metabar_regex),
                                   "metabar text value is correct");
        }

        if(data.template_group === "products" && data.has_price) {
            casper.test.comment("Check price value");
            casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + tiles_selectors.tile.price), price_regex, "price text value is correct");
        }

        if(data.has_detail) {
            casper.test.comment("Select first tile to make detail show up");
            casper.click(root_selectors.main + " " + tiles_selectors.tile.root);

            casper.test.comment("Check selected tile and detail content");
            detail_title = casper.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
            tile_title = casper.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected + " " +
                                       tiles_selectors.tile.title.root).trim();

            if(data.name !== "Images") {
                if(detail_title.length === tile_title.length) {
                    casper.test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
                } else if(detail_title.length > tile_title.length) {
                    casper.test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
                    casper.test.assertEquals(tile_title.substr(0, tile_title.length - 3), detail_title.substr(0, tile_title.length - 3),
                                            "detail title matches selected tile title");
                } else {
                    casper.test.fail("detail title is different from selected tile title");
                }
            }

            if(data.template_group === "media") {
                casper.test.comment("Check if detail image matches selected tile image");
                var detail_img = casper.getElementAttribute(root_selectors.main + " " + detail_selectors.content.media_img, 'src');
                var tile_img = casper.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.media_img, 'src');
                casper.test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");
            }
            detail_link = casper.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
            tile_link = casper.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

            if(data.name !== "Videos" && data.name !== "Images") {
                casper.test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");
            }
            if(data.template_group === "products" && data.has_price) {
                casper.test.comment("Check tile and detail price values");
                // Get only the text from the first element which has the given selector
                var tile_price = casper.evaluate(function(selectors, key) {
                    var elements = __utils__.findAll(root_selectors.main + " " + tiles_selectors.tile.price);
                    return elements[0].innerHTML.trim();
                }, {
                    selectors: selectors,
                    key: key
                });

                var detail_price = casper.fetchText(root_selectors.main + " " + detail_selectors.content.body.subtitle.price).trim();
                casper.test.assertMatch(tile_price, price_regex, "tile price has the correct value");
                casper.test.assertMatch(detail_price, price_regex, "detail price has the correct value");
                casper.test.assertEquals(detail_price, tile_price, "detail and selected tile have the same price");
            }
        }
    }

    casper.test.comment("Check regexes from JSON file");
    for(var key in data.regexes) {
        var regex = new RegExp(data.regexes[key]);
        // Get only the text from the first element which has the given selector
        var text = casper.evaluate(function(selectors, key) {
            var elements = __utils__.findAll(selectors.main + " " + key);
            return elements[0].innerHTML.trim();
        }, {
            selectors: root_selectors,
            key: key
        });
        casper.test.assertMatch(text, regex, key + " text value is correct");
    }

    casper.viewport(360, 640).then(function() {
        casper.reload(function() {
            casper.test.comment("Viewport changed to {width: 360, height: 640}");

            if(data.template_group !== "") {
                casper.test.comment("Check moreAt text and URL");
                casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + moreAt_selector).trim(), moreAt_regex,
                                       "moreAt text value is correct");
                casper.test.assertEquals(casper.getElementAttribute(root_selectors.main + " " + moreAt_selector, 'href'), data.moreAt_url,
                                        "moreAt URL is correct");
            }
            if(!path.match(/no-tiles/)) {
                casper.test.comment("Check metabar text");
                if(!data.metabar_regex) {
                    casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), metabar_regex,
                                           "metabar text value is correct");
                } else {
                    casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), new RegExp(data.metabar_regex),
                                           "metabar text value is correct");
                }

                if(data.template_group === "products" && data.has_price) {
                    casper.test.comment("Check price value");
                    casper.test.assertMatch(casper.fetchText(root_selectors.main + " " + tiles_selectors.tile.price), price_regex, "price text value is correct");
                }

                if(data.has_detail) {
                    casper.test.comment("Select first tile to make detail show up");
                    casper.click(root_selectors.main + " " + tiles_selectors.tile.root);

                    casper.test.comment("Check selected tile and detail content");
                    detail_title = casper.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
                    tile_title = casper.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected + " " +
                                               tiles_selectors.tile.title.root).trim();

                    if(data.name !== "Images") {
                        if(detail_title.length === tile_title.length) {
                            casper.test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
                        } else if(detail_title.length > tile_title.length) {
                            casper.test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
                            casper.test.assertEquals(tile_title.substr(0, tile_title.length - 3), detail_title.substr(0, tile_title.length - 3),
                                                    "detail title matches selected tile title");
                        } else {
                            casper.test.fail("detail title is different from selected tile title");
                        }
                    }

                    if(data.template_group === "media") {
                        casper.test.comment("Check if detail image matches selected tile image");
                        var detail_img = casper.getElementAttribute(root_selectors.main + " " + detail_selectors.content.media_img, 'src');
                        var tile_img = casper.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.media_img, 'src');
                        casper.test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");
                    }

                    detail_link = casper.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
                    tile_link = casper.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

                    if(data.name !== "Videos" && data.name !== "Images") {
                        casper.test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");
                    }

                    if(data.template_group === "products" && data.has_price) {
                        casper.test.comment("Check tile and detail price values");
                        // Get only the text from the first element which has the given selector
                        var tile_price = casper.evaluate(function(selectors, key) {
                            var elements = __utils__.findAll(root_selectors.main + " " + tiles_selectors.tile.price);
                            return elements[0].innerHTML.trim();
                        }, {
                            selectors: selectors,
                            key: key
                        });

                        var detail_price = casper.fetchText(root_selectors.main + " " + detail_selectors.content.body.subtitle.price).trim();
                        casper.test.assertMatch(tile_price, price_regex, "tile price has the correct value");
                        casper.test.assertMatch(detail_price, price_regex, "detail price has the correct value");
                        casper.test.assertEquals(detail_price, tile_price, "detail and selected tile have the same price");
                    }
                }
            }

            casper.test.comment("Check regexes from JSON file");
            for(var key in data.regexes) {
                var regex = new RegExp(data.regexes[key]);
                // Get only the text from the first element which has the given selector
                var text = casper.evaluate(function(selectors, key) {
                    var elements = __utils__.findAll(selectors.main + " " + key);
                    return elements[0].innerHTML.trim();
                }, {
                    selectors: root_selectors,
                    key: key
                });
                casper.test.assertMatch(text, regex, key + " text value is correct");
            }
        });
    });
}
