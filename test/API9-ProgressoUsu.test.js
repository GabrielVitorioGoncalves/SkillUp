const request = require('supertest');
const app = require('../routes/api'); 

describe('API-009 - Marcar lição como concluída (POST /api/progresso)', () => {
  let token;
  let cursoId = 1; // Simulado
  let licaoId = 10; // Simulado

  const usuario = {
    nome: 'Aluno Progresso',
    email: 'progresso@example.com',
    senha: '123456'
  };

  it('Deve criar usuário e autenticar', async () => {
    await request(app).post('/api/usuarios').send(usuario);

    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;
  });

  it('Deve registrar progresso em uma lição', async () => {
    const res = await request(app)
      .post('/api/progresso')
      .set('Authorization', `Bearer ${token}`)
      .send({ cursoId, licaoId });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('mensagem', 'Progresso registrado');
  });

  it('Deve retornar mensagem se a lição já estiver concluída', async () => {
    const res = await request(app)
      .post('/api/progresso')
      .set('Authorization', `Bearer ${token}`)
      .send({ cursoId, licaoId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensagem', 'Lição já marcada como concluída');
  });

  it('Deve retornar erro se faltarem campos', async () => {
    const res = await request(app)
      .post('/api/progresso')
      .set('Authorization', `Bearer ${token}`)
      .send({ cursoId }); // faltando licaoId

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('erro', 'Campos obrigatórios ausentes');
  });
});
