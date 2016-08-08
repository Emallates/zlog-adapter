var query = require('../query');
var _ = require('../util');


module.exports = _extend = function(client, opt, conf) { 
  this.client = client;
  this.opt = opt;
  this._base = conf.BASE.input;
  this._add = conf.BASE.radd;
  this._get = conf.BASE.rget;
  this._token = client.configs.apiKey;
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
   mbody.code = mbody.msg.mcode = parseInt(obj.response.statusCode || obj.code);
   mbody = ext(obj, mbody);
   this.client.context._sendRequest({body:mbody, url:this.adapter.host+this._base, timeout:this.adapter.configs.timeout, method:"POST"}, function(err,res, data){  /**/  });
 } else throw Error('invalid input');
 return;
};

var JSONEX = {
    stringify: function(obj){
          var jsonified = {}
          jsonified.type = obj['type'];
          jsonified.value = jsonified.type == "Function" ? obj['value'].toString() : obj['value'];
          return JSON.stringify(jsonified)
    },
    parse: function(json){
          objectified = {};
          var obj;
          try{
            obj = JSON.parse(json);
          } catch(e){ 
          if(!obj) obj = json;  
          for(i in obj){
              if(obj[i].type == "RegExp" || obj['type'] == 'RegExp'){
                  var m = obj[i].value.match(/\/(.*)\/([a-z]+)?/) || obj['value'].match(/\/(.*)\/([a-z]+)?/) 
                  objectified['value'] = new RegExp(m[1],m[2]);
              } else if(obj[i].type == "String" || obj['type'] == 'String'){
                  objectified['value'] = obj[i].value || obj['value'];
              } else if(obj[i].type == "Function" || obj['type'] == 'Function'){
                var val = obj[i].value || obj['value'];
                  objectified['value'] = new Function("return ("+val+")")();
              }   
          }
          return objectified
          }
    }
};

_extend.prototype.rules = function(model, Callback){
   if(ValidRule(model)){ 
     if(model.ftype == 'set'){
        model = parser(model);
        var rBody = getRbody(model);
     }
     var body = model.ftype == 'set' ? {body:rBody, url: this.adapter.host+'/engine'+this._add , method : "POST"} : setQS(model,{body:model.rule, url: this.adapter.host+'/engine'+this._get+'/'+this._token , method : "GET"}); 
     if(body.method == "POST") body.body.token = this._token;
     this.client.context._sendRequest(body, function(err, data){  
         if(err) Callback(err, false);
         Callback(null, data);
     });   
   } else return "RULE_MODEL_INVALID";

};



function getRbody(model){
  if(model.type == "operator") return {op:model.rule, type:model.type};
  if(model.type == "keyword") return {kw:model.rule, type:model.type};
  if(model.type == "rule") return {rule:model.rule, type:model.type};
  if(model.type == "knowledgebase") return {kb:model.rule, type:model.type};
}
 
function parser(model){
  if(model.type == 'rule' || model.type == 'knowledgebase'){
    if(!_.isArray(model.rule))
    for(i in model.rule){
      if(model.rule[i].type == 'action'){
        if(model.rule[i].value.type == "Function") model.rule[i].value = JSONEX.stringify(model.rule[i].value); 
      }
    }
    if(_.isArray(model.rule)){
      for(i in model.rule){
        for(key in model.rule[i]){  
          var _type = model.rule[i][key].type || model.rule[i][key][0].type;
          if(_type == 'action'){
              if(model.rule[i][key].value.type == "Function") model.rule[i][key].value = JSONEX.stringify(model.rule[i][key].value); 
          }
        }
      }
    }
  }
  if(model.type == 'operator') { 
     if(model.rule['function'] != undefined)if(model.rule.function.type == "Function") model.rule.function = JSONEX.stringify(model.rule.function); }
  if(model.type == 'keyword' && model.rule.function) { 
    if(model.rule['function'] != undefined)if(model.rule.function.type == "Function") model.rule.function = JSONEX.stringify(model.rule.function); 
  }
  return model;
}

function clean(model){
  var obj ={};
  for(i in model) { 
    if(model[i] != undefined) obj[i] = model[i];
  }
  return obj; 
}

function setQS(model, obj){
   var qs = require('querystring');
   obj.url+='?'+qs.stringify(clean({type:model.type, key:model.key}));
   return obj;
}

function ValidRule(model){
  if(model.ftype != 'get' && model.ftype != 'set') return false;
  if(model.type != 'rule' && model.type != 'knowledgebase' && model.type != 'keyword' && model.type != 'operator') return false;
  return true;
}

_extend.prototype.messages = function(page, limit, cb) {
  var qObj = new query(this);
  qObj.type('message').select().where().range().paginate({page:page, limit:limit});
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
  if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
  qObj.exec(cb);
};

_extend.prototype.hook = function(criteria) { 
  this.hook = "NotImplemented yet";
  return this;
};

_extend.prototype.status = function(cb){
  // we can add more things to status other then key in getClassByCode
   var qObj = new query(this);
   qObj.type('classify');
   qObj.select('code');
   if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data = getClassByCode(data);
       cb(null, data);
   });
};

_extend.prototype.locations = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('location_country');
   if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data.countries = data.terms; 
       delete data.missing; delete data.total; delete data.other; delete data.terms; 
       cb(null, data);
   });
};
_extend.prototype.callers = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('http_client_ip');
   if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data.callers = data.terms; 
       delete data.missing; delete data.total; delete data.other; delete data.terms; 
       cb(null, data);
   });
};
_extend.prototype.requests = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('method');
   if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data.calls = data.terms; 
       delete data.missing; delete data.total; delete data.other; delete data.terms; 
       cb(null, data);
   });
};

_extend.prototype.browserByCall = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('client_info');
   if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data.calls = data.terms; 
       delete data.missing; delete data.total; delete data.other; delete data.terms; 
       cb(null, data);
   });
};

_extend.prototype.browsers = function(page,limit,cb){
  var qObj = new query(this);
   qObj.type('message');
   qObj.select('client_info');
   qObj.paginate({page:page, limit:limit});
   if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data = cleanBrowser(data);
       cb(null, data);
   });
};

function cleanBrowser(data){
  data.browsers = data.logs; 
  data.total = data.total_results;
  for(var i in data.browsers){  data.browsers[i] = data.browsers[i].headers['user-agent'];  delete data.browsers[i].timestamp; delete data.browsers[i].ref; }
  delete data.missing; delete data.total_results; delete data.other; delete data.logs; 
  return data
}

function getClassByCode(obj){
  var final_obj = {"ERRORS":0, EXCEPTIONS:0, SUCCESSES:0, timestamp: obj.timestamp};
  for(var i in obj.facets)if(i[0] == "2" || i[0] == "3") final_obj.SUCCESSES+=obj.facets[i];else if(i[0] == "4") final_obj.ERRORS+=obj.facets[i];else final_obj.EXCEPTIONS+=obj.facets[i];
  return final_obj;
}


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
  return { splitter : tags.splitter || '>',tags: tags[req.route.path || req.path] } || {};
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