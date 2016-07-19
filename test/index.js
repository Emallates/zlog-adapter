var should = require("should"),
tests = require('./case.js');
process.env.consoleTestCallback = false;
var client = require('enoa-client')(tests.via);
describe("zglog-adapter unit tests",function(){
  it("zglog-adapter Should be created",function(){
     client.adapter.should.have.property('context' && 'configs' && 'host' && 'port' && 'log');
  });
  // it("select should return an object",function(){
  //      client.adapter.select(tests.select.obj).should.have.property('_select');
  //      client.adapter.select(tests.select.arr).should.have.property('_select');
  // });
  // it("select should return callback",function(done){
  //      client.adapter.select(tests.select.obj, tests.callback);
  //      client.adapter.select(tests.select.obj).exec(tests.callback);
  //      done();
  // });
  it("where should return an object",function(){
       client.adapter.find().where(tests.where.str).should.have.property('_where');
       client.adapter.find().where(tests.where.arr).should.have.property('_where');
       client.adapter.find().where(tests.where.arr_op).should.have.property('_where');
       client.adapter.find().where(tests.where.arr_obj).should.have.property('_where');
  });
  // it("where should return callback",function(done){
  //      client.adapter.where(tests.where.str, tests.callback);
  //      client.adapter.where(tests.where.str).exec(tests.callback);
  //      client.adapter.where(tests.where.arr, tests.callback);
  //      client.adapter.where(tests.where.arr).exec(tests.callback);
  //      client.adapter.where(tests.where.arr_op, tests.callback);
  //      client.adapter.where(tests.where.arr_obj).exec(tests.callback);
  //      done();
  // });
  it("time should return an object",function(){
       client.adapter.find().time(tests.time.key).should.have.property('_time');
       client.adapter.find().time(tests.time.range).should.have.property('_time');
  });
  // it("time should return callback",function(done){
  //      client.adapter.time(tests.time.key, tests.callback);
  //      client.adapter.time(tests.time.key).exec(tests.callback);
  //      client.adapter.time(tests.time.range, tests.callback);
  //      client.adapter.time(tests.time.range).exec(tests.callback);
  //      done();
  // });
  // it("find should return an object",function(){
  //      client.adapter.find(tests.find.setA).should.have.property('_select' && '_where' && '_time');
  //      client.adapter.find(tests.find.setB).should.have.property('_select' && '_where' && '_time');
  //      client.adapter.find(tests.find.setC).should.have.property('_select' && '_where' && '_time');
  //      client.adapter.find(tests.find.setD).should.have.property('_select' && '_where' && '_time');
  // }); 
  // it("find should return callback",function(){
  //      client.adapter.find(tests.find.setA, tests.callback);
  //      client.adapter.find(tests.find.setA).exec(tests.callback);
  //      client.adapter.find(tests.find.setB, tests.callback);
  //      client.adapter.find(tests.find.setB).exec(tests.callback);
  //      client.adapter.find(tests.find.setC, tests.callback);
  //      client.adapter.find(tests.find.setC).exec(tests.callback);
  //      client.adapter.find(tests.find.setD, tests.callback);
  //      client.adapter.find(tests.find.setD).exec(tests.callback);
  // }); 
});

