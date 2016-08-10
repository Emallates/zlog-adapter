var conf = require('../conf');
var extend = require('extend');

var util = function(){};

util.prototype.isEmpty = function(data){    
  return this.isString(data) ? this.isStringEmpty(data) : this.isArray(data) ? this.isArrayEmpty(data) : this.isObject(data) ? this.isObjectEmpty(data) : this.isUndefined(data) ? true : this.isNull(data) ? true : 'INVALID_DATA'; 
};

util.prototype.type = function(data){ return Object.prototype.toString.call(data); };

util.prototype.isStringEmpty = function(data){  return this.len(data) < 1 ? true : false;  };

util.prototype.isArrayEmpty = function(data){  return this.len(data) < 1 ? true : false;  };

util.prototype.isObjectEmpty = function(data){ return this.len(data) < 1 ? true : false; };

util.prototype.len = function(data){ return this.isArray(data) || this.isString(data) ? data.length : Object.keys(data).length;; };

util.prototype.isInt = function(data){  return this.type(data) == _int() ? true : parseInt(data) == _int() ? true : false; };

util.prototype.isArray = function(data){  return this.type(data) == _array();  };

util.prototype.isString = function(data){  return this.type(data) == _string();  };

util.prototype.isObject = function(data){ return this.type(data) == _object();  };

util.prototype.isFunction = function(data){ return this.type(data) == _function();  };

util.prototype.isBoolean = function(data){  return this.type(data) == _boolean();  }

util.prototype.isUndefined = function(data){ return this.type(data) == _undefined();   }; 

util.prototype.isNull = function(data){ return this.type(data) == _null(); };

util.prototype.clone = function(_s, _d){
  _d = JSON.parse(JSON.stringify(_s));
  return _d;
};

util.prototype.isStatus = function(code, skey, ekey, exkey){
  return (parseInt(code) < 400 && parseInt(code) >= 200) ? skey : (parseInt(code) < 500 && parseInt(code) >= 400) ? ekey : exkey;
}

util.prototype.compact = function(arr){
  var _compacted = [];
  for(var i in arr){
    console.log(arr[i] == false , arr[i] == null , isNaN(arr[i]));
    if(arr[i] != false && arr[i] != null/* && (!isNaN(arr[i]) && _.isString(arr[i]))*/) _compacted.push(arr[i]);
  }
  return _compacted;
}

util.prototype.cleanNAN = function(data){
  for(key in data){
       if(data[key] == 'NaN') delete data[key];
    }
     return data
};
util.prototype.validate = function(first_argument) {
  // if(!creds.host && !creds.ip || (!creds.appId || !creds.apiKey)) throw new Error("Invalid Credatials or Credatials missing".red);
  return true;  
};

util.prototype.getHosts = function(creds){
  creds.host = creds.host != undefined ? creds.host : 'localhost';
  creds.port = creds.port != undefined ? creds.port : 9000;
  if(creds.maxHost){
    var hosts = [];
    for(var i =0; i< creds.maxHost; i++ ) hosts.push((creds.protocol || "http") +"://"+(creds.host||creds.ip||'cdn.zglog.com')+(creds.port? (":"+creds.port) : ""));
    return hosts;
    }
    return (creds.protocol || "http") +"://"+(creds.host||creds.ip||'cdn.zglog.com')+(creds.port? (":"+creds.port) : "");
};
util.prototype.bodyParser = function(finalRequest, obj){
  if(obj.method == "PUT" || obj.method == "POST") {
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
  var conf = require('../conf'); 
  return conf.ERRORS[type]+"["+JSON.stringify(data)+"]"; 
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

util.prototype.OR = function (arr, val){ return arr.indexOf(val) != -1; }
util.prototype.AND = function (arr, val){ return arr.indexOf(val) == -1; }

// util.prototype.typeof = function (val) {
//  switch(Object.prototype.toString.call(val)){
//   case '[object Object]': return 'object'; break;
//   case '[object Array]': return 'array'; break;
//   case '[object String]': return 'string'; break;
//   case '[object Number]': return 'number' ; break;
//   case '[object Boolean]': return 'bool' ; break;
//   case '[object Function]': return 'function' ; break;
//   // case '[object Undefined]': return 'undefined';
//   default: return 'undefined';
//  }
// }






function _int(){ return '[object Number]'; }
function _array(){ return '[object Array]'; }
function _string(){ return '[object String]'; }
function _object(){ return '[object Object]'; }
function _function(){ return '[object Function]'; }
function _boolean(){ return '[object Boolean]'; }
function _undefined(){ return '[object Undefined]'; }
function _null(){ return '[object Null]'; }

module.exports = new util();