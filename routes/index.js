var express = require('express');
const { buscarUsuario } = require('../banco');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});
 // Não sei oque fiz aqui mais por algum motivo so carrega a pagina de login se estiver assim
router.get('/login', function(req,res,next){
  res.render('login');
});

router.post('/login', async function(req,res,next){
  const email = req.body.email;
  const senha = req.body.senha;

  const usuario = await global.banco.buscarUsuario({ email, senha});

  if(usuario.id_usuario){
    global.id_usuario = usuario.id_usuario;
    global.usu_email = usuario.usu_email;

    res.redirect('/pagUsu');
  }else{
    res.redirect('/login');
  }
});

router.get('/pagUsu', async function(res,res,next){
  verificarLogin(res);
  res.render('pagUsu');

});



function verificarLogin(res) {
  console.log("entrou em verificarLogin");
  if (!global.usu_email || global.usu_email == "") {
    res.redirect('/login');
  }

}


module.exports = router;
