var express = require('express');
var router = express.Router();


const multer = require('multer');
const path = require('path');
const banco = require('../banco');


const armazena = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'capa') {
      cb(null, path.join(__dirname, '../public/uploads/capas'));
    }
    else if (file.fieldname === 'video' || file.fieldname === 'videos[]') {
      cb(null, path.join(__dirname, '../public/uploads/videos'));
    }
    else {
      cb(new Error('Campo de arquivo não esperado'));
    }
  },
  filename: function (req, file, cb) {
    const nomeUnico = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, nomeUnico);
  }
});

const upload = multer({ storage: armazena });

const uploadCurso = upload.fields([
  { name: 'capa', maxCount: 1 },
  { name: 'videos[]', maxCount: 20 }
]);


function verificarLogin(res) {
  if (!global.adm_email || global.adm_email == "") {
    res.redirect('/admin');
  }
}

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

/* ----- Cursos: Listagem ----- */
router.get('/principalAdm', async function (req, res) {
  try {
    verificarLogin(res);

    const conexao = await global.banco.conectarBD();
    const [cursos] = await conexao.query('SELECT * FROM cursos');

    res.render('admin/principalAdm', { cursos });
  } catch (erro) {
    console.error('Erro ao buscar cursos:', erro);
    res.render('admin/principalAdm', { cursos: [] });
  }
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
router.get('/cria-curso', async function (req, res) {
  try {
    const categorias = await global.banco.admBuscarCategorias();
    res.render('admin/temas', { categorias });
  } catch (err) {
    console.error(err);
    res.render('admin/temas', { categorias: [] });
  }
});

// Rota para processar a criação do curso
router.post('/cria-curso', uploadCurso, async function (req, res) {
  const { nome, descricao, categoria, titulos } = req.body;

  const capaFile = req.files?.capa?.[0];
  const nomeArquivoCapa = capaFile ? capaFile.filename : null;

  try {
    const conexao = await global.banco.conectarBD();

    // 1. Inserir o curso
    const [cursoResult] = await conexao.query(
      'INSERT INTO cursos (cur_titulo, cur_descricao, cur_categoria, capa) VALUES (?, ?, ?, ?)',
      [nome, descricao, categoria, nomeArquivoCapa]
    );
    const cursoId = cursoResult.insertId;

    // 2. Inserir vídeos e associar
    const arquivosVideos = req.files?.videos || [];
    // titulos pode vir como string se só tiver 1. Normalizamos para array.
    const titulosArray = Array.isArray(titulos) ? titulos : [titulos];

    for (let i = 0; i < arquivosVideos.length; i++) {
      const video = arquivosVideos[i];
      const nomeArquivoVideo = video.filename;
      const titulo = titulosArray[i] || `Lição ${i + 1}`;

      // Inserir na tabela `video`
      const [videoResult] = await conexao.query(
        'insert into videos (vid_titulo, caminho_do_arquivo) VALUES (?, ?)',
        [titulo, nomeArquivoVideo]
      );
      const videoId = videoResult.insertId;

      // Relacionar com o curso (ordem baseada no índice)
      await conexao.query(
        'INSERT INTO curso_video (id_curso, id_video, ordem) VALUES (?, ?, ?)',
        [cursoId, videoId, i + 1]
      );
    }

    res.redirect('/admin/principalAdm');
  } catch (erro) {
    console.error('Erro ao criar curso com vídeos:', erro);
    res.status(500).send('Erro ao criar curso com vídeos.');
  }
});

router.get('/temas', async function (req, res) {
  try {
    const categorias = await global.banco.admBuscarCategorias();
    res.render('Temas', { categorias });
  } catch (err) {
    console.error('Erro ao carregar categorias:', err);
    res.render('Temas', { categorias: [] });
  }
});

router.get('/editar-curso/:id', async function (req, res, next) {
  try {
    verificarLogin(res);
    const idDoCurso = req.params.id;

    const [curso, categorias, videosDoCurso] = await Promise.all([
      global.banco.buscarCursoPorId(idDoCurso),
      global.banco.admBuscarCategorias(),
      global.banco.buscarPlaylistDoCurso(idDoCurso)
    ]);

    if (!curso) {
      return res.status(404).send('Curso não encontrado');
    }

    res.render('admin/editar_curso', { curso, categorias, videos: videosDoCurso });
  } catch (error) {
    console.error("Erro ao carregar página de edição:", error);
    next(error);
  }
});

router.post('/editar-curso/:id', upload.single('capa'), async function (req, res, next) {
  try {
    verificarLogin(res);
    const { id } = req.params;
    const { nome, descricao, categoria } = req.body;
    const capaFile = req.file;

    const cursoAtual = await global.banco.buscarCursoPorId(id);
    let nomeArquivoCapa = cursoAtual.capa;

    if (capaFile) {
      nomeArquivoCapa = capaFile.filename;
    }

    await global.banco.atualizarCurso(id, nome, descricao, categoria, nomeArquivoCapa);

    res.redirect('/admin/principalAdm');
  } catch (error) {
    console.error('Erro ao atualizar o curso:', error);
    next(error); // Adicionei o next(error)
  }
});

router.post('/excluir-video/:idVideo', async function (req, res, next) {
  try {
    verificarLogin(res);
    const { idVideo } = req.params;
    await global.banco.excluirVideo(idVideo);

    res.redirect(`/admin/editar-curso/${req.body.idCurso}`);
  } catch (error) {
    next(error);
  }
});

router.get('/adicionar-aula/:idCurso', async function (req, res, next) {
  try {
    verificarLogin(res);
    const { idCurso } = req.params;
    const curso = await global.banco.buscarCursoPorId(idCurso);

    if (!curso) {
      return res.status(404).send('Curso não encontrado para adicionar aula.');
    }

    res.render('admin/adicionar_aula', { curso });

  } catch (error) {
    next(error);
  }
});

router.post('/adicionar-aula/:idCurso', upload.single('video'), async function (req, res, next) {
  try {
    verificarLogin(res);
    const { idCurso } = req.params;
    const { titulo } = req.body;
    const videoFile = req.file;

    if (!videoFile) {
      throw new Error("Nenhum arquivo de vídeo foi enviado.");
    }

    const nomeArquivoVideo = videoFile.filename;

    await banco.adicionarVideoAoCurso(idCurso, titulo, nomeArquivoVideo);

    res.redirect(`/admin/editar-curso/${idCurso}`);

  } catch (error) {
    console.error("Erro ao adicionar nova aula:", error);
    next(error);
  }
});

router.get('/editar-aula/:idVideo', async function (req, res, next) {
  try {
    verificarLogin(res);
    const { idVideo } = req.params;
    const video = await global.banco.buscarVideoComCursoId(idVideo);

    if (!video) {
      return res.status(404).send('Aula não encontrada.');
    }
    res.render('admin/editar_aula', { video });

  } catch (error) {
    next(error);
  }
});

router.post('/editar-aula/:idVideo', upload.single('video'), async (req, res, next) => {
  try {
    verificarLogin(res);
    const { idVideo } = req.params;
    const { titulo, idCurso } = req.body; 
    const novoVideoFile = req.file;

    let nomeNovoArquivo = null;
    if (novoVideoFile) {
      nomeNovoArquivo = novoVideoFile.filename;
    }

    await global.banco.alterarVideo(idVideo, titulo, nomeNovoArquivo);

    res.redirect(`/admin/editar-curso/${idCurso}`);

  } catch (error) {
    console.error("Erro ao alterar a aula:", error);
    next(error);
  }
});

module.exports = router;
