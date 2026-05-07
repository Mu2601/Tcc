const API_URL = "https://Muri26.pythonanywhere.com";
let todosOsLivros = []; 

// --- 1. LOGIN E SESSÃO ---
function realizarLogin(usuario, senha) {
    let dadosUsuario = null;
    if (usuario === "admin" && senha === "123") {
        dadosUsuario = { nome: "Bibliotecária", tipo: "admin", id: "999" };
    } else if (usuario === "leitor" && senha === "123") {
        dadosUsuario = { nome: "Miroki", tipo: "leitor", id: "101" };
    }

    if (dadosUsuario) {
        localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));
        alert(`Bem-vindo(a), ${dadosUsuario.nome}!`);
        window.location.href = "index.html"; 
    } else {
        alert("Usuário ou senha incorretos.");
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = "login.html";
}

function atualizarDashboard() {
    const sessao = localStorage.getItem('usuarioLogado');
    const painelAdmin = document.getElementById('painel-admin');
    const infoLogin = document.getElementById('dashboard-header') || document.getElementById('info-login');

    if (sessao && infoLogin) {
        const usuario = JSON.parse(sessao);
        infoLogin.innerHTML = `
            <span>Olá, <strong>${usuario.nome}</strong></span>
            <button onclick="fazerLogout()" style="padding:2px 8px; margin-left:10px; background:#ff4757; color:white; border:none; border-radius:4px; cursor:pointer;">Sair</button>
        `;
        if (usuario.tipo === 'admin' && painelAdmin) {
            painelAdmin.style.display = 'block';
        }
    }
}

// --- 2. GESTÃO DE LIVROS (CADASTRO) ---
function cadastrarLivro() {
    const campoTitulo = document.getElementById('titulo');
    const campoAutor = document.getElementById('autor');
    const campoCapa = document.getElementById('capa');
    const campoDesc = document.getElementById('descricao');
    const campoGen = document.getElementById('generol');
    const campoQtd = document.getElementById('quantidade');

    if (!campoTitulo || !campoAutor) return;

    const livro = {
        id: Date.now(),
        titulo: campoTitulo.value,
        autor: campoAutor.value,
        capa: campoCapa.value,
        descricao: campoDesc.value,
        generol: campoGen.value,
        quantidade: campoQtd.value
    };

    if (!livro.titulo || !livro.autor) {
        alert("Título e Autor são obrigatórios!");
        return;
    }

    fetch(`${API_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livro)
    })
    .then(res => res.json())
    .then(dados => {
        alert("📚 Livro cadastrado com sucesso!");
        const form = document.getElementById('form-livro');
        if(form) form.reset(); 
        listarLivros(); // Atualiza a lista após cadastrar
    })
    .catch(err => console.error("Erro na API:", err));
}

// --- 3. LISTAGEM E BUSCA ---
function listarLivros() {
    fetch(`${API_URL}/listar`)
    .then(res => res.json())
    .then(dadosBrutos => {
        todosOsLivros = dadosBrutos.filter(l => l && l.titulo); 
        renderizarCards(todosOsLivros);
    })
    .catch(err => console.error("Erro ao listar:", err));
}

// FUNÇÃO DE BUSCA (FILTRO)
function filtrarLivros() {
    const termo = document.getElementById('pesquisar-input').value.toLowerCase();
    const filtrados = todosOsLivros.filter(livro => 
        livro.titulo.toLowerCase().includes(termo) || 
        livro.autor.toLowerCase().includes(termo)
    );
    renderizarCards(filtrados);
}

// ... (mantenha o topo do arquivo com as variáveis e funções de login)

function renderizarCards(lista) {
    const container = document.getElementById('lista-livros');
    if (!container) return;
    container.innerHTML = "";

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    lista.forEach(livro => {
        let acaoHtml = "";
        
        // Lógica de IDs de usuários (corrigindo possíveis retornos nulos do Excel)
        const listaIds = String(livro.usuario_id || "").split(',')
            .map(id => id.trim())
            .filter(id => id && id !== "None" && id !== "null");
            
        const disponivel = (parseInt(livro.quantidade) || 0) - listaIds.length;

        if (sessao) {
            const meuId = String(sessao.id);
            if (listaIds.includes(meuId)) {
                acaoHtml = `<button class="btn-pegar" style="background: #e67e22;" onclick="devolverLivro(${livro.id})">Devolver</button>`;
            } else if (disponivel > 0) {
                acaoHtml = `<button class="btn-pegar" onclick="pegarLivro(${livro.id})">Pegar (${disponivel} un.)</button>`;
            } else {
                acaoHtml = `<span style="color: #ff1869; font-weight: bold; margin-top: 10px;">Esgotado</span>`;
            }

            // Botão excluir para admin (estilizado para não quebrar a pilha)
            if (sessao.tipo === 'admin') {
                acaoHtml += `<button onclick="excluirLivro(${livro.id})" style="background:none; border:none; color:#ff1869; cursor:pointer; margin-top:10px; font-size:1.2rem;">🗑️ Excluir</button>`;
            }
        }

        // MONTAGEM DO HTML (respeitando as classes do seu novo CSS)
        container.innerHTML += `
            <div class="card-livro" style="background: #111; width: 240px; border-radius: 12px; overflow: hidden; border: 1px solid #333; display: flex; flex-direction: column; transition: 0.3s;">
                <div class="capa-container" style="width: 100%; height: 320px; overflow: hidden;">
                    <img src="${livro.capa}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/240x320?text=Sem+Capa'">
                </div>
                <div class="card-detalhes" style="padding: 15px; display: flex; flex-direction: column; text-align: center;">
                    <span style="color: #0091ff; font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">${livro.generol || 'Geral'}</span>
                    <h3 style="font-size: 1.1rem; margin: 5px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${livro.titulo}</h3>
                    <p style="font-size: 0.85rem; color: #888; margin-bottom: 10px;">${livro.autor}</p>
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        ${acaoHtml}
                    </div>
                </div>
            </div>
        `;
    });
}

// Inicialização corrigida para o seu novo layout
document.addEventListener('DOMContentLoaded', () => {
    atualizarDashboard();
    listarLivros();

    const inputBusca = document.getElementById('pesquisar-input');
    if (inputBusca) {
        inputBusca.addEventListener('input', filtrarLivros);
    }
});

// ... (mantenha o resto das funções de empréstimo/devolução)
// --- 4. AÇÕES DE EMPRÉSTIMO ---
function pegarLivro(id) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    if(!sessao) return alert("Faça login para pegar livros.");
    
    fetch(`${API_URL}/emprestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: id, usuario_id: sessao.id })
    }).then(() => listarLivros());
}

function devolverLivro(id) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    fetch(`${API_URL}/devolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: id, usuario_id: sessao.id })
    }).then(() => listarLivros());
}

function excluirLivro(id) {
    if (!confirm("Excluir este livro?")) return;
    fetch(`${API_URL}/excluir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: id })
    }).then(() => listarLivros());
}

// --- 5. INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    atualizarDashboard();
    listarLivros();
    
    // Adiciona evento de busca se o input existir
    const inputBusca = document.getElementById('pesquisar-input');
    if(inputBusca) {
        inputBusca.addEventListener('input', filtrarLivros);
    }
});
