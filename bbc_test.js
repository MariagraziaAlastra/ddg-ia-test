casper.test.begin('BBC IA is correctly shown', function suite(test) {
    var query = "what+is+on+bbc+one";
    var api_url = "http://www.bbc.co.uk/bbcone/programmes/schedules/london/today.json";
    var bbc_url = "http://bbc.co.uk/";
    var program_url = bbc_url + "programmes/";
    var hour_regex = /^[0-9][0-9]:[0-9][0-9]\s-\s.[0-9][0-9]:[0-9][0-9]$/;
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
                this.captureSelector('bbc.jpeg', 'html');
                test.assertExists(selectors.ia_tab, "BBC IA is shown");

                test.comment("\n###### Begin checking for elements existence and correct nesting ######\n");
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

                test.comment("\n###### End checking for elements existence and correct nesting ######\n");
            });
        });
    });

    casper.run(function() {
        test.done();
    });
});
