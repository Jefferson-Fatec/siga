// js/consultaProfessores.js
// Este arquivo JavaScript é responsável por exibir e controlar a tabela de "Consulta de Professores".
// Por ser um projeto de faculdade no início do curso, os dados dos professores aqui são "mockados",
// ou seja, são dados de exemplo criados no próprio código, e não vêm de um banco de dados real.
// Isso nos permite aprender a criar tabelas dinâmicas e funcionalidades interativas no navegador.

// --- 1. Quando a Página Carrega: 'DOMContentLoaded' ---

// 'document.addEventListener('DOMContentLoaded', async () => { ... })':
// Este é um "ouvinte de eventos" (event listener). Ele diz ao navegador para
// esperar até que TODO o conteúdo da página HTML (texto, tabelas, botões, etc.)
// esteja completamente carregado antes de tentar executar o código JavaScript dentro dele.
// O 'async' indica que esta função pode realizar operações que demoram um pouco (como esperar dados),
// sem "travar" o navegador.
document.addEventListener('DOMContentLoaded', async () => {
    // --- 1.1. Obtendo Elementos da Página ---
    // Aqui, estamos pegando referências para os elementos HTML da nossa página usando seus IDs ou seletores.
    // Isso nos permite manipular esses elementos (como preencher a tabela, mostrar/esconder mensagens).
    const tabelaProfessoresBody = document.querySelector('#tabelaProfessores tbody'); // O corpo da tabela onde os professores serão listados
    
    // 'if (tabelaProfessoresBody)': Este é um "controle de segurança" importante.
    // Ele verifica se o elemento 'tabelaProfessoresBody' (o corpo da tabela de professores)
    // realmente existe nesta página. Isso é útil se este mesmo arquivo JavaScript for
    // incluído em outras páginas que não possuem essa tabela, evitando erros no console.
    if (tabelaProfessoresBody) {
        const loadingDiv = document.getElementById('loading');                 // A div que mostra a mensagem "Carregando..."
        const searchInput = document.getElementById('searchInput');             // O campo de texto para pesquisa
        // Seleciona todos os cabeçalhos da tabela (<th>) que têm o atributo 'data-column'.
        // Estes serão os cabeçalhos clicáveis para ordenar a tabela.
        const tableHeaders = document.querySelectorAll('#tabelaProfessores thead th[data-column]');
        const paginationControls = document.getElementById('paginationControls'); // A barra de controle de paginação

        // --- 1.2. Dados Mockados de Professores ---
        // Este é o array (lista) de objetos JavaScript que representa nossos professores.
        // Cada objeto é um "professor" com suas propriedades (ID, Nome, Email, etc.).
        // Estes dados estão no código porque estamos "mockando" (simulando) o banco de dados.
        let allProfessores = [
            { IDProfessor: 1, NomeProfessor: "Maria Silva", Email: "maria.silva@siga.com.br", IdiomaPrincipal: "Análise e Desenvolvimento de Sistemas", Status: "Ativo" },
            { IDProfessor: 2, NomeProfessor: "João Oliveira", Email: "joao.oliveira@siga.com.br", IdiomaPrincipal: "Design de Mídias Digitais", Status: "Ativo" },
            { IDProfessor: 3, NomeProfessor: "Ana Souza", Email: "ana.souza@siga.com.br", IdiomaPrincipal: "Jogos Digitais", Status: "Ativo" },
            { IDProfessor: 4, NomeProfessor: "Pedro Costa", Email: "pedro.costa@siga.com.br", IdiomaPrincipal: "Logística", Status: "Ativo" },
            { IDProfessor: 5, NomeProfessor: "Beatriz Almeida", Email: "beatriz.almeida@siga.com.br", IdiomaPrincipal: "Análise e Desenvolvimento de Sistemas", Status: "Inativo" },
            { IDProfessor: 6, NomeProfessor: "Carlos Rodrigues", Email: "carlos.rodrigues@siga.com.br", IdiomaPrincipal: "Design de Mídias Digitais", Status: "Ativo" },
            { IDProfessor: 7, NomeProfessor: "Fernanda Lima", Email: "fernanda.lima@siga.com.br", IdiomaPrincipal: "Jogos Digitais", Status: "Ativo" },
            { IDProfessor: 8, NomeProfessor: "Gabriel Santos", Email: "gabriel.santos@siga.com.br", IdiomaPrincipal: "Logística", Status: "Ativo" },
            { IDProfessor: 9, NomeProfessor: "Juliana Pereira", Email: "juliana.pereira@siga.com.br", IdiomaPrincipal: "Análise e Desenvolvimento de Sistemas", Status: "Ativo" },
            { IDProfessor: 10, NomeProfessor: "Ricardo Neves", Email: "ricardo.neves@siga.com.br", IdiomaPrincipal: "Design de Mídias Digitais", Status: "Inativo" },
            { IDProfessor: 11, NomeProfessor: "Leticia Gomes", Email: "leticia.gomes@siga.com.br", IdiomaPrincipal: "Jogos Digitais", Status: "Ativo" },
            { IDProfessor: 12, NomeProfessor: "Diego Ferreira", Email: "diego.ferreira@siga.com.br", IdiomaPrincipal: "Logística", Status: "Ativo" },
            { IDProfessor: 13, NomeProfessor: "Patrícia Ribeiro", Email: "patricia.ribeiro@siga.com.br", IdiomaPrincipal: "Análise e Desenvolvimento de Sistemas", Status: "Ativo" },
            { IDProfessor: 14, NomeProfessor: "Felipe Mendes", Email: "felipe.mendes@siga.com.br", IdiomaPrincipal: "Design de Mídias Digitais", Status: "Ativo" },
            { IDProfessor: 15, NomeProfessor: "Bruna Dias", Email: "bruna.dias@siga.com.br", IdiomaPrincipal: "Jogos Digitais", Status: "Inativo" },
            { IDProfessor: 16, NomeProfessor: "Guilherme Siqueira", Email: "guilherme.siqueira@siga.com.br", IdiomaPrincipal: "Logística", Status: "Ativo" },
            { IDProfessor: 17, NomeProfessor: "Camila Rocha", Email: "camila.rocha@siga.com.br", IdiomaPrincipal: "Análise e Desenvolvimento de Sistemas", Status: "Ativo" },
            { IDProfessor: 18, NomeProfessor: "Lucas Barros", Email: "lucas.barros@siga.com.br", IdiomaPrincipal: "Design de Mídias Digitais", Status: "Ativo" },
        ];

        // 'currentProfessores': Esta é uma cópia dos dados originais.
        // Usamos esta cópia para aplicar filtros e ordenações, sem alterar 'allProfessores'.
        let currentProfessores = [...allProfessores];
        let currentPage = 1;      // Começamos na primeira página.
        const itemsPerPage = 5;   // Mostraremos 5 professores por página.
        let sortColumn = null;    // A coluna pela qual a tabela está ordenada (nenhuma no início).
        let sortDirection = 'asc'; // A direção da ordenação ('asc' para crescente, 'desc' para decrescente).

        // --- 2. Funções de Renderização e Lógica da Tabela ---

        // 'renderTable()': Esta função é responsável por LIMPAR a tabela e
        // preenchê-la novamente com os dados dos professores (após filtragem, ordenação ou mudança de página).
        function renderTable() {
            tabelaProfessoresBody.innerHTML = ''; // Limpa todo o conteúdo atual do corpo da tabela.

            // Se não houver professores após a filtragem (ex: a pesquisa não encontrou nada):
            if (currentProfessores.length === 0) {
                // Insere uma mensagem na tabela informando que nenhum professor foi encontrado.
                tabelaProfessoresBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum professor encontrado para a pesquisa.</td></tr>';
                renderPagination(0, 1); // Atualiza a paginação para mostrar que não há páginas.
                return; // Sai da função, pois não há mais nada para renderizar.
            }

            // Lógica de Paginação:
            // Calcula qual é o primeiro e o último item da página atual.
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            // Pega apenas os professores que pertencem à página atual.
            const paginatedProfessores = currentProfessores.slice(startIndex, endIndex);

            // Para cada professor na página atual:
            paginatedProfessores.forEach(professor => {
                const row = tabelaProfessoresBody.insertRow(); // Cria uma nova linha na tabela.
                // Insere células (colunas) na linha com os dados do professor.
                row.insertCell(0).textContent = professor.IDProfessor;
                row.insertCell(1).textContent = professor.NomeProfessor;
                row.insertCell(2).textContent = professor.Email;
                row.insertCell(3).textContent = professor.IdiomaPrincipal;
                row.insertCell(4).textContent = professor.Status;
            });

            // Após preencher a tabela, atualiza os controles de paginação.
            renderPagination(currentProfessores.length, currentPage);
        }

        // 'filterProfessores()': Esta função é chamada quando o usuário digita no campo de pesquisa.
        // Ela filtra a lista de professores com base no termo digitado.
        function filterProfessores() {
            // Pega o que foi digitado, converte para minúsculas e remove espaços extras.
            const searchTerm = searchInput.value.toLowerCase().trim();

            // Se o campo de pesquisa estiver vazio:
            if (!searchTerm) {
                // Volta a exibir todos os professores originais.
                currentProfessores = [...allProfessores];
            } else {
                // Filtra os professores: mantém apenas aqueles cujo nome, email ou idioma principal
                // incluem o termo de pesquisa.
                currentProfessores = allProfessores.filter(professor =>
                    professor.NomeProfessor.toLowerCase().includes(searchTerm) ||
                    professor.Email.toLowerCase().includes(searchTerm) ||
                    professor.IdiomaPrincipal.toLowerCase().includes(searchTerm)
                );
            }
            currentPage = 1; // Sempre volta para a primeira página após filtrar.
            sortColumn = null; // Reseta a ordenação (volta ao estado inicial de não ordenado).
            updateSortIcons(); // Atualiza os ícones de ordenação nos cabeçalhos.
            renderTable(); // Desenha a tabela novamente com os dados filtrados.
        }

        // 'sortProfessores(column)': Esta função é chamada quando o usuário clica em um cabeçalho de coluna.
        // Ela ordena a lista de professores com base na coluna clicada.
        function sortProfessores(column) {
            // Se a coluna clicada já for a coluna atual de ordenação:
            if (sortColumn === column) {
                // Apenas inverte a direção da ordenação (de 'asc' para 'desc' ou vice-versa).
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                // Se for uma nova coluna, define como a coluna de ordenação e a direção inicial como crescente.
                sortColumn = column;
                sortDirection = 'asc';
            }

            // Ordena o array 'currentProfessores' usando uma função de comparação.
            // Ela compara os valores da coluna escolhida entre dois professores (a e b).
            currentProfessores.sort((a, b) => {
                const valA = String(a[column]).toLowerCase(); // Pega o valor da coluna, converte para string e minúsculas.
                const valB = String(b[column]).toLowerCase();

                // Compara os valores para ordenar:
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1; // Se A é menor que B, A vem antes (ou depois se for decrescente).
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;  // Se A é maior que B, A vem depois (ou antes se for decrescente).
                return 0; // Se são iguais, a ordem não muda entre eles.
            });
            currentPage = 1; // Volta para a primeira página após ordenar.
            updateSortIcons(); // Atualiza os ícones de ordenação nos cabeçalhos.
            renderTable(); // Desenha a tabela novamente com os dados ordenados.
        }

        // 'updateSortIcons()': Atualiza os pequenos ícones de seta ao lado dos nomes das colunas
        // para mostrar qual coluna está sendo usada para ordenação e em qual direção.
        function updateSortIcons() {
            tableHeaders.forEach(header => {
                const icon = header.querySelector('i'); // Pega o elemento <i> (o ícone de seta).
                if (icon) {
                    // Remove as classes de seta para cima/baixo.
                    icon.classList.remove('fa-sort-up', 'fa-sort-down');
                    // Se este cabeçalho for a coluna de ordenação atual:
                    if (header.dataset.column === sortColumn) {
                        // Adiciona a seta para cima (ascendente) ou para baixo (decrescente).
                        icon.classList.add(sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down');
                    } else {
                        // Se não for a coluna de ordenação, mostra o ícone padrão de "duas setas".
                        icon.classList.add('fa-sort');
                    }
                }
            });
        }

        // 'renderPagination(totalItems, currentPageNum)': Esta função cria e atualiza
        // os botões de paginação (1, 2, 3, Anterior, Próximo) abaixo da tabela.
        function renderPagination(totalItems, currentPageNum) {
            paginationControls.innerHTML = ''; // Limpa os controles de paginação existentes.
            const totalPages = Math.ceil(totalItems / itemsPerPage); // Calcula o número total de páginas.

            // Se houver apenas uma página ou menos, não mostra os controles de paginação.
            if (totalPages <= 1) {
                return;
            }

            // --- Botão "Anterior" ---
            const prevItem = document.createElement('li'); // Cria um item de lista para o botão.
            prevItem.classList.add('page-item'); // Adiciona a classe do Bootstrap para estilo.
            if (currentPageNum === 1) prevItem.classList.add('disabled'); // Desabilita se estiver na primeira página.
            // Define o HTML interno do botão (texto e ícone de seta).
            prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
            // Adiciona um ouvinte de clique: se não for a primeira página, diminui a página atual e re-renderiza.
            prevItem.addEventListener('click', (e) => {
                e.preventDefault(); // Evita que o link # mude a URL.
                if (currentPageNum > 1) {
                    currentPage--;
                    renderTable();
                }
            });
            paginationControls.appendChild(prevItem); // Adiciona o botão à barra de paginação.

            // --- Números das Páginas ---
            for (let i = 1; i <= totalPages; i++) { // Loop para criar um botão para cada número de página.
                const pageItem = document.createElement('li');
                pageItem.classList.add('page-item');
                if (i === currentPageNum) pageItem.classList.add('active'); // Marca a página atual como ativa.
                pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = i; // Define a página atual para a clicada.
                    renderTable(); // Re-renderiza a tabela para a nova página.
                });
                paginationControls.appendChild(pageItem);
            }

            // --- Botão "Próximo" ---
            const nextItem = document.createElement('li');
            nextItem.classList.add('page-item');
            if (currentPageNum === totalPages) nextItem.classList.add('disabled'); // Desabilita se estiver na última página.
            nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
            nextItem.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentPageNum < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });
            paginationControls.appendChild(nextItem);
        }

        // --- 3. Adicionando Ouvintes de Eventos (Event Listeners) ---
        // Estes são os "gatilhos" que fazem nossas funções serem executadas em resposta a ações do usuário.

        // 'searchInput.addEventListener('keyup', filterProfessores)':
        // Quando o usuário solta uma tecla no campo de pesquisa, a função 'filterProfessores' é chamada.
        searchInput.addEventListener('keyup', filterProfessores);

        // 'tableHeaders.forEach(...)' e 'header.addEventListener('click', ...)'
        // Para cada cabeçalho de coluna que pode ser clicado para ordenar:
        tableHeaders.forEach(header => {
            header.style.cursor = 'pointer'; // Muda o cursor para uma mãozinha para indicar que é clicável.
            header.addEventListener('click', () => {
                const column = header.dataset.column; // Pega o nome da coluna do atributo 'data-column'.
                sortProfessores(column); // Chama a função para ordenar a tabela.
            });
        });

        // --- 4. Inicialização da Página (Quando Tudo Está Pronto) ---

        // Simula um atraso de rede (como se estivesse buscando dados do servidor):
        // Isso faz com que a mensagem "Carregando..." apareça por um tempo, simulando uma conexão real.
        loadingDiv.classList.remove('d-none'); // Mostra a div de carregamento.
        await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5 segundos.
        loadingDiv.classList.add('d-none'); // Esconde a div de carregamento.

        // Finalmente, renderiza a tabela pela primeira vez com os dados iniciais.
        renderTable();
    }
});