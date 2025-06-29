const request = require('supertest');
const path = require('path');
const app = require('../routes/api'); 

describe('IT-002 - Criar curso com upload de imagem de capa', () => {
  it('Deve criar um curso', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', 'JavaScript')
      .field('descricao', 'Curso de JavaScript')
      .field('categoria', 'Programacao')
      .attach('capa', path.resolve(__dirname, 'imgTeste.jpg'));

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('capa');
    expect(res.body.capa).toMatch(/\/uploads\/capas\/.*\.(jpg|png)/);
  });
});
