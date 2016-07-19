var _ = require('type-util');
module.exports = function(pageModel){
	if(pageModel.skip != undefined) pageModel.skip = parseInt(pageModel.skip);
	if(pageModel.page != undefined) pageModel.page = parseInt(pageModel.page);
	if(pageModel.limit != undefined) pageModel.limit = parseInt(pageModel.limit);
	pageModel.limit = pageModel.limit != undefined && pageModel.page != NaN && typeof pageModel.limit == 'number' ? pageModel.limit : 12;
	return page(pageModel);
}
function page(pageModel){
    return _.isInt(pageModel.page) && ( pageModel.page > 0) && pageModel.page != undefined ? (pageModel.page - 1) * pageModel.limit + 1 : pageModel.skip != undefined ? pageModel.skip : 0;
}