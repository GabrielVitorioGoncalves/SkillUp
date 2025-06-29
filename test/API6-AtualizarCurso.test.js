const request = require('supertest');
const app = require('../routes/api'); 
const path = require('path');

describe('API-006 - Atualizar curso (PUT /api/cursos/:id)', () => {
  let cursoId;
  let token;

  const usuario = {
    nome: 'Teste',
    email: 'teste@teste',
    senha: '123'
  };

  const cursoOriginal = {
    nome: 'Java',
    descricao: 'Cursos Java',
    categoria: 'Programacao'
  };

  const atualizacao = {
    nome: 'Python',
    descricao: 'Curso Python',
    categoria: 'Programacao'
  };

  it('Deve criar um usuário e fazer login para obter token', async () => {
    await request(app)
      .post('/api/usuarios')
      .send(usuario);

    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;
    expect(token).toBeDefined();
  });

  it('Deve criar um curso para ser atualizado', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', cursoOriginal.nome)
      .field('descricao', cursoOriginal.descricao)
      .field('categoria', cursoOriginal.categoria)
      .attach('capa', path.resolve(__dirname, 'imgTeste.jpg'));

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve atualizar os dados do curso com token', async () => {
    const res = await request(app)
      .put(`/api/cursos/${cursoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(atualizacao);

    expect(res.statusCode).toBe(200);
    expect(res.body.nome).toBe(atualizacao.nome);
    expect(res.body.descricao).toBe(atualizacao.descricao);
    expect(res.body.categoria).toBe(atualizacao.categoria);
  });

  it('Deve retornar erro ao tentar atualizar um curso inexistente', async () => {
    const res = await request(app)
      .put('/api/cursos/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nome: 'Fake' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro', 'Curso não encontrado');
  });
});
