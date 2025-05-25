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

async function verificarAdmExistente(usuario,email){
    const conex = await conectarBD();
    const sql = "select * from admin where adm_email=? and adm_senha=?;"
    const[adm] = await conex.query(sql,[usuario,email]);
    return Array.isArray(adm) && adm.length > 0;

}

async function cadastrarAdmin(usuario, email, senha){
    const conex = await conectarBD();
    const sql = "insert into admin(adm_nome=?,adm_email=?,adm_senha=?) values (?,?,?);"
    await conex.query(sql,[usuario,email,senha]);
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

module.exports = {conectarBD, buscarUsuario, buscarAdmin, verificarUsuarioExistente, cadastrarUsuario, buscarNotasPorCurso, calcularMediaDoCurso, verificarAdmExistente, cadastrarAdmin}