#Documentation - JSON files for Tiles Macrotype

##Main parameters

* **name** - (string) name of the IA;

* **id** - (string) IA id (suffix for selector div.zci--);
 
* **ia_tab_id** - (string) suffix for selector a.zcm__link--;

* **status** - (string) "live" if IA works normally;
 
* **query** - (string) the query to test, as URL;
 
* **has_detail** - (boolean) true if clicking on a tile makes the detail appear, false otherwise;
 
* **tileview_capacity** - (number) how many tiles fit in a 1336x768 window for that IA;
 
* **moreAt_url** - (string) raw URL linked in the moreAt placed on the upper right corner of metabar, empty string if there is no moreAt;

* [OPTIONAL] **metabar_regex** - (string) regex for metabar primary text, use it only if metabar has no count and item type;

* **moreAt_regex** - (string) regex for moreAt text;
 
* **template_group** - (string) template group name, empty string if it has no template group;
 
* **custom_selectors** - (object) contains key-value pairs for names and string values of custom selectors;

* **regexes** - (object) contains key-value pairs for selectors and string values of custom regexes;


##Additional parameters for each template group

####Icon

* **has_footer** - (boolean) true if IA has footer;

####Media

* **has_rating** - (boolean) true if IA has rating;

####Products

* **has_rating** - (boolean) true if IA has rating;

* **has_priceAndBrand** - (boolean) true if IA has price and brand sections;

* **has_callout** - (boolean) true if IA has detail callout;

####Text

* **has_subtitle** - (boolean) true if IA has subtitle;

* **has_footer** - (boolean) true if IA has footer;
