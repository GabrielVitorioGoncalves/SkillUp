
const banco = require('../banco')
const index = require('../routes/index')

describe('Função verificar Login Usuario', () => {
    test('Usuario Logado', async () => {
        const usuario = {email: 'teste@teste'};
        const test = await index.verificarLogin(usuario)
    });
    test('Usuario nao esta Logad', async () => {

    });

});
