var query = require('../query');
var _ = require('type-util');


module.exports = _extend = function(client, opt, conf) { 
  this.client = client;
  this.opt = opt;
  this._base = conf.BASE.input;
};

//form required object send back the formed object execute according to that.
_extend.prototype.register = function(){
   this._request_obj = {form: form, method:"POST", url:getUrl(this.client.host,this.client.rbase)};
   return this; 
};

_extend.prototype.logger = function(){ 
   return (_.isEmpty(this.adapter.configs.appId) || _.isEmpty(this.adapter.configs.apiKey) || this.adapter.configs.mode == 'local' || this.adapter.configs.mode == undefined) ? require('./local')() : require('./centre.js')(this.client, this.options/*, this.client.context._sendRequest*/); 
};

_extend.prototype.log = function(obj) {
   if(valid(obj)){
   var base = this.client.ibase;
   var mbody = {};
   console.log(this.client);
   mbody.msg = {
     response:{
        local : obj.response.statusCode == 304 ? undefined : _.isObject(obj.response.body) ? obj.response.body : _.isString(obj.response.body) ? obj.response.body : undefined
     },
     request:{
       body:{
         body:obj.request.body, 
         query:obj.request.query,
         params:obj.request.params
       }
       , ipxf:xforwardip(obj.request)
       , headers: obj.request.headers
       , ip:obj.request._remoteAddress
       , timestamp:new Date().toISOString()
       , tags: getTags(obj.request, this.client.configs.TAGS)
       , route:(obj.request.route) ? obj.request.route : {path:obj.request.path}
       , method: obj.request.method
     }
   };
   if(obj.tpr) for(var key in obj.tpr){  mbody.msg.response[key] = obj.tpr[key];  }
   mbody.token = this.adapter.configs.apiKey;
   mbody.app_id = this.adapter.configs.appId;  
   mbody.code = mbody.msg.mcode = parseInt(obj.response.statusCode);
   mbody = ext(obj, mbody);
   this.client.context._sendRequest({body:mbody, url:this.adapter.host+this._base, timeout:this.adapter.configs.timeout, method:"POST"}, function(err,res, data){  if(err) console.log(err); if(data) console.log(data); if(!err && !data) console.log('empty response');  });
 } else throw Error('invalid input');
 return;
};

_extend.prototype.messages = function(page, limit, cb) {
  var qObj = new query(this);
  qObj.select().where().range().paginate({page:page, limit:limit});
  if(!_.isFunction(cb)) throw Error("Callback function is required on messages()");
  qObj.exec(cb);
};
_extend.prototype.total = function(cb) {
  var qObj = new query(this);
  qObj.type('count');
  if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
  qObj.exec(cb);
};

_extend.prototype.terms = function(cb) {
  var qObj = new query(this);
  qObj.type('terms');
  if(!_.isFunction(cb)) throw Error("Callback function is required on terms()");
  qObj.exec(cb);
};

_extend.prototype.fieldStat = function(field ,cb) {
  var qObj = new query(this);
  qObj.type('fstat');
  qObj.select(field);
  if(!_.isFunction(cb)) throw Error("Callback function is required on stat()");
  qObj.exec(cb);
};
_extend.prototype.classify = function(field ,cb) {
  var qObj = new query(this);
  qObj.type('classify');
  qObj.select(field);
  if(!_.isFunction(cb)) throw Error("Callback function is required on stat()");
  qObj.exec(cb);
};
_extend.prototype.history = function(criteria , cb) {
  var qObj = new query(this);
  var _type = criteria.field ? 'fhistory' : 'history';
  qObj.type(_type);
  if(qObj._rtype == 'fhistory') qObj.field(criteria.field);
  qObj.interval(criteria.interval);
  if(criteria.where) qObj.where(criteria.where);
  if(criteria.not) qObj.not(criteria.not);
  if(criteria.range) qObj.range(criteria.range);
  if(!_.isFunction(cb)) throw Error("Callback function is required on stat()");
  qObj.exec(cb);
};
_extend.prototype.subClassStat = function(criteria , cb) {
  // order: {String} What to order on (Allowed values: TERM, REVERSE_TERM, COUNT, REVERSE_COUNT, TOTAL, REVERSE_TOTAL, MIN, REVERSE_MIN, MAX, REVERSE_MAX, MEAN, REVERSE_MEAN)
  var qObj = new query(this);
  qObj.type('cstat');
  if(criteria.order) qObj.order(criteria.order);
  if(criteria.key)  qObj.key(criteria.key);
  if(criteria.value)  qObj.value(criteria.value);
  if(criteria.where) qObj.where(criteria.where);
  if(criteria.not) qObj.not(criteria.not);
  if(criteria.range) qObj.range(criteria.range);
  if(!_.isFunction(cb)) throw Error("Callback function is required on stat()");
  qObj.exec(cb);
};

_extend.prototype.getMessageById = function(criteria , cb) {
  var qObj = new query(this);
  qObj.type('single');
  qObj.id(criteria.id);
  qObj.index = criteria.ref;
  if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
  qObj.exec(cb);
};

_extend.prototype.hook = function(criteria) { 
  this.hook = "NotImplemented yet";
  return this;
};


_extend.prototype.connector = function() {
  // console.log(this);
  // this._url =      
  return this;
};


_extend.prototype.save = function() {
  console.log(
    'saving ' + this._select + ', the ' +
    this._where + ' ' + this._time + ' query...'
  );

  // save to database here...

  return this;
};



function getUrl(host, endPoint){
  return host+endPoint;
}
function xforwardip(req){
    var ipAddress;
    var forwardedIpsStr = req.header('x-forwarded-for'); 
    if (forwardedIpsStr) {
      var forwardedIps = forwardedIpsStr.split(',');
      ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
      ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}
function getTags(req, tags){
  tags = tags || {};
  return { splitter : tags.SPLITTER || '>',tags: tags[req.route.path || req.path] } || {};
}
function ext(obj, mObj){
   var conf = require('../../conf');
   for(var v in obj){ if(conf.CB_CRITERIA[v] === obj[v]) mObj[v] = conf.CB_CRITERIA[v].valid(obj[v]);   }
   for(var index in conf.EXEC_CRITERIA.CONFIGURED){  mObj[conf.EXEC_CRITERIA.CONFIGURED[index]] = true; }
   return mObj;
};
function valid(obj){
  return obj.request && obj.response && obj.tpr;
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