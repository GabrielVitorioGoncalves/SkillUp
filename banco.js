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


conectarBD();

module.exports = {}