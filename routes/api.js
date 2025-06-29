
const express = require('express');
const multer = require('multer');
const app = express();
const jwt = require('jsonwebtoken');
const path = require('path');

app.use(express.json());

const segredo = 'Manseira';

// Banco fake
let usuarios = [];
let cursos = [];
let comentarios = [];
let certificados = [];
let progresso = [];
let licoes = [];




// upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/capas');
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

// middleware autenticação
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Sem Token' });

  jwt.verify(token, segredo, (err, usuario) => {
    if (err) return res.status(403).json({ erro: 'Token inválido' });
    req.usuario = usuario;
    next();
  });
}


// /api

// Criar usuário
app.post('/api/usuarios', (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }
  const id = usuarios.length + 1;
  usuarios.push({ id, nome, email, senha });
  res.status(201).json({ id, email });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  const user = usuarios.find(u => u.email === email && u.senha === senha);
  if (!user) return res.status(401).json({ erro: 'Credenciais inválidas' });

  const token = jwt.sign({ id: user.id }, segredo, { expiresIn: '1h' });
  res.json({ token });
});

// Criar curso
app.post('/api/cursos', /*autenticarToken,*/ upload.single('capa'), (req, res) => {
  const { nome, descricao, categoria } = req.body;
  const capa = req.file ? `/uploads/capas/${req.file.filename}` : null;

  if (!nome || !descricao || !categoria) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  const novoCurso = {
    id: cursos.length + 1,
    nome,
    descricao,
    categoria,
    capa
  };

  cursos.push(novoCurso);
  res.status(201).json(novoCurso);
});

// Mostrar cursos
app.get('/api/cursos', (req, res) => {
  res.json(cursos);
});

// Escolher curso(informações)
app.get('/api/cursos/:id', (req, res) => {
  const curso = cursos.find(c => c.id == req.params.id);
  if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
  res.json(curso);
});

// Atualizar curso
app.put('/api/cursos/:id', autenticarToken, (req, res) => {
  const curso = cursos.find(c => c.id == req.params.id);
  if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });
  Object.assign(curso, req.body);
  res.json(curso);
});

// Excluir curso
app.delete('/api/cursos/:id', autenticarToken, (req, res) => {
  const index = cursos.findIndex(c => c.id == req.params.id);
  if (index === -1) return res.status(404).json({ erro: 'Curso não encontrado' });
  cursos.splice(index, 1);
  res.json({ mensagem: 'Curso excluído' });
});

// licoes

app.post('/api/licoes', (req, res) => {
  const { cursoId, titulo, conteudo } = req.body;
  const curso = cursos.find(c => c.id == cursoId);

  if (!curso) {
    return res.status(404).json({ erro: 'Curso não encontrado' });
  }

  if (!titulo || !conteudo) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  const novaLicao = {
    id: licoes.length + 1,
    cursoId,
    titulo,
    conteudo
  };

  licoes.push(novaLicao);
  res.status(201).json(novaLicao);
});

app.get('/api/cursos/:id/licoes', (req, res) => {
  const cursoId = parseInt(req.params.id);
  const lista = licoes.filter(l => l.cursoId === cursoId);
  res.json(lista);
});

// Marcar licao concluida
app.post('/api/progresso', autenticarToken, (req, res) => {
  const { cursoId, licaoId } = req.body;

  if (!Number.isInteger(cursoId) || !Number.isInteger(licaoId)) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  const jaConcluido = progresso.find(p =>
    p.usuarioId === req.usuario.id &&
    p.cursoId === cursoId &&
    p.licaoId === licaoId
  );

  if (jaConcluido) {
    return res.status(200).json({ mensagem: 'Lição já marcada como concluída' });
  }

  progresso.push({ usuarioId: req.usuario.id, cursoId, licaoId });
  res.status(201).json({ mensagem: 'Progresso registrado' });
});

// progresso de um usuario
app.get('/api/usuarios/:id/progresso', autenticarToken, (req, res) => {
  const dados = progresso.filter(p => p.usuarioId == req.params.id);
  res.json(dados);
});



// Adicionar comentário
app.post('/api/comentarios', autenticarToken, (req, res) => {
  const { cursoId, texto, nota } = req.body;

  if (
    typeof cursoId !== 'number' ||
    typeof nota !== 'number' ||
    typeof texto !== 'string' ||
    texto.trim() === ''
  ) {
    return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
  }

  const comentario = {
    id: comentarios.length + 1,
    usuarioId: req.usuario.id,
    cursoId,
    texto,
    nota
  };

  comentarios.push(comentario);
  res.status(201).json(comentario);
});


// Obter progresso
app.get('/api/usuarios/:id/progresso', autenticarToken, (req, res) => {
  const dados = progresso.filter(p => p.usuarioId == req.params.id);
  res.json(dados);
});

// Gerar certificado (mockado)
app.get('/api/certificados/:id', autenticarToken, (req, res) => {
  const curso = cursos.find(c => c.id == req.params.id);
  if (!curso) return res.status(404).json({ erro: 'Curso não encontrado' });

  certificados.push({ usuarioId: req.usuario.id, cursoId: curso.id });

  res.json({
    mensagem: 'Certificado gerado',
    curso: curso.nome,
    link: `/certificados/${curso.id}.pdf`
  });
});



module.exports = app;
