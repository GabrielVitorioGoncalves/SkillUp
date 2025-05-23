const banco = require('../banco');

describe('Testes reais do módulo banco.js', () => {
  const usuarioTeste = {
    nome: 'usuario_test',
    email: 'usuario_test@email.com',
    senha: '123456'
  };

  beforeAll(async () => {
    const conex = await banco.conectarBD();
    await conex.query("DELETE FROM usuarios WHERE usu_email = ?", [usuarioTeste.email]);
  });

  afterAll(async () => {
    const conex = await banco.conectarBD();
    await conex.query("DELETE FROM usuarios WHERE usu_email = ?", [usuarioTeste.email]);
  });

  // 1
  test('conectarBD deve retornar uma conexão válida', async () => {
    const conex = await banco.conectarBD();
    expect(conex).toBeDefined();
    expect(conex.query).toBeDefined();
  });

  // 2
  test('cadastrarUsuario deve inserir novo usuário no banco', async () => {
    await banco.cadastrarUsuario(usuarioTeste.nome, usuarioTeste.email, usuarioTeste.senha);
    const conex = await banco.conectarBD();
    const [rows] = await conex.query("SELECT * FROM usuarios WHERE usu_email = ?", [usuarioTeste.email]);
    expect(rows.length).toBe(1);
    expect(rows[0].usu_nome).toBe(usuarioTeste.nome);
  });

  // 3
  test('buscarUsuario deve retornar o usuário com dados corretos', async () => {
    const resultado = await banco.buscarUsuario({ email: usuarioTeste.email, senha: usuarioTeste.senha });
    expect(resultado).toBeDefined();
    expect(resultado.usu_email).toBe(usuarioTeste.email);
  });

  // 4
  test('verificarUsuarioExistente deve retornar true se existir', async () => {
    const existe = await banco.verificarUsuarioExistente(usuarioTeste.nome, usuarioTeste.email);
    expect(existe).toBe(true);
  });

  // 5
  test('verificarUsuarioExistente deve retornar false se não existir', async () => {
    const existe = await banco.verificarUsuarioExistente('inexistente', 'naoexiste@email.com');
    expect(existe).toBe(false);
  });

  // 6
  test('buscarAdmin deve retornar vazio se admin não existir', async () => {
    const admin = await banco.buscarAdmin({ email: 'nao@existe.com', senha: '123' });
    expect(admin).toEqual({});
  });

  // 7
  test('calcularMediaDoCurso deve retornar null para array vazio', () => {
    expect(banco.calcularMediaDoCurso([])).toBe(null);
  });

  // 8
  test('calcularMediaDoCurso deve calcular média corretamente', () => {
    expect(banco.calcularMediaDoCurso([5, 4, 3, 4, 5])).toBe(4.2);
  });

  // 9
  test('admBuscarCategoria deve retornar false para categoria inexistente', async () => {
    const resultado = await banco.admBuscarCategoria('Categoria Inexistente');
    expect(resultado).toBe(false);
  });

  // 10
  test('admInserirCategoria deve inserir nova categoria', async () => {
    const nome = 'NovaCategoria';
    await banco.admInserirCategoria(nome);
    const conex = await banco.conectarBD();
    const [res] = await conex.query('SELECT * FROM temas WHERE cat_nome = ?', [nome]);
    expect(res.length).toBeGreaterThan(0);
    await conex.query("DELETE FROM temas WHERE cat_nome = ?", [nome]);
  });

  // 11
  test('admBuscarCategorias deve retornar uma lista (ou vazio)', async () => {
    const resultado = await banco.admBuscarCategorias();
    expect(Array.isArray(resultado)).toBe(true);
  });

  // 12
  test('admBuscarCategoriaPorCodigo deve retornar null para ID inválido', async () => {
    const categoria = await banco.admBuscarCategoriaPorCodigo(-1);
    expect(categoria).toBeNull();
  });

  // 13
  test('buscarNotasPorCurso deve retornar array (mesmo que vazio)', async () => {
    const notas = await banco.buscarNotasPorCurso(-1);
    expect(Array.isArray(notas)).toBe(true);
  });

  // 14
  test('admAtualizarCategoria deve atualizar uma categoria existente', async () => {
    const conex = await banco.conectarBD();
    await conex.query("INSERT INTO temas (cat_nome) VALUES ('Categoria Antiga')");
    const [result] = await conex.query("SELECT * FROM temas WHERE cat_nome = 'Categoria Antiga'");
    const id = result[0].id_tema;
    await banco.admAtualizarCategoria('Categoria Nova', id);
    const [atualizado] = await conex.query("SELECT * FROM temas WHERE id_tema = ?", [id]);
    expect(atualizado[0].cat_nome).toBe('Categoria Nova');
    await conex.query("DELETE FROM temas WHERE id_tema = ?", [id]);
  });

  // 15
  test('admExcluirCategoria deve excluir uma categoria', async () => {
    const conex = await banco.conectarBD();
    await conex.query("INSERT INTO temas (cat_nome) VALUES ('Categoria Excluir')");
    const [res] = await conex.query("SELECT * FROM temas WHERE cat_nome = 'Categoria Excluir'");
    const id = res[0].id_tema;
    await banco.admExcluirCategoria(id);
    const [verifica] = await conex.query("SELECT * FROM temas WHERE id_tema = ?", [id]);
    expect(verifica.length).toBe(0);
  });

  // 16
  test('buscarUsuario deve retornar objeto vazio com dados incorretos', async () => {
    const resultado = await banco.buscarUsuario({ email: 'x@email.com', senha: 'xxx' });
    expect(resultado).toEqual({});
  });
});