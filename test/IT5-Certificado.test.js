const request = require('supertest');
const app = require('../routes/api'); 
const path = require('path');

describe('IT-005 - Geração de certificado após conclusão do curso', () => {
  let token;
  let usuarioId;
  let cursoId;
  const licoes = [1, 2, 3]; 

  const usuario = {
    nome: 'Certificado User',
    email: 'certificado@example.com',
    senha: '123456'
  };

  const curso = {
    nome: 'Java',
    descricao: 'Curso de Java',
    categoria: 'Programacao'
  };

  it('Deve criar usuário e fazer login', async () => {
    await request(app).post('/api/usuarios').send(usuario);

    const resLogin = await request(app)
      .post('/api/login')
      .send({ email: usuario.email, senha: usuario.senha });

    expect(resLogin.statusCode).toBe(200);
    token = resLogin.body.token;

    // decodificar o ID do usuário a partir do token
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    usuarioId = payload.id;
  });

  it('Deve criar o curso', async () => {
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

  it('Deve marcar todas as lições como concluídas', async () => {
    for (const licaoId of licoes) {
      const res = await request(app)
        .post('/api/progresso')
        .set('Authorization', `Bearer ${token}`)
        .send({ cursoId, licaoId });

      expect(res.statusCode).toBe(201);
    }
  });

  it('Deve gerar o certificado com sucesso', async () => {
    const res = await request(app)
      .get(`/api/certificados/${cursoId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('mensagem');
    expect(res.body).toHaveProperty('link');
    expect(res.body.link).toMatch(/\.pdf$/);
  });
});

