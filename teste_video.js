// Conteúdo para o arquivo: teste_video.js

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001; // Usando uma porta diferente (3001) para não dar conflito

console.log("=========================================");
console.log("INICIANDO SERVIDOR DE TESTE MÍNIMO");
console.log("=========================================");

// Monta o caminho absoluto para a pasta 'public'
const publicFolderPath = path.join(__dirname, 'public');
console.log("Configurando para servir arquivos da pasta:", publicFolderPath);

// A única e mais importante linha do nosso teste:
app.use(express.static(publicFolderPath));

// Rota de teste para garantir que o servidor está no ar
app.get('/teste', (req, res) => {
    res.send('O servidor de teste está funcionando!');
});

app.listen(PORT, () => {
    console.log(`\nServidor de teste rodando em http://localhost:${PORT}`);
    console.log("AGORA, TENTE ACESSAR SEU VÍDEO NO NAVEGADOR NESTE ENDEREÇO:");
    console.log(`http://localhost:${PORT}/uploads/videos/aula2_node.mp4`);
});