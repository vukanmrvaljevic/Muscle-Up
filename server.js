const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const sassMiddleware = require('node-sass-middleware');
const path = require('path');

const admin = require('firebase-admin');
const serviceAccount = require('./key.json');
const firebaseAdmin = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://finalproject-7ea7d.firebaseio.com"
});

const db = firebaseAdmin.database();

function isAuthenticated(request, response, next) {
	const uid = request.query.uid;
	firebaseAdmin.auth().getUser(uid)
		.then(function(user){
			next();
		})
		.catch(function(error){
			response.redirect('/');
		});
}

const app = express();
app.use(logger('dev'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(sassMiddleware({
	src: path.join(__dirname, 'public/css'),
	dest: path.join(__dirname, 'public/css'),
	debug: true,
	outputstyle: 'compressed',
	prefix: '/css'
}));
app.use(express.static('public'));


app.get('/', function(request, response){
	response.render('home.ejs');
});

app.get('/workouts', function(request, response){
	response.render('workouts.ejs');
});

app.get('/programs', function(request, response){
	response.render('programs.ejs');
});


app.get('/post', isAuthenticated, function(request, resopnse){
	response.render('social.ejs');
});

app.get('/login', function(request, response){
	response.render('home.ejs');
});

app.get('/create', function(request, response){
	response.render('home.ejs');
});

app.get('/social', function(request, response) {
	const ref = db.ref('users');
	ref.once('value')
		.then(function(snapshot) {
            console.log(snapshot.val());
			response.render('social.ejs', {
				data: snapshot.val()
			});
		});
});

app.get('/social/:id', function(request, response) {
	const ref = db.ref('/users/' + request.params.id);
	ref.once('value')
		.then(function(snapshot) {
			response.render('social.ejs', {
				data: snapshot.val(),
				user: request.params.id
			});
		});
});

app.get('/profile', function(request, response){ 
	response.render('programs.ejs');
});

const port = process.env.PORT || 8000;
app.listen(port, function() {
	console.log("App running on port", port);
});