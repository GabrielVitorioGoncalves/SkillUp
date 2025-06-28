var express = require('express');
const banco = require('../banco');
const { error } = require('console');
var router = express.Router();
const PDFDocument = require('pdfkit');

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

router.get('/curso/:idCurso/video/:idVideo', async function (req, res, next) {
  verificarLogin(res);
  try {
    const { idCurso, idVideo } = req.params;

    //Buscamos os dados do videos atual e da playlist que esta em paralelo
    const [videoAtual, playlist] = await Promise.all([
      banco.buscarVideoPorId(idVideo),
      banco.buscarPlaylistDoCurso(idCurso)
    ]);

    if (!videoAtual) {
      const err = new Error('Video não encontrado.');
      err.status = 404;
      return next(err);
    }

    //Agora que renderiza a pagina passando os dados anteriores
    res.render('paginaVideo', {
      videoAtual: videoAtual,
      playlist: playlist,
      idCurso: idCurso
    })
  } catch (error) {
    console.error("Erro ao carregar a pagina de vídeo", error);
    next(error);
  }
});

router.post('/progresso/marcar-visto', async (req, res) => {
  verificarLogin(res);

  const { idVideo } = req.body;
  if (!idVideo) {
    return res.status(400).json({
      sucess: false,
      message: 'ID do video nao foi fornecido.'
    });
  }

  try {
    await banco.marcarVideoComoVisto(global.id_usuario, idVideo);
    res.json({
      sucess: true,
      message: 'Progresso salvo!'
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      message: 'Errorrrrrr'
    });
  }

})

router.get('/curso/:idCurso/certificado', async (req, res, next) => {
  verificarLogin(res);

  const { idCurso } = req.params;
  const idUsuario = global.id_usuario;

  try {
    //TEMOS QUE VERIFICAR O PROGRESSO PRIMEIRO
    const totalVideos = await banco.contarVideosDoCurso(idCurso);
    const videosVistos = await banco.contarVideosVistosDoCurso(idUsuario, idCurso);

    if (totalVideos === 0 || videosVistos < totalVideos) {
      return res.status(403).send('Voce ainda nao concluiu este curso para emitir o certificado')
    }

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="certificado_${idUsuario}_${idCurso}.pdf`)
    doc.pipe(res);
    //PARTE CHATA DE MONTAR O CERTIFICADOOOOOOOOOOOOOOOOOOOOOOOOOO
    doc.fontSize(40).font('Helvetica-Bold').text('CERTIFICADO DE CONCLUSÃO', { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(22).font('Helvetica').text('Certificamos que', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(32).font('Helvetica-Bold').text(global.usu_nome, { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(22).font('Helvetica').text('concluiu com sucesso o curso de', { align: 'center' });
    doc.moveDown(1);
    doc.fontSize(28).font('Helvetica-Bold').text('NOME DO CURSO AQUI', { align: 'center' }); // Nome do curso
    doc.moveDown(3);
    doc.fontSize(16).text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error("Erro ao gerar certificado:", error);
    next(error);
  }
})


router.get('/curso/:idCurso', async function (req,res,next) {
  try{
    verificarLogin(res);
    const {idCurso} = req.params;
    const primeiroVideo = await global.banco.buscarPrimeiroVideo(idCurso);

    if(primeiroVideo && primeiroVideo.id_video){
      //AEEE ENCONTRAMOS
      res.redirect(`/curso/${idCurso}/video/${primeiroVideo.id_video}`);
    } else{
      //DEU RUIM NAO ACHAMOS
      res.status(404).send('Este curso ainda não tem videos');
    } 
  } catch(error){
    next(error);
  }
})


function verificarLogin(res) {
  var test = false;
  if (!global.usu_email || global.usu_email == "") {
    res.redirect('/login');

    return test = true;
  }

}


//Testar verifiar Login

module.exports = router;  // Retirada a exportação da função verificarLogin
