const express = require('express'),
	path = require('path'),
	logger = require('morgan');

const app = express();
const port = 8082;

app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.render('pages/index');
});

app.listen(port);
