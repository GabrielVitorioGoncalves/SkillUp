const request = require('supertest');
const app = require('../routes/api'); 

describe('IT-004 - Marcar lição como concluída e verificar progresso', () => {
  let token;
  let usuarioId;
  const cursoId = 1;
  const licaoId = 10;

  const usuario = {
    nome: 'Aluno Lição',
    email: 'aluno@teste.com',
    senha: '123456'
  };

  beforeAll(async () => {
    // Cadastrar usuário
    await request(app).post('/api/usuarios').send(usuario);

    // Login
    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;

    // Decodificar ID do token (se você não tiver um endpoint para retornar o ID)
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    usuarioId = decoded.id;
  });

  it('Deve marcar a lição como concluída', async () => {
    const res = await request(app)
      .post('/api/progresso')
      .set('Authorization', `Bearer ${token}`)
      .send({ cursoId, licaoId });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensagem', 'Progresso registrado');
  });

  it('Deve retornar o progresso do usuário contendo a lição marcada', async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuarioId}/progresso`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const encontrada = res.body.find(p => p.licaoId === licaoId);
    expect(encontrada).toBeDefined();
    expect(encontrada.cursoId).toBe(cursoId);
  });
});
