casper.test.begin('IAs with tiles are correctly shown', function suite(test) {
    // This is just for testing - the path should actually be passed as a command-line arg
    var path = "./json/tiles/airlines.json";
    var data = require(path);
    var metabar_regex = /^Showing\s[0-9]+\s[a-zA-Z]+\s([a-zA-Z]+\s)*for$/;
    var moreAt_regex = new RegExp(data.moreAt_regex);
    var class_selected = ".is-selected";
    var class_scroll = ".can-scroll";
    var class_grid = ".has-tiles--grid";
    var detail_link, next_items, prev_items, tot_items;
    var selectors = {
        'ia_tab': 'a.zcm__link--' + data.id,
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
                'root': 'div.tile.tile--' + data.id,
                'media_img': 'div.tile__media img.tile__media__img', // media
                'title': 'div.tile__body h6.tile__title', // media
                'rating': 'div.tile__body div.tile__rating.one-line span.tile__source.one-line' //media
            },
            'mobile': {
                'root': 'div.tile--m--bbc span.tile--m--mob',
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
                    'title': 'a h5.detail__title',
                    'subtitle': 'p.detail__subtitle',
                    'source': 'p.detail__source',
                    'desc': 'p.detail__desc'
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

                test.comment("Check if metabar contains mode, moreAt and text");
                test.assertExists((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.mode),
                                 "metabar contains mode");
                test.assertExists((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.moreAt.root),
                                 "metabar contains moreAt");
                test.assertExists((selectors.main + " " + selectors.metabar.root + " " + selectors.metabar.text.root),
                                 "metabar contains text");

                test.comment("Check if metabar moreAt contains moreAt icon");
                test.assertExists((selectors.main + " " + selectors.metabar.moreAt.root + " " + selectors.metabar.moreAt.icon),
                                 "moreAt contains moreAt icon");

                test.comment("Check if metabar text contains count and item type");
                test.assertExists((selectors.main + " " + selectors.metabar.text.root + " " + selectors.metabar.text.count),
                                 "metabar text contains count");
                test.assertExists((selectors.main + " " + selectors.metabar.text.root + " " + selectors.metabar.text.item_type),
                                 "metabar text contains item type");

                test.comment("Check if tiles wrapper contains navigation and tiles and doesn't contain mobile tile");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.nav_next),
                                 "tiles wrapper contains forward navigation icon");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.nav_prev),
                                 "tiles wrapper contains backwards navigation icon");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.tile.root),
                                 "tiles wrapper contains tiles");
                test.assertDoesntExist((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.mobile.root),
                                 "tiles wrapper does not contain mobile tile");

                if (data.template_group === "media") {
                    test.comment(data.name + " IA has template group media:");
                    test.comment("Check if tiles contain image, title and rating");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.media_img),
                                     "tiles contain image");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.title),
                                     "tiles contain title");
                    test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.rating),
                                     "tiles contain rating");
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

                test.comment("Check existence of custom selectors from JSON file");
                for (var key in data.custom_selectors) {
                    test.assertExists((selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
                }

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

            test.comment("Check if detail content has image and body now");
            test.assertExists((selectors.main + " " + selectors.detail.content.root + " " + selectors.detail.content.media_img),
                             "detail content has image");
            test.assertExists((selectors.main + " " + selectors.detail.content.root + " " + selectors.detail.content.body.root),
                             "detail content has body");

            test.comment("Check if detail body has title, subtitle, source and description");
            test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.title),
                             "detail body has title");
            test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.subtitle),
                             "detail body has subtitle");
            test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.source),
                             "detail body has source");
            test.assertExists((selectors.main + " " + selectors.detail.content.body.root + " " + selectors.detail.content.body.desc),
                             "detail body has description");
        } else {
            test.comment(data.name + " IA has no detail - skip the remaining detail visibility tests");
        }

        test.comment("\n###### End checking detail visibility before and after selecting a tile ######\n");
    });

    casper.then(function() {
        test.comment("\n###### Start checking IA content values ######\n");

        test.comment("Check metabar text");
        test.assertMatch(this.fetchText(selectors.main + " " + selectors.metabar.text.root).trim(), metabar_regex, 
                         "metabar text value is correct");

        test.comment("Check moreAt text and URL");
        test.assertMatch(this.fetchText(selectors.main + " " + selectors.metabar.moreAt.root).trim(), moreAt_regex,
                         "moreAt text value is correct");
        test.assertEquals(this.getElementAttribute(selectors.main + " " + selectors.metabar.moreAt.root, 'href'), data.moreAt_url,
                         "moreAt URL is correct");

        if (data.has_detail) {
            test.comment("Check selected tile and detail content");
            var detail_title = this.fetchText(selectors.main + " " + selectors.detail.content.body.title).trim();
            var tile_title = this.fetchText(selectors.main + " " + selectors.tiles.tile.root + class_selected + " " + selectors.tiles.tile.title).trim();

            if (detail_title.length === tile_title.length) {
                test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
            } else if (detail_title.length > tile_title.length) {
                test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
                test.assertEquals(tile_title.substring(0, -3), detail_title.substr(0, tile_title.length - 3),
                                 "detail title matches selected tile title");
            } else {
                test.fail("detail title is different from selected tile title");
            }

            var detail_img = this.getElementAttribute(selectors.main + " " + selectors.detail.content.media_img, 'src');
            var tile_img = this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.media_img, 'src');

            test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");

            detail_link = this.getElementAttribute(selectors.main + " " + selectors.detail.content.body.root + " " + 'a', 'href');
            var tile_link = this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.root, 'data-link');

            test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");
        }

        test.comment("Check regexes from JSON file");
        for (var key in data.regexes) {
            var regex = new RegExp(data.regexes[key]);
            test.assertMatch(this.fetchText(selectors.main + " " + key).trim(), regex, key + " text value is correct");
        }

        test.comment("\n###### End checking IA content values ######\n");
    });

    casper.run(function() {
        test.done();
    });
});
