const request = require('supertest');
const app = require('../routes/api'); 
const path = require('path');

describe('API-008 - Comentar e avaliar curso (POST /api/comentarios)', () => {
  let token;
  let cursoId;

  const usuario = {
    nome: 'Comentador',
    email: 'comentador@example.com',
    senha: '123456'
  };

  const curso = {
    nome: 'Curso Avaliado',
    descricao: 'Curso para testes de avaliação',
    categoria: 'Feedback'
  };

  const comentario = {
    texto: 'Curso excelente!',
    nota: 5
  };

  it('Deve criar usuário e fazer login', async () => {
    await request(app).post('/api/usuarios').send(usuario);

    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;
  });

  it('Deve criar um curso para ser avaliado', async () => {
    const res = await request(app)
      .post('/api/cursos')
      .field('nome', curso.nome)
      .field('descricao', curso.descricao)
      .field('categoria', curso.categoria)
      .attach('capa', path.resolve(__dirname, 'imgTeste.jpg'));

    expect(res.statusCode).toBe(201);
    cursoId = res.body.id;
  });

  it('Deve adicionar um comentário e nota ao curso', async () => {
    const res = await request(app)
      .post('/api/comentarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cursoId,
        texto: comentario.texto,
        nota: comentario.nota
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.texto).toBe(comentario.texto);
    expect(res.body.nota).toBe(comentario.nota);
    expect(res.body.cursoId).toBe(cursoId);
  });

  it('Deve retornar erro se faltar texto ou nota', async () => {
    const res = await request(app)
      .post('/api/comentarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cursoId,
        nota: 4
      });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('erro', 'Campos obrigatórios ausentes');
  });
});
