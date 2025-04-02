var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
 // Não sei oque fiz aqui mais por algum motivo so carrega a pagina de login se estiver assim
router.get('/login.ejs', function(req,res,next){
  res.render('login');
});
module.exports = router;
