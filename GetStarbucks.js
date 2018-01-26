var MongoClient = require("mongodb").MongoClient;
var geoip       = require('geoip-lite');
var fs          = require('fs');
var url         = "mongodb://localhost:9999";
var closest_starbucks = {};
var items_processed=0;
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}
function deg2rad(deg) {
  return deg * (Math.PI/180);
}
function write_to_starbuckshtml(res,closest_starbucks){
  var head = "<h1> Starrbucks ON " + closest_starbucks['Street Combined'] + " Is nearest you</h1>";
  var form ="<form><input type='button' value='Go back!' onclick='history.back()'></input></form>";
  var body_one = "<br><h2> Store Number:" + closest_starbucks['Store Number'] + "</h2>";
  var body_two = "<br><h2> Country Prefix :" + closest_starbucks.Country + "</h2>";
  var body_three = "<br><h2> Postal Code :" + closest_starbucks['Postal Code'] + "</h2>";
  var body = buildHtml(res,head + form + body_one + body_two + body_three);
}

function buildHtml(res,body) {
  var header = '';
  var doc = '<!DOCTYPE html>'+ '<html><header>' + header + '</header><body>' + body + '</body></html>';
  fs.writeFile('starbucks.html',doc,function(){
    res.sendFile(__dirname + '/starbucks.html');

  });
}

exports.getLocation = function(res,client_lat,client_lon){
  MongoClient.connect(url,function(err,client){
    if(err) throw err;
    starbucks_locations = client.db('test').collection("star");
    starbucks_locations.find({}).toArray(function(err,docs){
      docs.forEach(function(starbucks_doc,index,starbucks_arr){

        items_processed += 1;
        if(isEmpty(closest_starbucks)){
          console.log("here");
          closest_starbucks = starbucks_arr[index];
        }else{
          var closest_starbucks_distance = getDistanceFromLatLonInKm(closest_starbucks.Latitude,closest_starbucks.Longitude,client_lat,client_lon);
          var doc_starbucks_distance = getDistanceFromLatLonInKm(starbucks_doc.Latitude,starbucks_doc.Longitude,client_lat,client_lon);
          if(doc_starbucks_distance < closest_starbucks_distance){
            closest_starbucks = starbucks_arr[index];
          }}
        if(items_processed == starbucks_arr.length){
          write_to_starbuckshtml(res,closest_starbucks);
          items_processed = 0;
        }
      });
    });
  });
};
