/*
      Script para criar o usuário admin (NA PORTA 5432)
      Rode com: node register_admin.js
    */
    const { Pool } = require('pg');
    const bcrypt = require('bcryptjs');

    // Configuração do Banco de Dados (PORTA 5432)
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost', 
        database: 'postgres',
        password: 'minhasenha',
        port: 5432, // <-- GARANTIDO QUE ESTÁ NA PORTA CERTA
    });

    // --- DADOS DO ADMIN ---
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'Coxa1909!*!&@*@&#¨$&%@$%&**(#@#$59&%&#*@'; 
    // --------------------

    async function createAdmin() {
        console.log('Iniciando criação do usuário admin...');
        try {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(ADMIN_PASS, salt);
            console.log(`Senha '${ADMIN_PASS}' criptografada.`);
            
            const query = {
                text: 'INSERT INTO Users(username, password_hash) VALUES($1, $2) ON CONFLICT (username) DO NOTHING RETURNING *',
                values: [ADMIN_USER, passwordHash],
            };
            const res = await pool.query(query);

            if (res.rowCount > 0) {
                console.log('=====================================');
                console.log(`Usuário '${ADMIN_USER}' CRIADO!`);
                console.log('=====================================');
            } else {
                console.warn(`*** Usuário '${ADMIN_USER}' já existe.`);
            }
        } catch (err) {
            console.error('ERRO ao criar usuário admin:', err.stack);
        } finally {
            await pool.end();
            console.log('Conexão com o banco fechada.');
        }
    }
    createAdmin();