const mysql = require('mysql2/promise');

//Vamos la Primeira coisa de tudo e criar a conexão com o banco de Dados

async function conectarBD(){
    
    if(global.connection && global.connection.state !== 'disconnected'){

        return global.connection;
    }

  // caso nao exista a conexão vamo criar ela aqui
  const conexao = await mysql.createConnection(
    {
        host : 'localhost',
        port : 3306,
        user : 'root',
        password : '',
        database : 'skillUp'
    }
  );

  //Guardar a nova conexão no objeto global
  global.connection = conexao;

  //retorna a conexao criada 
  return global.connection;
}

async function buscarUsuario(usuario) {
  const conex = await conectarBD();

  const sql = "select * from usuarios where usu_email=? and usu_senha=?";

  const [usuarioEncontrado] = await conex.query(sql, [usuario.email, usuario.senha]);

  if (usuarioEncontrado && usuarioEncontrado.length > 0) { //tamanho maior q 0
      return usuarioEncontrado[0]; //elemento 0
  } else {
      return {};
  }
}

async function verificarUsuarioExistente(usuario,email) 
{
  const conex = await conectarBD();

  const sql = "select * from usuarios where usu_nome=? or usu_email=?;"

  const[usuarios] = await conex.query(sql,[usuario, email]);

  //retorna true caso "usuarios" tenha algum registro
  //ou False caso não tenha qualquer registro
  return Array.isArray(usuarios) && usuarios.length > 0;
}

async function cadastrarUsuario(usuario,email,senha)
{
  const conex = await conectarBD();
  // const hashSenha = await bcrypt.hash(senha,10);
  const sql =  "insert into usuarios(usu_nome, usu_email, usu_senha) values(?,?,?);";

  await conex.query(sql,[usuario,email,senha])
}


/**
 * 
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


conectarBD();

module.exports = {buscarUsuario, buscarAdmin, verificarUsuarioExistente, cadastrarUsuario}