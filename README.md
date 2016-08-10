# zlogjs-adapter


log http request, response, and get the logged messages

[![Join the chat at https://gitter.im/Emallates/zlogjs-adapter](https://badges.gitter.im/Emallates/zlogjs-adapter.svg)](https://gitter.im/Emallates/zlogjs-adapter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Version][version-svg]][package-url]&nbsp;[![Build Status][travis-svg]][travis-url]</br>[![ISSUES][issues-url]][issues-url]&nbsp;[![FORKS][forks-url]][forks-url]&nbsp;[![STARS][stars-url]][stars-url]&nbsp;[![Downloads][downloads-image]][downloads-url]</br>[![License][license-image]][license-url]

[version-svg]: https://img.shields.io/npm/v/zlogjs-adapter.svg?style=flat-square
[package-url]: https://npmjs.org/package/zlogjs-adapter
[travis-svg]: https://img.shields.io/travis/Emallates/zlogjs-adapter/master.svg?style=flat-square
[travis-url]: https://api.travis-ci.org/Emallates/zlogjs-adapter.svg?branch=master
[issues-url]:https://img.shields.io/github/issues/Emallates/zlogjs-adapter.svg?style=flat-square
[forks-url]:https://img.shields.io/github/forks/Emallates/zlogjs-adapter.svg?style=flat-square
[stars-url]:https://img.shields.io/github/stars/Emallates/zlogjs-adapter.svg?style=flat-square
[downloads-image]: https://img.shields.io/npm/dm/zlogjs-adapter.svg?style=flat-square
[downloads-url]: http://npm-stat.com/charts.html?package=zlogjs-adapter
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: https://raw.githubusercontent.com/Emallates/zlogjs-adapter/master/LICENSE

##DESCRIPTION
zlogjs-adapter is just for experminetal purposes for [enoa-client](https://github.com/Emallates/enoa-client), you can log the http request, response and get the saved logged messages.<br/>
 `zlogjs-adapter` is build for [enoa-client](https://github.com/Emallates/enoa-client) just for experimental purposes.<br/>

<!--NO_HTML-->
Table of Contents
-----------------

1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Configuration](#configuration)
	- [zlogjs-adapter configuration](#zlogjs-adapter)
1. [Overview](#overview)
	- [Features](#features)
	- [Methods](#methods)
1. [Issues or Suggestions](#issues-or-suggestions)
1. [License](#license)

<!--/NO_HTML-->

## Prerequisites
Clients should be registered with the regarding service

## Installation

Install stable version from NPM:
```
npm install zlogjs-adapter --save
```


## Configuration

zlogjs-adapter can be used with enoa-client, for more information on how to use enoa-client in your App view the [enoa-client](https://github.com/Emallates/enoa-client).


#### zlogjs-adapter configuration

##### Example

```javascript
var zlog = { 
   collections:{
     adapter:{
       appId:'app_id',
       apiKey:'api_key',
       adapter:require('zlogjs-adapter'), 
       host:'host', port:'port' ,
       mode:"central"
     }
   }
};
var client = require('enoa-client')(zlog);
//client is initialized now
```
##### SKIP API EXAMPLE
```javascript
var zlog = { 
   collections:{
     adapter:{
       appId:'app_id',
       apiKey:'api_key',
       adapter:require('zlogjs-adapter'), 
       host:'host', port:'port' ,
       mode:"central",
       SKIP:{
         "/api/a":"CODE":{"<":304, ">":200},
         "/api/b":200
         "/api/c":"CODE":{"<=":400, ">=":499},
         "/api/d":true
       }
     }
   }
}
var client = require('enoa-client')(zlog);
//client is initialized now
```
##### GLOBAL SKIP EXAMPLE
```javascript
var zlog = { 
   collections:{
     adapter:{
       appId:'app_id',
       apiKey:'api_key',
       adapter:require('zlogjs-adapter'), 
       host:'host', port:'port' ,
       mode:"central",
       SKIP_CODE:450
     }
   }
};
var client = require('enoa-client')(zlog);
//client is initialized now
```
##### TAGS EXAMPLE
```javascript
var zlog = { 
   collections:{
     adapter:{
       appId:'app_id',
       apiKey:'api_key',
       adapter:require('zlogjs-adapter'), 
       host:'host', port:'port' ,
       mode:"central",
       TAGS:{
          "/api/a":"tag1",
          "/api/b":"tag1:tvalue",
          "/api/c":["tag1:tvalue","tag2:tvalue"],
          "/api/d":["tag1","tag2"],
          "/api/e":{"tag1":"tvalue","tag2":"tvalue"},
          "splitter":":"
       }
     }
   }
}
var client = require('enoa-client')(zlog);
//client is initialized now
```
## Overview

#### Features
1. [Log Messages]()
2. [Get Messages]()
3. [Get Terms]()
4. [Get Stats]()
5. [Get History]()
6. [Inject Rules]()

#### Methods

#### Logger && Log

```javascript
//express
express_app.use(client.adapter.logger());
//normal use
client.adapter.log(//parameters)
```
#### Log using service

```javascript
//config
var adapter = { 
   collections:{
     adapter:{
       appId:'app_id',
       apiKey:'api_key',
       adapter:require('zlogjs-adapter'), host:'host', port:'port',
       mode : 'central'
     }
   }
} 
var client = require('enoa-client')(adapter);

```
#### Log using local file

```javascript
//config
var adapter = { 
   collections:{
     adapter:{
       appId:'app_id',
       apiKey:'api_key',
       adapter:require('zlogjs-adapter'), host:'host', port:'port',
       mode : 'local', //|| leave mode 
     }
   }
} 
var client = require('enoa-client')(adapter);

```



#### Messages

```javascript
// parameters --> (page, limit, callback)
client.adapter.messages(10, 10, callback);
client.adapter.messages(10, 10, callback);

```

#### MessageById

```javascript
//ref is always given inside messages body along with id
client.adapter.getMessageById({id:'id',ref:'ref'}, callback);

```

#### Terms

```javascript
client.adapter.terms(callback);
//OR
client.adapter.find().type('terms').exec(callback);
```

#### Field-Statistics

```javascript
client.adapter.fieldStat('field_name',callback);
// OR
client.adapter.find().select('field').type('fstat').exec(callback);
```


#### Classes

```javascript
client.adapter.classify('field_name',callback);
// OR
client.adapter.find().select('field_name').type('classify').exec(callback);
```

#### History

```javascript
client.adapter.history({interval:'year', where:'level',not:'abc',range:{'level':{'>=':[6]}}},callback);
//OR
client.adapter.find().type('history').where('level').not('abc').range({'level':{'>=':[6]}}).interval('year').exec(callback)
```


#### Field-specific-history

```javascript
client.adapter.history({field:'level',interval:'year', where:'level',not:'abc',range:{'level':{'>=':[6]}}},callback)
// OR
client.adapter.find().type('fhistory').where('level').not('abc').range({'level':{'>=':[6]}}).interval('year').field('level').exec(callback);
```

#### Terms-statistics

```javascript
client.adapter.subClassStat({key:'level', value:'6', order:'term'},callback);
//OR
client.adapter.find().type('cstat').key('level').value('6').order('term').exec(callback)
```

#### Operations History
```javascript
clien.adapter.operationsHitsory(interval,callback);

```

#### System Status per method 
```javascript
client.adapter.systemStatusPerMethod(callback);
```



#### System Status per Operation
```javascript
  client.adapter.systemStatusPerOperation(callback);
```


#### Total

```javascript
client.adapter.total(callback);
```
#### Syestem responses by ERROR, EXCEPTION, and SUCCESS

```javascript
client.adapter.status(callback);
```
#### Locations

```javascript
client.adapter.locations(callback);
```
#### Callers IP's

```javascript
client.adapter.callers(callback);
```
#### Operations by methods

```javascript
client.adapter.operations(time, callback);
```
#### Browsers

```javascript
client.adapter.browsers(callback);
```
#### Find

```javascript

client.adapter.find().select('*').exec(callback);
client.adapter.find({select:'*'}).exec(callback);

```

#### Select

```javascript
client.adapter.find().select('*').exec(callback);
//OR
client.adapter.find().select().exec(callback);
//SELECT CUSTOM MODEL
client.adapter.find().select('key').exec(callback);
client.adapter.find().select(['key1','key2','key3','key4']).exec(callback);

```
#### Where

```javascript
client.adapter.find().select().where('key1').exec(callback);
client.adapter.find().select().where(['key1',{key2:value}]).exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).exec(callback);

```
#### Not

```javascript
client.adapter.find().select('*').where('key1').not('abc').exec(callback);
client.adapter.find().select().where(['key1',{key2:value}]).not({level:1}).exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).not({level:2, title:'abc'}).exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).not('abc').exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).not(['level','title']).exec(callback);

```

#### Range

```javascript
client.adapter.find().select('*').where('key1').range({'level':{'>':[6]}}).exec(callback);
client.adapter.find().select('*').where('key1').range({'level':{'<':[6]}}).exec(callback);
client.adapter.find().select('*').where('key1').range({'level':{'<=':[6]}}).exec(callback);
client.adapter.find().select('*').where('key1').range({'level':{from:0, to:1}}).exec(callback);

```

#### Time

```javascript
client.adapter.find().select('*').where('key1').time({from:'2015-05-2', to:'2016-02-03'}).exec(callback);
client.adapter.find().select('*').where('key1').time({from:'2015-05-2T00:00:000Z', to:'2016-02-03T00:00:000Z'}).exec(callback);
client.adapter.find().select('*').where('key1').time('last year').exec(callback);

```


####Pagination

```javascript
client.adapter.find().select('*').paginate({page:5, limit:100}).exec(callback);
client.adapter.find().select('*').paginate({page:5, limit:100}).exec(callback);
client.adapter.find().select('*').paginate({skip:50, limit:100}).exec(callback);
```
####Page

```javascript
client.adapter.find().select('*').page(10).exec(callback);
```
####Skip

```javascript
client.adapter.find().select('*').skip(100).exec(callback);
client.adapter.find().select().where(['key1',{key2:value}]).skip({level:1}).exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).skip({level:8, title:'xyz'}).exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).skip('abc').exec(callback);
client.adapter.find().select().where({or:['key1',{key2:value}], and:['abc',{level:1}]}).skip(['1x','pid']).exec(callback);
```
####Limit

```javascript
client.adapter.find().select('*').limit(10).exec(callback);
```

####Glimit

```javascript
client.adapter.find().select('*').paginate(adapter.glimit('global')).exec(callback);
client.adapter.find().select('*').page(adapter.glimit('page')).exec(callback);
client.adapter.find().select('*').skip(adapter.glimit('skip')).exec(callback);
client.adapter.find().select('*').limit(adapter.glimit('limit')).exec(callback);
```
####Terms

```javascript
client.adapter.find().select('code').type('fstat').exec(callback);
```
####Stats

```javascript
client.adapter.find().select('code').type('fstat').exec(callback);
//OR
client.adapter.stat('code',callback);
```
####Rules
#####Set Rules OR Inject(Operator)
```javascript
var operator = {
   "title":".", 
   "description":"This operator concatenates two strings arrays or objects",
   "function":{type:"Function",value:function(a, b){ var result = Object.prototype.toString.call(a) == '[object String]' ? '' : Object.prototype.toString.call(a) == '[object Array]' ? [] : Object.prototype.toString.call(a) == '[object Object]' ? {} : false; if(Object.prototype.toString.call(a) == '[object String]' && Object.prototype.toString.call(b) == '[object String]' ) result = a+b; if(Object.prototype.toString.call(a) == '[object Array]' && Object.prototype.toString.call(b) == '[object Array]' ){ for(i in a) result.push(a[i]); for(i in b) result.push(b[i]); if(Object.prototype.toString.call(a) == '[object Object]' && Object.prototype.toString.call(b) == '[object Object]' ){ for(key in a) result[key] = a[key]; for(key in b) result[key] = b[key]; }}}}
};
 eclient.adapter.rules({ftype:'set',type:'operator', rule:operator}, Callback);
```

#####Set Rules OR Inject(Keyword)
```javascript
var keyword = {
     "title":"AA", 
     "description":"This key word means inside the rule executors which action will be executed it can contain the refferance of action or direct action itself as a function",
     "function":{"type":"Function","value":function (){  return "A"; }}
};
 eclient.adapter.rules({ftype:'set',type:'keyword', rule:keyword}, Callback);
```

#####Set Rules OR Inject(Object)
```javascript
var rule = {
      "t1" :{"type":"title", "value":"isPrince"},
         "d1" : {"type":"operations", "value":["==","!="]},
         "e1":[{"type":"target", "value":"king", "factname":"father","actref":"a1", "opref":0},{"type":"target", "value":"minister", "factname":"mother","actref":"a3","opref":1},{"type":"target", "value":"great king", "factname":"grandfather","actref":"a2","opref":0}],
          "a1":{
            "type":"action",
            "value":{"type":"Function","value":function (msg){  console.log(msg+'isPrince'); }},
            "params":"fact"
            "actref":"a2"
          },
         "a2":{
           "type":"action",
           "value": {"type":"Function","value":function (){  console.log('confratulations, you belong to a Royal famliy'); }},
           "params":"grandfather"
         },
         "a3":{
            "type":"action",
            "value":{"type":"Function","value":function (){  console.log("isNotPrince");  }}
          },
         "c1":{"type":"description", "value":"if the fact father or mother is king, and queen respectively then you are a prince, and if grand father is great king , then you belong to royal family"}
};
 eclient.adapter.rules({ftype:'set',type:'rule', rule:rule}, Callback);
 //OR
 eclient.adapter.rules({ftype:'set',type:'knowledgebase', rule:rule}, Callback);
```

#####Set Rules OR Inject(Array)
```javascript
var arr = [
        {
       "t1" :{"type":"title", "value":"testT4"},
           "d1" : {"type":"operations", "value":"=="},
           "e1":[{"type":"target", "value":"parent", "factname":"father", "actref":"a1"},{"type":"target", "value":"parent", "factname":"mother", "actref":"a1"},{"type":"target", "value":"parent", "factname":"grantfather", "actref":"a2"}],
           "a1":{"type":"action", "value":"king"},
           "a2":{"type":"action", "value":{type:"Function", value:function(){ console.log("Your Father!");}}},
           "a3":{"type":"action", "value":{type:"Function", value:function(){ console.log("King");}}},
           "c1":{"type":"description", "value":"if the fact equal value father it will return king || true"}
    },{
       "t1" :{"type":"title", "value":"testT5"},
           "d1" : {"type":"operations", "value":">"},
           "e1":{"type":"target", "value":6547852.0265, "factname":"sales"},
           "a1":{"type":"action", "value":"return"},
           "c1":{"type":"description", "value":"if the fact greater then value sales it will return true"}
    },{
       "t1":{"type":"title", "value":"testT6"},
           "d1":{"type":"operations", "value":"=="},
           "e1":{"type":"target", "value":"this", "factname":"father"},
           "a1":{"type":"action", "value":"return"},
           "c1":{"type":"description", "value":"if the fact is equal to father then it will return true"}
     }
];
 
 eclient.adapter.rules({ftype:'set',type:'knowledgebase', rule:arr}, Callback);
```
#####Get Keyword
```javascript
 //get saved customized operators  
 eclient.adapter.rules({ftype:'get',type:'keyword'}, Callback);
 eclient.adapter.rules({ftype:'get',type:'keyword', key:'title || identifier'}, Callback);
```

#####Get Operator
```javascript
 //get saved standard operators  
 eclient.adapter.rules({ftype:'get',type:'operator', key:'title || identifier'}, Callback);
 eclient.adapter.rules({ftype:'get',type:'operator'}, Callback);
```
#####Get Kb || a single rule
```javascript
   
 eclient.adapter.rules({ftype:'get',type:'knwoledgebase', key:'title || identifier'}, Callback);
 eclient.adapter.rules({ftype:'get',type:'knowledgebase'}, Callback);
```



## Issues or Suggestions
As zlogjs-adapter is just an experimantal adapter for [enoa-client](https://github.com/Emallates/enoa-client), anybody who can build or contribute is welcome.


## License

**[MIT](./LICENSE)**

