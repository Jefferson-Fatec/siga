CREATE TABLE dbo.Clientes (
    -- IDCliente: É a Chave Primária (PK) desta tabela.
    -- INT: Tipo de dado inteiro (números sem casas decimais).
    -- PRIMARY KEY: Define que esta coluna é a Chave Primária.
    -- IDENTITY(1,1): Faz com que o banco de dados gere automaticamente um número único para cada novo cliente,
    --                começando em 1 e incrementando de 1 em 1.
    IDCliente INT PRIMARY KEY IDENTITY(1,1),

    -- Nome: Nome completo do cliente.
    -- NVARCHAR(255): Tipo de dado para texto (N de "nacional", para suportar caracteres especiais como acentos).
    --                255 é o tamanho máximo do texto (255 caracteres).
    -- NOT NULL: Significa que este campo NÃO pode ficar vazio. É obrigatório preencher.
    Nome NVARCHAR(255) NOT NULL,

    -- Email: Endereço de e-mail do cliente.
    -- UNIQUE: Garante que cada e-mail seja único na tabela (não pode haver 2 clientes com o mesmo e-mail).
    Email NVARCHAR(255) UNIQUE NOT NULL,

    -- Telefone: Número de telefone do cliente.
    -- NVARCHAR(20): Espaço para o telefone (ex: (99) 99999-9999).
    -- NULL: Permite que este campo fique vazio se o cliente não quiser informar.
    Telefone NVARCHAR(20) NULL,

    -- DataCadastro: Data e hora em que o cliente foi cadastrado.
    -- DATETIME: Tipo de dado para data e hora.
    -- DEFAULT GETDATE(): Automaticamente preenche este campo com a data e hora atual
    --                   quando um novo cliente é inserido, se nenhum valor for fornecido.
    DataCadastro DATETIME DEFAULT GETDATE()
);
GO -- GO: Comando para separar blocos de SQL, indicando ao banco para executar o comando acima.