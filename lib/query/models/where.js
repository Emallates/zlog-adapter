var _ = require('type-util');

module.exports = function(crit){ return model(crit); };
function model(crit){  
  var where = {'or':[], 'and':[]};
  // if(_.isString(crit)) return { exists: crit}
  if(_.isString(crit)) { var temp = crit; crit = []; crit[0] = temp;  }
  if(_.isObject(crit)){
    if(crit.or){
       console.log('_.isObject(crit) ------------> ', 'or');
       if(_.isArray(crit.or)){
         for(i in crit.or) where.or.push(crit.or[i]);
       }
       if(_.isObject(crit.or)){
         for(k in crit.or){ var _t = {}; _t[k] = crit.or[k]; where.or.push(_t); }
       } 
    }
    if(crit.and){
       console.log('_.isObject(crit) ------------> ', 'and'); 
       if(_.isArray(crit.and)){
         for(i in crit.and) where.and.push(crit.and[i]);
       }
       if(_.isObject(crit.and)){
         for(k in crit.and){ var _t = {}; _t[k] = crit.and[k]; where.and.push(_t); }
       } 
    }
     for(key in crit){
      if(key != 'or' && key != 'and'){
        var temp = {}; temp[key] = crit[key];
        where.and.push(temp);
      }  

     }
  }
  if(_.isArray(crit)){
    for(i in crit){ 
         if(_.isString(crit[i])) where.and.push(crit[i]);
         if(_.isObject(crit[i])) {
          for(key in crit[i]) {
            if(key.toLowerCase() == 'and') { 
              if(_.isObject(crit[i][key])){
                 where.and.push(crit[i][key]); 
              }
              if(!_.isObject(crit[i][key]))
              for(j in crit[i][key]){
                   where.and.push(crit[i][key][j]);
              }
            }
            if(key.toLowerCase() == 'or') {
              if(_.isObject(crit[i][key])){
                 where.and.push(crit[i][key]); 
              }
              if(!_.isObject(crit[i][key]))
              for(j in crit[i][key]){
                 where.or.push(crit[i][key][j]);
              }
            }
            if(key.toLowerCase() != 'or' && key.toLowerCase() != 'and'){
              where.and.push(crit[i]);
            }
          }
         }
         if(_.isArray(crit[i])){
          console.log('isArray',crit[i]);
         }
    }
  }
  return _.lengthOf(where) > 0 ? where : undefined;
};
