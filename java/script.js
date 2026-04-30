const API_URL = "https://Muri26.pythonanywhere.com";
let todosOsLivros = [];

// --- LIMPEZA DE DUPLICADOS ---
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

// --- BUSCA E LISTA OS LIVROS ---
function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(response => response.json())
    .then(dadosBrutos => {
        todosOsLivros = filtrarLivros(dadosBrutos);
        renderizarCards(todosOsLivros);
    })
    .catch(error => console.error("Erro ao listar livros:", error));
}

// --- PESQUISA EM TEMPO REAL ---
function pesquisarLivros() {
    const termo = document.getElementById('input-pesquisa').value.toLowerCase();
    const livrosFiltrados = todosOsLivros.filter(livro => {
        return livro.titulo.toLowerCase().includes(termo) ||
               livro.autor.toLowerCase().includes(termo);
    });
    renderizarCards(livrosFiltrados);
}

// --- DESENHA OS CARDS ---
function renderizarCards(lista) {
    const container = document.getElementById('lista-livros');
    if (!container) return;
    container.innerHTML = "";

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    lista.forEach(livro => {
        let acaoHtml = "";

        if (sessao) {
            const donoId = String(livro.usuario_id);
            const meuId = String(sessao.id);

            if (!livro.usuario_id || donoId === "None" || donoId === "null") {
                acaoHtml = `<button class="btn-pegar" onclick="pegarLivro(${livro.id})">Pegar</button>`;
            } else if (donoId === meuId) {
                acaoHtml = `<button class="btn-pegar" style="background:orange" onclick="devolverLivro(${livro.id})">Devolver</button>`;
            } else {
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
                    <div class="card-footer">${acaoHtml}</div>
                </div>
            </div>
        `;
    });
}

// --- EMPRÉSTIMO ---
function pegarLivro(idLivro) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    fetch(`${API_URL}/emprestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro, usuario_id: sessao.id })
    })
    .then(res => res.json())
    .then(() => { alert("📚 Livro reservado!"); listarLivros(); })
    .catch(() => alert("Erro ao processar empréstimo."));
}

function devolverLivro(idLivro) {
    fetch(`${API_URL}/devolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro })
    })
    .then(res => res.json())
    .then(() => { alert("✅ Livro devolvido!"); listarLivros(); })
    .catch(() => alert("Erro ao devolver livro."));
}

// --- CADASTRO DE LIVRO (ADMIN) ---
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

// --- SESSÃO E DASHBOARD ---
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

// --- INICIALIZAÇÃO ---
window.onload = () => {
    atualizarDashboard();
    listarLivros();
};
