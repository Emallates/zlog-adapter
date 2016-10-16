'use strict';
var conf = require('../.configuration')
, extend = require('./extend') 
, query = require('./query')
, _ = require('./extras/util');

module.exports = adapter;

function adapter(context, opts){
	if(_.nativeCompare(opts.mode, conf.MODE.REMOTE, '=='))
	if(_.validate(opts)){
		this.context = context;
		this.configs = opts;
		// this._request = request;
		this._request = context._sendRequest;
		this.host = _.getHosts(opts);
		this.port = opts.port || 80;
		this.ibase = conf.BASE.input;
		this.rbase = conf.BASE.rbase;
		this.debug = opts.debug;
	}
	if(_.nativeCompare(opts.mode, conf.MODE.LOCAL, '==') || _.nativeCompare(opts.mode, undefined, '==')){
		this.context = context;
		this.configs = opts;
		this.host = _.getHosts(opts);
		this.port = opts.port || 80;
		this.debug = opts.debug;
	}

};
function find(criteria, callback){
	var q = new query(this);
    q.asign(criteria);
    return q;
}

function request(obj, callback){ request(_.parser(obj), callback); }

adapter.prototype.create = function(obj, callback){  return callback(null, 503); };

adapter.prototype.update = function(obj, callback){ return callback(null, 503); };

adapter.prototype.delete = function(obj, callback){  return callback(null, 503); };

adapter.prototype.extend = function(optional){
	var ext = new extend(this, optional, conf);
	let plugin = this.configs.plugin;
	if(plugin != undefined) ext[plugin.split('-')[plugin.split('-').length - 1] == 'logger' ? 'logger' : plugin] = require(plugin)(this);
	for(key in optional) ext[key] = (_.isFunction(optional[key])) ? optional[key] : undefined;
	ext.find = find; 
    return ext;  
};