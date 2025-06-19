var express = require('express');
var router = express.Router();

// ----- Pacotes e Configuração Inicial -----
const multer = require('multer');
const path = require('path');
const banco = require('../banco');

// Configuração do Multer (upload de imagens)
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

/* ----- Função de Verificação de Login ----- */
function verificarLogin(res) {
  if (!global.adm_email || global.adm_email == "") {
    res.redirect('/admin');
  }
}

/* ----- Admin: Tela Inicial e Login ----- */
router.get('/', function (req, res) {
  res.render('admin/admin');
});

router.post('/loginadmin', async function (req, res) {
  const { email, senha } = req.body;
  const admin = await global.banco.buscarAdmin({ email, senha });

  if (admin.id_admin) {
    global.id_admin = admin.id_admin;
    global.adm_email = admin.adm_email;
    res.redirect('/admin/principalAdm');
  } else {
    res.redirect('/admin');
  }
});

router.get('/principalAdm', async function (req, res) {
  verificarLogin(res);
  res.render('admin/principalAdm');
});

/* ----- Categorias: CRUD ----- */
router.get('/categorias', async function (req, res) {
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

router.get('/categorianova', async function (req, res) {
  verificarLogin(res);
  res.render('admin/categoria_nova', {
    cat_nome: global.cat_nome,
    mensagem: null,
    sucesso: false
  });
});

router.post('/categorianova', async function (req, res) {
  verificarLogin(res);
  const cat_nome = req.body.cat_nome;

  if (!cat_nome) {
    return res.render('admin/categoria_nova', {
      cat_nome: global.cat_nome,
      mensagem: 'O campo deve ser preenchido',
      sucesso: false
    });
  }

  const categoriaExistente = await global.banco.admBuscarCategoria(cat_nome);
  if (categoriaExistente) {
    return res.render('admin/categoria_nova', {
      cat_nome: global.cat_nome,
      mensagem: 'Essa categoria já Existe no banco de Dados',
      sucesso: false
    });
  }

  await global.banco.admInserirCategoria(cat_nome);
  return res.render('admin/categoria_nova', {
    cat_nome: global.cat_nome,
    mensagem: 'Categoria criada com sucesso.',
    sucesso: true
  });
});

router.get('/categoriasAtualizadas/:id', async function (req, res) {
  verificarLogin(res);
  const codigo = req.params.id;

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
  });
});

router.post('/categoriasAtualizadas/:id', async function (req, res) {
  const id_tema = req.params.id;
  const cat_nome = req.body.cat_nome;

  if (!cat_nome) {
    return res.render('admin/categorias_atualizada', {
      cat_nome: global.cat_nome,
      categoria: { id_tema, cat_nome },
      mensagem: "Preencha os campos obrigatorios.",
      sucesso: false
    });
  }

  const catExistente = await global.banco.admBuscarCategoria(cat_nome);
  if (catExistente) {
    return res.render('admin/categorias_atualizada', {
      cat_nome: global.cat_nome,
      categoria: { id_tema, cat_nome },
      mensagem: "Essa categoria já existe.",
      sucesso: false
    });
  }

  await global.banco.admAtualizarCategoria(cat_nome, id_tema);
  return res.render('admin/categorias_atualizada', {
    cat_nome: global.cat_nome,
    categoria: { id_tema, cat_nome },
    mensagem: "Categoria atualizada com sucesso.",
    sucesso: true
  });
});

router.get('/excluircategoria/:id', async function (req, res) {
  verificarLogin(res);
  const id_tema = req.params.id;

  const categoria = await global.banco.admBuscarCategoriaPorCodigo(id_tema);
  if (!categoria) {
    return res.redirect('/admin/categorias?erro=notfound');
  }

  await global.banco.admExcluirCategoria(id_tema);
  res.redirect('/admin/categorias?sucesso=true');
});

/* ----- Administradores: Cadastro, Listagem, Exclusão ----- */
router.get('/cadastroAdm', async function (req, res) {
  verificarLogin(res);
  const admins = await global.banco.buscarTodosAdmins();
  res.render('admin/cadastroAdm', {
    mensagem: null,
    sucesso: false,
    usuario: '',
    email: '',
    admins
  });
});

router.post('/cadastroAdm', async function (req, res) {
  const { usuario, email, senha } = req.body;
  const admins = await global.banco.buscarTodosAdmins();

  if (!usuario || !email || !senha) {
    return res.render('admin/cadastroAdm', {
      mensagem: 'Preencha todos os campos.',
      sucesso: false,
      usuario,
      email,
      admins
    });
  }

  const verificarAdm = await global.banco.verificarAdmExistente(usuario, email);
  if (verificarAdm) {
    return res.render('admin/cadastroAdm', {
      mensagem: 'Esse administrador já existe.',
      sucesso: false,
      usuario,
      email,
      admins
    });
  }

  await global.banco.cadastrarAdmin(usuario, email, senha);
  const novosAdmins = await global.banco.buscarTodosAdmins();

  return res.render('admin/cadastroAdm', {
    mensagem: 'Administrador cadastrado com sucesso!',
    sucesso: true,
    usuario: '',
    email: '',
    admins: novosAdmins
  });
});

router.get('/cadastroadmnovo', async function (req, res) {
  verificarLogin(res);
  res.render('admin/cadastroAdmNovo', {
    mensagem: null,
    sucesso: false,
    usuario: '',
    email: ''
  });
});

router.get('/excluiradm/:id', async function (req, res) {
  const adminId = req.params.id;

  try {
    await global.banco.excluirAdmin(adminId);
    res.redirect('/admin/cadastroadm');
  } catch (error) {
    console.error('Erro ao excluir administrador:', error);
    res.status(500).send('Erro ao excluir administrador');
  }
});

router.get('/editaradm/:id', async function (req, res) {
  verificarLogin(res);
  const id = req.params.id;

  const admin = await global.banco.buscarAdminPorId(id);
  if (!admin) {
    return res.redirect('/admin/cadastroAdm');
  }

  res.render('admin/cadastroAdmAtualizada', {
    admin,
    mensagem: null,
    sucesso: false
  });
});

router.post('/cadastroAdmAtualizada/:id', async function (req, res) {
  const id_admin = req.params.id;
  const { usuario, email } = req.body;

  if (!usuario || !email) {
    return res.render('admin/cadastroAdmAtualizada', {
      admin: { id_admin, adm_nome: usuario, adm_email: email },
      mensagem: 'Preencha todos os campos.',
      sucesso: false
    });
  }

  // Verifica duplicidade (se o novo e-mail já pertence a outro)
  const existente = await global.banco.verificarAdmExistente(usuario, email);
  if (existente && existente.id_admin != id_admin) {
    return res.render('admin/cadastroAdmAtualizada', {
      admin: { id_admin, adm_nome: usuario, adm_email: email },
      mensagem: 'Já existe um administrador com esse nome ou email.',
      sucesso: false
    });
  }

  await global.banco.atualizarAdmin(id_admin, usuario, email);

  res.render('admin/cadastroAdmAtualizada', {
    admin: { id_admin, adm_nome: usuario, adm_email: email },
    mensagem: 'Administrador atualizado com sucesso!',
    sucesso: true
  });
});


/* ----- Cursos: Criação ----- */

// Rota para mostrar o formulário de criação de curso com categorias
router.get('/cria-curso', async function(req, res) {
  try {
    const categorias = await global.banco.admBuscarCategorias();
    res.render('admin/temas', { categorias });
  } catch (err) {
    console.error(err);
    res.render('admin/temas', { categorias: [] });
  }
});

// Rota para processar a criação do curso
router.post('/cria-curso', upload.single('capa'), async function (req, res) {
  const { nome, descricao, categoria } = req.body;
  const capa = req.file ? '/uploads/capas/' + req.file.filename : null;

  const conexao = await global.banco.conectarBD();
  try {
    await conexao.query(
      'INSERT INTO cursos (cur_titulo, cur_descricao, cur_categoria, capa) VALUES (?, ?, ?, ?)',
      [nome, descricao, categoria, capa]
    );
    res.redirect('/admin/temas');  // Corrigido aqui
  } catch (erro) {
    console.error('Erro ao inserir curso:', erro);
    res.status(500).send('Erro ao criar curso.');
  }
});


/* ----- Temas: Página Inicial (placeholder) ----- */
router.get('/Temas', async function (req, res) {
  res.render('temas', { title: 'Temas' });
});

module.exports = router;
