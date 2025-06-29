const request = require('supertest');
const app = require('../routes/api'); 

describe('API-001 - Criar novo usuário (POST /api/usuarios)', () => {
  const novoUsuario = {
    nome: 'Teste',
    email: 'Teste@teste',
    senha: '123'
  };

  it('Deve criar um novo usuário com sucesso', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send(novoUsuario);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(novoUsuario.email);
  });

  it('Deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({ email: 'semnome@example.com', senha: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });
});
