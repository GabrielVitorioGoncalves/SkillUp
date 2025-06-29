const request = require('supertest');
const app = require('../routes/api'); 
const path = require('path');

describe('API-007 - Excluir curso (DELETE /api/cursos/:id)', () => {
  let cursoId;
  let token;

  const usuario = {
    nome: 'Remocao Tester',
    email: 'remove@example.com',
    senha: '123456'
  };

  const curso = {
    nome: 'Curso a Remover',
    descricao: 'Curso temporário',
    categoria: 'Administração'
  };

  it('Deve criar um usuário e fazer login para obter token', async () => {
    await request(app).post('/api/usuarios').send(usuario);

    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;
  });

  it('Deve criar um curso para ser excluído', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', path.resolve(__dirname, 'imgTeste.jpg'));

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve excluir o curso criado', async () => {
    const res = await request(app)
      .delete(`/api/cursos/${cursoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensagem', 'Curso excluído');
  });

  it('Deve retornar erro ao tentar excluir curso inexistente', async () => {
    const res = await request(app)
      .delete('/api/cursos/99999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro', 'Curso não encontrado');
  });
});
