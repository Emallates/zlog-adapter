var model = ["message","cstat","fstat"];
module.exports = function(type){
	return type ? type : model[0];
}