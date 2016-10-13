var _ = require('../../extras/util');
module.exports = function(criteria, prev){ 
  return not(criteria, prev); 
};
function not(criteria, prev){
   var _final = [];
   if(_.isArray(criteria))return prev;
   if(_.isString(criteria) || _.isObject(criteria))_final.push(criteria);
   if(prev) { for(i in _final) prev.push(_final[i]); _final = prev; }
   return _final;
};