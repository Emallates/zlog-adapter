var _ = require('../../extras/util');
module.exports = function(pageModel){
	if(_.nativeCompare(pageModel.skip, undefined, '!=')) pageModel.skip = parseInt(pageModel.skip);
	if(_.nativeCompare(pageModel.page, undefined, '!=')) pageModel.page = parseInt(pageModel.page);
	if(_.nativeCompare(pageModel.limit, undefined, '!=')) pageModel.limit = parseInt(pageModel.limit);
	pageModel.limit = _.nativeCompare(pageModel.limit, undefined, '!=') && _.nativeCompare(pageModel.page, NaN, '!=') && _.isInt(pageModel.limit) ? pageModel.limit : 12;
	return page(pageModel);
}
function page(pageModel){
    return _.isInt(pageModel.page) && (_.nativeCompare(pageModel.page, 0, '>')) && _.nativeCompare(pageModel.page, undefined, '!=') ? (pageModel.page - 1) * pageModel.limit + 1 : _.nativeCompare(pageModel.skip, undefined, '!=') ? pageModel.skip : 0;
}