
var csvjson = require('csvjson');
var fs = require('fs');
var MongoClient = require("mongodb").MongoClient;
var objectArray = [];

function mongoInsert(){
  var url = "mongodb://localhost:9999";
  console.log("insert function");
  MongoClient.connect(url,function(err,client){
    client.db('test').collection("star").insertMany(objectArray);
    db.close();

  });
}
function clean(){
  var options = {
    delimiter:',',
    quote:'"'
  };
  var data = fs.readFile('st.csv','utf8',function(err,data){
    objectArray=csvjson.toObject(data,options);
    mongoInsert();
  });
}
clean();
