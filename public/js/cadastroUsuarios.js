// js/cadastroUsuarios.js
// Este arquivo JavaScript controla tudo o que acontece na página de "Cadastro de Usuário" (cadastro.html).
// Ele cuida desde a validação do que você digita no formulário até o envio dos dados para o nosso "servidor" (back-end).

// --- 1. Configuração da API de Cadastro ---

// 'API_CADASTRO_URL': Esta é a "porta de entrada" para o nosso servidor (o back-end Node.js).
// É o endereço para onde o navegador vai enviar os dados do formulário quando você clicar em "Cadastrar".
// ATENÇÃO: Se o seu servidor Node.js estiver rodando localmente (na sua máquina), use 'http://localhost:3000/api/cadastrarUsuario'.
//          Se você já publicou seu servidor Node.js no Azure (ex: Azure App Service), você deve usar a URL pública dele aqui.
//          Exemplo para Azure: 'https://seu-nome-do-appservice.azurewebsites.net/api/cadastrarUsuario'
const API_CADASTRO_URL = '/api/cadastrarUsuario'; // URL DA APLICACAO LOCAL (para desenvolvimento)
// const API_CADASTRO_URL = 'SUA_URL_DA_AZURE_FUNCTION_POST_USUARIO_AQUI'; // Descomente e use esta para o Azure

// --- 2. Quando a Página Carrega: 'DOMContentLoaded' ---

// 'document.addEventListener('DOMContentLoaded', function() { ... })':
// Este é um "ouvinte de eventos" (event listener). Ele diz ao navegador para
// esperar até que TODO o conteúdo da página HTML (texto, imagens, formulários, etc.)
// esteja completamente carregado antes de tentar executar o código JavaScript dentro dele.
// Isso evita erros, pois garante que todos os elementos que queremos manipular (como o formulário)
// já existam na página.
document.addEventListener('DOMContentLoaded', function() {
    // --- 2.1. Obtendo Elementos do Formulário ---
    // Aqui, estamos pegando referências para os elementos HTML da nossa página.
    // Usamos 'document.getElementById()' para encontrar os elementos pelo seu ID único.
    const form = document.getElementById('formCadastroUsuario'); // O formulário completo
    const cepInput = document.getElementById('cep');             // O campo de CEP
    const logradouroInput = document.getElementById('logradouro'); // O campo de Logradouro (Rua, Av.)
    const bairroInput = document.getElementById('bairro');       // O campo de Bairro
    const cidadeInput = document.getElementById('cidade');       // O campo de Cidade
    const estadoInput = document.getElementById('estado');       // O campo de Estado
    const mensagemCadastro = document.getElementById('mensagemCadastro'); // Onde exibiremos mensagens de sucesso/erro
    const senhaInput = document.getElementById('senha');         // O campo da Senha
    const confirmarSenhaInput = document.getElementById('confirmarSenha'); // O campo de Confirmação da Senha

    // 'if (form)': Este é um "controle de segurança".
    // Ele verifica se o elemento 'form' (o formulário de cadastro) realmente existe nesta página.
    // Isso é útil se este mesmo arquivo JavaScript for incluído em outras páginas
    // que não possuem o formulário de cadastro, evitando erros.
    if (form) {
        // --- 2.2. Adicionando Máscaras e Eventos de Digitação ---
        // Aqui, aplicamos "máscaras" nos campos (como colocar pontos e traços no CPF e CEP)
        // e também adicionamos a validação "em tempo real" enquanto o usuário digita.

        // 'cepInput.addEventListener('input', ...)' e outros:
        // 'input': Este evento é disparado toda vez que o conteúdo de um campo é alterado (digitado, colado).
        // '(e) => { e.target.value = formatCEP(e.target.value); }': Quando o evento 'input' ocorre no campo CEP,
        // chamamos a função 'formatCEP' (definida no 'script.js' global) para formatar o valor.
        cepInput.addEventListener('input', (e) => { e.target.value = formatCEP(e.target.value); });
        document.getElementById('cpf').addEventListener('input', (e) => { e.target.value = formatCPF(e.target.value); });
        document.getElementById('telefone').addEventListener('input', (e) => { e.target.value = formatTelefone(e.target.value); });

        // 'cepInput.addEventListener('blur', async () => { ... })':
        // 'blur': Este evento é disparado quando o usuário "sai" do campo (clica em outro lugar ou aperta Tab).
        // Usamos ele para consultar o ViaCEP assim que o CEP é digitado.
        cepInput.addEventListener('blur', async () => {
            const cepValue = cepInput.value; // Pega o valor digitado no CEP
            const cepFeedback = cepInput.nextElementSibling; // Pega a mensagem de erro/validação do Bootstrap

            // Verifica se o CEP tem o tamanho certo (9 caracteres, ex: "01001-000")
            if (cepValue.length === 9) {
                // 'await consultarCEP(cepValue)': Chama a função 'consultarCEP' (que está no 'script.js' global)
                // para buscar os dados do endereço. 'await' faz o JavaScript "esperar" a resposta do ViaCEP.
                const endereco = await consultarCEP(cepValue);
                if (endereco) {
                    // Se o endereço foi encontrado, preenche os campos correspondentes:
                    logradouroInput.value = endereco.logradouro;
                    bairroInput.value = endereco.bairro;
                    cidadeInput.value = endereco.localidade;
                    estadoInput.value = endereco.uf;
                    // Adiciona classes do Bootstrap para indicar que os campos estão válidos (verde):
                    cepInput.classList.remove('is-invalid'); cepInput.classList.add('is-valid');
                    logradouroInput.classList.add('is-valid');
                    bairroInput.classList.add('is-valid');
                    cidadeInput.classList.add('is-valid');
                    estadoInput.classList.add('is-valid');
                } else {
                    // Se o CEP não foi encontrado ou é inválido, limpa os campos e mostra erro:
                    logradouroInput.value = ''; bairroInput.value = ''; cidadeInput.value = ''; estadoInput.value = '';
                    // Adiciona classe do Bootstrap para indicar erro (vermelho):
                    cepInput.classList.add('is-invalid'); cepInput.classList.remove('is-valid');
                    cepFeedback.textContent = 'CEP não encontrado ou inválido.'; // Exibe a mensagem de erro
                }
            } else {
                // Se o CEP não tem o formato correto (ex: poucos dígitos), limpa e mostra erro:
                logradouroInput.value = ''; bairroInput.value = ''; cidadeInput.value = ''; estadoInput.value = '';
                cepInput.classList.add('is-invalid'); cepInput.classList.remove('is-valid');
                cepFeedback.textContent = 'O CEP deve ter o formato 99999-999.';
            }
        });

        // 'Array.from(form.elements).forEach(...)' e 'input.addEventListener('input', ...)'
        // Percorre todos os campos do formulário e adiciona um ouvinte para o evento 'input'.
        // Isso faz com que a função 'validateField' seja chamada enquanto o usuário digita,
        // dando feedback visual instantâneo (verde/vermelho).
        Array.from(form.elements).forEach(function(input) {
            // Verifica se é um campo de input e não é o campo de confirmação de senha ou CEP (que têm validação específica)
            if (input.tagName === 'INPUT' && input.id !== 'confirmarSenha' && input.id !== 'cep') {
                 input.addEventListener('input', () => { validateField(input); }); // Chama a função global 'validateField'
            }
        });

        // Listener específico para confirmarSenha:
        // Verifica se a senha e a confirmação de senha são iguais enquanto o usuário digita na confirmação.
        confirmarSenhaInput.addEventListener('input', () => {
            const confirmarSenhaFeedback = confirmarSenhaInput.nextElementSibling;
            if (confirmarSenhaInput.value !== senhaInput.value) {
                confirmarSenhaInput.classList.add('is-invalid');
                confirmarSenhaInput.classList.remove('is-valid');
                confirmarSenhaFeedback.textContent = 'As senhas não conferem.';
            } else {
                confirmarSenhaInput.classList.remove('is-invalid');
                confirmarSenhaInput.classList.add('is-valid');
            }
        });

        // Força a validação de campos de endereço quando preenchidos pelo ViaCEP:
        // Isso garante que os campos preenchidos automaticamente também mostrem o status visual de válido.
        logradouroInput.addEventListener('change', () => validateField(logradouroInput));
        bairroInput.addEventListener('change', () => validateField(bairroInput));
        cidadeInput.addEventListener('change', () => validateField(cidadeInput));
        estadoInput.addEventListener('change', () => validateField(estadoInput));

        // --- 2.3. Lógica ao Enviar o Formulário: 'form.addEventListener('submit', ...)' ---
        // Este é o código que será executado quando o usuário clicar no botão "Cadastrar".
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); // Impede o navegador de recarregar a página (comportamento padrão de formulários).
            event.stopPropagation(); // Impede que o evento de "submit" se espalhe para outros elementos.

            let formIsValid = true; // Uma "bandeira" para verificar se todo o formulário é válido.
            showMessage(mensagemCadastro, '', 'd-none'); // Limpa qualquer mensagem anterior (sucesso ou erro).

            // Re-valida todos os campos obrigatórios antes de enviar:
            Array.from(form.elements).forEach(function(input) {
                if (input.tagName === 'INPUT' && input.hasAttribute('required')) {
                    if (!validateField(input)) {
                        formIsValid = false; // Se um campo não é válido, a bandeira se torna falsa.
                    }
                }
            });

            // Re-valida se as senhas conferem:
            if (senhaInput.value !== confirmarSenhaInput.value) {
                confirmarSenhaInput.classList.add('is-invalid');
                confirmarSenhaInput.classList.remove('is-valid');
                confirmarSenhaInput.nextElementSibling.textContent = 'As senhas não conferem.';
                formIsValid = false;
            } else {
                confirmarSenhaInput.classList.remove('is-invalid');
                confirmarSenhaInput.classList.add('is-valid');
            }

            // Se TODAS as validações passaram (formIsValid ainda é true):
            if (formIsValid) {
                // 1. Coletar todos os dados do formulário em um único objeto JavaScript:
                const userData = {
                    nome: document.getElementById('nome').value,
                    username: document.getElementById('username').value,
                    email: document.getElementById('email').value,
                    senha: document.getElementById('senha').value,
                    dataNascimento: document.getElementById('dataNascimento').value,
                    cpf: document.getElementById('cpf').value,
                    rg: document.getElementById('rg').value,
                    telefone: document.getElementById('telefone').value,
                    cargo: document.getElementById('cargo').value,
                    cep: document.getElementById('cep').value,
                    logradouro: document.getElementById('logradouro').value,
                    numero: document.getElementById('numero').value,
                    complemento: document.getElementById('complemento').value,
                    bairro: document.getElementById('bairro').value,
                    cidade: document.getElementById('cidade').value,
                    estado: document.getElementById('estado').value
                };

                try {
                    // 2. Enviar os dados para o nosso servidor (back-end) usando a API Fetch:
                    // 'await fetch(API_CADASTRO_URL, { ... })': Faz um pedido HTTP (requisição) para a URL da API.
                    // 'method: 'POST'': Informa que estamos ENVIANDO dados para criar um novo recurso.
                    // 'headers: { 'Content-Type': 'application/json' }': Diz ao servidor que estamos enviando dados no formato JSON.
                    // 'body: JSON.stringify(userData)': Converte o nosso objeto 'userData' em uma string JSON
                    //                                   para ser enviada no corpo do pedido.
                    const response = await fetch(API_CADASTRO_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });

                    // 3. Receber e Analisar a Resposta do Servidor:
                    // 'await response.json()': Espera a resposta do servidor e a converte de JSON para um objeto JavaScript.
                    const responseData = await response.json();

                    // 4. Verificar se o Pedido foi Bem-Sucedido:
                    // 'response.ok': É uma propriedade de 'response' que é 'true' se o status HTTP for 2xx (ex: 200 OK, 201 Created).
                    if (response.ok) {
                        // Se o cadastro deu certo:
                        // Exibe uma mensagem de sucesso na tela.
                        showMessage(mensagemCadastro, responseData.message || 'Usuário cadastrado com sucesso!', 'success');
                        form.reset(); // Limpa todos os campos do formulário.
                        // Remove as cores de validação (verde/vermelho) dos campos após o reset.
                        Array.from(form.elements).forEach(function(input) {
                            input.classList.remove('is-valid', 'is-invalid');
                        });
                    } else {
                        // Se o servidor retornou um erro (ex: 400 Bad Request, 500 Internal Server Error):
                        // Exibe uma mensagem de erro na tela (a mensagem que o servidor enviou ou uma genérica).
                        showMessage(mensagemCadastro, responseData.message || 'Erro ao cadastrar usuário. Tente novamente.', 'danger');
                        // Imprime o erro detalhado no console do navegador (para você depurar).
                        console.error('Erro na resposta da API:', responseData.error || response.statusText);
                    }
                } catch (error) {
                    // 5. Capturar Erros de Conexão (se o servidor não estiver rodando ou houver problema de rede):
                    // Se o navegador não conseguiu nem mesmo fazer o pedido para o servidor (ex: servidor desligado, problema de rede).
                    console.error('Erro ao enviar dados para a API:', error);
                    // Exibe uma mensagem para o usuário informando que não foi possível conectar.
                    showMessage(mensagemCadastro, 'Não foi possível conectar ao servidor de cadastro. Verifique se o back-end está rodando.', 'danger');
                }
            } else {
                // Se as validações no front-end falharam (o formulário não é válido):
                showMessage(mensagemCadastro, 'Por favor, corrija os erros no formulário.', 'danger');
            }
        });
    }
}); // Fim do 'DOMContentLoaded' principal da página de cadastro.