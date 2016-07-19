module.exports = obj = {
	LIB :{
		EXT:require('../lib/extend'), UTIL:require('../lib/util'),QUERY:require('../lib/query')
	},
	BASE : {
		input:'/input', output:'/Search',rbase:'/gtV1.0'
	},
	ERRORS : {
		//[err][relation][subject][object type][this]
		"CON":"[ECON_CONNECTION_REFUSED][FOR][REQUEST][QUERY]"
	},
	CB_CRITERIA  :{
		l : {type:'boolean', valid: function(v){ return v === true || v === false ? v : true; }},
		f : {url:''},
		sms:{number: '', rule:''},
        email:{email:'',rule:''},
	},
	EXEC_CRITERIA :{
		CONFIGURED: ['def','d','m'],
	    ALLOWED_CRIT : ['def','d','m','c','e','loc','save']
	}
};