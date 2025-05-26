var express = require('express');
var router = express.Router();
//teste com multer (upload)
const multer = require('multer');
const path = require('path');
const banco = require('../banco');

// Configurar armazenamento do Multer
const armazena = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/capas'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nomeArquivo = Date.now() + '-' + file.originalname;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage: armazena });

// Rotas principais do Admin 
router.get('/', function (req, res, next) {
  res.render('admin/admin');
});

router.get('/principalAdm', async function (req, res, next) {
  verificarLogin(res);
  res.render('admin/principalAdm');
});


/**
 * Rotas para as categorias
 */

router.get('/categorias', async function (req,res,next) {
  verificarLogin(res);
  const cate = await global.banco.admBuscarCategorias();

  res.render('admin/categorias',{
    cat_nome: global.cat_nome,
    cate,
    mensagem: null,
    sucesso: false
  });
})

router.get('/categorianova', async function (req,res,next){
  verificarLogin(res);
  res.render('admin/categoria_nova',{
    cat_nome: global.cat_nome,
    mensagem: null,
    sucesso: false
  })
})


//Post para a pegar o formulario da categoria nova

router.post('/categorianova', async function (req,res,next) {
  verificarLogin(res);

  const cat_nome = req.body.cat_nome

  //Verificação se o nome esta em branco
  if(!cat_nome){
    return res.render('admin/categoria_nova',{
      cat_nome : global.cat_nome,
      mensagem : 'O campo deve ser preenchido',
      sucesso: false
    })
  }

  // Outra verificação para saber se o nome
  // está duplicado

  const categoriaExistente = await global.banco.admBuscarCategoria(cat_nome);
  if(categoriaExistente){
    return res.render('admin/categoria_nova',{
      cat_nome : global.cat_nome,
      mensagem : 'Essa categoria já Existe no banco de Dados',
      sucesso : false
    });
  }

  //Agora caso o nome nao esteja em branco nem exista algum nome igual no devemos inserir o dado no banco

  await global.banco.admInserirCategoria(cat_nome);
  return res.render('admin/categoria_nova',{
    cat_nome : global.cat_nome,
    mensagem : 'Categoria criada com sucesso.',
    sucesso : true
  });
})













router.get('/Temas', async function (req, res, next) {
  res.render('temas', { title: 'Temas' });
});

router.post('/loginadmin', async function (req, res, next) {
  const email = req.body.email;
  const senha = req.body.senha;

  const admin = await global.banco.buscarAdmin({ email, senha });

  if (admin.id_admin) {
    global.id_admin = admin.id_admin;
    global.adm_email = admin.adm_email;
    res.redirect('/admin/principalAdm');
  } else {
    res.redirect('/admin');
  }
});

function verificarLogin(res) {
  if (!global.adm_email || global.adm_email == "") {
    res.redirect('/admin');
  }
}

router.get('/cadastroAdm', async function (req,res,next) {
  verificarLogin(res);
  res.render('admin/cadastroAdm');
  
})

router.post('/cadastroAdm', async function(req,res,next){

const {usuario,email,senha} = req.body
const verificarAdm = await global.banco.verificarAdmExistente(usuario,email);
if(verificarAdm){
  return res.render('admin/cadastroAdm')
};

const admin = await global.banco.cadastrarAdmin(usuario,email,senha);
res.redirect('/principalAdm')

})





























// post para criação de curso 
router.post('/cria-curso', upload.single('capa'), async function(req, res) {
  const { nome, descricao, categoria } = req.body;
  const capa = req.file ? '/uploads/capas/' + req.file.filename : null;


  const conexao = await global.banco.conectarBD();
  try {
    await conexao.query(
      'INSERT INTO cursos (cur_titulo, cur_descricao, cur_categoria, capa) VALUES (?, ?, ?, ?)',
      [nome, descricao, categoria, capa]
    );
    res.redirect('/admin/Temas');
  } catch (erro) {
    console.error('Erro ao inserir curso:', erro);
    res.status(500).send('Erro ao criar curso.');
  } finally {
    conexao.end();
  }
});

module.exports = router;
