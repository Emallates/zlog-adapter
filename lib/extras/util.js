var conf = require('./enm');
var extend = require('extend');

var util = function(){};

util.prototype.divide = function(dividend, divisor){return dividend/divisor;};

util.prototype.multiply = function(n1, n2){return n1*n2; };


util.prototype.isEmpty = function(data){    
  return this.isString(data) ? this.isStringEmpty(data) : this.isArray(data) ? this.isArrayEmpty(data) : this.isObject(data) ? this.isObjectEmpty(data) : this.isUndefined(data) ? true : this.isNull(data) ? true : 'INVALID_DATA'; 
};

util.prototype.type = function(data){ return Object.prototype.toString.call(data); };

util.prototype.isStringEmpty = function(data){  return this.nativeCompare(this.len(data), 1, '<') ? true : false;  };

util.prototype.isArrayEmpty = function(data){  return this.nativeCompare(this.len(data), 1, '<') ? true : false;  };

util.prototype.isObjectEmpty = function(data){ return this.nativeCompare(this.len(data), 1, '<') ? true : false; };

util.prototype.len = function(data){ return this.isArray(data) || this.isString(data) ? data.length : Object.keys(data).length;; };

util.prototype.isInt = function(data){  return this.nativeCompare(this.type(data), _int(), '==') ? true : this.nativeCompare(parseInt(data), _int(), '==') ? true : false; };

util.prototype.isArray = function(data){  return this.nativeCompare(this.type(data), _array(), '==');  };

util.prototype.isString = function(data){  return this.nativeCompare(this.type(data), _string(), '==');  };

util.prototype.isObject = function(data){ return this.nativeCompare(this.type(data), _object(), '==');  };

util.prototype.isFunction = function(data){ return this.nativeCompare(this.type(data), _function(), '==');  };

util.prototype.isBoolean = function(data){  return this.nativeCompare(this.type(data), _boolean(), '==');  }

util.prototype.isUndefined = function(data){ return this.nativeCompare(this.type(data), _undefined(), '==');   }; 

util.prototype.isNull = function(data){ return this.nativeCompare(this.type(data), _null(), '=='); };

util.prototype.APIORG = function(data){
   return data.split('/').join('\\/');
}

util.prototype.isAPI = function(data){ var api = _apiRegex();
  return api.GET.test(data) || api.POST.test(data) || api.PUT.test(data) || api.DELETE.test(data);
};

util.prototype.isSuccess = function(data){
   if(this.nativeCompare(parseInt(data), 200 , '>=') && this.nativeCompare(parseInt(data), 399 , '<=')) return true; 
};

util.prototype.isError = function(data){
   if(this.nativeCompare(parseInt(data), 400 , '>=') && this.nativeCompare(parseInt(data), 499 , '<=')) return true; 
};

util.prototype.isException = function(data){
   if(this.nativeCompare(parseInt(data), 500 , '>=')) return true; 
};

util.prototype.isPath = function(data){ return /\//ig.test(data); }

util.prototype.isOperation = function(data){ var operation = _operationRegex();
 return operation.READ.test(data.toUpperCase()) || operation.CREATE.test(data.toUpperCase()) || operation.UPDATE.test(data.toUpperCase()) || operation.DELETE.test(data.toUpperCase());  
};

util.prototype.isMethod = function(data){ var method = _methodRegex(); 
  return method.GET.test(data) || method.POST.test(data) || method.PUT.test(data) || method.DELETE.test(data);
};

util.prototype.intervalToTimeKeyword = function(_interval){ return this.len(_interval) >= 3 ? 'last '+_interval : undefined; };

util.prototype.codeTypeDivision = function(data){
  var finalobj = {Success:{}, Error:{}, Exception:{}}; 
  for(var key in data){ 
    if(this.isSuccess(key)) finalobj.Success[key] = data[key]; 
    if(this.isError(key)) finalobj.Error[key] = data[key]; 
    if(this.isException(key)) finalobj.Exception[key] = data[key]; 
  }
  return finalobj;
}

util.prototype.getTimeRange = function(d, hours){
  var _to = Math.round(d.getTime() / 1000);
  var _from = _to - ((hours || 24) * 3600);
  return {to : this.dateMiliToString(_to), from : this.dateMiliToString(_from)};
};

util.prototype.getPercentile = function(n){return this.divide(n, 100); };
//epoch
util.prototype.dateMiliToString = function(time){
  var date = new Date(time * 1000);
  return date.getFullYear().toString()+'-'+(date.getMonth() + 1).toString()+'-'+date.getDate().toString()+'T'+date.getHours().toString()+':'+date.getMinutes().toString()+':'+date.getSeconds().toString()+'.000Z';
};
//utc
util.prototype.utcdateMiliToString = function(time){
  var date = new Date(parseInt(time));
  // console.log(date);
  return date.getFullYear().toString()+'-'+(date.getMonth() + 1).toString()+'-'+date.getDate().toString()+'T'+date.getHours().toString()+':'+date.getMinutes().toString()+':'+date.getSeconds().toString()+'.000Z';
};
util.prototype.zoneStringToMili = function(time){
   return new Date( new Date(time).getTime() + ( new Date(time).getTimezoneOffset() * 60000 ) ).getTime();
};
util.prototype.percentCalc = function(n){ return this.multiply(100,n);  }

util.prototype.clone = function(_s, _d){
  _d = JSON.parse(JSON.stringify(_s));
  return _d;
};


util.prototype.mapKeys = function(data, map){
  var finalobj = {};
  for(key in data)
    if(map[key]) finalobj[map[key]] = data[key];
  return finalobj;
};
util.prototype.reverseMapKeys = function(key, map){
    if(this.isString(key)) 
    for(var i in map)
      if(this.nativeCompare(key, map[i], '==')) { return i; break; }
    if(this.isArray(key)){
      var finalobj = [];
      for(var i in key)
          for(var j in map)
             if(this.nativeCompare(key[i], map[j], '==')) finalobj.push(j);  
    }
    return finalobj; 
}; 

util.prototype.extractor = function(keys, data){
  if(!keys) return data;
  var finalobj = {};
  if(this.isString(keys)) finalobj[keys] = data[keys];
  if(this.isArray(keys))
    for(var i in keys)
      finalobj[keys[i]] = data[keys[i]];
  return finalobj;
};

util.prototype.apiToq = function(key){
  if(this.isString(key)) key = key/*.split(':').join('\\:')*/.split('/').join('\\/').split('=').join('\\=').split('?').join('\\?').split('%').join('\\%');
  return key;
}

util.prototype.dataExtractor = function(map){
   var finalobj = [];
   for(var key in map)
      finalobj.push(map[key]);
    return finalobj;
}

util.prototype.isStatus = function(code, skey, ekey, exkey){
  return (this.nativeCompare(parseInt(code), 400, '<') && this.nativeCompare(parseInt(code), 200 , '>=')) ? skey : (this.nativeCompare(parseInt(code), 500, '<') && this.nativeCompare(parseInt(code), 400, '>=')) ? ekey : exkey;
}

util.prototype.compact = function(arr){
  var _compacted = [];
  for(var i in arr){
    if(this.nativeCompare(arr[i], false, '!=') && this.nativeCompare(arr[i], null, '!=')/* && (!isNaN(arr[i]) && _.isString(arr[i]))*/) _compacted.push(arr[i]);
  }
  return _compacted;
}

util.prototype.cleanNAN = function(data){
  for(key in data){
       if(this.nativeCompare(data[key], 'NaN', '==')) delete data[key];
  }
  return data
};
util.prototype.validate = function(first_argument) {
  // if(!creds.host && !creds.ip || (!creds.appId || !creds.apiKey)) throw new Error("Invalid Credatials or Credatials missing".red);
  return true;  
};

util.prototype.getHosts = function(creds){
  creds.host = this.nativeCompare(creds.host, undefined, '!=') ? creds.host : 'localhost';
  creds.port = this.nativeCompare(creds.port, undefined, '!=') ? creds.port : 9000;
  if(creds.maxHost){
    var hosts = [];
    for(var i =0; i< creds.maxHost; i++ ) hosts.push((creds.protocol || "http") +"://"+(creds.host||creds.ip||'cdn.zglog.com')+(creds.port? (":"+creds.port) : ""));
    return hosts;
    }
    return (creds.protocol || "http") +"://"+(creds.host||creds.ip||'cdn.zglog.com')+(creds.port? (":"+creds.port) : "");
};
util.prototype.bodyParser = function(finalRequest, obj){
  if(this.nativeCompare(obj.method, "PUT", '==') || this.nativeCompare(obj.method, "POST", '==')) {
    if(obj.formData) finalRequest.formData = obj.formData;
    if(obj.multipart) finalRequest.multipart = obj.multipart;
    if(obj.form) finalRequest.form = obj.form;
    if(obj.body) finalRequest.body = obj.body;
  }
  return finalRequest;
};
util.prototype.parser = function(obj){
  var finalRequest = {};
  finalRequest.url = obj.params ? obj.url+obj.params : obj.url;
  for(key in obj.opts){ finalRequest[key] = obj.opts[key];   }
  finalRequest.method = obj.method; 
  finalRequest.qs = obj.qs;
  return bodyParser(finalRequest, obj); 
};
util.prototype.Error = function(type, data){ 
  var enm = require('./enm'); 
  return enm.ERRORS[type]+"["+JSON.stringify(data)+"]"; 
};

util.prototype.extend = function(arg1, arg2){ return extend(arg1, arg2); }

util.prototype.getObject =  function(arr, defValue){
  if( !Array.isArray(arr) && _.isObject(arr)) return arr;
  else if( Array.isArray(arr) ){
    var o = {};
    for(var i in arr) o[ arr[i] ] = defValue || arr[i];
  }
  else { var o = {}; o[arr] = arr; }
  return o;
}

util.prototype.assignWithIgnore = function(_obj, ignoreList){
  try{
      ignoreList = this.getObject(ignoreList || [], true); 
      var finalobj = JSON.parse(JSON.stringify(_obj), function(key, value){ if(!ignoreList[key]) return value; });
      return finalobj;
    } catch(exp){
      console.log(exp);
    }
};

util.prototype.compair = function (status, sObj, opr){
  var result = []; opr = opr || 'OR';

  switch(_u.typeof(sObj)){
    case 'number': case 'string': result.push(sObj === status); break;
    case 'object':
      result.push(this.compairObject(status, sObj));
      break;
    case 'array': for(var i in sObj) result.push(this.compairObject(status, sObj[i]));  break;
  }
  return (opr == 'OR') ? this.OR(result, true) : this.AND(result, false);
};

util.prototype.compairObject = function (status, sObj){
  
  if(this.typeof(sObj) == 'number' || this.typeof(sObj) == 'string' ) return (status == sObj);
  
  var resArr = [];
  var opr = (sObj.or || sObj.OR || (sObj.opr||'').toUpperCase() == 'OR') ? 'OR' : 'AND';
  for(var i in sObj){
    switch(i){
      case '>':             resArr.push(status > sObj[i] ); break;
      case '=>':case '>=':  resArr.push(status >= sObj[i] ); break;
      case '=': case '==':  resArr.push(status == sObj[i] ); break;
      case '!=':case '!==': resArr.push(status != sObj[i] ); break;
      case '<':             resArr.push(status < sObj[i] ); break;
      case '=<':case '<=':  resArr.push(status <= sObj[i] ); break;
    }
  }
  return (opr == 'OR') ? this.OR(resArr, true) : this.AND(resArr, false);
};
util.prototype.nativeCompare = function(arg1, arg2, operator){
    switch(operator){
      case "==": return arg1 == arg2;
      break;
      case "!=": return arg1 != arg2;
      break;
      case ">=": return arg1 >= arg2;
      break;
      case "<=": return arg1 <= arg2;
      break;
      case "===": return arg1 === arg2;
      break;
      case "!==": return arg1 !== arg2;
      break;
      case ">": return arg1 > arg2;
      break;
      case "<": return arg1 < arg2;
      break;
    }
}

util.prototype.OR = function (arr, val){ return arr.indexOf(val) != -1; }
util.prototype.AND = function (arr, val){ return arr.indexOf(val) == -1; }

util.prototype.logError = function(err){
  console.log('[ERR]'+'['+err+']');
};
util.prototype.logSuccess = function(){};

util.prototype.JSONEX = {};
util.prototype.JSONEX.stringify = function stringify(obj){
   var jsonified = {}
   jsonified.type = obj['type'];
   jsonified.value = jsonified.type == "Function" ? obj['value'].toString() : obj['value'];
   return JSON.stringify(jsonified)
};
util.prototype.JSONEX.parse = function(json){
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






function _int(){ return '[object Number]'; }
function _array(){ return '[object Array]'; }
function _string(){ return '[object String]'; }
function _object(){ return '[object Object]'; }
function _function(){ return '[object Function]'; }
function _boolean(){ return '[object Boolean]'; }
function _undefined(){ return '[object Undefined]'; }
function _null(){ return '[object Null]'; }
function _methodRegex(){ { return {GET: new RegExp("^GET$"), POST: new RegExp("^POST$"), PUT: new RegExp("^PUT$"), DELETE: new RegExp("^DELETE$")}; } } 
function _operationRegex(){ { return {READ: new RegExp("^READ$"), CREATE: new RegExp("^CREATE$"), UPDATE: new RegExp("^UPDATE$"), DELETE: new RegExp("^DELETE$")}; } } 
function _apiRegex(){ return {GET: new RegExp("GET/"), POST: new RegExp("POST/"), PUT: new RegExp("PUT/"), DELETE: new RegExp("DELETE/")}; }

module.exports = new util();