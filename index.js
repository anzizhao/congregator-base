var request = require('request');
var colors = require('colors');

var Fetcher =  require('./lib/fetch');
var Content =  require('./lib/content');
var http = require('http');

function Congregator (options) {
    this.ipc = options.ipc;
    this.handleEntry = options.handleEntry;
    this.getSources = options.getSources;
    this.waitTime = options.waitTime || 10000;
    this.timeout = options.timeout || 10000;

    var agent = new http.Agent(); // http agent
    agent.maxSockets = options.sockets || 5;
    this.agent = agent;
    this.fetcher = new Fetcher({ request: request });
    this.contenter = new Content();
}

Congregator.prototype.content = function(opt, entries, callback) {
    this.contenter.run(opt, entries, callback);
} 

//每一个子类应该有自己的handler
Congregator.prototype.handler = require('./lib/handler')();

Congregator.prototype.distribute = require('./lib/distribute')();
Congregator.prototype.fetch = function (entry , callback) {
    this.fetcher.run( entry, callback)
}

Congregator.prototype.process = require('./lib/process')();
Congregator.prototype.run = require('./lib/run')();

Congregator.prototype.finishRunMsg = function(){
    // interface  should be rewrite for the inherit
    return '**Congregator- done waiting - commensing new fetch..............**'.blue;
} 

exports = module.exports = Congregator;
