// js/consultaUsuarios.js - Lógica Específica da Consulta de Usuários

document.addEventListener('DOMContentLoaded', async () => {
    const tabelaUsuariosBody = document.querySelector('#tabelaUsuarios tbody');

    // Verifica se o elemento da tabela de usuários existe na página atual
    if (tabelaUsuariosBody) {
        const loadingDiv = document.getElementById('loading');
        const errorMessageDiv = document.getElementById('errorMessage');
        // ATENÇÃO: COLOQUE A URL CORRETA DA SUA API DE CONSULTA DE USUÁRIOS AQUI
        // Se for Azure Function: 'https://seuappdefuncoes.azurewebsites.net/api/GetUsuarios?code=SUA_CHAVE'
        // Se for Node.js local: 'http://localhost:3000/api/usuarios'
      //  const apiUrlUsuarios = 'http://localhost:3000/api/usuarios'; // Exemplo para Node.js local
// Exemplo em js/consultaUsuarios.js
//const apiUrlUsuarios = 'https://seu-app-name.azurewebsites.net/api/usuarios';
 const apiUrlUsuarios = '/api/usuarios';
      
// Exibir o indicador de carregamento
        loadingDiv.classList.remove('d-none');
        // Esconder mensagens de erro anteriores
        errorMessageDiv.classList.add('d-none');

        try {
            const response = await fetch(apiUrlUsuarios); // Faz a requisição à API
            if (!response.ok) {
                // Se a resposta não for bem-sucedida (ex: status 404, 500)
                const errorText = await response.text(); // Tenta ler a resposta como texto para mais detalhes
                throw new Error(`Erro HTTP! Status: ${response.status} - ${errorText}`);
            }
            const usuarios = await response.json(); // Converte a resposta para JSON

            if (usuarios.length === 0) {
                // Se não houver usuários, exibe uma mensagem na tabela
                tabelaUsuariosBody.innerHTML = '<tr><td colspan="10" class="text-center">Nenhum usuário encontrado.</td></tr>';
            } else {
                // Preenche a tabela com os dados dos usuários
                usuarios.forEach(usuario => {
                    const row = tabelaUsuariosBody.insertRow();
                    row.insertCell(0).textContent = usuario.IDUsuario;
                    row.insertCell(1).textContent = usuario.Nome;
                    row.insertCell(2).textContent = usuario.Username;
                    row.insertCell(3).textContent = usuario.Email;
                    row.insertCell(4).textContent = usuario.Cargo;
                    row.insertCell(5).textContent = usuario.CPF;
                    // Tratamento para campos que podem ser nulos ou 'N/A'
                    row.insertCell(6).textContent = usuario.Telefone || 'N/A';
                    row.insertCell(7).textContent = usuario.Cidade;
                    row.insertCell(8).textContent = usuario.Estado;
                    // Formata a DataCadastro (se existir e for um formato de data)
                    const dataCadastro = usuario.DataCadastro ? new Date(usuario.DataCadastro).toLocaleDateString('pt-BR') : 'N/A';
                    row.insertCell(9).textContent = dataCadastro;
                });
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            errorMessageDiv.classList.remove('d-none'); // Mostra a mensagem de erro
            errorMessageDiv.textContent = `Não foi possível carregar os dados dos usuários. Detalhes: ${error.message}`;
        } finally {
            loadingDiv.classList.add('d-none'); // Esconde o indicador de carregamento
        }
    }
});