const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const JWT_SECRET = "segredo123"; // Pode manter simples para dev

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'postgres', password: 'minhasenha', port: 5432
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Token não fornecido." });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Inválido." });
        req.user = user; next();
    });
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (!rows[0] || !(await bcrypt.compare(password, rows[0].password_hash))) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }
        const token = jwt.sign({ u: username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/products', auth, async (req, res) => {
    const { search } = req.query;
    let q = 'SELECT * FROM Produtos';
    let p = [];
    if (search) {
        q += ` WHERE nome ILIKE $1 OR categoria ILIKE $1 OR especificacoes::text ILIKE $1`;
        p.push(`%${search}%`);
    }
    q += ' ORDER BY id ASC'; // Ordem Crescente
    try {
        const { rows } = await pool.query(q, p);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/product/:id', auth, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Produtos WHERE id = $1', [req.params.id]);
        rows[0] ? res.json(rows[0]) : res.status(404).json({ error: "Não encontrado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Rotas de Escrita (Create, Update, Delete) mantidas iguais...
app.post('/products', auth, async (req, res) => {
    const { nome, categoria, imagem_url, descricao, especificacoes } = req.body;
    try {
        const { rows } = await pool.query(
            'INSERT INTO Produtos (nome, categoria, imagem_url, descricao, especificacoes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome, categoria, imagem_url, descricao, especificacoes]
        );
        res.status(201).json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/products/:id', auth, async (req, res) => {
    const { nome, categoria, imagem_url, descricao, especificacoes } = req.body;
    try {
        const { rows } = await pool.query(
            'UPDATE Produtos SET nome=$1, categoria=$2, imagem_url=$3, descricao=$4, especificacoes=$5 WHERE id=$6 RETURNING *',
            [nome, categoria, imagem_url, descricao, especificacoes, req.params.id]
        );
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/products/:id', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM Produtos WHERE id=$1', [req.params.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(port, () => console.log(`Server on ${port}`));