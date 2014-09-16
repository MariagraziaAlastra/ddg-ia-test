casper.test.begin('Urban Dictionary IA is correctly shown', function suite(test) {
    var ud_word = "rad";
    var query = "!safeoff ud " + ud_word;
    var api_url = "http://api.urbandictionary.com/v0/define?term=";
    var define_url = "http://www.urbandictionary.com/define.php?term=";
    var selectors = {
        'ia_tab': 'a.zcm__link--urban_dictionary',
        'main': 'div.zci--urban_dictionary',
        'content': 'div.cw',
        'aux': 'div.zci__aux',
        'header': 'h3 span.zci__urban__word',
        'definition': 'p.ud_definition',
        'example': 'div.ud_example',
        'example_line': 'div.example',
        'moreAt': 'a.zci__more-at',
        'moreAt_icon': 'img.zci__more-at__icon',
        'aux_header': 'h6.info--head',
        'aux_label': 'div.info span.info__label a'
    };

    casper.start("https://bttf.duckduckgo.com", function() {
        test.assertTitle("DuckDuckGo", "DDG title is the one expected");
        test.assertExists('form#search_form_homepage', "main form is found");

        // Urban Dictionary IA shows only if safe search is off
        this.fill('form#search_form_homepage', { 'q': "!safeoff " + query }, true);
        this.click('input#search_button_homepage');
    });

    casper.then(function() {
        test.assertUrlMatch(/q=ud\srad&kp=-1/, "search term has been submitted");
        test.assertExists(selectors.ia_tab, "Urban Dictionary IA is shown");

        // Check if main content and Infobox exist
        test.assertExists((selectors.main + " " + selectors.content), "main content exists");
        test.assertExists((selectors.main + " " + selectors.aux), "Infobox exists");

        // Check if the content elements exist
        test.assertExists((selectors.main + " " + selectors.header), "title exists");
        test.assertExists((selectors.main + " " + selectors.definition), "definition exists");
        test.assertExists((selectors.main + " " + selectors.example), "example exists");
        test.assertExists((selectors.main + " " + selectors.moreAt), "moreAt exists");
        test.assertExists((selectors.main + " " + selectors.moreAt + " " + selectors.moreAt_icon), "moreAt icon exists");

        // Check if the Infobox elements exist
        test.assertExists((selectors.main + " " + selectors.aux_header), "Infobox title exists");
        test.assertExists((selectors.main + " " + selectors.aux_label), "related words exist");
    });

    casper.then(function() {
        var data = this.evaluate(function(api_url) {
            return JSON.parse(__utils__.sendAJAX(api_url));
        }, {api_url: api_url + ud_word});

        // Check if all the elements have the right values from the API response
        header_text =  this.fetchText(selectors.main + " " + selectors.header);
        test.assertEquals(header_text, data.list[0].word, "title equals the searched word");

        definition_text =  this.fetchText(selectors.main + " " + selectors.definition).trim();
        definition_text = definition_text.replace("\n", "");
        test.assertEquals(definition_text, data.list[0].definition, "the definition is the right one");

        example_text =  this.fetchText(selectors.main + " " + selectors.example + " " + selectors.example_line).trim();
        example_text = example_text.replace(/\r?\n/gi, "");
        data.list[0].example = data.list[0].example.replace(/\r?\n/gi, "");
        test.assertEquals(example_text, data.list[0].example, "the example is the right one");

        moreAt_text = this.fetchText(selectors.main + " " + selectors.moreAt).trim();
        test.assertEquals(moreAt_text, "More at Urban Dictionary");

        moreAt_href = this.getElementAttribute((selectors.main + " " + selectors.moreAt), 'href');
        test.assertEquals(moreAt_href, define_url + header_text);

        var tags = this.evaluate(function(selectors) {
            var related_words = __utils__.findAll(selectors.main + " " + selectors.aux_label);
            return Array.prototype.map.call(related_words, function(word) {
                return {
                    'text': word.text,
                    'href': word.href
                };
            });
        }, {selectors: selectors});

        test.assertEval(function(tags, define_url) {
            tags.forEach(function(item) {
                if (item.href !== define_url + item.text) {
                    return false;
                }
            });
            return true;
        }, "each related word links to the correct Urban Dictionary page", {tags: tags, define_url: define_url});

        var tags_text = this.evaluate(function(tags) {
            return Array.prototype.map.call(tags, function(item) {
                return item.text;
            });
        }, {tags: tags});

        test.assertEquals(tags_text, data.tags, "all the related words returned by the API are shown");
    });

    casper.then(function() {
        // Check if Infobox is visible on desktop screens
        casper.viewport(1336, 768).then(function() {
            test.assertVisible((selectors.main + " " + selectors.aux), "Infobox is visible on desktop screens");
        });
    });

    casper.then(function() {
        // Check if Infobox is hidden on mobile screens
        casper.viewport(360, 640).then(function() {
            test.assertNotVisible((selectors.main + " " + selectors.aux), "Infobox is hidden on mobile screens");
        });
    });

    casper.run(function() {
        test.done();
    });
});

