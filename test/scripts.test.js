const banco = require('../banco');

describe('Rota - /login', () => {
    test('Usuario existe', async () => {
        const usu = { email: 'teste@teste', senha: 'teste' };
        const resultado = await banco.buscarUsuario(usu);

        expect(resultado.usu_email).toEqual(usu.email);
        expect(resultado.usu_senha).toEqual(usu.senha)
    });
    test('Usuario nao existe', async () => {
        const usu = { email: 'sla@sla', senha: '123' };
        const resultado = await banco.buscarUsuario(usu);

        expect(resultado).toEqual({});
    });

});
