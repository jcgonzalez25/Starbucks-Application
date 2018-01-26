var express = require('express');
var geoip   = require('geoip-lite');
var url     = require('url');
const bodyParser= require('body-parser');
var app = express();
var star = require('./GetStarbucks.js');
app.set('trust proxy');


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');

});

app.get('/starbucks.html',function(req,res){

  var ip = req.headers['xx-forwarded-for'] || req.connection.remoteAddress;
  ip = ip.split(':')[3];
  var loc = geoip.lookup(ip);
  if (typeof(loc) != "undefined"){
    var latitude = loc.ll[0];
    var longitude = loc.ll[1];
    var closest_starbuck_near_client = new star.getLocation(res,latitude,longitude);
  }
});

app.get('/getLocation.html',function(req,res){
  var latitude = req.query.latitude;
  var longitude = req.query.longitude;
  var closest_starbuck_near_client = star.getLocation(res,latitude,longitude);
});



app.listen(1111, function () {
  console.log('Example app listening on port 1111');
});
