const request = require('supertest');
const app = require('../routes/api'); 

describe('API-003 - Listar cursos (GET /api/cursos)', () => {
  it('Deve retornar um array com os cursos cadastrados', async () => {
    const curso = {
      nome: 'Java',
      descricao: 'Curso de Java',
      categoria: 'Programacao'
    };

    await request(app)
      .post('/api/cursos')
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', 'test/imgTeste.jpg');

    const res = await request(app).get('/api/cursos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('nome');
    expect(res.body[0]).toHaveProperty('descricao');
    expect(res.body[0]).toHaveProperty('categoria');
    expect(res.body[0]).toHaveProperty('capa');
  });
});
