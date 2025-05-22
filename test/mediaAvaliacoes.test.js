
describe('calcularMediaAvaliacoes', () => {
  it('deve retornar 0 se não houver avaliações', () => {
    const resultado = calcularMediaAvaliacoes([]);
    expect(resultado).toBe(0);
  });

  it('deve calcular corretamente a média de avaliações inteiras', () => {
    const resultado = calcularMediaAvaliacoes([5, 4, 3, 4, 5]);
    expect(resultado).toBe(4.2); // (5+4+3+4+5) / 5 = 21/5 = 4.2
  });
  });