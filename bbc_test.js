casper.test.begin('BBC IA is correctly shown', function suite(test) {
    var query = "what+is+on+bbc+one";
    var api_url = "http://www.bbc.co.uk/bbcone/programmes/schedules/london/today.json";
    var bbc_url = "http://www.bbc.co.uk";
    var program_url = "http://bbc.co.uk/programmes/";
    var hour_regex = /^[0-9][0-9]:[0-9][0-9](A|P){1}M\s-\s[0-9][0-9]:[0-9][0-9](A|P){1}M$/;
    var metabar_regex = /^Showing\s[0-9]+\s[a-zA-Z]+\sfor$/;
    var moreAt_regex = /BBC/;
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

                test.comment("Check if tiles wrapper contains navigation and tiles");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.nav_next),
                                 "tiles wrapper contains forward navigation icon");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.nav_prev),
                                 "tiles wrapper contains backwards navigation icon");
                test.assertExists((selectors.main + " " + selectors.tiles.root + " " + selectors.tiles.tile.root),
                                 "tiles wrapper contains tiles");

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

        test.comment("Check if detail is hidden when no tile is selected");
        test.assertNotVisible((selectors.main + " " + selectors.detail.root), "detail is hidden");

        this.click(selectors.tiles.tile.root);
        test.comment("Performed click on tile");

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

        // Choose a single tile to fetch title and text
        var tile = this.evaluate(function(selectors) {
            return {
                'title': __utils__.findAll(selectors.main + " " + selectors.tiles.tile.title)[0].innerHTML,
                'rating': __utils__.findAll(selectors.main + " " + selectors.tiles.tile.rating)[0].innerHTML
            };
        }, {selectors: selectors});
        test.comment("Check tiles content");
        test.assertMatch(tile.rating, hour_regex,
                        "rating has the correct text");

        test.comment("\n###### End checking IA content values ######\n");
    });

    casper.run(function() {
        test.done();
    });
});
