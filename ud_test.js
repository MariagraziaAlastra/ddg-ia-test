casper.test.begin('Urban Dictionary IA is shown', function suite(test) {
    var query = "ud rad";

    casper.start("https://bttf.duckduckgo.com", function() {
        test.assertTitle("DuckDuckGo", "DDG title is the one expected");
        test.assertExists('form#search_form_homepage', "main form is found");
        // Urban Dictionary IA shows only if safe search is off
        this.fill('form#search_form_homepage', { 'q': "!safeoff " + query }, true);
        this.click('input#search_button_homepage');
    });

    casper.then(function() {
        test.assertUrlMatch(/q=ud\srad&kp=-1/, "search term has been submitted");
        test.assertExists('a.zcm__link--urban_dictionary', "Urban Dictionary IA is shown");
    });

    casper.run(function() {
        test.done();
    });
});

