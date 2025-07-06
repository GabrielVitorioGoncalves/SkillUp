const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');



async function conectarBD() {

    if (global.connection && global.connection.state !== 'disconnected') {
        return global.connection;
    }

    const conexao = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'skillUp',
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

async function verificarUsuarioExistente(usuario, email) {
    const conex = await conectarBD();
    const sql = "select * from usuarios where usu_nome=? or usu_email=?";
    const [usuarios] = await conex.query(sql, [usuario, email]);
    return Array.isArray(usuarios) && usuarios.length > 0;
}

async function cadastrarUsuario(usuario, email, senha) {
    const conex = await conectarBD();
    const sql = "insert into usuarios(usu_nome, usu_email, usu_senha) values(?,?,?);";
    await conex.query(sql, [usuario, email, senha])
}

/**
 * Rotas para o Admin
 */

async function buscarAdmin(admin) {
    const conex = await conectarBD();
    const sql = "select * from admin where adm_email=? and adm_senha=?";
    const [admEncontrado] = await conex.query(sql, [admin.email, admin.senha]);
    if (admEncontrado && admEncontrado.length > 0) {
        return admEncontrado[0];
    } else {
        return {};
    }
};

async function buscarTodosAdmins() {
    const conexao = await conectarBD();
    const [rows] = await conexao.query('SELECT id_admin, adm_email FROM admin');
    return rows;
}



async function verificarAdmExistente(usuario, email) {
    const conex = await conectarBD();
    const sql = "select * from admin where adm_email=? and adm_senha=?;"
    const [adm] = await conex.query(sql, [usuario, email]);
    return Array.isArray(adm) && adm.length > 0;

}

async function cadastrarAdmin(usuario, email, senha) {
    const conex = await conectarBD();
    const sql = "insert into admin(adm_nome,adm_email,adm_senha) values (?,?,?);"
    await conex.query(sql, [usuario, email, senha]);
}

async function excluirAdmin(id_admin) {
    const conexao = await conectarBD(); // Função que conecta ao BD
    try {
        // Query para excluir admin pelo id
        await conexao.query('delete from admin where id_admin = ?', [id_admin]);
    } catch (err) {
        throw err;
    }
}


async function atualizarAdmin(id, nome, email) {
    const conexao = await conectarBD();
    await conexao.query('UPDATE admin SET adm_nome = ?, adm_email = ? where id_admin = ?', [nome, email, id]);
}

async function buscarAdminPorId(id) {
    const conexao = await conectarBD();
    const [linhas] = await conexao.query(
        'SELECT * FROM admin where id_admin = ?',
        [id]
    );
    return linhas[0];
}


/**
 * Funções para Cursos
 */

async function cadastrarCurso(titulo, descricao, categoria, capa) {
    const conexao = await conectarBD();
    const sql = 'INSERT INTO cursos (cur_titulo, cur_descricao, cur_categoria, capa) VALUES (?, ?, ?, ?)';
    await conexao.query(sql, [titulo, descricao, categoria, capa]);
}

async function admExcluirCategoria(id_tema) {
    const conex = await conectarBD();
    const sql = "delete from temas where id_tema=?";
    await conex.query(sql, [id_tema])
}

async function admAtualizarCategoria(cat_nome, id_tema) {
    const conex = await conectarBD();
    const sql = `update temas set cat_nome=? where id_tema=?`;
    await conex.query(sql, [cat_nome, id_tema]);
}

async function admBuscarCategoriaPorCodigo(codigo) {
    const conex = await conectarBD();
    const sql = "select * from temas where id_tema=?;";
    const [categorias] = await conex.query(sql, [codigo]);
    return categorias[0] || null;
}
async function admInserirCategoria(nome) {
    const conex = await conectarBD();
    const sql = "insert into temas (cat_nome) values (?);";
    await conex.query(sql, [nome])
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
    const [categoria] = await conex.query(sql, [nome]);
    return categoria.length > 0;
}

/**
 * Pagina Cursos
 */
async function buscarCategoriasDeCursos() {
    const conex = await conectarBD();
    const sql = "SELECT DISTINCT cur_categoria FROM cursos where cur_categoria IS NOT NULL AND cur_categoria <> '' ORDER BY cur_categoria ASC;";
    const [categorias] = await conex.query(sql);
    return categorias;
}

async function buscarCursosMaisAvaliados() {
    const conex = await conectarBD();
    const sql = "SELECT * FROM cursos ORDER BY cur_nota DESC LIMIT 10"; // Usando a coluna cur_nota que já existe
    const [cursos] = await conex.query(sql);
    return cursos;
}

async function buscarTodosOsCursos() {
    const conex = await conectarBD();
    const sql = "SELECT * FROM cursos ORDER BY cur_titulo ASC";
    const [cursos] = await conex.query(sql);
    return cursos;
}
async function buscarCursosRecentes() {
    const conex = await conectarBD();
    const sql = "SELECT * FROM cursos ORDER BY id_curso DESC LIMIT 10"; // Usando a chave primária id_curso
    const [cursos] = await conex.query(sql);
    return cursos;
}

async function buscarVideoPorId(idVideo) {
    const conex = await conectarBD();
    const sql = "select * from videos where id_video = ? limit 1;";
    const [[video]] = await conex.query(sql, [idVideo]);
    return video;
}
async function buscarPlaylistDoCurso(idCurso) {
    const conex = await conectarBD();
    const sql = `select v.id_video, v.vid_titulo
                from videos as v inner join 
                curso_video as cv on v.id_video = cv.id_video
                where cv.id_curso = ?
                order by cv.ordem ASC;`
    const [videos] = await conex.query(sql, [idCurso]);
    return videos;
}

async function marcarVideoComoVisto(idUsuario, idVideo) {
    const conex = await conectarBD();
    const sql = `
        INSERT INTO historico (id_usuario, id_video, his_concluido, his_dataHora) 
        VALUES (?, ?, 1, NOW()) 
        ON DUPLICATE KEY UPDATE his_concluido = 1, his_dataHora = NOW();
    `
    await conex.query(sql, [idUsuario, idVideo]);
}

async function contarVideosDoCurso(idCurso) {
    const conex = await conectarBD();
    const sql = "select count(*) as total from curso_video where id_curso = ?;"
    const [[{ total }]] = await conex.query(sql, [idCurso]);
    return total;
}

async function contarVideosVistosDoCurso(idUsuario, idCurso) {
    const conex = await conectarBD();
    const sql = `select count(*) as vistos from historico h 
    inner join curso_video cv on h.id_video = cv.id_video 
    where h.id_usuario = ? and cv.id_curso = ? and h.his_concluido = 1;`
    const [[{ vistos }]] = await conex.query(sql, [idUsuario, idCurso]);
    return vistos;
}

async function buscarPrimeiroVideo(idCurso) {
    const conex = await conectarBD();
    const sql = `select id_video from curso_video 
                where id_curso = ? 
                order by  ordem asc 
                limit 1;`;
    const [[primeiroVideo]] = await conex.query(sql, [idCurso]);
    return primeiroVideo;
}

async function atualizarCurso(id, titulo, descricao, categoria, capa) {
    const conex = await conectarBD();
    const sql = `update cursos set cur_titulo = ?, cur_descricao = ?, cur_categoria = ?, capa = ? where id_curso = ?`;

    await conex.query(sql, [titulo, descricao, categoria, capa, id]);
}

async function buscarCursoPorId(idCurso) {
    const conex = await conectarBD();
    const sql = "select * from cursos where id_curso = ? limit 1;";
    const [[curso]] = await conex.query(sql, [idCurso]);
    return curso;
}

//MEIA HORA PROCURANDO ISSO, MAIS MEIA HORA PROCURANDO O ERRO DO SQL!!!!!!!
async function excluirVideo(idVideo) {
    const conex = await conectarBD();
    await conex.beginTransaction();
    try {
        const video = await buscarVideoPorId(idVideo);
        const nomeArquivo = video ? video.caminho_do_arquivo : null;

        await conex.query('delete from curso_video where id_video = ?', [idVideo]);

        await conex.query('delete from videos where id_video = ?', [idVideo]);

        if (nomeArquivo) {
            const caminhoArquivo = path.join(__dirname, '../public/uploads/videos', nomeArquivo);
            if (fs.existsSync(caminhoArquivo)) {
                fs.unlinkSync(caminhoArquivo);
            }
        }

        await conex.commit();
        return true;
    } catch (error) {
        await conex.rollback();
        console.error("Erro ao excluir vídeo:", error);
        throw error;
    }
}

async function adicionarVideoAoCurso(idCurso, tituloVideo, caminhoArquivo) {
    const conex = await conectarBD();
    // Isso aqui e uma transação, serve so pra garantir que tudo funciona ou (se der errado) nada funfa
    await conex.beginTransaction();

    try {
        const sqlOrdem = "select count(*) as total from curso_video where id_curso = ?;";
        const [[{ total }]] = await conex.query(sqlOrdem, [idCurso]);
        const proximaOrdem = total + 1;
        const sqlVideo = 'insert into videos (vid_titulo, caminho_do_arquivo) values (?, ?)';
        const [videoResult] = await conex.query(sqlVideo, [tituloVideo, caminhoArquivo]);
        const novoVideoId = videoResult.insertId;
        const sqlCursoVideo = 'insert into curso_video (id_curso, id_video, ordem) values (?, ?, ?)';

        await conex.query(sqlCursoVideo, [idCurso, novoVideoId, proximaOrdem]);
        await conex.commit();

    } catch (error) {
        // Se falha alguma coisa isso desfaz as alterções (tive que perder pra aprende isso aqui kkkkkk)
        await conex.rollback();
        console.error("Erro na transação ao adicionar vídeo:", error);
        throw error;
    }
}

async function buscarVideoComCursoId(idVideo) {
    const conex = await conectarBD();
    const sql = `select v.*, cv.id_curso from videos v join curso_video cv on v.id_video = cv.id_video  where v.id_video = ? limit 1;`;
    const [[video]] = await conex.query(sql, [idVideo]);
    return video;
}


async function buscarUsuarioPorId(id) {
    const conexao = await conectarBD();
    const [linhas] = await conexao.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
    return linhas[0];
}


async function alterarVideo(idVideo, novoTitulo, nomeNovoArquivo) {
    const conex = await conectarBD();
    if (nomeNovoArquivo) {

        const videoAntigo = await buscarVideoPorId(idVideo);
        const arquivoAntigo = videoAntigo ? videoAntigo.caminho_do_arquivo : null;

        if (arquivoAntigo) {
            const caminhoArquivo = path.join(__dirname, '../public/uploads/videos', arquivoAntigo);
            if (fs.existsSync(caminhoArquivo)) {
                fs.unlinkSync(caminhoArquivo);
            }
        }
        const sql = "update videos set vid_titulo = ?, caminho_do_arquivo = ? where id_video = ?";
        await conex.query(sql, [novoTitulo, nomeNovoArquivo, idVideo]);
    } else {
        const sql = "update videos set vid_titulo = ? where  id_video = ?";
        await conex.query(sql, [novoTitulo, idVideo]);
    }
}

async function salvarAvaliacao(idUsuario, idVideo, nota) {
    const conex = await conectarBD();
    const sql = "insert into avaliacao (id_usuario, id_video, ava_nota, ava_dataHora) values (?, ?, ?, NOW()) on duplicate key update ava_nota = ?, ava_dataHora = now(); ";
    await conex.query(sql, [idUsuario, idVideo, nota, nota]);
}

async function excluirTudo(idCurso) {
    const conex = await conectarBD();
    await conex.beginTransaction();

    try {
        const cursoParaExcluir = await buscarCursoPorId(idCurso);
        const videosParaExcluir = await buscarPlaylistDoCurso(idCurso);

        await conex.query('delete from curso_categoria where id_curso = ?', [idCurso]);
        await conex.query('delete from curso_video where id_curso = ?', [idCurso]);

        if (videosParaExcluir.length > 0) {
            const idsDosVideos = videosParaExcluir.map(v => v.id_video);
            await conex.query('delete from avaliacao where id_video in (?)', [idsDosVideos]);
            await conex.query('delete from historico where id_video in (?)', [idsDosVideos]);
            await conex.query('delete from videos where id_video in (?)', [idsDosVideos]);
        }

        await conex.query('delete from cursos where id_curso = ?', [idCurso]);

        if (cursoParaExcluir && cursoParaExcluir.capa) {
            const caminhoCapa = path.join(__dirname, '../public/uploads/capas', cursoParaExcluir.capa);
            if (fs.existsSync(caminhoCapa)) {
                fs.unlinkSync(caminhoCapa);
            }
        }

        for (const video of videosParaExcluir) {
            if (video.caminho_do_arquivo) {
                const caminhoVideo = path.join(__dirname, '../public/uploads/videos', video.caminho_do_arquivo);
                if (fs.existsSync(caminhoVideo)) {
                    fs.unlinkSync(caminhoVideo);
                }
            }
        }

        await conex.commit();
    } catch (error) {
        await conex.rollback();
        throw error;
    }
}

async function buscarTodosCursosComProgresso(idUsuario) {
    const conex = await conectarBD();
    const sql = ` select c.*,count(distinct cv.id_video) as total_videos,count(distinct  h.id_video) as videos_vistos, avg(av.ava_nota) as nota_media from cursos c
        left join curso_video cv on c.id_curso = cv.id_curso 
        left join historico h on cv.id_video = h.id_video and h.id_usuario = ? and h.his_concluido = 1 left join avaliacao av on cv.id_video = av.id_video group by c.id_curso order by c.cur_titulo ASC;`;
    const [cursos] = await conex.query(sql, [idUsuario]);
    return cursos;
}


module.exports = {
    conectarBD, buscarUsuario,
    buscarAdmin, verificarUsuarioExistente,
    cadastrarUsuario, verificarAdmExistente,
    cadastrarAdmin, admExcluirCategoria,
    admAtualizarCategoria, admBuscarCategoriaPorCodigo,
    admInserirCategoria, admBuscarCategoria,
    admBuscarCategorias, buscarTodosAdmins, excluirAdmin, atualizarAdmin, buscarAdminPorId,
    cadastrarCurso, buscarCategoriasDeCursos, buscarCursosMaisAvaliados, buscarTodosOsCursos, buscarCursosRecentes, buscarVideoPorId, buscarPlaylistDoCurso, marcarVideoComoVisto, contarVideosDoCurso, contarVideosVistosDoCurso, buscarPrimeiroVideo, atualizarCurso, buscarCursoPorId, excluirVideo, adicionarVideoAoCurso, buscarVideoComCursoId, alterarVideo, excluirTudo, buscarUsuarioPorId, buscarTodosCursosComProgresso, salvarAvaliacao
}