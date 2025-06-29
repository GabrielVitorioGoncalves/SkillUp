const request = require('supertest');
const app = require('../routes/api'); 

describe('IT-003 - Associar lições a um curso', () => {
  let cursoId;

  const curso = {
    nome: 'JavaScript',
    descricao: 'Curso de JavaScript',
    categoria: 'Programação'
  };

  const licao = {
    titulo: 'Lição 1 - Introdução',
    conteudo: 'Conteúdo da introdução'
  };

  it('Deve criar um novo curso', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', 'test/imgTeste.jpg');

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve adicionar uma lição ao curso criado', async () => {
    const res = await request(app)
      .post('/api/licoes')
      .send({
        cursoId,
        titulo: licao.titulo,
        conteudo: licao.conteudo
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.cursoId).toBe(cursoId);
  });

  it('Deve listar as lições do curso e conter a lição criada', async () => {
    const res = await request(app).get(`/api/cursos/${cursoId}/licoes`);
    expect(res.statusCode).toBe(200);
    const encontrada = res.body.find(l => l.titulo === licao.titulo);
    expect(encontrada).toBeDefined();
  });
});
