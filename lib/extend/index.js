var query = require('../query');
var _ = require('../util');
var msgJS = require('../msg.js');
var waterfall = require('async-waterfall');

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
};
_extend.prototype.keyCalls = function(key, cb){
    var qObj = new query(this);
    var _key = _.isString(key) ? key : Object.keys(key)[0];
    var _value = key[_key];
    qObj.type('classify').select(_key).where(key);
    if(!_.isFunction(cb)) throw Error("Callback function is required on total()");
    qObj.exec(function(err, data){
      if(err) { cb(err, false); return; }
      var finalObj = {time:data.time};
      finalObj[_value] = data.facets[_value];
      cb(null, finalObj);
    })
};

_extend.prototype.uniqueCalls = function(key, cb){
  var qObj = new query(this);
   if(!_.isString(key)) { cb("INVALID_KEY", false); return; }
   qObj.type('classify').select(key).exec(function(err, data){
        if(err) { cb(err, null); return;} 
        cb(null, {uniqueips:_.len(data.facets)});
   });
};
_extend.prototype.successPerKey = function(key, cb){
  var conf = require('../../conf');
  var qObj = new query(this);
  var _prvKey = key[Object.keys(key)[0]];
  var _select = _.isString(key) ? key : Object.keys(key)[0];
   if(Object.keys(key)[0] == "operation"){ 
    key[Object.keys(key)[0]] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];
    if(!key[Object.keys(key)[0]]) { cb("INVALID_OPERATION", false); return; }
   } 
   _select = _select == "operation" ? "method" : _select;
   qObj.type('classify').select(_select).range(conf.MSG_STATUS.SUC.RANGE);
   if(!_.isString(key)) { 
       var _where = {}; _where[Object.keys(key)[0] == "operation" ? "method" : Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
       qObj.where(_where); 
   }
   qObj.exec(function(err, data){
       var finalObj = {};
       if(_.isString(key)){ 
        finalObj['successes']= {}; for(var i in data.facets) finalObj.successes[ _.isMethod(i) && !_.isAPI(key[Object.keys(key)[0]]) ? conf.METHOD_MAP[i] : i] = data.facets[i]; 
       }  
       else { 
        var _key = Object.keys(key)[0] == "operation" && _prvKey != 'true' ? _prvKey.toUpperCase() : key[Object.keys(key)[0]];
        finalObj[_key] = {successes: data.facets[key[Object.keys(key)[0]]] || 0}; 
       }
       finalObj.time = data.time;
       finalObj.success_total = data.total; 
       cb(null, finalObj);
   });
}
_extend.prototype.errorsPerKey = function(key, cb){
  var conf = require('../../conf');
  var qObj = new query(this);
  var _prvKey = key[Object.keys(key)[0]];
  var _select = _.isString(key) ? key : Object.keys(key)[0];
   if(Object.keys(key)[0] == "operation"){ 
    key[Object.keys(key)[0]] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];
    if(!key[Object.keys(key)[0]]) { cb("INVALID_OPERATION", false); return; }
   } 
   _select = _select == "operation" ? "method" : _select;
   qObj.type('classify').select(_select).range(conf.MSG_STATUS.ERR.RANGE);
   if(!_.isString(key)) { 
       var _where = {}; _where[Object.keys(key)[0] == "operation" ? "method" : Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
       qObj.where(_where); 
   }
   qObj.exec(function(err, data){
       var finalObj = {};
       if(_.isString(key)){ 
        finalObj['errors']= {}; for(var i in data.facets) finalObj.errors[ _.isMethod(i) && !_.isAPI(key[Object.keys(key)[0]]) ? conf.METHOD_MAP[i] : i] = data.facets[i]; 
       }  
       else { 
        var _key = Object.keys(key)[0] == "operation" && _prvKey != 'true' ? _prvKey.toUpperCase() : key[Object.keys(key)[0]];
        finalObj[_key] = {errors: data.facets[key[Object.keys(key)[0]]] || 0}; 
       }
       finalObj.time = data.time;
       finalObj.error_total = data.total; 
       cb(null, finalObj);
   });
}
_extend.prototype.exceptionsPerKey = function(key, cb){
  var conf = require('../../conf');
  var qObj = new query(this);
  var _prvKey = key[Object.keys(key)[0]];
  var _select = _.isString(key) ? key : Object.keys(key)[0];
   if(Object.keys(key)[0] == "operation"){ 
    key[Object.keys(key)[0]] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];
    if(!key[Object.keys(key)[0]]) { cb("INVALID_OPERATION", false); return; }
   }
   _select = _select == "operation" ? "method" : _select;
   qObj.type('classify').select(_select).range(conf.MSG_STATUS.EXC.RANGE);
   if(!_.isString(key)) { 
       var _where = {}; _where[Object.keys(key)[0] == "operation" ? "method" : Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
       qObj.where(_where); 
   }
   qObj.exec(function(err, data){
       var finalObj = {};
       if(_.isString(key)){ 
        finalObj['exceptions']= {}; for(var i in data.facets) finalObj.exceptions[ _.isMethod(i) && !_.isAPI(key[Object.keys(key)[0]]) ? conf.METHOD_MAP[i] : i] = data.facets[i]; 
       }  
       else { 
        var _key = Object.keys(key)[0] == "operation" && _prvKey != 'true' ? _prvKey.toUpperCase() : key[Object.keys(key)[0]];
        finalObj[_key] = {exceptions: data.facets[key[Object.keys(key)[0]]] || 0}; 
       }
       finalObj.time = data.time;
       finalObj.exception_total = data.total; 
       cb(null, finalObj);
   });
}

_extend.prototype.messages = function(page, limit, cb) {
  var qObj = new query(this);
  qObj.type('message').select().where().range().paginate({page:page, limit:limit});
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(cb);
};
_extend.prototype.total = function(key, cb) {
  if(!_.isFunction(cb)) { _.logError(msgJS.CALLBACK_REQUIRED); return msgJS.CALLBACK_REQUIRED;  }
  var qObj = new query(this); var _key;
  if(_.isString(key)) { _key = key; qObj.type('classify').select(_key); }
  if(_.isObject(key)) { _
    _key = Object.keys(key)[0];
    var _where = {}; _where[_key] = key[_key];
    qObj.type('classify').select(_key).where(_where); 
  }
  if(!key || _.len(key) < 1) qObj.type('count'); 
  qObj.exec(function(err, data){
     if(err) { cb(err, false); return;  }
     var finalObj = {};
     finalObj = _.isString(key) ? _.len(data.facets) : !key || _.len(key) < 1 ? data : _.isObject(key) && _.len(data.facets) == 1 ? data.facets[Object.keys(data.facets)[0]] : data.facets;
     cb(null, finalObj);
  });
};

_extend.prototype.terms = function(cb) {
  var qObj = new query(this);
  qObj.type('terms');
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(function(err, data){
     if(err) { cb(err,false); return;  }
     cb(null, data.fields);
  });
};

_extend.prototype.fieldStat = function(field ,cb) {
  var qObj = new query(this);
  qObj.type('fstat');
  qObj.select(field);
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(cb);
};
_extend.prototype.classify = function(field ,cb) {
  var qObj = new query(this);
  qObj.type('classify');
  qObj.select(field);
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(function(err, data){
     if(err) { cb(err, false); return;  }
     var finalObj = {};
     finalObj[field] = Object.keys(data.facets);
     finalObj.time = data.time;
     cb(null, finalObj);  
  });
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
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(cb);
};
//time_range: last day, last month, last year, last 6 years
//time_range: from , to
_extend.prototype.operations = function(time, cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('method');
   qObj.time(time || 'last years');
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
   qObj.exec(function(err, data){
       console.log(err);
       if(err) { cb(err, false); return; } 
       delete data.missing; delete data.total; delete data.other; delete data.terms;
       data.actions = _.MtoA(data.facets); 
       delete data.facets;
       cb(null, data);
   });
};
_extend.prototype.operationsHitsory = function(_interval,cb){
  try{
      if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
       var qObj = new query(this);
       waterfall([function(done){
          qObj.type('fhistory');
          qObj.field('*'); qObj.where([{method:"GET"}]); qObj.interval(_interval);
          done();
       }, function(done){
           qObj.exec(function(err, data){ 
           if(err) { cb(err, false); return; } 
               var finalObj = {}; 
               finalObj.Read = {};
               finalObj.Read = data.results;
               done(null, finalObj);
           });
       }, function(finalObj, done){
          qObj.type('fhistory');
          qObj.field('*'); qObj.where([{method:"POST"}]); qObj.interval(_interval);
           qObj.exec(function(err, data){
           if(err) { cb(err, false); return; }  
               finalObj.Create = data.results;
               done(null, finalObj);
           });
       }, function(finalObj, done){
          qObj.type('fhistory');
          qObj.field('*'); qObj.where([{method:"PUT"}]); qObj.interval(_interval);
           qObj.exec(function(err, data){
           if(err) { cb(err, false); return; }  
               finalObj.Update = data.results;
               done(null, finalObj);
           });
       }, function(finalObj, done){
          qObj.type('fhistory');
          qObj.field('*'); qObj.where([{method:"DELETE"}]); qObj.interval(_interval);
           qObj.exec(function(err, data){
           if(err) { cb(err, false); return; }  
               finalObj.Delete = data.results;
               finalObj.time = data.time;
               done(null, cleanOperations(finalObj));
           });
       }],cb);
    } catch(ex){ cb(ex, false);  }  
};

_extend.prototype.systemStatusPerOperation = function(cb){
  try{
      var conf = require('../../conf');
      if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
       var qObj = new query(this);
       waterfall([function(done){
          var finalObj = []; 
          finalObj[0] = {key:conf.MSG_STATUS.EXC.LABEL, values: _.clone(conf.OPERATION_CNT)};
          finalObj[1] = {key:conf.MSG_STATUS.SUC.LABEL, values: _.clone(conf.OPERATION_CNT)};
          finalObj[2] = {key:conf.MSG_STATUS.ERR.LABEL, values: _.clone(conf.OPERATION_CNT)};
          done(null, finalObj);
       },function(finalObj,done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.READ.q);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.READ.LABEL, data.facets);
               done(null, finalObj);
          });    
       }, function(finalObj, done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.CREATE.q);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.CREATE.LABEL, data.facets);
               done(null, finalObj);
          });    
       }, function(finalObj, done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.UPDATE.q);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.UPDATE.LABEL, data.facets);
               done(null, finalObj);
          }); 
       }, function(finalObj, done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.DELETE.q);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.DELETE.LABEL, data.facets);
               var results = {errors:{}, successes:{}};
               results.errors[finalObj[0].key] = finalObj[0].values; 
               results.errors[finalObj[2].key] = finalObj[2].values;
               results.successes[finalObj[1].key] = finalObj[1].values;
               results.time = data.time;
               done(null, results);
          }); 
       }],cb);
    } catch(ex){ cb(ex, false);  }  
};
_extend.prototype.resType = function(type , code , cb){
    try{
      if(_.isArray(type)) { cb(null, "INVALID_INPUT"); return;  }
      var conf = require('../../conf');
      if(type == "list" && type != 'code') { cb(null,_.dataExtractor(conf.CODES_MAP)); return; }
      if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
      var qObj = new query(this);
      qObj.select('code').type('classify');
      qObj.exec(function(err, data){
        console.log(err, data);
        if(err) { cb(err, false); return; }
        var finalObj = {time: data.time};
        finalObj.responses = _.extractor(code, _.mapKeys(data.facets, conf.CODES_MAP)); 
        cb(null, finalObj);
      });
    } catch(ex){ cb(ex, false);  }
};
_extend.prototype.apiByStatus = function(cb){
     var conf = require('../../conf');
     var qObj = new query(this);
     waterfall([function(done){
       qObj.type('classify').select('api').range(conf.MSG_STATUS.EXC.RANGE);
       qObj.exec(function(err, data){
          var finalObj = {};
          var _keys = Object.keys(data.facets);
          for(var i in _keys){
            finalObj[_keys[i]] = {};
            finalObj[_keys[i]][conf.MSG_STATUS.EXC.LABEL] = data.facets[_keys[i]];  
          }
          done(err, finalObj);
       });
     }, function(finalObj, done){
         qObj.type('classify').select('api').range(conf.MSG_STATUS.SUC.RANGE);
         qObj.exec(function(err, data){
            var _keys = Object.keys(data.facets);
            for(var i in _keys){
              finalObj[_keys[i]] = finalObj[_keys[i]] || {};
              finalObj[_keys[i]][conf.MSG_STATUS.SUC.LABEL] = data.facets[_keys[i]];  
            }
            done(err, finalObj);
         });
     }, function(finalObj, done){
         qObj.type('classify').select('api').range(conf.MSG_STATUS.ERR.RANGE);
         qObj.exec(function(err, data){
            var _keys = Object.keys(data.facets);
            for(var i in _keys){
              finalObj[_keys[i]] = finalObj[_keys[i]] || {};
              finalObj[_keys[i]][conf.MSG_STATUS.ERR.LABEL] = data.facets[_keys[i]];  
            }
            finalObj.time = data.time;
            done(err, finalObj);
         });
     }], function(err, results){
         cb(err, results);
     })
};
_extend.prototype.apiByResponseTypes = function(key,cb){
  if(!key || _.len(key) < 1) { logError(msgJS.PARAM_REQUIRED); return msgJS.PARAM_REQUIRED;  }
  var conf = require('../../conf');
  var qObj = new query(this);
  waterfall([function(done){
  //     //single
  //     //all
      var Original = Object.keys(key)[0];
      var value = key[Original];
      key[Original] = _.apiToq(key[Original]);
      qObj.type('classify').select('code');
      if(key != null) qObj.where(key);
      qObj.exec(function(err, data){
         var finalObj = {};
         if(err) { cb(err, false); return; }
         finalObj[value] = _.mapKeys(data.facets, conf.CODES_MAP);
         finalObj.time = data.time;
         done(null,finalObj);
      })      
  }], function(err, results){
       cb(err, results); 
  })
}
function resMaker(_arr){
  if(_.isString(_arr)) return {code: _arr};
  if(_.isArray(_arr)){
      var obj = {and:[]};
      for(var i in _arr)
          obj.and.push({code: _arr[i]});  
      return obj; 
  }
}


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
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(cb);
};

_extend.prototype.getMessageById = function(criteria , cb) {
  var qObj = new query(this);
  qObj.type('single');
  qObj.id(criteria.id);
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
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
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data = getClassByCode(data);
       cb(null, data);
   });
};

_extend.prototype.locations = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('location_code');
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       // var _locations = [];
       // for(var key in data.facets)_locations.push({"ID":key, value:data.facets[key]}); 
       cb(null, data.facets);
   });
};

_extend.prototype.callers = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('http_client_ip');
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
   qObj.exec(function(err, data){
       if(err) { cb(err, false); return; }
       data.ip = data.facets; 
       delete data.missing; delete data.total; delete data.other; delete data.facets; 
       cb(null, data);
   });
};
_extend.prototype.requests = function(cb){
  var qObj = new query(this);
   qObj.type('classify');
   qObj.select('method');
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
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
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
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
   if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
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

function mapAxes(index, pkey, key, pVal, results, obj){
   obj[index] = {}; obj[index][pkey] = key;
   obj[index][pVal] =[];
   for(_time in results){
      obj[index][pVal].push({x:_time, y : results[_time].total_count});
   }
   return obj;
}

function cleanOperations(data){
  var _temp = {};
  for(var key in data.Read){ 
    _temp[key+'000'] = data.Read[key].total_count;
    data.Read[key] = _temp[key+'000']; 
  }
  for(var key in data.Create)data.Create[key] = data.Create[key].total_count;
  for(var key in data.Update)data.Update[key] = data.Update[key].total_count; 
  for(var key in data.Delete)data.Delete[key] = data.Delete[key].total_count;  
  return data;
}

function statusByKey(Obj, Key, data){
   for(var i in data){
      if(_.isStatus(i, "Successes", "Errors", "Exceptions") == Obj[0].key) Obj[0].values[Key]+=data[i];
      if(_.isStatus(i, "Successes", "Errors", "Exceptions") == Obj[1].key) Obj[1].values[Key]+=data[i]; 
      if(_.isStatus(i, "Successes", "Errors", "Exceptions") == Obj[2].key) Obj[2].values[Key]+=data[i]; 
   }
   return Obj
}


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