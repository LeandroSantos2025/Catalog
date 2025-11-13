/* SCRIPT 1: SETUP COMPLETO */

-- 1. Tabelas
CREATE TABLE IF NOT EXISTS Produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL, 
    imagem_url TEXT,
    especificacoes JSONB, 
    descricao TEXT
);

CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dados de Exemplo (Telas, Baterias, Teclados, Fontes)
INSERT INTO Produtos (nome, categoria, imagem_url, especificacoes, descricao) VALUES
('Tela 15.6" Full HD IPS', 'Tela', 'https://placehold.co/600x400?text=Tela+15.6', '{"tamanho": "15.6", "resolucao": "1920x1080", "conector": "30 Pinos"}', 'Tela IPS de alta definição.'),
('Tela 14.0" LED Slim', 'Tela', 'https://placehold.co/600x400?text=Tela+14.0', '{"tamanho": "14.0", "resolucao": "1366x768", "conector": "30 Pinos"}', 'Tela padrão slim.'),
('Bateria Dell Inspiron 15', 'Bateria', 'https://placehold.co/600x400?text=Bateria+Dell', '{"voltagem": "14.8V", "capacidade": "40Wh", "part_number_compativeis": ["M5Y1K"]}', 'Bateria longa duração.'),
('Bateria Lenovo S145', 'Bateria', 'https://placehold.co/600x400?text=Bateria+Lenovo', '{"voltagem": "7.4V", "capacidade": "30Wh", "part_number_compativeis": ["L16C2PF0"]}', 'Bateria interna.'),
('Teclado Dell 15 5000', 'Teclado', 'https://placehold.co/600x400?text=Teclado+Dell', '{"layout": "ABNT2", "iluminacao": "Não"}', 'Teclado padrão ABNT2.'),
('Fonte Universal 65W', 'Fonte', 'https://placehold.co/600x400?text=Fonte+65W', '{"potencia": "65W", "tipo_pino": "Kit Multi"}', 'Fonte universal.');