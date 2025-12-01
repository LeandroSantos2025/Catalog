-- 1. Cria a Tabela de Produtos
CREATE TABLE IF NOT EXISTS Produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL, 
    imagem_url TEXT,
    especificacoes JSONB, 
    descricao TEXT
);

-- 2. Cria a Tabela de Usuários
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Insere Dados (Exemplos)
INSERT INTO Produtos (nome, categoria, imagem_url, especificacoes, descricao)
VALUES
('Tela 15.6" Full HD', 'Tela', 'https://placehold.co/600x400?text=Tela+15.6', '{"resolucao": "1920x1080"}', 'Tela padrão.'),
('Bateria Dell M5Y1K', 'Bateria', 'https://placehold.co/600x400?text=Bateria+Dell', '{"voltagem": "14.8V"}', 'Bateria Dell.');