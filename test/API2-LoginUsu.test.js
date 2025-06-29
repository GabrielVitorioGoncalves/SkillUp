const request = require('supertest');
const app = require('../routes/api'); 

describe('API-002 - Login do usuário (POST /api/login)', () => {
  const usuario = {
    nome: 'Teste',
    email: 'Teste@teste',
    senha: '123'
  };

  beforeAll(async () => {
    await request(app)
      .post('/api/usuarios')
      .send(usuario);
  });

  it('Deve autenticar o usuário e retornar um token JWT', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: usuario.email,
        senha: usuario.senha
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  it('Deve retornar erro ao usar senha incorreta', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: usuario.email,
        senha: 'senhaErrada'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('erro', 'Credenciais inválidas');
  });

  it('Deve retornar erro ao usar e-mail inexistente', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'naoexiste@example.com',
        senha: '123'
      });

    expect(res.statusCode).toBe(401);
  });
});
