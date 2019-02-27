var express = require('express');
var path = require('path');
//var express = require('express');
var app = express();
var router = require('../router/main')(app);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var server = app.listen(3000, function(){
    console.log("Express server has started on port 30002")
});

app.use(express.static(path.join(__dirname+'/public')));
//app.use(express.static('C:\\work\\icr_re\\계산서샘플_20180629'));
