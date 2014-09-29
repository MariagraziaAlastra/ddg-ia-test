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

    function checkSelectors(root, elements) {
        for (var key in elements) {
            if (elements[key] !== null && key !== 'root') {
                if (typeof elements[key] === 'object') {
                    return (casper.exists(root + " " + elements[key].root) && checkSelectors(elements[key].root, elements[key]));
                } else if (typeof elements[key] === 'string') {
                    return casper.exists(root + " " + elements[key]);
                }
            }
        }
}

    casper.start("https://bttf.duckduckgo.com/", function() {
        casper.viewport(1336, 768).then(function() {
            this.open("https://bttf.duckduckgo.com/?q=" + data.query).then(function() {
                test.comment("Viewport changed to {width: 1336, height: 768}");
                test.assertExists(selectors.ia_tab, data.name + " IA is shown");

                test.comment("Check content selectors")
                test.assert(checkSelectors(selectors.main, selectors.content), "Cw and its nested elements exist");

               if (data.has_aux) {
                   test.comment("Check Infobox selectors")
                   test.assert(checkSelectors(selectors.main, selectors.aux), "Infobox and its nested elements exist");
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
