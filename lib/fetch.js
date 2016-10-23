
var debug = require('debug')('congregator:fetch');
var colors = require('colors');
var util = require('util');
var async = require('async');

var helpers = require('./helpers');


function Fetcher ( options ) {
    //this.request = options.request;
    this.startFetchMsg = 'beginning fetch from base: ';
}

//接口
Fetcher.prototype.setFetchMsg = function(msg ) {
    this.startFetchMsg = msg;
}

//虚拟接口 集成类应该实现该功能 获取列表
Fetcher.prototype.getList = function (opt, callback) {
    callback()
}

//虚拟接口 集成类应该实现该功能 获取列表
Fetcher.prototype.handleList = function (opt, body, callback) {
    callback()
}

Fetcher.prototype.setGetListFn = function (fn) {
    this.getList = fn;
}

Fetcher.prototype.setHandleListFn = function (fn) {
    this.handleList = fn;
}




// 参考使用 在程序里没有影响的
Fetcher.prototype.getRequestOptions = function (url) {
    return  {
        url: url,
        headers: {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml',
        },
        timeout: 10000,
        pool: false
    };
}


Fetcher.prototype.run = function(opt, callback) {
    debug( this.startFetchMsg.yellow + opt.name.magenta);

    var ranking = 0; // rank the articles by position in feed
    var formattedPosts = []; // formatted posts holder
    async.waterfall([
        // fetch raw mapping entries
        function (callback) {
            this.getList(opt, callback)
        }.bind(this),

        // handle and parse mapping entries
        function (body, callback) {
            this.handleList(opt,  body, callback);
        }.bind(this)
    ], function (err, result) {
        callback(err, result);
    });
}

exports = module.exports =  Fetcher;
