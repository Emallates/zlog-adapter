var query = require('./models');
var _ = require('type-util');
module.exports = q;
function q(adapter){
  this.adapter = adapter;
  return this;
}

q.prototype.type = function(_type) { 
  this._rtype = query.type(_type);
  return this; 
}
q.prototype.select = function(model) { 
  this._select = _.isEmpty(model) ? query.select().native() : query.select().custom(model, this._rtype);
  return this; 
}
q.prototype.where = function(criteria) { 
  this._where = query.where(criteria);  
  return this;
}
q.prototype.not = function(criteria) { 
  this._not = query.not(criteria, this._not);
    return this;
}
q.prototype.range = function(criteria) { 
  this._range = query.range(criteria);
  return this;
}
q.prototype.time = function(criteria) { 
    this._time = query.time(criteria);
    return this;
}
q.prototype.paginate = function(pObj) { 
  var limit, page, skip;
   if(pObj){ limit = pObj.limit; page = pObj.page; skip = pObj.skip   }
   this._limit = query.limit(parseInt(limit) || glimit());
   this._skip = query.page({limit: limit, page: page, skip: skip});
   return this
}
q.prototype.page = function(_page) { 
  this._page = _page;
    this.paginate({limit : glimit(), page: _page || gpage()});
    return this;
}
q.prototype.skip = function(_skip) { 
    if(_.isInt(_skip) || _.isInt(parseInt(_skip)))this._skip = _skip;
    if(_.isObject(_skip) || _.isString(_skip) || _.isArray(_skip)){ 
      this._not = query.not(_skip, this._not); 
    }
    this.paginate({limit : glimit(), skip:  _skip != NaN && !_.isObject(_skip) && !_.isString(_skip) && !_.isArray(_skip)  ? _skip : gskip()});
    return this;
}
q.prototype.limit = function(_limit) { 
  var page, skip;
  if(this._skip == undefined) page = typeof this._page == 'function' || this._page == undefined ? gskip() : this._page;
    if(this._page == undefined) skip = typeof this._skip == 'function' || this._skip == undefined ? gpage() : this._skip;
    this.paginate({limit : _limit, page: page, skip: skip});
    return this;
}
q.prototype.id = function(id) { 
    this.messageId = id;
    return this;
}
q.prototype.interval = function(inter){
  this._interval = inter;
  return this;
}
q.prototype.key = function(k){
  this._key = k;
  return this;
}
q.prototype.value = function(v){
  this._value = v;
  return this;
}
q.prototype.order = function(o){
  this._order = o.toUpperCase();
  return this;
}
q.prototype.field = function(o){
  this._field = o;
  return this;
};

q.prototype.asign = function(crit) { 
  // this.where = crit; return this;
  crit = crit || {};
  for(var i in crit) { if(q.prototype[i])q.prototype[i].call(this, crit[i]);  } 
}

q.prototype.exec = function(callback){
  var config = require('../../conf');
  if(this._rtype == 'fstat') this._select = this._select[0];
  var qObj = {};
  qObj.body = {rtype: this._rtype || this.type()._rtype,index:this.index,key: this._key, value: this._value, order:this._order,field: this._field, interval: this._interval,select: this._select, where: this._where, time:this._time, skip: this._rtype != 'count' && this._rtype != 'terms' ? this._skip || gskip() : undefined, limit: this._rtype != 'count'  && this._rtype != 'terms' ? this._limit || glimit() : undefined, range: this._range, not: this._not, messageId: this.messageId};
  qObj.method = this._rtype != 'count' && this._rtype != 'terms' ? 'POST' : 'GET';
  qObj.url = this.adapter.adapter.host+config.BASE[this._rtype]+this.adapter.adapter.configs.apiKey;
  if(this.adapter.adapter.configs.debug) console.log('final-query -----> ',qObj);
  this.adapter.adapter.context._sendRequest(qObj, function(err, data){
     var r = new RegExp('Cannot');
     if(err){ callback(Error("CON", err), false); return; }
     if(r.test(data)){ callback(Error("CON", data), false); return; }
     if(_.isString(data)) data = JSON.parse(data, this);
     // if(qObj.body.rtype == 'message') cleanMessage(data);
     data = cleanNaN(data);
     if(data) callback(null, data); 
  })
}



function clean(data, model){
  for(i in model._select){
    if(data[i]) data[i] = JSON.parse(data[i]);
  }
  return data;
}
function Error(type, data){ 
  var conf = require('../../conf');
  return conf.ERRORS[type]+"["+JSON.stringify(data)+"]"; 
}
function cleanNaN(data){
  for(key in data){
    if(data[key] == 'NaN') delete data[key];
  }
  return data
}

function glimit(){
  return 12;
}
function gskip(){
  return 0;
}
function gpage(){
  return 1;
}