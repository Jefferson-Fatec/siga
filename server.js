// server.js
// Este é o coração do nosso back-end (servidor).
// Ele vai receber pedidos do nosso site (front-end) e conversar com o banco de dados.

// --- 1. Importando as Ferramentas Necessárias ---

// 'dotenv': Ajuda a carregar configurações sensíveis (como senhas do banco)
// de um arquivo .env, mantendo-as fora do nosso código público.
require('dotenv').config();

// 'express': É um "framework" (um conjunto de ferramentas) para Node.js
// que facilita a criação de servidores web e APIs.
const express = require('express');

// 'mssql': É um "driver" que permite ao Node.js se conectar e conversar
// com bancos de dados SQL Server (como o Azure SQL Database).
const sql = require('mssql');

// 'cors': É um middleware (um pedaço de código que processa requisições)
// que resolve um problema de segurança no navegador. Ele permite que
// nosso site (rodando em um endereço) converse com este servidor (rodando em outro).
const cors = require('cors');

// --- 2. Configurando o Servidor Express ---

// 'app' é a nossa aplicação Express. Tudo que o servidor vai fazer
// (rotas, middlewares) será configurado nela.
const app = express();

// 'port': Define em qual "porta" o servidor vai escutar por pedidos.
// process.env.PORT é usado pelo Azure App Service para nos dizer qual porta usar.
// Se não estiver no Azure (estiver rodando localmente), ele usará a porta 3000.
const port = process.env.PORT || 3000;

// --- 3. Configuração de Conexão com o Banco de Dados Azure SQL ---

// 'dbConfig': Um objeto que guarda todas as informações necessárias para
// o Node.js se conectar ao seu banco de dados no Azure.
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, // Ex: 'seuservidor.database.windows.net'
    database: process.env.DB_DATABASE, // Ex: 'AzBD'
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    port: parseInt(process.env.DB_PORT) || 1433
};

// NOVO LOG: Loga a configuração do banco de dados (CUIDADO: não logue senhas em produção!)
console.log(`[${new Date().toISOString()}] Configuração do DB carregada: Server=${dbConfig.server}, Database=${dbConfig.database}, User=${dbConfig.user}, Port=${dbConfig.port}`);


// --- 4. Middlewares (Funções que Processam Pedidos Antes das Rotas) ---

app.use(cors());
app.use(express.json());

// --- 5. Definindo as Rotas da Nossa API ----------------------------------------------------------------

// NOVO: Middleware para logar todas as requisições HTTP recebidas
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Requisição recebida: ${req.method} ${req.originalUrl}`);
    next(); // Continua para a próxima função middleware/rota
});


// Serve os arquivos estáticos do front-end
app.use(express.static('public'));

// Rota GET para Consulta de Usuários
app.get('/api/usuarios', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Iniciando consulta GET /api/usuarios.`);

    try {
        // NOVO LOG: Antes de tentar conectar ao DB
        console.log(`[${new Date().toISOString()}] Tentando conectar ao banco de dados para /api/usuarios.`);
        await sql.connect(dbConfig);
        // NOVO LOG: Após conectar ao DB com sucesso
        console.log(`[${new Date().toISOString()}] Conexão ao banco de dados estabelecida para /api/usuarios.`);

        const request = new sql.Request();
        const result = await request.query('SELECT IDUsuario, Nome, Username, Email, Cargo, CPF, Telefone, Cidade, Estado, DataCadastro FROM dbo.Usuarios');

        console.log(`[${new Date().toISOString()}] Consulta /api/usuarios bem-sucedida. ${result.recordset.length} registros encontrados.`);
        res.json(result.recordset);

    } catch (err) {
        // NOVO LOG: Erro detalhado na conexão ou consulta ao DB
        console.error(`[${new Date().toISOString()}] ERRO FATAL em GET /api/usuarios:`, err.message);
        if (err.code === 'ELOGIN') { // Erro específico de login (usuário/senha)
            console.error(`[${new Date().toISOString()}] Possível erro de autenticação/senha no banco de dados para GET /api/usuarios.`);
        }
        res.status(500).send('Erro no servidor ao consultar usuários.');
    } finally {
        // NOVO LOG: Informa que a conexão está sendo fechada
        console.log(`[${new Date().toISOString()}] Fechando conexão com o banco de dados para /api/usuarios.`);
        sql.close();
    }
});

// Rota POST para Cadastro de Usuários
app.post('/api/cadastrarUsuario', async (req, res) => {
    console.log(`[${new Date().toISOString()}] Iniciando requisição POST /api/cadastrarUsuario.`);
    // NOVO LOG: Loga os dados recebidos (CUIDADO: NÃO LOGUE SENHAS!)
    const { nome, username, email, cargo, cpf, cep, logradouro, numero, bairro, cidade, estado } = req.body;
    console.log(`[${new Date().toISOString()}] Dados recebidos para cadastro: Nome=${nome}, Username=${username}, Email=${email}, Cargo=${cargo}, CPF=${cpf}, CEP=${cep}`);


    if (!nome || !username || !email || !req.body.senha || !cargo || !cpf || !cep || !logradouro || !numero || !bairro || !cidade || !estado) {
        // NOVO LOG: Erro de validação de dados
        console.warn(`[${new Date().toISOString()}] Erro 400: Campos obrigatórios faltando para cadastro de usuário.`);
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
    }

    try {
        // NOVO LOG: Antes de tentar conectar ao DB
        console.log(`[${new Date().toISOString()}] Tentando conectar ao banco de dados para POST /api/cadastrarUsuario.`);
        await sql.connect(dbConfig);
        // NOVO LOG: Após conectar ao DB com sucesso
        console.log(`[${new Date().toISOString()}] Conexão ao banco de dados estabelecida para POST /api/cadastrarUsuario.`);

        const request = new sql.Request();

        const result = await request
            .input('Nome', sql.NVarChar, nome)
            .input('Username', sql.NVarChar, username)
            .input('Email', sql.NVarChar, email)
            .input('Senha', sql.NVarChar, req.body.senha) // Use req.body.senha para garantir que pega do corpo.
            .input('Cargo', sql.NVarChar, cargo)
            .input('CPF', sql.NVarChar, cpf)
            .input('RG', sql.NVarChar, req.body.rg || null)
            .input('Telefone', sql.NVarChar, req.body.telefone || null)
            .input('DataNascimento', sql.Date, req.body.dataNascimento || null)
            .input('CEP', sql.NVarChar, cep)
            .input('Logradouro', sql.NVarChar, logradouro)
            .input('Numero', sql.NVarChar, numero)
            .input('Complemento', sql.NVarChar, req.body.complemento || null)
            .input('Bairro', sql.NVarChar, bairro)
            .input('Cidade', sql.NVarChar, cidade)
            .input('Estado', sql.NVarChar, estado)
            .query(`
                INSERT INTO dbo.Usuarios (Nome, Username, Email, Senha, Cargo, CPF, RG, Telefone, DataNascimento, CEP, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
                VALUES (@Nome, @Username, @Email, @Senha, @Cargo, @CPF, @RG, @Telefone, @DataNascimento, @CEP, @Logradouro, @Numero, @Complemento, @Bairro, @Cidade, @Estado);
            `);

        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            console.log(`[${new Date().toISOString()}] Usuário "${username}" cadastrado com sucesso.`);
            res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
        } else {
            console.error(`[${new Date().toISOString()}] Erro ao cadastrar usuário "${username}": nenhuma linha afetada.`);
            res.status(500).json({ message: "Erro ao cadastrar usuário: nenhuma linha afetada." });
        }

    } catch (err) {
        // NOVO LOG: Erro detalhado na conexão ou inserção no DB
        console.error(`[${new Date().toISOString()}] ERRO FATAL em POST /api/cadastrarUsuario para usuário "${username}":`, err.message);
        if (err.code === 'ELOGIN') { // Erro específico de login (usuário/senha)
             console.error(`[${new Date().toISOString()}] Possível erro de autenticação/senha no banco de dados para POST /api/cadastrarUsuario.`);
        }
        res.status(500).json({ message: "Erro interno do servidor.", error: err.message });
    } finally {
        // NOVO LOG: Informa que a conexão está sendo fechada
        console.log(`[${new Date().toISOString()}] Fechando conexão com o banco de dados para POST /api/cadastrarUsuario.`);
        sql.close();
    }
});

// --- 6. Iniciando o Servidor ---

app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Servidor de back-end rodando em http://localhost:${port}`);
    console.log(`[${new Date().toISOString()}] API de usuários pronta em /api/usuarios (GET)`);
    console.log(`[${new Date().toISOString()}] API de cadastro pronta em /api/cadastrarUsuario (POST)`);
});