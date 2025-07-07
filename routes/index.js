var express = require('express');
const banco = require('../banco'); // Importa o módulo do banco
var router = express.Router();
const PDFDocument = require('pdfkit');


function verificarLogin(req, res, next) {
  if (global.id_usuario) {
    return next();
  } else {
    res.redirect('/login');
  }
}


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/CadastroUsuario', function (req, res, next) {
  res.render('CadastroUsuario');
});

router.post('/CadastroUsuario', async function (req, res, next) {
  try {
    const { usuario, email, senha } = req.body
    const jaExiste = await banco.verificarUsuarioExistente(usuario, email);
    if (jaExiste) {
      return res.status(400).render('CadastroUsuario', {
        mensagem: 'Usuário ou e-mail já existe.',
        sucesso: false
      });
    }
    await banco.cadastrarUsuario(usuario, email, senha);
    res.redirect('/login');
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function (req, res, next) {
  try {
    const { email, senha } = req.body;
    const usuario = await banco.buscarUsuario({ email, senha });

    if (usuario && usuario.id_usuario) {
      global.id_usuario = usuario.id_usuario;
      global.usu_email = usuario.usu_email;
      global.usu_nome = usuario.usu_nome;
      res.redirect('/pagUsu');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    next(error);
  }
});



router.get('/pagUsu', verificarLogin, async function (req, res, next) {
  try {
    const idUsuario = global.id_usuario;
    const todosOsCursos = await banco.buscarTodosCursosComProgresso(idUsuario);

    todosOsCursos.forEach(curso => {
      if (curso.total_videos > 0) {
        curso.progresso = Math.round((curso.videos_vistos / curso.total_videos) * 100);
      } else {
        curso.progresso = 0;
      }
    });

    const secoesFixas = [
      { titulo: "Lançados recentemente", cursos: todosOsCursos.slice(-5).reverse() },
      { titulo: "Cursos mais bem avaliados", cursos: [...todosOsCursos].sort((a, b) => (b.nota_media || 0) - (a.nota_media || 0)).slice(0, 5) }
    ];

    const categoriasUnicas = [...new Set(todosOsCursos.map(c => c.cur_categoria))].filter(Boolean);
    const categoriasDinamicas = categoriasUnicas.map(cat => ({ cur_categoria: cat }));

    res.render('Usuario', {
      userName: global.usu_nome,
      secoesFixas: secoesFixas,
      categoriasDinamicas: categoriasDinamicas,
      todosOsCursos: todosOsCursos
    });
  } catch (error) {
    console.error("Erro ao carregar a página do usuário:", error);
    next(error);
  }
});

router.get('/sobreNos', function (req, res, next) { // Não precisa de async se não tem await
  res.render('sobreNos', { title: 'Sobre Nos' });
});

router.get('/curso/:idCurso/video/:idVideo', verificarLogin, async function (req, res, next) {
  try {
    const { idCurso, idVideo } = req.params;
    const idUsuario = global.id_usuario;

    const [videoAtual, playlist, totalVideos, videosVistos] = await Promise.all([
      banco.buscarVideoPorId(idVideo),
      banco.buscarPlaylistDoCurso(idCurso),
      banco.contarVideosDoCurso(idCurso),
      banco.contarVideosVistosDoCurso(idUsuario, idCurso)
    ]);

    if (!videoAtual) {
      const err = new Error('Vídeo não encontrado.');
      err.status = 404;
      return next(err);
    }

    const progresso = totalVideos > 0 ? Math.round((videosVistos / totalVideos) * 100) : 0;

    res.render('paginaVideo', {
      videoAtual: videoAtual,
      playlist: playlist,
      idCurso: idCurso,
      progresso: progresso,
      totalVideos: totalVideos,
      videosVistos: videosVistos
    });
  } catch (error) {
    console.error("Erro ao carregar a página de vídeo:", error);
    next(error);
  }
});

// Esta rota é uma API, a verificação de login é um pouco diferente
router.post('/api/progresso/marcar-visto', async function (req, res, next) {
  if (!global.id_usuario) {
    return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
  }
  try {
    const { idVideo } = req.body;
    if (!idVideo) {
      return res.status(400).json({ success: false, message: 'ID do vídeo não fornecido.' });
    }
    await banco.marcarVideoComoVisto(global.id_usuario, idVideo);
    res.json({ success: true, message: 'Progresso salvo!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao salvar progresso.' });
  }
});

router.get('/curso/:idCurso/certificado', verificarLogin, async (req, res, next) => {
  try {
    const { idCurso } = req.params;
    const idUsuario = global.id_usuario;

    const totalVideos = await banco.contarVideosDoCurso(idCurso);
    const videosVistos = await banco.contarVideosVistosDoCurso(idUsuario, idCurso);
    if(!videoAtual){
      const err = new Error ('Vídeo não encontrado.');
      err.status = 404;
      return next(err);
    }
    
    if (totalVideos === 0 || videosVistos < totalVideos) {
      return res.status(403).send('Você ainda não concluiu este curso para emitir o certificado.');
    }

    const [usuario, curso] = await Promise.all([
      banco.buscarUsuarioPorId(idUsuario),
      banco.buscarCursoPorId(idCurso)
    ]);

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificado-${usuario.usu_nome}-${curso.cur_titulo}.pdf"`);
    doc.pipe(res);

    doc.fontSize(36).font('Helvetica-Bold').text('CERTIFICADO DE CONCLUSÃO', { align: 'center', y: 150 });
    doc.moveDown(2);
    doc.fontSize(20).font('Helvetica').text('Certificamos que', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(30).font('Helvetica-Bold').text(usuario.usu_nome, { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(20).font('Helvetica').text('concluiu com sucesso o curso de', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(28).font('Helvetica-Bold').text(curso.cur_titulo, { align: 'center' });
    doc.moveDown(3);
    doc.fontSize(14).font('Helvetica').text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
    doc.end();

  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    next(error);
  }
});

router.get('/curso/:idCurso', verificarLogin, async function (req, res, next) {
  try {
    const { idCurso } = req.params;
    const primeiroVideo = await banco.buscarPrimeiroVideo(idCurso); // Corrigido para a função mais robusta

    if (primeiroVideo && primeiroVideo.id_video) {
      res.redirect(`/curso/${idCurso}/video/${primeiroVideo.id_video}`);
    } else {
      res.status(404).send('Este curso ainda não tem vídeos.');
    }
  } catch (error) {
    next(error);
  }
});

//deixei por ultimo porque foi chato de achar
router.post('/api/video/avaliar', verificarLogin, async (req, res, next) => {
  console.log('DADOS RECEBIDOS', req.body);
  try {
    const { idVideo, nota } = req.body;
    const idUsuario = global.id_usuario;

    if (!idVideo || !nota || nota < 1 || nota > 5) {
      return res.status(400).json({ success: false, message: "Dados da avaliação inválidos." });
    }
    await banco.salvarAvaliacao(idUsuario, idVideo, nota);
    res.json({ success: true });

  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    res.status(500).json({ success: false, message: "Erro interno do servidor." });
  }
});

router.get('/ajuda', function(req, res, next) {
  res.render('ajuda', { title: 'Central de Ajuda' });
});

module.exports = router;