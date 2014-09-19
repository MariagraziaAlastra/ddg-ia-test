casper.test.begin('BBC IA is correctly shown', function suite(test) {
    var query = "what+is+on+bbc+one";
    var api_url = "http://www.bbc.co.uk/bbcone/programmes/schedules/london/today.json";
    var bbc_url = "http://www.bbc.co.uk";
    var program_url = "http://bbc.co.uk/programmes/";
    var hour_regex = /^[0-9][0-9]?:[0-9][0-9](A|P){1}M\s-\s[0-9][0-9]?:[0-9][0-9](A|P){1}M$/;
    var metabar_regex = /^Showing\s[0-9]+\s[a-zA-Z]+\sfor$/;
    var runtime_regex = /^Run\sTime:\s[0-9][0-9]?\s(hours?|mins){1}$/;
    var moreAt_regex = /([a-zA-Z]+\s)*BBC/;
    var mobile_regex = /([a-zA-Z]+\s)*TV/;
    var class_selected = ".is-selected";
    var class_scroll = ".can-scroll";
    var class_grid = ".has-tiles--grid";
    var tileview_capacity = 5;
    var detail_link, next_items, prev_items, tot_items;
    var selectors = {
        'ia_tab': 'a.zcm__link--bbc',
        'main': 'div.zci--bbc',
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
            'root': 'div.tile-wrap div.zci__main--tiles.tileview__bbc',
            'nav_next': 'i.tile-nav--next',
            'nav_prev': 'i.tile-nav--prev',
            'tile': {
                'root': 'div.tile.tile--bbc',
                'media_img': 'div.tile__media img.tile__media__img',
                'title': 'div.tile__body h6.tile__title',
                'rating': 'div.tile__body div.tile__rating.one-line span.tile__source.one-line'
            },
            'mobile': {
                'root': 'div.tile--m--bbc span.tile--m--mob',
                'icon': 'i.tile--m--mob__icn'
            }
        },
        'detail': {
            'root': 'div.tile-wrap div.zci__detail.detail--bbc div.detail__wrap',
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

    casper.start("https://bttf.duckduckgo.com/?q=" + query, function() {
        casper.viewport(1336, 768).then(function() {
            this.reload(function() {
                test.comment("Viewport changed to {width: 1336, height: 768}");
                test.assertExists(selectors.ia_tab, "BBC IA is shown");

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

                test.comment("Check if tiles contain image, title and rating");
                test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.media_img),
                                 "tiles contain image");
                test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.title),
                                 "tiles contain title");
                test.assertExists((selectors.main + " " + selectors.tiles.tile.root + " " + selectors.tiles.tile.rating),
                                 "tiles contain rating");

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
        test.assertEquals(this.getElementAttribute(selectors.main + " " + selectors.metabar.moreAt.root, 'href'), bbc_url,
                         "moreAt URL is correct");

        test.comment("Check selected tile and detail content");
        test.assertMatch(this.fetchText(selectors.main + " " + selectors.tiles.tile.root + class_selected + " " + selectors.tiles.tile.rating),
                        hour_regex, "rating has the correct text value");
        test.assertMatch(this.fetchText(selectors.main + " " + selectors.detail.content.body.source).trim(), runtime_regex,
                        "detail body source has the correct text value");

        var detail_title = this.fetchText(selectors.main + " " + selectors.detail.content.body.title).trim();
        var tile_title = this.fetchText(selectors.main + " " + selectors.tiles.tile.root + class_selected + " " + selectors.tiles.tile.title).trim();

        if (detail_title.length === tile_title.length) {
            test.assertEquals(detail_title, tile_title, "detail title matches selected tile title");
        } else if (detail_title.length > tile_title.length) {
            test.assertEquals(tile_title.substr(-3, 3), "...", "selected tile title has ellipsis");
            test.assertEquals(tile_title.substring(0, -3), detail_title.substr(0, tile_title.length - 3), "detail title matches selected tile title");
        } else {
            test.fail("detail title is different from selected tile title");
        }

        var detail_img = this.getElementAttribute(selectors.main + " " + selectors.detail.content.media_img, 'src');
        var tile_img = this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.media_img, 'src');

        test.assertEquals(detail_img, tile_img, "detail image matches selected tile image");

        detail_link = this.getElementAttribute(selectors.main + " " + selectors.detail.content.body.root + " " + 'a', 'href');
        var tile_link = this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.root, 'data-link');

        test.assertEquals(detail_link, tile_link, "detail URL matches selected tile URL");

        var broadcasts = this.evaluate(function(api_url) {
            var data = JSON.parse(__utils__.sendAJAX(api_url));
            return data.schedule.day.broadcasts;
        }, {api_url: api_url});

        var programmes = [];
        for (var item in broadcasts) {
            programmes.push({
                'title': broadcasts[item].programme.display_titles.title,
                'desc': broadcasts[item].programme.short_synopsis
            });
        }

        var detail_desc = this.fetchText(selectors.main + " " + selectors.detail.content.body.desc).trim();

        test.assertEvaluate(function(programmes, detail_title, detail_desc) {
            var detail_obj = {
                'title': detail_title,
                'desc': detail_desc
            };
            for (var item in programmes) {
                if (programmes[item].title === detail_obj.title &&
                    programmes[item].desc === detail_obj.desc) {
                    return true;
                }
            }
            return false;
        }, "detail content is correctly fetched from API result",
        {programmes: programmes, detail_title: detail_title, detail_desc: detail_desc});

        test.comment("\n###### End checking IA content values ######\n");
    });

    casper.then(function() {
        test.comment("\n###### Start checking detail functionality ######\n");

        test.comment("Check detail controls");
        test.assertExists((selectors.main + " " + selectors.detail.controls.next + class_scroll), "next control is active");
        test.assertDoesntExist((selectors.main + " " + selectors.detail.controls.prev + class_scroll), "previous control is disabled");

        test.comment("Click on next control and check if detail now refers to next tile");
        this.click(selectors.main + " " + selectors.detail.controls.next);
        test.assertNotEquals(this.getElementAttribute(selectors.main + " " + selectors.detail.content.body.root + " " + 'a', 'href'), detail_link,
                            "detail now links to a different show");
        test.assertEquals(this.getElementAttribute(selectors.main + " " + selectors.tiles.tile.root, 'data-link'), detail_link,
                         "detail now refers to next tile");

        test.comment("Click on the detail close icon and check if detail is now hidden and no tile is selected");
        this.click(selectors.main + " " + selectors.detail.close);
        test.assertNotVisible((selectors.main + " " + selectors.detail.root), "detail is hidden");
        test.assertDoesntExist((selectors.main + " " + selectors.tiles.tile.root + class_selected), "no tile selected");

        test.comment("\n###### End checking detail functionality ######\n");
    });

    casper.then(function() {
        this.reload(function() {
            test.comment("\n###### Start checking tileview navigation functionality ######\n");

        test.comment("Check tileview navigation");
        next_items = parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_next), 'data-items'));
        prev_items = parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_prev), 'data-items'));
        tot_items = parseInt(this.fetchText(selectors.main + " " + selectors.metabar.text.count));
        this.echo(next_items + " " + tot_items);
        test.assertDoesntExist((selectors.main + " " + selectors.tiles.nav_prev + class_scroll), "previous navigation is disabled");
        test.assert((next_items === (tot_items - tileview_capacity)), "next navigation has the correct number of items");
        test.assert((prev_items === 0), "previous navigation is empty");

        if (next_items > 0) {
            test.assertExists((selectors.main + " " + selectors.tiles.nav_next + class_scroll), "next navigation is active");
            test.comment("Click on next navigation and check number of items again");
            this.click(selectors.main + " " + selectors.tiles.nav_next);
            if (next_items >= (tileview_capacity * 2)) {
                test.assert(parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_next), 'data-items')) ===
                           (tot_items - (tileview_capacity * 2)), "next navigation has the correct number of items");
                test.assert(parseInt(this.getElementAttribute((selectors.main + " " + selectors.tiles.nav_prev), 'data-items')) == tileview_capacity,
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

    casper.then(function() {
            if (tot_items >= (tileview_capacity * 2)) {
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

                test.comment("Check metabar visibility before and after expanding content");
                test.assertNotVisible((selectors.main + " " + selectors.metabar.root), "metabar is hidden on mobile");
                this.click(selectors.main + " " + selectors.tiles.mobile.root);
                test.assertVisible((selectors.main + " " + selectors.metabar.root), "metabar is now visible");

                test.comment("Click on metabar mode button and check if tileview collapses");
                this.click(selectors.main + " " + selectors.metabar.mode);
                test.assertNotVisible((selectors.main + " " +  selectors.tileview), "tileview is hidden");

                test.comment("\n###### End checking mobile view ######\n");
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
