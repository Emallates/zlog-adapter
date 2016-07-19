var adapter = require('../index.js');
var direct = {
	context :{ 
		   appId: 'app_id', 
		   apiKey: 'apikey', 
		   timeout: 30000, 
		   port: 7000 
	},
	opts : { 
	   	   appId: 'lY0pzEYR',
		   apiKey: 'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IiMxMToxNCIsInR5cGUiOiJzb2NpYWwiLCJuYW1lIjoib3JrdXQifQ.udWY-O1bmb9sTcqWk89su5I1LryVHABscfhHzRKnTmE',
		   timeout: false,
		   port: 9000,
		   host: '192.168.0.5' 
	}
};
var via = {
	appId:'app_id',apiKey:'apikey',timeout:30000, port:7000,
	collections:{
		adapter:{
			host:'192.168.0.5', 
			adapter:adapter, 
			timeout:false, 
			port:9000,
			appId:'lY0pzEYR',
			apiKey:'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IiMxMToxNCIsInR5cGUiOiJzb2NpYWwiLCJuYW1lIjoib3JrdXQifQ.udWY-O1bmb9sTcqWk89su5I1LryVHABscfhHzRKnTmE'
		}
	}
};
var select = {
	arr :['model', 'A', 'B'],
	obj :{'model':true, 'A':true, 'B':true,'C':true}
};
var where = {
   str : 'A', 
   arr : ['A','B','C'],//by default or
   arr_op : [{'and':['A','B']},{'and':['D','G']},'C',{'or':['Y','Z']}],
   arr_obj : [{'and':['X']},'Y',{'A':{'>':'valueA'}},{'B':{'<':'valueB'}},{'AND':['XYZ','WXY']},{'AND':[{'C':{'=':'valueC'}},{'D':{'=':'valueD'}}], 'OR':[{'E':{'<=':'valueE'}},{'F':{'>=':'valueF'}}]}]
};
var time = {
	key : 'last week',
    range : {from:'2014-04-04T0.00Z', to:'2014-04-04T0.00Z'}
};
var find = {
   setA:{select:select.arr, where:where.str, time:time.key},
   setB:{select:select.obj, where:where.arr, time:time.range},
   setC:{select:select.obj, where:where.arr_op, time:time.range},
   setD:{select:select.obj, where:where.arr_obj, time:time.range},
   setE:{select:{}, where:{}, time:{}}
};

var callback = function(err, data){ if(process.env.consoleTestCallback == true) console.log(err ? err : data ? data : null); };
module.exports = {
	direct:direct,
	via:via,
	select:select,
	where:where,
	time:time,
	find:find,
	callback:callback
}