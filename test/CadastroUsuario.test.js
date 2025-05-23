describe('Teste com o cadastro', () => {
    const usuario = {
        user: "VictoryGrey",
        email: "victory@gmail.com",
        senha: "Vic123"};
    test('fazer cadastro', async () => {
        await expect(cadastrarUsuario(usuario.user, usuario.email, usuario.senha)).resolves.toBeUndefined();
    });
    test('Usuario criado com sucesso', async () => {
        const usuarioCadastrado = await buscarUsuario(usuario);
        expect(usuarioCadastrado).toBeDefined();
        expect(usuarioCadastrado.usu_nomeusuario).toBe(usuario.user);
        expect(usuarioCadastrado.usu_email).toBe(usuario.email);
    });
});