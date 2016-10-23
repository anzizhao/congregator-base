var read = require('node-read');
var async = require('async');
var debug = require('debug')('congregator:content');
var util = require('util');
var url = require('url');
var helpers = require('./helpers');

var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();


function Content() {

}
//  虚拟接口  接口获取内容
Content.prototype.getContent = function(opt, item, callback ){
    // error:  callback error,  
    // right : return url or html 
    return  ''
}
Content.prototype.setGetContentFn = function(fn){
    this.getContent = fn;
}

Content.prototype.run = function( opt, entries, callback) {
    if (!opt.body){
        callback(null, null);
        return;
    }
    if (!opt.linkref){
        callback(null, null);
        return;
    }

    var processed = [];

    // loop through each entry and get the body content
    async.each(entries, function (item, callback) {
        //已有的内容 不在抓取
        if( item.content ) {
            callback();
        } else {
            process.nextTick(function () {
                async.waterfall([
                    // fetch raw mapping entries
                    function (callback) {
                        var illegalDomain = helpers.containsIllegalDomain(item[opt.linkref]);
                        if (!item[opt.linkref] || illegalDomain) {
                            debug('link contains illegal domain: ' + illegalDomain);
                            callback();
                            return;
                        }
                        var urlOrHtml = this.getContent(opt, item, callback); 

                    }.bind(this),

                    // handle and parse mapping entries
                    function (urlOrHtml, callback) {
                        read( urlOrHtml, 
                             { pool: this.agent, timeout: this.timeOut }, 
                             function (err, article, res) {
                                 // override when error occurs
                                 if (err) {
                                     debug('got error for guid: ' + item.guid + ' - ' + util.inspect(err));
                                     callback();
                                     return;
                                 }

                                 // add content to item
                                 item.content = {
                                     title: article.title,
                                     body: entities.decode(article.content),
                                     image: helpers.fixRelativePath(helpers.getMetaImage(article.dom), item[opt.linkref])
                                 };

                                 // add to result list
                                 processed.push(item);

                                 // callback
                                 callback();
                             }.bind(this));
                    }.bind(this)
                ], function (err) {
                    callback(err);
                });
            }.bind(this));

        }
    }.bind(this),
    function (err) {
        if (err) debug(util.inspect(err));
        callback(err, processed);
    });
};


exports = module.exports =  Content;
