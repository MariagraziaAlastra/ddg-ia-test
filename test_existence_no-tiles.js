casper.test.begin('Check elements existence and correct nesting', function suite(test) {
    // This is just for testing - the path should actually be passed as a command-line arg
    var path = "./json/no-tiles/expand_url.json";
    var data = require(path);
    var selectors = {
        'ia_tab': 'a.zcm__link--' + data.ia_tab_id,
        'main': 'div.zci--' + data.id,
        'content': {
            'root' : 'div.cw',
            'main_detail' : {
                'root' : 'div.zci__main.zci__main--detail',
                'body' : {
                    'root' : 'div.zci__body',
                    'moreAt' : {
                        'root' : 'a.zci__more-at',
                        'icon': 'img.zci__more-at__icon'
                    }
                }
            }
        },
        'aux': {
           'root' : 'div.zci__aux',
           'aux_header': 'h6.info--head',
           'aux_label': 'div.info span.info__label a'
        }
    };

    casper.start("https://bttf.duckduckgo.com/", function() {
        casper.viewport(1336, 768).then(function() {
            this.open("https://bttf.duckduckgo.com/?q=" + data.query).then(function() {
                test.comment("Viewport changed to {width: 1336, height: 768}");
                test.assertExists(selectors.ia_tab, data.name + " IA is shown");

               test.comment("Check if cw exists");
               test.assertExists((selectors.main + " " + selectors.content.root), "cw exists");

               test.comment("Check if cw contains main detail");
               test.assertExists((selectors.content.root + " " + selectors.content.main_detail.root), "cw contains main detail");

               test.comment("Check if main detail contains body");
               test.assertExists((selectors.content.main_detail.root + " " + selectors.content.main_detail.body.root),
                                "main detail contains body");

               test.comment("Check if body contains moreAt");
               test.assertExists((selectors.content.main_detail.body.root + " " + selectors.content.main_detail.body.moreAt.root),
                                "body contains moreAt");

               test.comment("Check if moreAt contains icon");
               test.assertExists((selectors.content.main_detail.body.moreAt.root + " " + selectors.content.main_detail.body.moreAt.icon),
                                "moreAt contains icon");

               if (data.has_aux) {
                   test.comment("Check if Infobox exists");
                   test.assertExists((selectors.main + " " + selectors.aux.root), "Infobox exists");

                  test.comment("Check if Infobox contains header and labels");
                   test.assertExists((selectors.aux.root + " " + selectors.aux.header), "Infobox contains header");
                   test.assertExists((selectors.aux.root + " " + selectors.aux.label), "Infobox contains labels");
                  
               }

               test.comment("Check existence of custom selectors from JSON file");
               for (var key in data.custom_selectors) {
                   test.assertExists((selectors.main + " " + data.custom_selectors[key]), data.name + " IA contains " + key);
               }

            });
        });
    });


    casper.run(function() {
        test.done();
    });
});
