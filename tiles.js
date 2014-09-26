casper.test.begin('IAs with tiles are correctly shown', function suite(test) {
    // This is just for testing - the path should actually be passed as a command-line arg
    var path = "./json/tiles/soundcloud.json";
    var data = require(path);
    var metabar_regex = /^Showing\s[0-9]+\s([A-Za-z]+\+?|[A-Z])(\s|\.)(([A-Za-z]+|[A-Z])(\s|\.))*for(\s([A-Za-z]+|[A-Z]))*$/;
    var moreAt_regex = new RegExp(data.moreAt_regex);
    var mobile_regex = new RegExp(data.mobile_regex);
    var price_regex = /^..*[0-9][0-9]*(,|\.)[0-9][0-9]$/;
    var class_selected = ".is-selected";
    var class_scroll = ".can-scroll";
    var class_grid = ".has-tiles--grid";
    var class_active = ".is-active";
    var detail_link, next_items, prev_items, tot_items;
    var selectors = {
        'ia_tab': 'a.zcm__link--' + data.ia_tab_id,
        'main': 'div.zci--' + data.id,
        'tileview': 'div.tileview.js-tileview',
        'tileview_grid': 'div.tileview--grid',
        'metabar': {
            'root': 'div.zci__metabar-wrap div.zci__metabar',
            'mode': 'span.zci__metabar__mode-wrap a.zci__metabar__mode',
            'moreAt': {
                'root': 'div.zci__metabar__more-at a.zci__more-at',
                'icon': 'img.zci__more-at__icon'
            },
            'text': {
                'root': 'div.zci__metabar__primary-text',
                'count': 'span.zci__metabar__count',
                'item_type': 'span.js-metabar-itemtype'
            }
        },
        'tiles': {
            'root': 'div.tile-wrap div.zci__main--tiles.tileview__' + data.id,
            'nav_next': 'i.tile-nav--next',
            'nav_prev': 'i.tile-nav--prev',
            'tile': {
                'root': 'div.tile',
                'media_img': 'div.tile__media img.tile__media__img', // media, products
                'title': {
                    'root': 'div.tile__body .tile__title', // media, icon, products, text
                    'subtitle': 'span.tile__title__sub' // text
                },
                'icon': 'div.tile__body img.tile__icon', // icon
                'content': 'div.tile__body div.tile__content', // icon, text
                'footer': 'div.tile__body div.tile__footer', // icon, text
                'rating': 'div.tile__body div.tile__rating.one-line', // media, products
                'price': 'div.tile__body div.tile__tx.tile--pr__sub.one-line span.tile--pr__price.price', // products
                'sep': 'div.tile__body div.tile__tx.tile--pr__sub.one-line span.tile__sep', // products
                'brand': 'div.tile__body div.tile__tx.tile--pr__sub.one-line span.tile--pr__brand' // products
            },
            'mobile': {
                'root': 'div.tile--m--' + data.id,
                'icon': 'i.tile--m--mob__icn'
            }
        },
        'detail': {
            'root': 'div.tile-wrap div.zci__detail div.detail__wrap',
            'close': 'i.detail__close',
            'content': {
                'root': 'div.detail__pane',
                'media_img': 'div.detail__media img.detail__media__img',
                'body': {
                    'root': 'div.detail__body div.detail__body__content',
                    'title': 'h5.detail__title',
                    'subtitle': {
                        'root': 'p.detail__subtitle',
                        'price': 'span.detail__price', // products
                        'sep': 'span.detail__sep', // products
                        'brand': 'span.detail__brand' // products
                    },
                    'desc': '.detail__desc',
                    'rating': 'p.detail__rating', // products
                    'callout': 'span.detail__callout--pr' // products
                }
            },
            'controls': {
                'root': 'div.detail__controls',
                'next': 'i.js-detail-next',
                'prev': 'i.js-detail-prev'
            }
        }
    };

    casper.start("https://bttf.duckduckgo.com/", function() {
        casper.viewport(1336, 768).then(function() {
            this.open("https://bttf.duckduckgo.com/?q=" + data.query).then(function() {
                test.comment("Viewport changed to {width: 1336, height: 768}");
                test.assertExists(selectors.ia_tab, data.name + " IA is shown");
                if (!this.exists(selectors.ia_tab + class_active)) {
                    test.comment(data.name + " IA tab is not active: click on it")
                    this.click(selectors.ia_tab);
                }
                test.assertExists(selectors.ia_tab + class_active, data.name + " IA is active");

                test.comment("\n###### Start checking elements existence and correct nesting ######\n");
                test.comment("Check if tileview exists and it's not a grid");
                test.assertExists((selectors.main + " " +  selectors.tileview), "tileview exists");
                test.assertDoesntExist((selectors.main + " " +  selectors.tileview_grid), "tileview is not a grid");

                test.comment("Check if tileview contains metabar, tiles wrapper and detail");
                test.assertExists((selectors.main + " " + selectors.tileview + " " + selectors.metabar.root),
                                 "tileview contains metabar");
                test.assertExists((selectors.main + " " + selectors.tileview + " " + selectors.tiles.root),
                                 "tileview contains tiles wrapper");
                test.assertExists((selectors.main + " " + selectors.tileview + " " + selectors.detail.root),
                                 "tileview contains detail");

                test.comment("Check if metabar contains mode and text");
                test.assertExists((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.mode),
                                 "metabar contains mode");
                test.assertExists((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.text.root),
                                 "metabar contains text");

                if (data.moreAt_url.length > 0) {
                    test.comment("Check if metabar contains moreAt");
                    test.assertExists((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.moreAt.root),
                                     "metabar contains moreAt");
                    if (data.name !== "Quixey") {
                        test.comment("Check if metabar moreAt contains moreAt icon");
                        test.assertExists((selectors.main + " " + selectors.metabar.moreAt.root + " " + selectors.metabar.moreAt.icon),
                                     "moreAt contains moreAt icon");
                    }
                } else {
                    test.comment("No template group - moreAt shouldn't exist");
                    test.assertDoesntExist((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.moreAt.root),
                                     "metabar does not contain moreAt");
                }

                if (!data.metabar_regex) {
                    test.comment("Check if metabar text contains count and item type");
                    test.assertExists((selectors.main + " " + selectors.metabar.text.root + " " + selectors.metabar.text.count),
                                     "metabar text contains count");
                    test.assertExists((selectors.main + " " + selectors.metabar.text.root + " " + selectors.metabar.text.item_type),
                                     "metabar text contains item type");
                }

                test.comment("Check if tiles wrapper contains navigation and tiles and doesn't contain mobile tile");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.nav_next),
                                 "tiles wrapper contains forward navigation icon");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.nav_prev),
                                 "tiles wrapper contains backwards navigation icon");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.tile.root),
                                 "tiles wrapper contains tiles");
                test.assertDoesntExist((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.mobile.root),
                                 "tiles wrapper does not contain mobile tile");

                test.comment(data.name + " IA has template group " + data.template_group);
                if (data.template_group === "media" || data.template_group === "products") {
                    test.comment("Check if tiles contain image");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.media_img),
                                     "tiles contain image");
                    if (data.has_rating) {
                        test.comment("Check if tiles contain rating");
                        test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.rating),
                                         "tiles contain rating");
                    } else {
                        test.comment("Check that rating doesn't exist");
                        test.assertDoesntExist((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.rating),
                                              "tiles don't contain rating");
                    }
                }

                if (data.template_group !== "base" && data.template_group !== "") {
                    test.comment("Check if tiles contain title");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.title.root),
                                     "tiles contain title");
                    if (data.template_group === "text" && data.has_subtitle) {
                        test.comment("Check if tile title contains subtitle");
                        test.assertExists((selectors.main + " " + selectors.tiles.tile.title.root + " " + selectors.tiles.tile.title.subtitle),
                                         "title contains subtitle");
                    }
                }

                if (data.template_group === "icon") {
                    test.comment("Check if tiles contain icon");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.icon),
                                     "tiles contain icon");
                }

                if (data.template_group === "icon" ||data.template_group === "text") {
                    test.comment("Check if tiles contain content and footer");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root +  " " + selectors.tiles.tile.content),
                                     "tiles contain content");
                    if (data.has_footer) {
                        test.assertExists((selectors.main + " " + selectors.tiles.tile.root +  " " + selectors.tiles.tile.footer),
                                         "tiles contain footer");
                    }
                }

                if (data.template_group === "products" && data.has_priceAndBrand) {
                    test.comment("Check if tiles contain price, separator and brand");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.price),
                                     "tiles contain price");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root +  " " + selectors.tiles.tile.sep),
                                     "tiles contain separator");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root +  " " + selectors.tiles.tile.brand),
                                     "tiles contain brand");
                }

                test.comment("Check if detail contains closing icon, content and controls");
                test.assertExists((selectors.main + " " + selectors.detail.root + " " + selectors.detail.close),
                                 "detail contains closing icon");
                test.assertExists((selectors.main + " " + selectors.detail.root + " " + selectors.detail.content.root),
                                 "detail contains content");
                test.assertExists((selectors.main + " " + selectors.detail.root + " " + selectors.detail.controls.root),
                                 "detail contains controls");

                test.comment("Check if detail content is empty, since no tile is selected yet");
                test.assertDoesntExist((selectors.main + " " + selectors.detail.content.root + " " + selectors.detail.content.media_img),
                                      "no image in detail");
                test.assertDoesntExist((selectors.main + " " + selectors.detail.content.root + " " + selectors.detail.content.body.root),
                                      "no body in detail");

                test.comment("Check if detail controls contain previous and next");
                test.assertExists((selectors.main + " " + selectors.detail.controls.root + " " + selectors.detail.controls.prev),
                                 "detail controls contain previous");
                test.assertExists((selectors.main + " " + selectors.detail.controls.root + " " + selectors.detail.controls.next),
                                 "detail controls contain next");

                test.comment("\n###### End checking elements existence and correct nesting ######\n");
            });
        });
    });

    casper.then(function() {
        test.comment("\n###### Start checking detail visibility before and after selecting a tile ######\n");
        test.comment("Check that no tile is selected right after page loading");
        test.assertDoesntExist((selectors.main + " " + selectors.tiles.tile.root + class_selected), "no tile is selected");

        test.comment("Check if detail is hidden when no tile is selected");
        test.assertNotVisible((selectors.main + " " + selectors.detail.root), "detail is hidden");

        if (data.has_detail) {
            this.click(selectors.tiles.tile.root);
            test.comment("Performed click on the first tile");

            test.comment("Check if detail is visible now");
            test.assertVisible((selectors.main + " " + selectors.detail.root), "detail is visible");

            if (data.name !== "Videos") {
            test.comment("Check if detail content has image now");
                test.assertExists((selectors.main + " " + selectors.detail.content.root + " " + selectors.detail.content.media_img),
                                 "detail content has image");
            }

            test.comment("Check if detail content has body now");
            test.assertExists((selectors.main + " " + selectors.detail.content.root + " " + selectors.detail.content.body.root),
                             "detail content has body");

            test.comment("Check if detail body has title, subtitle and description");
            test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.title),
                             "detail body has title");
            if (data.name === "Recipes" || data.name === "Videos") {
                test.assertDoesntExist((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.subtitle.root),
                                 "no subtitle in detail body");
            } else {
                test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.subtitle.root),
                                 "detail body has subtitle");
            }
            test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.desc),
                             "detail body has description");

            if (data.template_group === "products" && data.name !== "Recipes") {
                if (data.has_rating) {
                    test.comment("Check if detail body has rating");
                    test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.rating),
                                     "detail body has rating");
                }

                if (data.has_callout) {
                    test.comment("Check if detail body has callout");
                    test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.callout),
                                     "detail body has callout");
                }

                if (data.has_priceAndBrand) {
                    test.comment("Check if detail subtitle has price, separator and brand");
                    test.assertExists((selectors.main + " " + selectors.detail.content.body.subtitle.root + " " + selectors.detail.content.body.subtitle.price),
                                     "detail subtitle has price");
                    test.assertExists((selectors.main + " " + selectors.detail.content.body.subtitle.root + " " + selectors.detail.content.body.subtitle.sep),
                                     "detail subtitle has separator");
                    test.assertExists((selectors.main + " " + selectors.detail.content.body.subtitle.root + " " + selectors.detail.content.body.subtitle.brand),
                                     "detail subtitle has brand");
                }
            }

        test.comment("Check existence of custom selectors from JSON file");
        for (var key in data.custom_selectors) {
            test.assertExists((selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
        }

        } else {
            test.comment(data.name + " IA has no detail - skip the remaining detail visibility tests");
        }

        test.comment("\n###### End checking detail visibility before and after selecting a tile ######\n");
    });

    casper.then(function() {
        test.comment("\n###### Start checking IA content values ######\n");

        test.comment("Check metabar text");
        if (!data.metabar_regex) {
            test.assertMatch(this.fetchText(selectors.main + " " + selectors.metabar.text.root).trim(), metabar_regex, 
                            "metabar text value is correct");
        } else {
            test.assertMatch(this.fetchText(selectors.main + " " + selectors.metabar.text.root).trim(), new RegExp(data.metabar_regex),
                             "metabar text value is correct");
        }

        if (data.template_group !== "") {
            test.comment("Check moreAt text and URL");
            test.assertMatch(this.fetchText(selectors.main + " " + selectors.metabar.moreAt.root).trim(), moreAt_regex,
                             "moreAt text value is correct");
            test.assertEquals(this.getElementAttribute(selectors.main + " " + selectors.metabar.moreAt.root, 'href'), data.moreAt_url,
                             "moreAt URL is correct");
        }

        if (data.template_group === "products" && data.has_priceAndBrand) {
            test.comment("Check price value");
            test.assertMatch(this.fetchText(selectors.main + " " + selectors.tiles.tile.price), price_regex,
                            "price text value is correct");
        }

        if (data.has_detail) {
            test.comment("Check selected tile and detail content");
            var detail_title = this.fetchText(selectors.main + " " + selectors.detail.content.body.title).trim();
            var tile_title = this.fetchText(selectors.main + " " + selectors.tiles.tile.root + class_selected + " " + selectors.tiles.tile.title.root).trim();

            if (detail_title.length === tile_title.length) {
                test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
            } else if (detail_title.length > tile_title.length) {
                test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
                test.assertEquals(tile_title.substr(0, tile_title.length - 3), detail_title.substr(0, tile_title.length - 3),
                                 "detail title matches selected tile title");
            } else {
                test.fail("detail title is different from selected tile title");
            }

            if (data.template_group === "media") {
                test.comment("Check if detail image matches selected tile image");
                var detail_img = this.getElementAttribute(selectors.main + " " + selectors.detail.content.media_img, 'src');
                var tile_img = this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.media_img, 'src');

                test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");
            }

            detail_link = this.getElementAttribute(selectors.main + " " + selectors.detail.content.body.root + " " + 'a', 'href');
            var tile_link = this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.root, 'data-link');

            if (data.name !== "Videos") {
                test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");
            }

            if (data.template_group === "products" && data.has_priceAndBrand) {
                test.comment("Check tile and detail price values");
                // Get only the text from the first element which has the given selector
                var tile_price = this.evaluate(function(selectors, key) {
                    var elements = __utils__.findAll(selectors.main + " " + selectors.tiles.tile.price);
                    return elements[0].innerHTML.trim();
                }, {selectors: selectors, key: key});
                var detail_price = this.fetchText(selectors.main + " " + selectors.detail.content.body.subtitle.price).trim();

                test.assertMatch(tile_price, price_regex, "tile price has the correct value");
                test.assertMatch(detail_price, price_regex, "detail price has the correct value");
                test.assertEquals(detail_price, tile_price, "detail and selected tile have the same price");
            }
        }

        test.comment("Check regexes from JSON file");
        for (var key in data.regexes) {
            var regex = new RegExp(data.regexes[key]);
            // Get only the text from the first element which has the given selector
            var text = this.evaluate(function(selectors, key) {
                var elements = __utils__.findAll(selectors.main + " " + key);
                return elements[0].innerHTML.trim();
            }, {selectors: selectors, key: key});
            test.assertMatch(text, regex, key + " text value is correct");
        }

        test.comment("\n###### End checking IA content values ######\n");
    });

    casper.then(function() {
        if (data.has_detail) {
            test.comment("\n###### Start checking detail functionality ######\n");

            test.comment("Check detail controls");
            test.assertExists((selectors.main + " " + selectors.detail.controls.next + class_scroll), "next control is active");
            test.assertDoesntExist((selectors.main + " " + selectors.detail.controls.prev + class_scroll), "previous control is disabled");

            test.comment("Click on next control and check if detail now refers to next tile");
            this.click(selectors.main + " " + selectors.detail.controls.next);
            var new_detail_link = this.getElementAttribute(selectors.main + " " + selectors.detail.content.body.root + " " + 'a', 'href');
            test.assertNotEquals(new_detail_link, detail_link, "detail now links to a different show");

            if (data.name !== "Videos") {
                test.assertEquals(this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.root + class_selected, 'data-link'), new_detail_link,
                                 "detail now refers to next tile");
            }

            test.comment("Click on the detail close icon and check if detail is now hidden and no tile is selected");
            this.click(selectors.main + " " + selectors.detail.close);
            test.assertNotVisible((selectors.main + " " + selectors.detail.root), "detail is hidden");
            test.assertDoesntExist((selectors.main + " " + selectors.tiles.tile.root + class_selected), "no tile selected");

            test.comment("\n###### End checking detail functionality ######\n");
        }
    });

    casper.then(function() {
        this.reload(function() {
            test.comment("\n###### Start checking tileview navigation functionality ######\n");
            casper.waitForSelector(selectors.ia_tab + class_active, function() {
                // leaving this here for now for debug purposes
                this.captureSelector('C:\desktop.jpeg', 'html');

                next_items = parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_next), 'data-items'));
                prev_items = parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_prev), 'data-items'));
                // If we are passing metabar_regex in JSON file it means there is no metabar count to take tot_items from
                if (data.metabar_regex) {
                    tot_items = this.evaluate(function(selectors) {
                        return __utils__.findAll(selectors.main + " " + selectors.tiles.tile.root).length;
                    }, {selectors: selectors});
                } else {
                    tot_items = parseInt(this.fetchText(selectors.main + " " + selectors.metabar.text.count));
                }
                test.comment("Check tileview navigation");
                test.assertDoesntExist((selectors.main + " " + selectors.tiles.nav_prev + class_scroll), "previous navigation is disabled");
                if (data.id === "products") {
                    test.assert((next_items === ((tot_items - data.tileview_capacity) + 2)), "next navigation has the correct number of items");
                } else {
                    if (tot_items >= data.tileview_capacity) {
                        test.assert((next_items === (tot_items - data.tileview_capacity)), "next navigation has the correct number of items");
                    } else {
                        test.assert((next_items === 0), "next navigation has the correct number of items");
                    }
                }
                test.assert((prev_items === 0), "previous navigation is empty");

                if (next_items > 0) {
                    test.assertExists((selectors.main + " " + selectors.tiles.nav_next + class_scroll), "next navigation is active");
                    test.comment("Click on next navigation and check number of items again");
                    this.click(selectors.main + " " + selectors.tiles.nav_next);
                    if (next_items >= (data.tileview_capacity * 2)) {
                        test.assert(parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_next), 'data-items')) ===
                                   (tot_items - (data.tileview_capacity * 2)), "next navigation has the correct number of items");
                        test.assert(parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_prev), 'data-items')) == data.tileview_capacity,
                                   "previous navigation has the correct number of items");
                    } else {
                        test.assert(parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_next), 'data-items')) < next_items,
                                   "next navigation has less items now");
                        test.assert(parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_prev), 'data-items')) > 0,
                                   "previous navigation has items now");
                    }
                }

            test.comment("\n###### End checking tileview navigation functionality ######\n");
            });
        });
    });

    casper.then(function() {
        if (tot_items >= (data.tileview_capacity * 3)) {
            test.comment("\n###### Start checking grid mode ######\n");

            test.comment("Click on the metabar mode button and check if tileview expands to grid");
            this.click(selectors.main + " " + selectors.metabar.mode);
            test.assertExists((selectors.main + " " +  selectors.tileview_grid), "mode switched to grid");
            test.assertExists((selectors.main + " " + selectors.tiles.root + class_grid), "tileview expanded to grid");

            test.comment("Click again on the metabar mode button and check if tileview collapses");
            this.click(selectors.main + " " + selectors.metabar.mode);
            test.assertDoesntExist((selectors.main + " " +  selectors.tileview_grid), "mode switched back");
            test.assertDoesntExist((selectors.main + " " + selectors.tiles.root + class_grid), "tileview collapsed");

            test.comment("\n###### End checking grid mode ######\n");
        }
    });

    casper.then(function() {
        casper.viewport(360, 640).then(function() {
            this.reload(function() {
                test.comment("Viewport changed to {width: 360, height: 640}");
                test.comment("\n###### Start checking mobile view ######\n");

                test.comment("Check metabar visibility - should be hidden");
                test.assertNotVisible((selectors.main + " " + selectors.metabar.root), "metabar is hidden on mobile");
                if (tot_items > 1 && data.template_group === 'media') {
                    test.comment("Check elements existence");
                    test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.mobile.root),
                                     "tiles wrapper now contains mobile tile");
                    test.assertExists((selectors.main + " " + selectors.tiles.mobile.root + " " + selectors.tiles.mobile.icon),
                                     "mobile tile contains icon");
                    test.assertExists((selectors.main + " " +  selectors.tileview_grid), "grid mode active");
                    test.assertExists((selectors.main + " " + selectors.tiles.root + class_grid), "tileview is visualized as a grid");

                    test.comment("Check mobile tile text value");
                    test.assertMatch(this.fetchText(selectors.main + " " + selectors.tiles.mobile.root).trim(), mobile_regex,
                                    "mobile tile text value is correct");

                    test.comment("Check metabar visibility after expanding content");
                    this.click(selectors.main + " " + selectors.tiles.mobile.root);
                    test.assertVisible((selectors.main + " " + selectors.metabar.root), "metabar is now visible");

                    test.comment("Click on metabar mode button and check if tileview collapses");
                    this.click(selectors.main + " " + selectors.metabar.mode);
                    test.assertNotVisible((selectors.main + " " +  selectors.tileview), "tileview is hidden");
                } else {
                    test.comment(data.name + " IA has not enough tiles - skip remaining mobile tests");
                }

                test.comment("\n###### End checking mobile view ######\n");
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
