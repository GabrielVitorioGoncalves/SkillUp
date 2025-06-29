const db = require('../banco');
const fs = require('fs');
const path = require('path');

describe('🧪 Testes do módulo de banco de dados', () => {

  let usuarioId;
  let adminId;

  // 1. Testar conexão
  it('1 - Deve conectar ao banco de dados', async () => {
    const conexao = await db.conectarBD();
    expect(conexao).toBeDefined();
    expect(conexao.query).toBeDefined();
  });

  // 2. Cadastrar e buscar usuário
  it('2 - Deve cadastrar e buscar um usuário', async () => {
    const nome = 'Usuário Teste';
    const email = `teste${Date.now()}@example.com`;
    const senha = '123';

    await db.cadastrarUsuario(nome, email, senha);
    const existe = await db.verificarUsuarioExistente(nome, email);
    expect(existe).toBe(true);

    const usuario = await db.buscarUsuario({ email, senha });
    expect(usuario).toHaveProperty('usu_email', email);
    usuarioId = usuario.id_usuario;
  });

  // 3. Cadastrar e buscar admin
  it('3 - Deve cadastrar e buscar um admin', async () => {
    const nome = 'Admin Teste';
    const email = `adm${Date.now()}@example.com`;
    const senha = 'admin123';

    await db.cadastrarAdmin(nome, email, senha);
    const encontrado = await db.verificarAdmExistente(email, senha);
    expect(encontrado).toBe(true);

    const admin = await db.buscarAdmin({ email, senha });
    expect(admin).toHaveProperty('adm_email', email);
    adminId = admin.id_admin;
  });

  // 4. Cadastrar curso
  it('17 - Deve cadastrar um curso', async () => {
    await db.cadastrarCurso('Curso Teste', 'Descrição', 'Programação', 'imagem.jpg');
    const cursos = await db.buscarTodosOsCursos();
    const curso = cursos.find(c => c.cur_titulo === 'Curso Teste');
    expect(curso).toBeDefined();
  });

  // 5. Inserir e buscar categoria
  it('5 - Deve inserir e buscar uma categoria', async () => {
    const nome = `Categoria ${Date.now()}`;
    await db.admInserirCategoria(nome);
    const existe = await db.admBuscarCategoria(nome);
    expect(existe).toBe(true);
  });

  // 6. Buscar categorias de cursos
  it('6 - Deve retornar categorias de cursos distintas', async () => {
    const categorias = await db.buscarCategoriasDeCursos();
    expect(Array.isArray(categorias)).toBe(true);
  });

  // 7. Buscar cursos mais avaliados e recentes
  it('18 - Deve retornar os cursos mais avaliados e os recentes', async () => {
    const maisAvaliados = await db.buscarCursosMaisAvaliados();
    const recentes = await db.buscarCursosRecentes();
    expect(Array.isArray(maisAvaliados)).toBe(true);
    expect(Array.isArray(recentes)).toBe(true);
  });

  // 8. Buscar todos os admins
  it('8 - Deve retornar todos os admins', async () => {
    const admins = await db.buscarTodosAdmins();
    expect(Array.isArray(admins)).toBe(true);
    expect(admins[0]).toHaveProperty('id_admin');
  });

  // 9. Atualizar e excluir admin
  it('19 - Deve atualizar e excluir um admin', async () => {
    await db.atualizarAdmin(adminId, 'Admin Atualizado', `atualizado${Date.now()}@mail.com`);
    const adminAtualizado = await db.buscarAdminPorId(adminId);
    expect(adminAtualizado.adm_nome).toBe('Admin Atualizado');

    await db.excluirAdmin(adminId);
    const aindaExiste = await db.buscarAdminPorId(adminId);
    expect(aindaExiste).toBeUndefined();
  });

  it('20 / 21 - Deve adicionar vídeo a curso e buscar a playlist', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;

  const titulo = `Video Teste ${Date.now()}`;
  const caminho = `video${Date.now()}.mp4`;

  await db.adicionarVideoAoCurso(idCurso, titulo, caminho);
  const playlist = await db.buscarPlaylistDoCurso(idCurso);
  const adicionado = playlist.find(v => v.vid_titulo === titulo);
  expect(adicionado).toBeDefined();
});

it('22 - Deve buscar vídeo por ID', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;
  const playlist = await db.buscarPlaylistDoCurso(idCurso);

  const video = await db.buscarVideoPorId(playlist[0].id_video);
  expect(video).toHaveProperty('id_video');
});

it('23 - Deve marcar vídeo como visto no histórico', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;
  const playlist = await db.buscarPlaylistDoCurso(idCurso);
  const idVideo = playlist[0].id_video;

  await db.marcarVideoComoVisto(usuarioId, idVideo);
  const vistos = await db.contarVideosVistosDoCurso(usuarioId, idCurso);
  expect(vistos).toBeGreaterThanOrEqual(1);
});

it('23 - Deve salvar avaliação do vídeo', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;
  const playlist = await db.buscarPlaylistDoCurso(idCurso);
  const idVideo = playlist[0].id_video;

  await db.salvarAvaliacao(usuarioId, idVideo, 4);
  // Sem retorno, mas se não deu erro, foi salvo
});

it('24 - Deve buscar o primeiro vídeo do curso', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;

  const primeiro = await db.buscarPrimeiroVideo(idCurso);
  expect(primeiro).toHaveProperty('id_video');
});

it('25 - Deve alterar o título do vídeo', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;
  const playlist = await db.buscarPlaylistDoCurso(idCurso);
  const idVideo = playlist[0].id_video;

  await db.alterarVideo(idVideo, 'Novo Título', null);
  const video = await db.buscarVideoPorId(idVideo);
  expect(video.vid_titulo).toBe('Novo Título');
});

it('26 - Deve buscar todos os cursos com progresso', async () => {
  const cursos = await db.buscarTodosCursosComProgresso(usuarioId);
  expect(Array.isArray(cursos)).toBe(true);
});

it('27 - Deve atualizar dados de um curso', async () => {
  const curso = await db.buscarTodosOsCursos();
  const c = curso[0];
  await db.atualizarCurso(c.id_curso, 'Novo Título', 'Nova Desc', 'Nova Categoria', 'nova.jpg');
  const atualizado = await db.buscarCursoPorId(c.id_curso);
  expect(atualizado.cur_titulo).toBe('Novo Título');
});

it('28 - Deve excluir vídeo com transação segura', async () => {
  const curso = await db.buscarTodosOsCursos();
  const idCurso = curso[0].id_curso;
  const playlist = await db.buscarPlaylistDoCurso(idCurso);
  const idVideo = playlist[playlist.length - 1].id_video;

  await db.excluirVideo(idVideo);
  const video = await db.buscarVideoPorId(idVideo);
  expect(video).toBeUndefined();
});

it('29 - Deve excluir curso e todos os dados associados', async () => {
  const cursos = await db.buscarTodosOsCursos();
  const idCurso = cursos[cursos.length - 1].id_curso;

  await db.excluirTudo(idCurso);
  const curso = await db.buscarCursoPorId(idCurso);
  expect(curso).toBeUndefined();
});









});
