var model = ["message","cstat","fstat", "single","fhistory","history","terms"];
module.exports = function(type){
	return type ? type : model[0];
}