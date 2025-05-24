const banco = require('../banco');

describe('calcularMediaAvaliacoes', () => {
  it('deve retornar null se não houver avaliações', () => {
    const resultado = banco.calcularMediaDoCurso([]);
    expect(resultado).toBe(null);
  });

  it('deve calcular corretamente a média de avaliações inteiras', () => {
    const resultado = banco.calcularMediaDoCurso([5, 4, 3, 4, 5]);
    expect(resultado).toBe(4.2); // (5+4+3+4+5) / 5 = 4.2
  });

  it('deve calcular médias com notas decimais', () => {
    const resultado = banco.calcularMediaDoCurso([4.5, 3.5, 5]);
    expect(resultado).toBe(4.3); // (4.5+3.5+5)/3 = 13/3 = 4.333... arredonda p/ 4.3
  });
});
