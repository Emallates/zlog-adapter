var conf = require('./conf');
var extend = conf.LIB.EXT; 
var util = conf.LIB.UTIL;
var query = conf.LIB.QUERY;
var ibase = conf.BASE.input;
// var obase = conf.BASE.output;
var rbase = conf.BASE.rbase;

module.exports = adapter;

function adapter(context, opts){
	if(opts.mode == 'central')
	if(util.validate(opts)){
		this.context = context;
		this.configs = opts;
		this._request = request;
		this.host = util.getHosts(opts);
		this.port = opts.port || 80;
		this.ibase = ibase;
		// this.obase = obase;
		this.rbase = rbase;
		this.debug = opts.debug;
	}
	if(opts.mode == 'local' || opts.mode == undefined){
	    // console.log('Logs will be generated to file logs, because log mode is being set to local');
		this.context = context;
		this.configs = opts;
		this.host = util.getHosts(opts);
		this.port = opts.port || 80;
		this.debug = opts.debug;
	}

};
function find(criteria, callback){
	var q = new query(this);
    q.asign(criteria);
    return q;
}

function request(obj, callback){ request(util.parser(obj), callback); }

adapter.prototype.create = function(obj, callback){ 
	obj.adopId = 'Zee';
	return this._request.get(obj, callback);
};

adapter.prototype.update = function(obj, callback){ 
	obj.adopId = 1122; return callback(null, obj); 
};
adapter.prototype.delete = function(obj, callback){ 
	obj.adopId = 1122; return callback(null, obj); 
};
adapter.prototype.extend = function(optional){
	var ext = new extend(this, optional, conf);
	for(key in optional) ext[key] = (util.isFunction(optional[key])) ? optional[key] : undefined;
    ext.find = find;
    // ext.exec = util.exec;
    return ext;  
};





