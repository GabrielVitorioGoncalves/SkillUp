const request = require('supertest');
const app = require('../routes/api'); 

describe('API-004 - Detalhes de um curso (GET /api/cursos/:id)', () => {
  let cursoId;

  const curso = {
    nome: 'Java',
    descricao: 'Curso de Java',
    categoria: 'Programacao'
  };

  it('Deve criar um curso e armazenar o ID', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', 'test/imgTeste.jpg');

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve retornar os dados do curso criado pelo ID', async () => {
    const res = await request(app).get(`/api/cursos/${cursoId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', cursoId);
    expect(res.body).toHaveProperty('nome', curso.nome);
    expect(res.body).toHaveProperty('descricao', curso.descricao);
    expect(res.body).toHaveProperty('categoria', curso.categoria);
    expect(res.body).toHaveProperty('capa');
  });

  it('Deve retornar 404 para um curso inexistente', async () => {
    const res = await request(app).get('/api/cursos/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro', 'Curso não encontrado');
  });
});
