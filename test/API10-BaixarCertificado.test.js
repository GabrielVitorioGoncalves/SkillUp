const request = require('supertest');
const app = require('../routes/api'); 
const path = require('path');

describe('API-010 - Baixar certificado de curso (GET /api/certificados/:id)', () => {
  let token;
  let cursoId;

  const usuario = {
    nome: 'Usuário Certificado',
    email: 'certuser@example.com',
    senha: '123456'
  };

  const curso = {
    nome: 'Curso de Java',
    descricao: 'Aprenda Java do zero',
    categoria: 'Programação'
  };

  it('Deve criar usuário e fazer login', async () => {
    await request(app).post('/api/usuarios').send(usuario);

    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;
  });

  it('Deve criar um curso', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .set('Authorization', `Bearer ${token}`)
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', path.resolve(__dirname, 'imgTeste.jpg'));

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve gerar e retornar link para o certificado', async () => {
    const res = await request(app)
      .get(`/api/certificados/${cursoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensagem', 'Certificado gerado');
    expect(res.body).toHaveProperty('curso', curso.nome);
    expect(res.body).toHaveProperty('link');
    expect(res.body.link).toMatch(/\.pdf$/);
  });

  it('Deve retornar erro para curso inexistente', async () => {
    const res = await request(app)
      .get(`/api/certificados/9999`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro', 'Curso não encontrado');
  });
});
