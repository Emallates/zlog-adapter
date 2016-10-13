var _ = require('../../extras/util');
module.exports = function(criteria){ return range(criteria); };
function range(criteria){
   var final ='';
   for(key in criteria){
        if(criteria[key]['>']) final += criteria[key].length > 1 ? key +':['+criteria[key]['>'][0]+' TO '+criteria[key]['>'][1]+']' : key +':'+'>'+criteria[key]['>'][0];
        if(criteria[key]['<']) final += criteria[key].length > 1 ? key +':['+criteria[key]['<'][0]+' TO '+criteria[key]['<'][1]+']' : key +':'+'<'+criteria[key]['<'][0];
        if(criteria[key]['>=']) final += criteria[key].length > 1 ? key +':['+criteria[key]['>='][0]+' TO '+criteria[key]['>='][1]+']' : key +':'+'>='+criteria[key]['>='][0];
        if(criteria[key]['<=']) final += criteria[key].length > 1 ? key +':['+criteria[key]['<='][0]+' TO '+criteria[key]['<='][1]+']' : key +':'+'<='+criteria[key]['<='][0];
        if(criteria[key]['=='] || criteria[key]['=']) final += key +':'+criteria[key]['=' || '=='][0];
        if(_.nativeCompare(criteria[key]['from'], undefined, '!=')) final += key +':['+criteria[key]['from'];
        if(_.nativeCompare(criteria[key]['to'], undefined, '!=')) final += ' TO '+criteria[key]['to']+']';
   }
   return final;
}