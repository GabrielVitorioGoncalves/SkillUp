var createError = require('http-errors');
var express = require('express');
const multer = require('multer');


var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan')
const fs = require('fs');


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use((req, res, next) => {
  res.locals.currentUrl = req.url;
  next();
});


app.use('/', indexRouter);
app.use('/admin', adminRouter);

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
 cb(null, 'public/uploads/');
 },
 filename: (req, file, cb) => {
 const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
 cb(null, uniqueSuffix + path.extname(file.originalname));
 }
});
const upload = multer({
 storage: storage,
 fileFilter: (req, file, cb) => {
 const filetypes = /jpeg|jpg|png/;
 const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
 const mimetype = filetypes.test(file.mimetype);
 if (extname && mimetype) {
 return cb(null, true);
 } else {
 cb(new Error('Apenas imagens JPG ou PNG são permitidas!'));
 }
 }
});



//teste multer (upload)
//app.use('/uploads', express.static('uploads'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
 