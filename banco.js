const mysql = require('mysql2/promise');

async function conectarBD(){
    
    if(global.connection && global.connection.state !== 'disconnected'){
        return global.connection;
    }

    const conexao = await mysql.createConnection({
        host : 'localhost',
        port : 3306,
        user : 'root',
        password : '',
        database : 'skillUp',
        charset: 'utf8mb4'
    });

    global.connection = conexao;
    return global.connection;
}

async function buscarUsuario(usuario) {
    const conex = await conectarBD();
    const sql = "select * from usuarios where usu_email=? and usu_senha=?";
    const [usuarioEncontrado] = await conex.query(sql, [usuario.email, usuario.senha]);
    if (usuarioEncontrado && usuarioEncontrado.length > 0) {
        return usuarioEncontrado[0];
    } else {
        return {};
    }
}

async function verificarUsuarioExistente(usuario,email) {
    const conex = await conectarBD();
    const sql = "select * from usuarios where usu_nome=? or usu_email=?";
    const [usuarios] = await conex.query(sql,[usuario, email]);
    return Array.isArray(usuarios) && usuarios.length > 0;
}

async function cadastrarUsuario(usuario,email,senha) {
    const conex = await conectarBD();
    const sql =  "insert into usuarios(usu_nome, usu_email, usu_senha) values(?,?,?);";
    await conex.query(sql,[usuario,email,senha])
}

/**
 * Rotas para o Admin
 */

async function buscarAdmin(admin){
    const conex = await conectarBD();
    const sql= "select * from admin where adm_email=? and adm_senha=?";
    const [admEncontrado] = await conex.query(sql, [admin.email, admin.senha]);
    if(admEncontrado && admEncontrado.length > 0){
        return admEncontrado[0];
    }else{
        return {};
    }
};

async function buscarTodosAdmins() {
    const conexao = await conectarBD();
    const [rows] = await conexao.query('SELECT id_admin, adm_email FROM admin');
    return rows;
  }  



async function verificarAdmExistente(usuario,email){
    const conex = await conectarBD();
    const sql = "select * from admin where adm_email=? and adm_senha=?;"
    const[adm] = await conex.query(sql,[usuario,email]);
    return Array.isArray(adm) && adm.length > 0;

}

async function cadastrarAdmin(usuario, email, senha){
    const conex = await conectarBD();
    const sql = "insert into admin(adm_nome,adm_email,adm_senha) values (?,?,?);"
    await conex.query(sql,[usuario,email,senha]);
}

async function excluirAdmin(id_admin) {
    const conexao = await conectarBD(); // Função que conecta ao BD
    try {
      // Query para excluir admin pelo id
      await conexao.query('DELETE FROM admin WHERE id_admin = ?', [id_admin]);
    } catch (err) {
        throw err;
      }
  }


async function atualizarAdmin(id, nome, email) {
  const conexao = await conectarBD();
  await conexao.query('UPDATE admin SET adm_nome = ?, adm_email = ? WHERE id_admin = ?', [nome, email, id]);
}

async function buscarAdminPorId(id) {
  const conexao = await conectarBD();
  const [linhas] = await conexao.query(
    'SELECT * FROM admin WHERE id_admin = ?',
    [id]
  );
  return linhas[0]; // retorna apenas um objeto (o admin)
}


/**
 * Funções para Cursos
 */

async function cadastrarCurso(titulo, descricao, categoria, capa) {
  const conexao = await conectarBD();
  const sql = 'INSERT INTO cursos (cur_titulo, cur_descricao, cur_categoria, capa) VALUES (?, ?, ?, ?)';
  await conexao.query(sql, [titulo, descricao, categoria, capa]);
}


/**
 * Funções para usar futuramente
 */

async function buscarNotasPorCurso(id_video) {
    const conex = await conectarBD();
    const [notas] = await conex.execute(
        "Select ava_nota from avaliacao where id_video=?",
        [id_video]
    );
    return notas;
}

function calcularMediaDoCurso(avaliacoes) {
    if (!avaliacoes || avaliacoes.length === 0) {
        return null;
    }
    const soma = avaliacoes.reduce((total, nota) => total + nota, 0);
    const media = soma / avaliacoes.length;
    return parseFloat(media.toFixed(1)); 
}
async function admExcluirCategoria(id_tema) {
    const conex =  await conectarBD();
    const sql = "delete from temas where id_tema=?";
    await conex.query(sql,[id_tema]) 
}

async function admAtualizarCategoria(cat_nome,id_tema) {
    const conex = await conectarBD();
    const sql = `update temas set cat_nome=? where id_tema=?`;
    await conex.query(sql,[cat_nome,id_tema]);
}

async function admBuscarCategoriaPorCodigo(codigo) { 
    const conex = await conectarBD();
    const sql =  "select * from temas where id_tema=?;";
    const [categorias] = await conex.query(sql,[codigo]);
    return categorias[0] || null; 
}
async function admInserirCategoria(nome) {
    const conex = await conectarBD();
    const sql = "insert into temas (cat_nome) values (?);";
    await conex.query(sql,[nome])
}

async function admBuscarCategorias() {
    const conex = await conectarBD();
    const sql = "Select * from temas order by cat_nome;";
    const [cate] = await conex.query(sql);
    return cate;
}

async function admBuscarCategoria(nome) {
    const conex = await conectarBD();
    const sql = "Select * from temas where cat_nome=? order by cat_nome;";
    const [categoria] = await conex.query(sql,[nome]);
    return categoria.length > 0;
}





module.exports = {
    conectarBD, buscarUsuario, 
    buscarAdmin, verificarUsuarioExistente, 
    cadastrarUsuario, buscarNotasPorCurso, 
    calcularMediaDoCurso, verificarAdmExistente, 
    cadastrarAdmin, admExcluirCategoria, 
    admAtualizarCategoria,admBuscarCategoriaPorCodigo,
    admInserirCategoria,admBuscarCategoria, 
    admBuscarCategorias, buscarTodosAdmins, excluirAdmin, atualizarAdmin, buscarAdminPorId,
    cadastrarCurso
}