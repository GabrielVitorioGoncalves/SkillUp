var express = require('express');
const { buscarUsuario } = require('../banco');
const { error } = require('console');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home' });
});
// Não sei oque fiz aqui mais por algum motivo so carrega a pagina de login se estiver assim
router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/CadastroUsuario', function (req, res, next) {
  res.render('CadastroUsuario');
})

router.post('/CadastroUsuario', async function (req, res, next) {

  const { usuario, email, senha } = req.body
    const jaExiste = await global.banco.verificarUsuarioExistente(usuario, email);
    if(jaExiste){
      return res.status(404).render('error', {
      message: 'Usuário já Existe',
      error: { status: 404}
    });
    }
    await global.banco.cadastrarUsuario(usuario, email, senha);
    res.redirect('/');
})
//Ja foi testada
router.post('/login', async function (req, res, next) {
  const email = req.body.email;
  const senha = req.body.senha;

  const usuario = await global.banco.buscarUsuario({ email, senha });

  if (usuario.id_usuario) {
    global.id_usuario = usuario.id_usuario;
    global.usu_email = usuario.usu_email;
    global.usu_nome = usuario.usu_nome;

    res.redirect('/pagUsu');
  } else {

    res.redirect('/login');

  }
});



//Testar

router.get('/pagUsu', async function (req, res, next) {
  if (!global.usu_email || global.usu_email === "") {
    return res.redirect('/login');
  }

  const userName = global.usu_nome;

  res.render('Usuario', { userName });
});

router.get('/sobreNos', async function (req, res, next) {
  res.render('sobreNos', { title: 'Sobre Nos' });
});


function verificarLogin(res) {
  var test = false;
  if (!global.usu_email || global.usu_email == "") {
    res.redirect('/login');

    return test = true;
  }

}


//Testar verifiar Login

module.exports = router;  // Retirada a exportação da função verificarLogin
