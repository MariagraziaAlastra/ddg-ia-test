casper.test.begin('Check IA content values', function suite(test) {
    // This is just for testing - the path should actually be passed as a command-line arg
    var path = "./json/tiles/bbc.json";
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

                if (path.match(/no-tiles/)) {
                    if (data.template_group === "info") {
                        moreAt_selector = cw_selectors.main_detail.body.links_info.link_moreAt.root;
                    } else {
                        moreAt_selector = cw_selectors.main_detail.body.moreAt.root;
                    }
                } else {
                    moreAt_selector = metabar_selectors.moreAt.root;
                }

                if (data.template_group !== "") {
                    test.comment("Check moreAt text and URL");
                    test.assertMatch(this.fetchText(root_selectors.main + " " + moreAt_selector).trim(), moreAt_regex,
                                                   "moreAt text value is correct");
                    test.assertEquals(this.getElementAttribute(root_selectors.main + " " + moreAt_selector, 'href'), data.moreAt_url,
                                     "moreAt URL is correct");
                }

                if (!path.match(/no-tiles/)) {
                    test.comment("Check metabar text");
                    if (!data.metabar_regex) {
                        test.assertMatch(this.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), metabar_regex, 
                                        "metabar text value is correct");
                    } else {
                        test.assertMatch(this.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), new RegExp(data.metabar_regex),
                                        "metabar text value is correct");
                    }

                    if (data.template_group === "products" && data.has_price) {
                        test.comment("Check price value");
                        test.assertMatch(this.fetchText(root_selectors.main + " " + tiles_selectors.tile.price), price_regex,
                                        "price text value is correct");
                    }

                    if (data.has_detail) {
                        test.comment("Select first tile to make detail show up");
                        this.click(root_selectors.main + " " + tiles_selectors.tile.root);

                        test.comment("Check selected tile and detail content");
                        detail_title = this.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
                        tile_title = this.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected +
                                     " " + tiles_selectors.tile.title.root).trim();

                        if (data.name !== "Images") {
                            if (detail_title.length === tile_title.length) {
                                test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
                            } else if (detail_title.length > tile_title.length) {
                                test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
                                test.assertEquals(tile_title.substr(0, tile_title.length - 3), detail_title.substr(0, tile_title.length - 3),
                                                 "detail title matches selected tile title");
                            } else {
                                test.fail("detail title is different from selected tile title");
                            }
                        }

                        if (data.template_group === "media") {
                            test.comment("Check if detail image matches selected tile image");
                            var detail_img = this.getElementAttribute(root_selectors.main + " " + detail_selectors.content.media_img, 'src');
                            var tile_img = this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.media_img, 'src');

                            test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");
                        }

                        detail_link = this.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
                        tile_link = this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

                        if (data.name !== "Videos" && data.name !== "Images") {
                            test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");
                        }

                        if (data.template_group === "products" && data.has_price) {
                            test.comment("Check tile and detail price values");
                            // Get only the text from the first element which has the given selector
                            var tile_price = this.evaluate(function(selectors, key) {
                                var elements = __utils__.findAll(root_selectors.main + " " + tiles_selectors.tile.price);
                                return elements[0].innerHTML.trim();
                            }, {selectors: selectors, key: key});
                            var detail_price = this.fetchText(root_selectors.main + " " + detail_selectors.content.body.subtitle.price).trim();

                            test.assertMatch(tile_price, price_regex, "tile price has the correct value");
                            test.assertMatch(detail_price, price_regex, "detail price has the correct value");
                            test.assertEquals(detail_price, tile_price, "detail and selected tile have the same price");
                        }
                    }
                }

                test.comment("Check regexes from JSON file");
                for (var key in data.regexes) {
                     var regex = new RegExp(data.regexes[key]);
                    // Get only the text from the first element which has the given selector
                    var text = this.evaluate(function(selectors, key) {
                        var elements = __utils__.findAll(selectors.main + " " + key);
                        return elements[0].innerHTML.trim();
                    }, {selectors: root_selectors, key: key});
                    test.assertMatch(text, regex, key + " text value is correct");
                }
            });
        });
    });

    casper.then(function() {
        casper.viewport(360, 640).then(function() {
            this.reload(function() {
                test.comment("Viewport changed to {width: 360, height: 640}");

                if (data.template_group !== "") {
                    test.comment("Check moreAt text and URL");
                    test.assertMatch(this.fetchText(root_selectors.main + " " + moreAt_selector).trim(), moreAt_regex,
                                                   "moreAt text value is correct");
                    test.assertEquals(this.getElementAttribute(root_selectors.main + " " + moreAt_selector, 'href'), data.moreAt_url,
                                     "moreAt URL is correct");
                }

                if (!path.match(/no-tiles/)) {
                    test.comment("Check metabar text");
                    if (!data.metabar_regex) {
                        test.assertMatch(this.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), metabar_regex, 
                                        "metabar text value is correct");
                    } else {
                        test.assertMatch(this.fetchText(root_selectors.main + " " + metabar_selectors.text.root).trim(), new RegExp(data.metabar_regex),
                                        "metabar text value is correct");
                    }

                    if (data.template_group === "products" && data.has_price) {
                        test.comment("Check price value");
                        test.assertMatch(this.fetchText(root_selectors.main + " " + tiles_selectors.tile.price), price_regex,
                                        "price text value is correct");
                    }

                    if (data.has_detail) {
                        test.comment("Select first tile to make detail show up");
                        this.click(root_selectors.main + " " + tiles_selectors.tile.root);

                        test.comment("Check selected tile and detail content");
                        detail_title = this.fetchText(root_selectors.main + " " + detail_selectors.content.body.title).trim();
                        tile_title = this.fetchText(root_selectors.main + " " + tiles_selectors.tile.root + class_selected +
                                     " " + tiles_selectors.tile.title.root).trim();

                        if (data.name !== "Images") {
                            if (detail_title.length === tile_title.length) {
                                test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
                            } else if (detail_title.length > tile_title.length) {
                                test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
                                test.assertEquals(tile_title.substr(0, tile_title.length - 3), detail_title.substr(0, tile_title.length - 3),
                                                 "detail title matches selected tile title");
                            } else {
                                test.fail("detail title is different from selected tile title");
                            }
                        }

                        if (data.template_group === "media") {
                            test.comment("Check if detail image matches selected tile image");
                            var detail_img = this.getElementAttribute(root_selectors.main + " " + detail_selectors.content.media_img, 'src');
                            var tile_img = this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.media_img, 'src');

                            test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");
                        }

                        detail_link = this.getElementAttribute(root_selectors.main + " " + detail_selectors.content.body.root + " " + 'a', 'href');
                        tile_link = this.getElementAttribute(root_selectors.main + " " + tiles_selectors.tile.root, 'data-link');

                        if (data.name !== "Videos" && data.name !== "Images") {
                            test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");
                        }

                        if (data.template_group === "products" && data.has_price) {
                            test.comment("Check tile and detail price values");
                            // Get only the text from the first element which has the given selector
                            var tile_price = this.evaluate(function(selectors, key) {
                                var elements = __utils__.findAll(root_selectors.main + " " + tiles_selectors.tile.price);
                                return elements[0].innerHTML.trim();
                            }, {selectors: selectors, key: key});
                            var detail_price = this.fetchText(root_selectors.main + " " + detail_selectors.content.body.subtitle.price).trim();

                            test.assertMatch(tile_price, price_regex, "tile price has the correct value");
                            test.assertMatch(detail_price, price_regex, "detail price has the correct value");
                            test.assertEquals(detail_price, tile_price, "detail and selected tile have the same price");
                        }
                    }
                }

                test.comment("Check regexes from JSON file");
                for (var key in data.regexes) {
                     var regex = new RegExp(data.regexes[key]);
                    // Get only the text from the first element which has the given selector
                    var text = this.evaluate(function(selectors, key) {
                        var elements = __utils__.findAll(selectors.main + " " + key);
                        return elements[0].innerHTML.trim();
                    }, {selectors: root_selectors, key: key});
                    test.assertMatch(text, regex, key + " text value is correct");
                }

            });
        });
    });


    casper.run(function() {
        test.done();
    });
});
