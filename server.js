/*
  Backend (API) - CORRIGIDO e OTIMIZADO
  Rode com: node server.js
*/

// --- 1. Importações ---
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); // <--- NOVO: Carrega as variáveis do .env
// --- 2. Configurações ---
const app = express();
const port = process.env.PORT || 3000; // Usa a porta 3000 ou a porta que o Render definir



// Configuração do Banco de Dados (AGORA LENDO DO .ENV)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = "minha-chave-secreta-super-dificil-12345"; 
// --- 3. Middlewares ---
app.use(cors());       
app.use(express.json({ limit: '10mb' })); 

// Middleware de Autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (token == null) return res.status(401).json({ error: "Token não fornecido." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido." });
        req.user = user;
        next();
    });
};

// --- 4. Rotas da API ---

// == ROTA PÚBLICA: LOGIN ==
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Usuário e senha obrigatórios." });
    try {
        const userQuery = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        const user = userQuery.rows[0];
        if (!user) return res.status(401).json({ error: "Usuário ou senha inválidos." });
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: "Usuário ou senha inválidos." });
        
        const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '8h' }); 
        res.json({ token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// == ROTAS PROTEGIDAS ==
app.use(authenticateToken); 

// Rota: Listar Produtos (COM LÓGICA DE BUSCA RÁPIDA NO SQL)
app.get('/products', async (req, res) => {
    const { search } = req.query; 

    try {
        let queryText = 'SELECT * FROM Produtos';
        let queryParams = [];

        if (search) {
            queryText += `
                WHERE nome ILIKE $1 
                OR categoria ILIKE $1 
                OR descricao ILIKE $1
                OR especificacoes::text ILIKE $1
            `;
            queryParams.push(`%${search}%`);
        }

        // CORREÇÃO: Ordem Crescente (ASC) pelo ID/SKU para manter a lista ordenada
        queryText += ' ORDER BY id ASC';
        
        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Rota: Detalhe Produto
app.get('/product/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Produtos WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
});

// Rota: Criar
app.post('/products', async (req, res) => {
    const { nome, categoria, imagem_principal, imagens, descricao, especificacoes } = req.body;
    try {
        const query = `INSERT INTO Produtos (nome, categoria, imagem_principal, imagens, descricao, especificacoes) 
                       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
        const values = [nome, categoria, imagem_principal, imagens, descricao, especificacoes];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// Rota: Update
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, categoria, imagem_principal, imagens, descricao, especificacoes } = req.body;
    try {
        const query = `
            UPDATE Produtos
            SET nome = $1, categoria = $2, imagem_principal = $3, imagens = $4, descricao = $5, especificacoes = $6
            WHERE id = $7
            RETURNING *;
        `;
        const values = [nome, categoria, imagem_principal, imagens, descricao, especificacoes, id];
        const result = await pool.query(query, values);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
        res.status(200).json(result.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// Rota: Delete
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Produtos WHERE id = $1 RETURNING *;', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Produto não encontrado.' });
        res.status(204).send(); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro ao deletar produto' });
    }
});

// --- 5. Inicia o Servidor ---
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}. (http://localhost:3000)`);
});