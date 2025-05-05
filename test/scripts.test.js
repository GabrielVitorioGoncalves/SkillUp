const banco = require('../banco');

describe('Rota - /login', () => {
    test('Usuario existe', async () => {
        const usu = { email: 'teste@teste', senha: 'teste' };
        const resutaldo = await banco.buscarUsuario(usu);

        expect(resutaldo.usu_email).toEqual(usu.email);
        expect(resutaldo.usu_senha).toEqual(usu.senha)
    });
    test('Usuario nao existe', async () => {
        const usu = { email: 'sla@sla', senha: '123' };
        const resutaldo = await banco.buscarUsuario(usu);

        expect(resutaldo).toEqual({});
    });

});
