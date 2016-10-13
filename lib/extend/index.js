var _ = require('../extras/util.js');
var conf = require('../extras/enm');
var query = require('../query');
var waterfall = require('async-waterfall');
var msgJS = require('../extras/msg');

module.exports = extend;

function extend(client, opt, conf){
  this.client = client;
  this.opt = opt;
  this._base = conf.BASE.input;
  this._add = conf.BASE.radd;
  this._get = conf.BASE.rget;
  this._token = client.configs.apiKey;
}


extend.prototype.register = function register(form){ this._request_obj = {form: form, method:"POST", url:getUrl(this.client.host,this.client.rbase)}; };  

extend.prototype.rules = function rules(){
  
}; 

extend.prototype.performance = function performance(percentile, condition, time,cb){
    var qObj = new query(this);
    var _time = time || _.getTimeRange(new Date());
    condition[Object.keys(condition)[0]] = _.isAPI(condition[Object.keys(condition)[0]]) ? _.apiToq(condition[Object.keys(condition)[0]]) : _.APIORG(condition[Object.keys(condition)[0]]);
    qObj.type('performance').percentile(percentile).where(condition).time(time);
    qObj.exec(cb);
};

extend.prototype.keyCalls = function keyCalls(field, criteria, cb){
    var qObj = new query(this);
    qObj.type('classify'); if(field) qObj.select(field);
    var _key = _.isString(criteria) ? key : Object.keys(criteria)[0], _value = criteria[_key];
    criteria[_key] = _.isAPI(criteria[_key]) || _.isPath(criteria[_key]) ?  _.apiToq(criteria[_key]) : criteria[_key];
    qObj.where(criteria);
    qObj.exec(function(err, data){
       if(err) { cb(err, false); return;  }
       var finalObj = {time:data.time};
       finalObj[_.isString(criteria) ? criteria : _value] = _.isString(criteria) || field ? data.facets || 0 : data.facets[_value] || 0;
       finalObj['per-call-avg'] = _.divide(data.total ,_.len(data.facets));
       cb(null, finalObj);   
    });
};

extend.prototype.performanceHistoryByKey = function performanceHistoryByKey(percentile, condition, interval, time, cb){
   var qObj = new query(this);
   condition[Object.keys(condition)[0]] = _.isAPI(condition[Object.keys(condition)[0]]) ? _.apiToq(condition[Object.keys(condition)[0]]) : _.APIORG(condition[Object.keys(condition)[0]]);
   // var _time = time || _.getTimeRange(new Date());
   qObj.type('performancehistory').interval(interval).percentile(percentile).where(condition).time(_.isString(time) ? _.intervalToTimeKeyword(time) : time);
   qObj.exec(cb);
};

extend.prototype.keyCallsHistory = function keyCallsHistory(condition, time, injectkey, cb){
   var qObj = new query(this);
   condition[Object.keys(condition)[0]] = _.isAPI(condition[Object.keys(condition)[0]]) ? _.apiToq(condition[Object.keys(condition)[0]]) : condition[Object.keys(condition)[0]];
   qObj.type('history').where(condition).interval(time).time(_.intervalToTimeKeyword(time));
   qObj.exec(function(err, data){
       if(err) {  cb(err, false); return; }
       var finalObj = {};
       finalObj[injectkey ? condition[Object.keys(condition)[0]] : "results"] = data.results;
       finalObj.time = data.time;
       cb(null, finalObj);
   });
};


extend.prototype.successesPerKey = function successesPerKey(key, time, cb){
  var _time = time || _.getTimeRange(new Date(), 24);
  var qObj = new query(this);
  var _prvKey = key[Object.keys(key)[0]];
  var _select = _.isString(key) ? key : Object.keys(key)[0];
   if(Object.keys(key)[0] == "operation"){ 
    key[Object.keys(key)[0]] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];
    if(!key[Object.keys(key)[0]]) { cb("INVALID_OPERATION", false); return; }
   } 
   _select = _select == "operation" ? "api" : _select;
   qObj.type('classify').select(_select).time(_.isString(_time) ? _.intervalToTimeKeyword(_time) : _time).range(conf.MSG_STATUS.SUC.RANGE);
   if(!_.isString(key)) { 
       var _where = {}; _where[Object.keys(key)[0] == "operation" ? "api" : Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
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
};

extend.prototype.errorsPerKey = function errorsPerKey(key, time, cb){
  var _time = time || _.getTimeRange(new Date(), 24);
  var qObj = new query(this);
  var _prvKey = key[Object.keys(key)[0]];
  var _select = _.isString(key) ? key : Object.keys(key)[0];
   if(Object.keys(key)[0] == "operation"){ 
    key[Object.keys(key)[0]] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];
    if(!key[Object.keys(key)[0]]) { cb("INVALID_OPERATION", false); return; }
   } 
   _select = _select == "operation" ? "api" : _select;
   qObj.type('classify').select(_select).time(_.isString(_time) ? _.intervalToTimeKeyword(_time) : _time).range(conf.MSG_STATUS.ERR.RANGE);
   if(!_.isString(key)) { 
       var _where = {}; _where[Object.keys(key)[0] == "operation" ? "api" : Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
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
};

extend.prototype.exceptionsPerKey = function exceptionsPerKey(key, time, cb){
  var _time = time || _.getTimeRange(new Date(), 24);
  var qObj = new query(this);
  var _prvKey = key[Object.keys(key)[0]];
  var _select = _.isString(key) ? key : Object.keys(key)[0];
   if(Object.keys(key)[0] == "operation"){ 
    key[Object.keys(key)[0]] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];
    if(!key[Object.keys(key)[0]]) { cb("INVALID_OPERATION", false); return; }
   }
   _select = _select == "operation" ? "api" : _select;
   qObj.type('classify').select(_select).time(_.isString(_time) ? _.intervalToTimeKeyword(_time) : _time).range(conf.MSG_STATUS.EXC.RANGE);
   if(!_.isString(key)) { 
       var _where = {}; _where[Object.keys(key)[0] == "operation" ? "api" : Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
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
};

extend.prototype.locations = function locations(cb){
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

extend.prototype.messages = function messages(_crit, page, limit, time ,cb){
  var qObj = new query(this);
  if(_.isAPI(_crit[Object.keys(_crit)[0]]) || _.isPath(_crit[Object.keys(_crit)[0]])) _crit[Object.keys(_crit)[0]] = _.apiToq(_crit[Object.keys(_crit)[0]]);
  if(_crit.type == 'error') {  qObj.range(conf.MSG_STATUS.ERR.RANGE); }
  if(_crit.type == 'exception') qObj.range(conf.MSG_STATUS.EXC.RANGE);
  if(_crit.type == 'success') qObj.range(conf.MSG_STATUS.SUC.RANGE); 
  if(_crit.type == "GET") _crit = {method:"GET"};
  if(_crit.type == "POST") _crit = {method:"POST"};
  if(_crit.type == "PUT") _crit = {method:"PUT"};
  if(_crit.type == "DELETE") _crit = {method:"DELETE"}  ;
  if(!_crit.type && _crit) qObj.where(_crit);
  qObj.type('message').select().paginate({page:page, limit:limit});
  if(!time === false && time != null) { 
    time.from = parseInt(time.from) ? time.from : _.utcdateMiliToString(time.from);
    time.to = parseInt(time.to) ? time.to : _.utcdateMiliToString(time.to);
    qObj.time(time);
  }
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(cb);
};
extend.prototype.getMessageById = function(criteria , cb) {
  var qObj = new query(this);
  qObj.type('single');
  qObj.id(criteria.id);
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(cb);
};



/******************************************************BASE-FUNC*******************************************************************/

extend.prototype.getLocationByIp = function(ips, cb){
   var qObj = new query(this);
   qObj.type('iploc');
   qObj.ips(ips);
   qObj.exec(cb);
};

extend.prototype.classify = function(field , count, time, cb) {
  var _time = time || _.getTimeRange(new Date(), 24);
  var qObj = new query(this);
  qObj.type('classify').time(_.isString(time) ? _.intervalToTimeKeyword(time) : time);
  qObj.select(field);
  if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
  qObj.exec(function(err, data){
     if(err) { cb(err, false); return;  }
     var finalObj = {};
     finalObj[field] = count == true ? data.facets : Object.keys(data.facets);
     finalObj.time = data.time;
     cb(null, finalObj);  
  });
};

extend.prototype.total = function(key, cb) {
  if(!_.isFunction(cb)) { _.logError(msgJS.CALLBACK_REQUIRED); return msgJS.CALLBACK_REQUIRED;  }
  var qObj = new query(this); var _key;
  if(_.isString(key)) { _key = key; qObj.type('classify').select(_key); }
  if(_.isObject(key)) { _
    _key = Object.keys(key)[0];
    var _where = {}; _where[_key] = _.isAPI(key[_key]) || _.isPath(key[_key]) ? _.apiToq(key[_key]) : key[_key];
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
extend.prototype.keyCallsHistoryV1 = function(field, key, interval, cb){
   var qObj = new query(this);
   var _key = {}; _key[Object.keys(key)[0]] = {};
   _key[Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]];
   if(_.isOperation(key[Object.keys(key)[0]])) { _key = {};  _key["method"] = conf.OPERATION_MAP[key[Object.keys(key)[0]].toUpperCase()];}
   waterfall([function(done){
      qObj.type('classify'); qObj.select(field).time(_.intervalToTimeKeyword(interval || 'day'));
      qObj.exec(function(err, data){
          if(err) { done(err, false); return; }
          done(null, data.facets);
      });
   }, function(data, done){
      var finalObj = {}; 
      var arr = Object.keys(data); var finalObj = {};
      arr.forEach(function(key, index, arr){
           var _where = _key; _where[field] = _.isAPI(key) || _.isPath(key) ? _.apiToq(key) : key;
           qObj.type('history'); qObj.where(_where); qObj.interval(interval || 'day').time(_.intervalToTimeKeyword(interval || 'day'));
           qObj.exec(function(err, history){
                // console.log(history);
                finalObj[key] = history.results;
                if(_.len(finalObj) >= _.len(arr)) { done(null, finalObj); }
           });
      }, this);
   }, function(finalObj, done){
       var _data = {};
       for(var key in finalObj){  if(_.len(finalObj[key]) > 0) _data[key] = finalObj[key];  }
        done(null, _data);
   }], function(err, results){
       if(err) { cb(err, false); return; }
       cb(null, results); 
   });
   // cb(null, {keyCallsHistory:_key});
};
extend.prototype.operationsHitsory = function(operation, allowed,_interval,cb){
  try{
      if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
       var qObj = new query(this);
       waterfall([function(done){
         if(operation != null && operation != undefined && conf.OPERATION_MAP[operation.toUpperCase()]){
           qObj.type('fhistory');
           qObj.field('*'); qObj.where([{method:conf.OPERATION_MAP[operation.toUpperCase()]}]); qObj.interval(_interval || 'day');
           qObj.exec(function(err, data){
             if(err) { done(err, false); return;}
             var finalObj = {}; finalObj[operation] = {};
             for(var i in data.results){ 
                finalObj[operation][i] = {}; 
                finalObj[operation][i]['total'] = data.results[i].total_count;  
                finalObj[operation][i]['allowed'] = allowed;
                finalObj[operation][i]['usage-percentile'] = _.percentCalc(_.divide(data.results[i].total_count,allowed));
                cb(null, finalObj); return;  
             }
           }); 
         }
         done(); 
       },function(done){
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
extend.prototype.systemStatusPerOperation = function(interval, cb){
  try{
      if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
       var _time = _.intervalToTimeKeyword(interval);
       var qObj = new query(this);
       waterfall([function(done){
          var finalObj = []; 
          finalObj[0] = {key:conf.MSG_STATUS.EXC.LABEL, values: _.clone(conf.OPERATION_CNT)};
          finalObj[1] = {key:conf.MSG_STATUS.SUC.LABEL, values: _.clone(conf.OPERATION_CNT)};
          finalObj[2] = {key:conf.MSG_STATUS.ERR.LABEL, values: _.clone(conf.OPERATION_CNT)};
          done(null, finalObj);
       },function(finalObj,done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.READ.q).time(_time);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.READ.LABEL, data.facets);
               done(null, finalObj);
          });    
       }, function(finalObj, done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.CREATE.q).time(_time);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.CREATE.LABEL, data.facets);
               done(null, finalObj);
          });    
       }, function(finalObj, done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.UPDATE.q).time(_time);
          qObj.exec(function(err, data){
               finalObj = statusByKey(finalObj, conf.OPERATIONS.UPDATE.LABEL, data.facets);
               done(null, finalObj);
          }); 
       }, function(finalObj, done){
          qObj.select('code').type('classify').where(conf.OPERATIONS.DELETE.q).time(_time);
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
extend.prototype.responsesbykey = function(type, key, interval, cb){
  try{
    if(_.isArray(type)) { cb(null, "INVALID_INPUT"); return;  }    
    if(!_.isFunction(cb)) return msgJS.CALLBACK_REQUIRED;
    // if(!key || _.len(key) < 1) { logError(msgJS.PARAM_REQUIRED); return msgJS.PARAM_REQUIRED;  }
    if(type == "list") { cb(null,_.dataExtractor(conf.CODES_MAP)); return; }
    var _time = _.intervalToTimeKeyword(interval);
    var qObj = new query(this);
    waterfall([function(done){
        qObj.select('code').type('classify').time(_time);
        if(_.len(key) > 0) { 
          key[Object.keys(key)[0]] = _.isAPI(key[Object.keys(key)[0]]) || _.isPath(key[Object.keys(key)[0]]) ? _.apiToq(key[Object.keys(key)[0]]) : key[Object.keys(key)[0]]; 
          if(Object.keys(key)[0] != 'code') qObj.where(key);
        }
        qObj.exec(function(err, data){
          var finalObj = {time: data.time};
          finalObj.data = _.codeTypeDivision(data.facets);
          for(var k in finalObj.data){
            finalObj.Success = _.mapKeys(finalObj.data.Success, conf.CODES_MAP); 
            finalObj.Error = _.mapKeys(finalObj.data.Error, conf.CODES_MAP); 
            finalObj.Exception = _.mapKeys(finalObj.data.Exception, conf.CODES_MAP); 
          }
          delete finalObj.data;
          // if(_.len(key) < 1) finalObj.responses =  _.mapKeys(data.facets, conf.CODES_MAP); 
          // if(_.len(key) > 0){
          //    finalObj[key[Object.keys(key)[0]]] =  Object.keys(key)[0] == 'code' ? _.extractor(key[Object.keys(key)[0]],_.mapKeys(data.facets, conf.CODES_MAP)) : _.mapKeys(data.facets, conf.CODES_MAP);      
          // }
          done(err, finalObj);
        })
    }],cb)
  }catch(exception){
     cb(exception, false);
  }
};

/******************************************************BASE-FUNC*******************************************************************/
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

