module.exports = obj = {
	LIB :{
		EXT:require('../lib/extend'), UTIL:require('../lib/util'),QUERY:require('../lib/query')
	},
	BASE : {
		  input:'/input'
		, rbase:'/gtV1.0'
		, radd : '/add'
		, rget : '/get'
		, message:"/messages"
		, count:"/allcounts"
		, terms:"/terms"
		, fstat:"/fieldstat"
		, classify:"/fieldfacet"
		, history:"/history"
		, cfstat:"/fieldfacetstat"
		, fhistory:"/fieldspecifichistory"
		, single:"/messages/"
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
	},
	MSG_STATUS:{EXC:{LABEL:"Exceptions",COLOR:"#ff0000"}, SUC:{LABEL:"Successes", COLOR:"#57AE57"},ERR:{LABEL:"Errors",COLOR:"#FFFF00"}},
	OPERATION_CNT : {"Create":0, "Read":0, "Update":0, Delete:0},
	OPERATIONS : {READ:{q:{method:"GET"}, LABEL:"Read"}, CREATE:{q:{method:"POST"}, LABEL:"Create"}, UPDATE:{q:{method:"PUT"}, LABEL:"Update"}, DELETE:{q:{method:"DELETE"}, LABEL:"Delete"}}
};