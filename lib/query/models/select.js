var _ = require('../../util');
module.exports = function(){
   return {
      native: function(){ return native(); },
      custom: function(keys){ return custom(validate(keys)); }
   };
};

function native() { 
  return ['method','path','timestamp','code','_id']; 
}

function custom(model, type){
   var custom = [];
   if(_.isString(model) != true) for(i in model) custom.push(_.isArray(model) ? model[i] : model[i] == true ? i : null);
   if(_.isString(model) == true) custom.push(model);
   if(type == 'message') custom.push('_id');
   return _.compact(custom);
}


function validate(model){
   var finalized;
   if(_.isArray(model)){
      finalized = [];
      for(var i in model){
          if(_.isString(model[i])) finalized.push(model[i]); 
          if(_.isObject(model[i])){
             if(_.len(model[i]) != 1){ throw Error("SINGLE OBJECT CAN NOT CONTAIN MORE THEN ONE KEYS ON SELECT!"); break;}
             else finalized.push(model[i]);         
          }
      }
   }
   if(_.isString(model)) finalized = model;
   if(_.isObject(model)) {
     if(_.len(model) != 1) throw Error("SINGLE OBJECT CAN NOT CONTAIN MORE THEN ONE KEYS ON SELECT!");
     else finalized = model;
   }
   return finalized;
}