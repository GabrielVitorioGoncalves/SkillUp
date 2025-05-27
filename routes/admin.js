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

router.get('/categorias', async function (req, res, next) {
  verificarLogin(res);
  const cate = await global.banco.admBuscarCategorias();

  let mensagem = null;
  let sucesso = false;

  if (req.query.sucesso === 'true') {
    mensagem = "Categoria excluída com sucesso.";
    sucesso = true;
  } else if (req.query.erro === 'notfound') {
    mensagem = "A categoria não foi encontrada.";
  }

  res.render('admin/categorias', {
    cat_nome: global.cat_nome,
    cate,
    mensagem,
    sucesso
  });
});


router.get('/categorianova', async function (req, res, next) {
  verificarLogin(res);
  res.render('admin/categoria_nova', {
    cat_nome: global.cat_nome,
    mensagem: null,
    sucesso: false
  })
})


//Post para a pegar o formulario da categoria nova

router.post('/categorianova', async function (req, res, next) {
  verificarLogin(res);

  const cat_nome = req.body.cat_nome

  //Verificação se o nome esta em branco
  if (!cat_nome) {
    return res.render('admin/categoria_nova', {
      cat_nome: global.cat_nome,
      mensagem: 'O campo deve ser preenchido',
      sucesso: false
    })
  }

  // Outra verificação para saber se o nome
  // está duplicado

  const categoriaExistente = await global.banco.admBuscarCategoria(cat_nome);
  if (categoriaExistente) {
    return res.render('admin/categoria_nova', {
      cat_nome: global.cat_nome,
      mensagem: 'Essa categoria já Existe no banco de Dados',
      sucesso: false
    });
  }

  //Agora caso o nome nao esteja em branco nem exista algum nome igual no devemos inserir o dado no banco

  await global.banco.admInserirCategoria(cat_nome);
  return res.render('admin/categoria_nova', {
    cat_nome: global.cat_nome,
    mensagem: 'Categoria criada com sucesso.',
    sucesso: true
  });
})

//Atualização de curso

router.get('/categoriasAtualizadas/:id', async function (req, res, next) {
  verificarLogin(res);
  const codigo = parseInt(req.params.id);

  const cat = await global.banco.admBuscarCategoriaPorCodigo(codigo);
  if (!cat) {
    return res.render('admin/categorias_atualizada', {
      cat_nome: global.cat_nome,
      mensagem: 'A categoria não foi encontrada.',
      sucesso: false
    });
  }

  res.render('admin/categorias_atualizada', {
    cat_nome: global.cat_nome,
    categoria: cat,
    mensagem: null,
    sucesso: false
  })

})

router.post('/categoriasAtualizadas/:id', async function (req, res, next) {

  const id_tema = req.params.id;
  const cat_nome = req.body.cat_nome;

  console.log("ID do tema:", id_tema);
  console.log("Nome da categoria:", cat_nome);

  if (!cat_nome) {

    return res.render('admin/categorias_atualizada', {
      cat_nome: global.cat_nome,
      categoria: { id_tema, cat_nome },
      mensagem: "Preencha os campos obrigatorios.",
      sucesso: false
    });
  }

  //Verificando se o nome esta duplicado

  const catExistente = await global.banco.admBuscarCategoria(cat_nome);
  if (catExistente) {
    return res.render('admin/categorias_atualizada', {
      cat_nome: global.cat_nome,
      categoria: { id_tema, cat_nome },
      mensagem: "Essa categoria já existe.",
      sucesso: false
    })
  }

  //Gravando as alterações feitas

  await global.banco.admAtualizarCategoria(cat_nome, id_tema);
  return res.render('admin/categorias_atualizada',{
    cat_nome: global.cat_nome,
    categoria : {id_tema, cat_nome},
    mensagem: "Categoria atualizada com sucesso.",
    sucesso : true
  })

})

router.get('/excluircategoria/:id', async function(req,res,next) {
  verificarLogin(res);
  const id_tema = req.params.id;

  const categoria = await global.banco.admBuscarCategoriaPorCodigo(id_tema);

  if (!categoria) {
    // Redireciona para a listagem com mensagem de erro
    return res.redirect('/admin/categorias?erro=notfound');
  }

  await global.banco.admExcluirCategoria(id_tema);
  res.redirect('/admin/categorias?sucesso=true');
});

/**
 * Rotas dos temas
 */
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

/**
 * Rotas de Cadastro do Adm
 */

router.get('/cadastroAdm', async function (req, res, next) {
  verificarLogin(res);
  res.render('admin/cadastroAdm');

})

router.post('/cadastroAdm', async function (req, res, next) {

  const { usuario, email, senha } = req.body
  const verificarAdm = await global.banco.verificarAdmExistente(usuario, email);
  if (verificarAdm) {
    return res.render('admin/cadastroAdm')
  };

  const admin = await global.banco.cadastrarAdmin(usuario, email, senha);
  res.redirect('/principalAdm')

})

/**
 * Rota Criação do curso
 */
router.post('/cria-curso', upload.single('capa'), async function (req, res) {
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
