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
    // 'user': O nome de usuário para acessar o banco de dados.
    // Pegamos ele de uma variável de ambiente (process.env.DB_USER) por segurança!
    user: process.env.DB_USER,
    // 'password': A senha do usuário do banco de dados. Também de variável de ambiente.
    password: process.env.DB_PASSWORD,
    // 'server': O endereço do seu servidor Azure SQL Database.
    server: process.env.DB_SERVER, // Ex: 'seuservidor.database.windows.net'
    // 'database': O nome do banco de dados específico (o 'AzBD' do seu projeto).
    database: process.env.DB_DATABASE, // Ex: 'AzBD'
    // 'options': Configurações adicionais para a conexão.
    options: {
        // 'encrypt: true': Essencial para o Azure SQL Database, garante que a conexão é segura (criptografada).
        encrypt: true,
        // 'trustServerCertificate: false': Em produção, deve ser 'false' por segurança.
        // Em desenvolvimento, às vezes é necessário 'true' se houver problemas de certificado,
        // mas em geral, o Azure SQL funciona bem com 'false'.
        trustServerCertificate: false
    },
    // 'port': A porta padrão para conexões SQL Server é 1433.
    // Usamos 'parseInt' caso a variável de ambiente venha como texto.
    port: parseInt(process.env.DB_PORT) || 1433
    
};

// --- 4. Middlewares (Funções que Processam Pedidos Antes das Rotas) ---

// 'app.use(cors())': Habilita o CORS (Cross-Origin Resource Sharing).
// Isso é vital para que o navegador permita que o seu site (front-end),
// que está em um endereço (ex: um arquivo local ou GitHub Pages),
// faça pedidos para este servidor (back-end), que está em outro endereço (localhost:3000 ou Azure).
app.use(cors());

// 'app.use(express.json())': Diz ao Express para "entender" e converter
// qualquer dado enviado no corpo de um pedido (especialmente POST)
// que esteja em formato JSON para um objeto JavaScript.
// Assim, podemos acessar os dados do formulário com 'req.body'.
app.use(express.json());








// --- 5. Definindo as Rotas da Nossa API ----------------------------------------------------------------
// Uma rota é como um "endereço" específico no servidor para o qual
// o front-end pode enviar pedidos (requisições).

// NOVO: Serve os arquivos estáticos do front-end
// 'express.static('public')': Diz ao Express para procurar arquivos estáticos
//                              (HTML, CSS, JavaScript, imagens) dentro da pasta 'public'.
//                              Quando alguém acessa a URL raiz do seu App Service,
//                              ele tentará servir o 'index.html' dessa pasta.
app.use(express.static('public'));  
 // Rota GET para Consulta de Usuários
app.get('/api/usuarios', async (req, res) => {

     // NOVO LOG: Informa que uma consulta de usuários foi iniciada.
    console.log(`[${new Date().toISOString()}] Requisição GET /api/usuarios recebida.`);
    

    // 'req': Objeto que contém os detalhes do pedido do front-end.
    // 'res': Objeto que usamos para enviar a resposta de volta ao front-end.
    try {
        // 1. Conectar ao banco de dados:
        // Usa a configuração 'dbConfig' para estabelecer uma conexão com o Azure SQL.
        // 'await' significa que esperamos a conexão ser feita antes de continuar.
        await sql.connect(dbConfig);

        // 2. Criar um novo pedido SQL:
        // 'request' é um objeto que nos permite enviar comandos SQL para o banco de dados.
        const request = new sql.Request();

        // 3. Executar a consulta SQL:
        // 'SELECT ... FROM dbo.Usuarios' é o comando SQL para buscar todos os dados
        // das colunas especificadas na tabela 'dbo.Usuarios'.
        // 'result.recordset' conterá os dados retornados pelo banco.
        const result = await request.query('SELECT IDUsuario, Nome, Username, Email, Cargo, CPF, Telefone, Cidade, Estado, DataCadastro FROM dbo.Usuarios');


          // NOVO LOG: Informa que a consulta foi bem-sucedida e quantos registros foram encontrados.
        console.log(`[${new Date().toISOString()}] Consulta /api/usuarios bem-sucedida. ${result.recordset.length} registros encontrados.`);

        
        // 4. Enviar a resposta ao front-end:
        // 'res.json(result.recordset)' converte os dados do banco para o formato JSON
        // e os envia de volta para o navegador que fez o pedido.
        res.json(result.recordset);

    } catch (err) {
        // Se algo der errado (ex: problema de conexão, erro na query SQL):
        // 1. Imprime o erro no console do servidor (para você depurar).
        console.error('Erro ao consultar usuários:', err);
        // 2. Envia uma resposta de erro 500 (Internal Server Error) para o front-end,
        // com uma mensagem genérica de que algo deu errado no servidor.
        res.status(500).send('Erro no servidor ao consultar usuários.');
    } finally {
        // 'finally' garante que este bloco de código sempre será executado,
        // independentemente de ter ocorrido um erro ou não.
        // 'sql.close()': É crucial fechar a conexão com o banco de dados
        // para liberar recursos.
        sql.close();
    }
});




// Rota POST para Cadastro de Usuários-------------------------------------------------------------------------------
// Quando o site (front-end) faz um pedido POST para '/api/cadastrarUsuario'
// (como quando o usuário clica em "Cadastrar" no formulário), este código é executado.
app.post('/api/cadastrarUsuario', async (req, res) => {

    
    // 'req.body': Contém os dados que foram enviados do formulário HTML
    // pelo front-end (já convertidos de JSON para objeto JavaScript pelo 'express.json()').
    const { nome, username, email, senha, cargo, cpf, rg, telefone, dataNascimento, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;

    // 1. Validação Mínima dos Dados Recebidos:
    // Verifica se os campos que consideramos obrigatórios não estão vazios.
    // Se faltar algum, enviamos um erro 400 (Bad Request - Pedido Malfeito).
    if (!nome || !username || !email || !senha || !cargo || !cpf || !cep || !logradouro || !numero || !bairro || !cidade || !estado) {
        return res.status(400).json({ message: "Por favor, preencha todos os campos obrigatórios." });
    }

    try {
        // 2. Conectar ao banco de dados (mesmo processo da consulta):
        await sql.connect(dbConfig);
        const request = new sql.Request();

        // 3. Preparar e Executar a Query de Inserção (INSERT):
        // Usamos '.input()' para adicionar parâmetros à query.
        // Isso é MUITO IMPORTANTE para SEGURANÇA (prevenção de SQL Injection!).
        // NUNCA concatene variáveis diretamente na query SQL.
        const result = await request
            .input('Nome', sql.NVarChar, nome)
            .input('Username', sql.NVarChar, username)
            .input('Email', sql.NVarChar, email)
            // CUIDADO REAL: Em um aplicativo de verdade, a senha NUNCA seria guardada
            // em texto puro. Ela seria "hasheada" (transformada em um código único irreversível)
            // antes de ser salva no banco. Para este projeto de faculdade, estamos simplificando.
            .input('Senha', sql.NVarChar, senha)
            .input('Cargo', sql.NVarChar, cargo)
            .input('CPF', sql.NVarChar, cpf)
            // Campos opcionais: Se o dado não veio do formulário, enviamos 'null' para o banco.
            .input('RG', sql.NVarChar, rg || null)
            .input('Telefone', sql.NVarChar, telefone || null)
            .input('DataNascimento', sql.Date, dataNascimento || null)
            .input('CEP', sql.NVarChar, cep)
            .input('Logradouro', sql.NVarChar, logradouro)
            .input('Numero', sql.NVarChar, numero)
            .input('Complemento', sql.NVarChar, complemento || null)
            .input('Bairro', sql.NVarChar, bairro)
            .input('Cidade', sql.NVarChar, cidade)
            .input('Estado', sql.NVarChar, estado)
            .query(`
                INSERT INTO dbo.Usuarios (Nome, Username, Email, Senha, Cargo, CPF, RG, Telefone, DataNascimento, CEP, Logradouro, Numero, Complemento, Bairro, Cidade, Estado)
                VALUES (@Nome, @Username, @Email, @Senha, @Cargo, @CPF, @RG, @Telefone, @DataNascimento, @CEP, @Logradouro, @Numero, @Complemento, @Bairro, @Cidade, @Estado);
            `);

        // 4. Verificar o Resultado da Inserção:
        // 'rowsAffected[0]' nos diz quantas linhas foram afetadas pela operação INSERT.
        // Se for maior que 0, significa que o usuário foi inserido.
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            // Envia uma resposta de sucesso 201 (Created) para o front-end.
            res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
        } else {
            // Se nenhuma linha foi afetada (o que é incomum se não houver erro),
            // envia um erro interno.
            res.status(500).json({ message: "Erro ao cadastrar usuário: nenhuma linha afetada." });
        }

    } catch (err) {
        // Se algo der errado durante o processo de inserção:
        // 1. Imprime o erro detalhado no console do servidor.
        console.error('Erro no cadastro de usuário:', err);
        // 2. Envia uma resposta de erro 500 (Internal Server Error) para o front-end,
        // incluindo a mensagem de erro original para ajudar na depuração.
        res.status(500).json({ message: "Erro interno do servidor.", error: err.message });
    } finally {
        // Garante que a conexão com o banco é sempre fechada.
        sql.close();
    }
});

// --- 6. Iniciando o Servidor ---

// 'app.listen(port, ...)' faz com que o servidor comece a "escutar"
// por pedidos na porta especificada (3000 localmente, ou a porta do Azure).
// Quando o servidor está pronto, ele imprime uma mensagem no console.
app.listen(port, () => {
    console.log(`Servidor de back-end rodando em http://localhost:${port}`);
    console.log('API de usuários pronta em /api/usuarios');
    console.log('API de cadastro pronta em /api/cadastrarUsuario (POST)');
});