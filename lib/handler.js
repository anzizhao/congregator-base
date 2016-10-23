
var cheerio = require('cheerio');
var url = require('url');
var helpers = require('./helpers');
var debug = require('debug')('congregator:handler');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

Object.byString = helpers.byString;

exports = module.exports = function () {
    return function (post, entry, ranking ) {
        var valid = true;
        var entry = {
            origin: entry.origin,
            source: entry.url,
            host: url.parse(entry.url).host,
            category: entry.category || []
        };
        entry.template.elements.forEach(function (element) {
            var holder;
            if (element.required) {
                valid = false;
            }

            element.items.forEach(function (item) {
                // 处理entry
                var holder = Object.byString(post, item.selector);
                entry[element.name] = holder;
            });

            if (entry[element.name] && (element.type == 'url')) {
                entry[element.name] = helpers.fixRelativePath(entry[element.name], entry.source);
            }

        });

        entry = valid ? entry : null;
        return entry;
    };
};
