const API_URL = "https://Muri26.pythonanywhere.com";

// --- 1. LIMPEZA E FILTRAGEM (Item 3) ---
// Remove duplicados e livros com informações faltando antes de exibir
// Garanta que esta função esteja assim no seu script.js
function filtrarLivros(lista) {
    const vistos = new Set();
    return lista.filter(livro => {
        // Se a linha estiver vazia ou sem título, pula ela em vez de travar o site
        if (!livro || !livro.titulo) return false; 

        const tituloTexto = String(livro.titulo).toLowerCase();
        const eDuplicado = vistos.has(tituloTexto);
        vistos.add(tituloTexto);

        return !eDuplicado;
    });
}
// --- 2. EXIBIÇÃO DINÂMICA DE CARDS (Item 2) ---
function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(response => response.json())
    .then(dadosBrutos => {
        const livros = filtrarLivros(dadosBrutos);
        const container = document.getElementById('lista-livros');
        if (!container) return;

        container.innerHTML = "";
        
        // Recupera a sessão do usuário logado
        const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

        livros.forEach(livro => {
            let acaoHtml = "";

            // Lógica de botões baseada no status do livro e do usuário
            if (sessao) {
                const donoId = String(livro.usuario_id); // ID de quem pegou (do Excel)
                const meuId = String(sessao.id);        // Meu ID (do JSONBin)

                if (!livro.usuario_id || donoId === "None" || donoId === "null") {
                    // Livro disponível
                    acaoHtml = `<button class="btn-pegar" onclick="pegarLivro(${livro.id})">Pegar</button>`;
                } else if (donoId === meuId) {
                    // O livro está comigo
                    acaoHtml = `<button class="btn-pegar" style="background:orange" onclick="devolverLivro(${livro.id})">Devolver</button>`;
                } else {
                    // O livro está com outro usuário
                    acaoHtml = `<span class="indisponivel">Indisponível</span>`;
                }
            } else {
                acaoHtml = `<p style="font-size:11px; color:#888;">Faça login para reservar</p>`;
            }

            container.innerHTML += `
                <div class="card-livro">
                    <div class="capa-container">
                        <img src="${livro.capa}" alt="Capa" onerror="this.src='https://via.placeholder.com/150x220?text=Sem+Capa'">
                    </div>
                    <div class="card-detalhes">
                        <h3>${livro.titulo}</h3>
                        <p class="autor"><strong>Autor:</strong> ${livro.autor}</p>
                        <div class="tags">
                            <span class="genero-tag">${livro.generol}</span>
                            <span class="qtd-tag">Qtd: ${livro.quantidade}</span>
                        </div>
                        <p class="descricao">${livro.descricao}</p>
                        <div class="card-footer">
                            ${acaoHtml}
                        </div>
                    </div>
                </div>
            `;
        });
    })
    .catch(error => console.error("Erro ao listar livros:", error));
}

// --- 3. AÇÕES DE EMPRÉSTIMO (Item 2) ---
function pegarLivro(idLivro) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    
    fetch(`${API_URL}/emprestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            livro_id: idLivro,
            usuario_id: sessao.id
        })
    })
    .then(res => res.json())
    .then(() => {
        alert("📚 Livro reservado!");
        listarLivros(); // Atualiza a lista na tela
    })
    .catch(err => alert("Erro ao processar empréstimo."));
}

function devolverLivro(idLivro) {
    fetch(`${API_URL}/devolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro })
    })
    .then(res => res.json())
    .then(() => {
        alert("✅ Livro devolvido com sucesso!");
        listarLivros();
    })
    .catch(err => alert("Erro ao devolver livro."));
}

// --- 4. CONTROLE DA BIBLIOTECÁRIA E SESSÃO (Item 1 e 4) ---
function cadastrarLivro() {
    const livro = {
        id: Date.now(),
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        capa: document.getElementById('capa').value,
        descricao: document.getElementById('descricao').value,
        generol: document.getElementById('generol').value,
        quantidade: document.getElementById('quantidade').value
    };

    if (!livro.titulo || !livro.autor) return alert("Título e Autor são obrigatórios.");

    fetch(`${API_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livro)
    })
    .then(() => {
        alert("Livro cadastrado!");
        document.getElementById('form-livro').reset();
        listarLivros();
    });
}
// 1. Crie esta variável no topo do script para guardar a lista original
let todosOsLivros = []; 

function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(response => response.json())
    .then(dadosBrutos => {
        // Guardamos a lista limpa na nossa variável global
        todosOsLivros = filtrarLivros(dadosBrutos); 
        
        // Renderizamos a lista completa pela primeira vez
        renderizarCards(todosOsLivros); 
    })
    .catch(error => console.error("Erro ao listar livros:", error));
}

// 2. Nova função para filtrar enquanto o usuário digita
function pesquisarLivros() {
    const termo = document.getElementById('input-pesquisa').value.toLowerCase();
    
    // Filtra a lista original baseada no título ou autor
    const livrosFiltrados = todosOsLivros.filter(livro => {
        return livro.titulo.toLowerCase().includes(termo) || 
               livro.autor.toLowerCase().includes(termo);
    });

    // Desenha apenas os livros que passaram no filtro
    renderizarCards(livrosFiltrados);
}

// 3. Criamos uma função só para desenhar os cards (para não repetir código)
function renderizarCards(lista) {
    const container = document.getElementById('lista-livros');
    if (!container) return;
    container.innerHTML = "";

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    lista.forEach(livro => {
        // ... (Aqui você mantém toda aquela lógica de botões Pegar/Devolver que já fizemos) ...
        // (Use o código do card que te mandei na última mensagem completa)
    });
}

function atualizarDashboard() {
    const sessao = localStorage.getItem('usuarioLogado');
    const painelAdmin = document.getElementById('painel-admin');
    const infoLogin = document.getElementById('info-login');

    if (sessao) {
        const usuario = JSON.parse(sessao);
        
        // Exibe saudação e botão sair
        if (infoLogin) {
            infoLogin.innerHTML = `
                <span>Olá, <strong>${usuario.nome}</strong></span>
                <button onclick="fazerLogout()" class="btn-pegar" style="padding:2px 8px; font-size:12px; margin-left:10px;">Sair</button>
            `;
        }

        // Libera painel de cadastro se for admin
        if (usuario.tipo === 'admin' && painelAdmin) {
            painelAdmin.style.display = 'block';
        }
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.reload();
}

// --- 5. INICIALIZAÇÃO ---
window.onload = () => {
    atualizarDashboard();
    listarLivros();
};
