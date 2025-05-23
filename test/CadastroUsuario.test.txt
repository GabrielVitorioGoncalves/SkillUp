const banco = require('../banco');

describe('Teste da função cadastrarUsuario', () => {
  const usu = {
    usuario: "be",
    email: "nca@gmail.com",
    senha: "benca"
  };

  beforeAll(async () => {
    // Limpa o usuário antes do teste, se já existir
    await banco.removerUsuarioPorEmail(usu.email); // você precisa implementar isso no banco.js
  });

  test('CT001 - Deve cadastrar um usuário com sucesso', async () => {
    await expect(
      banco.cadastrarUsuario(usu.usuario, usu.email, usu.senha)
    ).resolves.toBeUndefined();

    const usuario = await banco.buscarUsuario(usu);
    expect(usuario).toBeDefined();
    expect(usuario.usu_nome).toBe(usu.usuario);
    expect(usuario.usu_email).toBe(usu.email);
  });
//so falta criar a funcao do email existente
  test('CT002 - Não deve cadastrar um usuário com e-mail já existente', async () => {
    await expect(
      banco.cadastrarUsuario(usu.usuario, usu.email, usu.senha)
    ).rejects.toThrow('Usuário já existe'); // ou a mensagem que você lançar no código
  });
});
