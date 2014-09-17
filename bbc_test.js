casper.test.begin('BBC IA is correctly shown', function suite(test) {
    var query = "what is on bbc one"
    var api_url = "http://www.bbc.co.uk/bbcone/programmes/schedules/london/today.json";
    var bbc_url = "http://bbc.co.uk/";
    var program_url = bbc_url + "programmes/";
    var selectors = {
        'ia_tab': 'a.zcm__link--bbc',
        'main': 'div.zci--bbc',
        'content': 'div.tileview',
        'tile': 'div.tile--bbc',
        'detail': 'div.zci__detail.detail--bbc',
        'tile_title': 'h6.tile__title.tile__title--b-i',
        'tile_img': 'div.tile__media.tile__media--b-i img.tile__media__img',
        'moreAt': 'div.zci__metabar__more-at a.zci__more-at',
        'moreAt_icon': 'img.zci__more-at__icon'
    };

    casper.start("https://bttf.duckduckgo.com", function() {
        test.assertTitle("DuckDuckGo", "DDG title is the one expected");
        test.assertExists('form#search_form_homepage', "main form is found");

        this.fill('form#search_form_homepage', { 'q': query }, true);
        this.click('input#search_button_homepage');
    });

    casper.then(function() {
        test.assertUrlMatch(/q=what\+is\+on\+bbc\+one/, "search term has been submitted");
        test.assertExists(selectors.ia_tab, "BBC IA is shown");

        // Check if tileview  and detail exist
        test.assertExists((selectors.main + " " + selectors.tile), "tileview exists");
        test.assertExists((selectors.main + " " + selectors.detail), "detail exists");

        // Check if the tiles elements exist
        test.assertExists((selectors.main + " " + selectors.tile_title), "title exists");
        test.assertExists((selectors.main + " " + selectors.tile_img), "images exist");
        test.assertExists((selectors.main + " " + selectors.moreAt), "moreAt exists");
        test.assertExists((selectors.main + " " + selectors.moreAt + " " + selectors.moreAt_icon), "moreAt icon exists");
    });

    casper.run(function() {
        test.done();
    });
});
