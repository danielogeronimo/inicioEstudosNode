var express = require('express'),
	app = express(),
	load = require('express-load'),
	error = require('./middleware/erro'),
	server = require('http').createServer(app),
	io    =  require('socket.io').listen(server),
	mongoose = require('mongoose');

	global.db = mongoose.connect('mongodb://localhost/ntalk');

var KEY = 'ntalk.sid',SECRET = 'ntalk';
var cookie = express.cookieParser(SECRET),
	store = new express.session.MemoryStore(),
	sessOpt = {secret:SECRET,key:KEY,store:store},
	session = express.session(sessOpt);

app.set('views',__dirname+'/views');
app.set('view engine','ejs');
app.use(cookie);
app.use(session);
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname+'/bower_components'));
app.use(error.notFound);
app.use(error.serverErro);

io.set('authorization',function(data,accept){
	cookie(data, {},function(err) {
		var sessionID = data.signedCookies[KEY];				
		store.get(sessionID,function(err,session){
			if(err||!sessionID){
				accept(null,false);
			}else{
				data.session = session;				
				accept(null,true);
			}
		});
	});
});

load('models')
	.then('controllers')
	.then('routes')
	.into(app);
load('sockets')
	.into(io);

server.listen(3000,function(){
	console.log('Atividade 3000');
});