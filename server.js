var express = require('express'),
app = express()
var session = require('express-session');	
var path = require('path');
var bodyParser = require('body-parser');
var port = 4000
require('dotenv').config();

var cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view engine","ejs");
app.set("views","./views");

var routes = require('./routes/api'); //importing route
routes(app); 

app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
}) 

app.listen(port);

console.log('Server run with port =  ' + port);
