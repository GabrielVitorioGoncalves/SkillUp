
const banco = require('../banco')
const index = require('../routes/index')

/*
 * Cada Aula vai ser Equivalente a 10%
 * ./progressService e um serviço do node.js
 * É uma barra de progesso com valor no javascript
 */

const { atualizarProgresso } = require('./progressService');

describe('atualizarProgresso', () => {
  it('deve incrementar o progresso corretamente com base nas aulas assistidas', () => {
    const progressoAtual= 20; 
    const totalAulas = 10;
    const aulasAssistidas = 2; 

    const resultado = atualizarProgresso(progressoAtual, totalAulas, aulasAssistidas);
    expect(resultado).toBe(40);
  });

  it('deve limitar o progresso a no máximo 100%', () => {
    const progressoAtual = 95;
    const totalAulas = 10;
    const aulasAssistidas = 1;

    const resultado = atualizarProgresso(progressoAtual, totalAulas, aulasAssistidas);
    expect(resultado).toBe(100);
  });

  it('deve calcular corretamente com valores quebrados', () => {
    const progressoAtual = 0;
    const totalAulas = 3;
    const aulasAssistidas = 1;

    const resultado = atualizarProgresso(progressoAtual, totalAulas, aulasAssistidas);
    expect(resultado).toBeCloseTo(33.33, 1);
  });
});
