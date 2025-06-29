const request = require('supertest');
const app = require('../routes/api'); 
const path = require('path');

describe('API-005 - Detalhar curso (GET /api/cursos/:id)', () => {
  let cursoId;

  const curso = {
    nome: 'Curso Detalhado',
    descricao: 'Curso para detalhamento',
    categoria: 'Análise'
  };

  it('Deve criar um curso para detalhamento', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', path.resolve(__dirname, 'imgTeste.jpg'));

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve retornar os detalhes do curso pelo ID', async () => {
    const res = await request(app).get(`/api/cursos/${cursoId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', cursoId);
    expect(res.body).toHaveProperty('nome', curso.nome);
    expect(res.body).toHaveProperty('descricao', curso.descricao);
    expect(res.body).toHaveProperty('categoria', curso.categoria);
    expect(res.body).toHaveProperty('capa');
  });

  it('Deve retornar 404 se o curso não existir', async () => {
    const res = await request(app).get('/api/cursos/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro', 'Curso não encontrado');
  });
});
