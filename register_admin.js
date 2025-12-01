const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    user: 'postgres', host: 'localhost', database: 'postgres', password: 'minhasenha', port: 5432
});

const ADMIN_USER = 'leleco';
const ADMIN_PASS = 'leleco1'; // SENHA SEGURA E CURTA

async function createAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(ADMIN_PASS, salt);
        await pool.query('INSERT INTO Users(username, password_hash) VALUES($1, $2) ON CONFLICT (username) DO NOTHING', [ADMIN_USER, hash]);
        console.log(`Usuário '${ADMIN_USER}' criado com sucesso! Senha: '${ADMIN_PASS}'`);
    } catch (err) { console.error(err); } 
    finally { await pool.end(); }
}
createAdmin();