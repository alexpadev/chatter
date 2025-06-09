var createError = require('http-errors');
var express = require('express');
require('dotenv').config();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/usuaris');
var biosRouter = require('./routes/bios');
var authRouter = require('./routes/auth');
var adminsRouter = require('./routes/admins');

var jwtAuthRouter = require('./routes/api/jwt-auth');
var usuarisRouter = require('./routes/api/usuaris');
var biosAPIRouter = require('./routes/api/bios');
var chatAPIrouter = require('./routes/api/chat');
var kissAPIrouter = require('./routes/api/kiss');


const chat = require('./chat/chat');

var cors = require('cors')

const expressFileUpload = require('express-fileupload');

const connectToDatabase = require('./config/database');
connectToDatabase();

var app = express();

require('./config/passport')(app);
require('./config/flash')(app);

app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// view engine setup
const nunjucks = require('nunjucks');
nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.engine('html', nunjucks.render);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressFileUpload());
app.use(cors())

require('./config/jwt-passport')(app);


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/admins', adminsRouter);
app.use('/bios', biosRouter);

app.use('/api/auth', jwtAuthRouter);
app.use('/api/usuaris', usuarisRouter);
app.use('/api/bios', biosAPIRouter);
app.use('/api/chat', chatAPIrouter);
app.use('/api/kiss', kissAPIrouter);


app.locals.chat = chat;


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  req.chat = app.locals.chat;

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
