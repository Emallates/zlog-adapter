var _ = require('type-util');
module.exports = function(crit){
   if(_.isString(crit)) return key(crit);
   if(_.isObject(crit)) return range(crit);
};
function key(model){  return {keyword:model}; }
function range(model){ 
	var _from = model.from.split('T').length > 1 ?  model.from : model.from+'T00:00:00.000Z';
	var _to = model.to.split('T').length > 1 ?  model.to : model.to+'T00:00:00.000Z'; 
	return {from:_from, to: _to}; 
}