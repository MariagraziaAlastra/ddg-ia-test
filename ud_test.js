casper.test.begin('Urban Dictionary IA is correctly shown', function suite(test) {
    var query = "ud rad";
    var api_url = "http://api.urbandictionary.com/v0/define?term=rad";

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

        // Check if main content and Infobox exist
        test.assertExists('div.zci--urban_dictionary div.cw', "main content exists");
        test.assertExists('div.zci--urban_dictionary div.zci__aux', "Infobox exists");

        // Check if the content elements exist
        test.assertExists('div.zci--urban_dictionary h3 span.zci__urban__word', "title exists");
        test.assertExists('div.zci--urban_dictionary p.ud_definition', "definition exists");
        test.assertExists('div.zci--urban_dictionary div.ud_example', "example exists");
        test.assertExists('div.zci--urban_dictionary a.zci__more-at', "moreAt exists");

        // Check if the Infobox elements exist
        test.assertExists('div.zci--urban_dictionary h6.info--head', "Infobox title exists");
        test.assertExists('div.zci--urban_dictionary div.info span.info__label a', "related words exist");
    });

    casper.then(function() {
        var data = this.evaluate(function(api_url) {
            return JSON.parse(__utils__.sendAJAX(api_url));
        }, {api_url: api_url});

        // Check if all the elements have the right values from the API response
        header_text =  this.fetchText('div.zci--urban_dictionary h3 span.zci__urban__word');
        test.assertEquals(header_text, data.list[0].word, "title equals the searched word");

        definition_text =  this.fetchText('div.zci--urban_dictionary p.ud_definition').trim();
        definition_text = definition_text.replace("\n", "");
        test.assertEquals(definition_text, data.list[0].definition, "the definition is the right one");

        example_text =  this.fetchText('div.zci--urban_dictionary div.ud_example div.example').trim();
        example_text = example_text.replace(/\r?\n/gi, "");
        data.list[0].example = data.list[0].example.replace(/\r?\n/gi, "");
        test.assertEquals(example_text, data.list[0].example, "the example is the right one");
    });

    casper.run(function() {
        test.done();
    });
});

