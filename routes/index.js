var express = require('express');
const banco = require('../banco');
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
  if (jaExiste) {
    return res.status(404).render('CadastroUsuario', {
      mensagem: 'Usuário já Existe',
      sucesso: false
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

router.get('/pagUsu', async function (req, res, next) {
  if (!global.usu_email || global.usu_email === "") {
    return res.redirect('/login');
  }

  try {

    const [
      cursosRecentes,
      cursosMaisAvaliados,
      categorias,
      todosOsCursos
    ] = await Promise.all([
      banco.buscarCursosRecentes(),
      banco.buscarCursosMaisAvaliados(),
      banco.buscarCategoriasDeCursos(),
      banco.buscarTodosOsCursos()
    ]);


    const secoesFixas = [
      { titulo: "Lançados recentemente", cursos: cursosRecentes },
      { titulo: "Cursos mais bem avaliados", cursos: cursosMaisAvaliados }
    ];

    res.render('Usuario', {
      userName: global.usu_nome, 
      secoesFixas: secoesFixas,
      categoriasDinamicas: categorias,
      todosOsCursos: todosOsCursos
    });

  } catch (error) {
    console.error("Erro ao carregar a página do usuário:", error);
    res.status(500).send("Erro interno ao carregar informações.");
  }
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
