const request = require('supertest');
const app = require('../routes/api'); 

describe('IT-001 - Cadastro e login de usuário', () => {
  const usuarioTeste = {
    nome: 'Teste',
    email: 'teste@teste',
    senha: '123'
  };

  it('Deve cadastrar um novo usuário com sucesso', async () => {
    const resposta = await request(app)
      .post('/api/usuarios')
      .send(usuarioTeste);

    expect(resposta.statusCode).toBe(201);
    expect(resposta.body).toHaveProperty('id');
    expect(resposta.body.email).toBe(usuarioTeste.email);
  });

  it('Deve autenticar o usuário e retornar um token', async () => {
    const resposta = await request(app)
      .post('/api/login')
      .send({
        email: usuarioTeste.email,
        senha: usuarioTeste.senha
      });

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body).toHaveProperty('token');
    expect(typeof resposta.body.token).toBe('string');
  });
});
