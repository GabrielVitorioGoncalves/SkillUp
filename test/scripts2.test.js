
const banco = require('../banco')
const index = require('../routes/index')

describe('Função verificar Login Usuario', () => {
    test('Usuario Logado', async () => {
        const usuario = {email: 'teste@teste'};
        const test = await index.verificarLogin(usuario)

        expect(test).toBeTruthy(test)
    });
    // test('Usuario nao esta Logado', async () => {

    //     const usuario = {email: 'teste@teste'};
    //     const test = await index.verificarLogin(usuario)

    //     expect(test).toBeFalsy(test)

    // });

});
