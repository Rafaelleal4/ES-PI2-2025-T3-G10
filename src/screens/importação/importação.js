const express = require('express');
// O 'multer' é um pacote (middleware) para Node.js que sabe lidar com o upload de arquivos (formulários multipart/form-data).
const multer = require('multer');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); 

router.post('/alunos/importar', upload.single('arquivo_alunos'), (req, res) => {
    
    if (!req.file) {
        return res.status(400).send({ message: 'Nenhum arquivo foi enviado.' });
    }

    console.log('Arquivo recebido pelo backend:', req.file);
    
    res.status(200).send({ message: 'Arquivo recebido com sucesso e pronto para processar!' });
});

module.exports = router;