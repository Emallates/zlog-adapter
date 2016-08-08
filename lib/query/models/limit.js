var _ = require('../../util');
module.exports = function(_limit){
	return limit(_limit);
}
function limit(limit){
    return _.isInt(limit) && ( limit > 0 && limit < 1000 ) ? parseInt(limit) : 12;
};