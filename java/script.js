const API_URL = "https://Muri26.pythonanywhere.com";
let todosOsLivros = []; // Memória local para a busca funcionar

// --- 1. FILTRAGEM DE SEGURANÇA ---
function filtrarLivros(lista) {
    const vistos = new Set();
    return lista.filter(livro => {
        if (!livro || !livro.titulo) return false;
        const tituloTexto = String(livro.titulo).toLowerCase();
        const eDuplicado = vistos.has(tituloTexto);
        vistos.add(tituloTexto);
        return !eDuplicado;
    });
}

// --- 2. LISTAGEM E BUSCA ---
function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(res => res.json())
    .then(dadosBrutos => {
        todosOsLivros = filtrarLivros(dadosBrutos);
        renderizarCards(todosOsLivros);
    })
    .catch(error => console.error("Erro ao listar:", error));
}

function pesquisarLivros() {
    const input = document.getElementById('search-input');
    if (!input) return;
    const termo = input.value.toLowerCase();

    const filtrados = todosOsLivros.filter(livro => {
        return livro.titulo.toLowerCase().includes(termo) ||
               livro.autor.toLowerCase().includes(termo) ||
               String(livro.generol).toLowerCase().includes(termo);
    });
    renderizarCards(filtrados);
}

// --- 3. RENDERIZAÇÃO DOS CARDS (Lógica de Múltiplas Unidades) ---
function renderizarCards(lista) {
    const container = document.getElementById('lista-livros');
    if (!container) return;
    container.innerHTML = "";

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    lista.forEach(livro => {
        let acaoHtml = "";
        
        // Transformamos a string de IDs do Excel em uma lista real de IDs
        // Ex: "10,25" vira ["10", "25"]
        const listaIdsBorrowers = String(livro.usuario_id || "")
            .split(',')
            .map(id => id.trim())
            .filter(id => id !== "" && id !== "None" && id !== "null");

        const qtdTotal = parseInt(livro.quantidade) || 0;
        const qtdEmprestada = listaIdsBorrowers.length;
        const qtdDisponivel = qtdTotal - qtdEmprestada;

        if (sessao) {
            const meuId = String(sessao.id);
            const euEstouComEle = listaIdsBorrowers.includes(meuId);

            // LOGICA DOS BOTÕES
            if (euEstouComEle) {
                // Se o ID do usuário logado está na lista, ele vê "Devolver"
                acaoHtml = `<button class="btn-pegar" style="background:orange" onclick="devolverLivro(${livro.id})">Devolver</button>`;
            } else if (qtdDisponivel > 0) {
                // Se tem estoque e ele não pegou, ele vê "Pegar"
                acaoHtml = `<button class="btn-pegar" onclick="pegarLivro(${livro.id})">Pegar (${qtdDisponivel} un.)</button>`;
            } else {
                // Se o estoque acabou
                acaoHtml = `<span class="indisponivel">Esgotado</span>`;
            }

            // OPÇÃO 1: Botão de Excluir (Só para Admin)
            if (sessao.tipo === 'admin') {
                acaoHtml += `<button onclick="excluirLivro(${livro.id})" style="background:red; margin-left:8px; padding: 5px 10px;" class="btn-pegar">🗑️</button>`;
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
                        <span class="qtd-tag">Total: ${qtdTotal}</span>
                    </div>
                    <p class="descricao">${livro.descricao}</p>
                    <div class="card-footer">${acaoHtml}</div>
                </div>
            </div>
        `;
    });
}

// --- 4. AÇÕES (Pegar, Devolver, Excluir) ---
function pegarLivro(idLivro) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    fetch(`${API_URL}/emprestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro, usuario_id: sessao.id })
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.success) {
            alert("📚 Livro reservado!");
            listarLivros();
        } else {
            alert(dados.message || "Erro ao pegar livro.");
        }
    });
}

function devolverLivro(idLivro) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    fetch(`${API_URL}/devolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro, usuario_id: sessao.id })
    })
    .then(() => {
        alert("✅ Livro devolvido!");
        listarLivros();
    });
}

function excluirLivro(idLivro) {
    if (confirm("Tem certeza que deseja excluir este livro do acervo?")) {
        fetch(`${API_URL}/excluir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ livro_id: idLivro })
        })
        .then(() => {
            alert("🗑️ Livro removido!");
            listarLivros();
        });
    }
}

// --- 5. CADASTRO E DASHBOARD ---
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

    if (!livro.titulo || !livro.autor) return alert("Preencha título e autor.");

    fetch(`${API_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livro)
    }).then(() => {
        alert("Livro cadastrado!");
        document.getElementById('form-livro').reset();
        listarLivros();
    });
}

function atualizarDashboard() {
    const sessao = localStorage.getItem('usuarioLogado');
    const painelAdmin = document.getElementById('painel-admin');
    const infoLogin = document.getElementById('info-login');

    if (sessao) {
        const usuario = JSON.parse(sessao);
        if (infoLogin) {
            infoLogin.innerHTML = `
                <span>Olá, <strong>${usuario.nome}</strong></span>
                <button onclick="fazerLogout()" class="btn-pegar" style="padding:2px 8px; font-size:12px; margin-left:10px;">Sair</button>
            `;
        }
        if (usuario.tipo === 'admin' && painelAdmin) {
            painelAdmin.style.display = 'block';
        }
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.reload();
}

// --- 6. INICIALIZAÇÃO ---
window.onload = () => {
    atualizarDashboard();
    listarLivros();

    const inputPesquisa = document.getElementById('search-input');
    if (inputPesquisa) inputPesquisa.addEventListener('keyup', pesquisarLivros);

    const botaoLupa = document.getElementById('search-button');
    if (botaoLupa) botaoLupa.addEventListener('click', pesquisarLivros);
};
