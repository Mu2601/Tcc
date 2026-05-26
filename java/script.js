const API_URL = "https://muri26.pythonanywhere.com"; // minúsculo evita erros
let todosOsLivros = [];

// ============================================================
// 1. LOGIN E SESSÃO
// ============================================================
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
    const infoLogin = document.getElementById('info-login') || document.getElementById('dashboard-header');

    if (sessao && infoLogin) {
        const usuario = JSON.parse(sessao);
        infoLogin.innerHTML = `
            <span>Olá, <strong>${usuario.nome}</strong></span>
            <button onclick="fazerLogout()" style="padding:4px 10px; margin-left:10px; background:#ff4757; color:white; border:none; border-radius:4px; cursor:pointer; font-size:13px;">Sair</button>
        `;
        if (usuario.tipo === 'admin' && painelAdmin) {
            painelAdmin.style.display = 'block';
        }
    } else if (infoLogin) {
        infoLogin.innerHTML = `<a href="login.html" class="btn-pegar">Entrar no Sistema</a>`;
    }
}

// ============================================================
// 2. CADASTRO DE LIVRO (ADMIN)
// ============================================================
function cadastrarLivro() {
    const campos = ['titulo', 'autor', 'capa', 'descricao', 'generol', 'quantidade'];
    const valores = {};
    for (const campo of campos) {
        const el = document.getElementById(campo);
        if (el) valores[campo] = el.value;
    }

    if (!valores.titulo || !valores.autor) {
        alert("Título e Autor são obrigatórios!");
        return;
    }

    const livro = { id: Date.now(), ...valores };

    fetch(`${API_URL}/cadastrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(livro)
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.success) {
            alert("📚 Livro cadastrado com sucesso!");
            const form = document.getElementById('form-livro');
            if (form) form.reset();
            listarLivros();
        } else {
            alert("Erro: " + (dados.message || "Tente novamente."));
        }
    })
    .catch(err => {
        console.error("Erro ao cadastrar:", err);
        alert("Erro de conexão com o servidor.");
    });
}

// ============================================================
// 3. LISTAGEM E BUSCA
// ============================================================
function listarLivros() {
    const tbody = document.getElementById('lista-livros-tbody');

    // Mostra mensagem de carregando
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#aaa;">Carregando livros...</td></tr>`;

    fetch(`${API_URL}/listar`)
    .then(res => {
        if (!res.ok) throw new Error("Erro HTTP: " + res.status);
        return res.json();
    })
    .then(dadosBrutos => {
        todosOsLivros = dadosBrutos.filter(l => l && l.titulo);
        if (tbody) renderizarLivros(todosOsLivros);
        // Atualiza grid de gênero se estiver visível
        const generoAtivo = document.querySelector('.btn-genero.ativo');
        if (generoAtivo) buscarPorGenero(generoAtivo.dataset.genero);
    })
    .catch(err => {
        console.error("Erro ao listar livros:", err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ff4757;">❌ Erro ao carregar. Verifique o console (F12).</td></tr>`;
    });
}

function filtrarLivros() {
    const input = document.getElementById('pesquisar-input');
    if (!input) return;
    const termo = input.value.toLowerCase();
    const filtrados = todosOsLivros.filter(livro =>
        String(livro.titulo || "").toLowerCase().includes(termo) ||
        String(livro.autor || "").toLowerCase().includes(termo) ||
        String(livro.generol || "").toLowerCase().includes(termo)
    );
    renderizarLivros(filtrados);
}

// ============================================================
// 4. RENDERIZAÇÃO DA TABELA
// ============================================================
function renderizarLivros(lista) {
    const tbody = document.getElementById('lista-livros-tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    if (lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#aaa; padding:20px;">Nenhum livro encontrado.</td></tr>`;
        return;
    }

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    lista.forEach(livro => {
        const { acaoHtml, disponivel } = montarBotoes(livro, sessao, false);

        tbody.innerHTML += `
            <tr>
                <td>
                    <img src="${livro.capa || ''}" class="mini-capa" 
                         onerror="this.src='https://via.placeholder.com/55x80?text=Capa'">
                </td>
                <td style="font-weight:bold; color:#fff; font-size:1.05rem;">
                    ${livro.titulo}
                </td>
                <td style="color:#bbb; font-size:0.95rem;">
                    ${livro.autor}
                </td>
                <td>
                    <span class="tag-genero">${livro.generol || 'Geral'}</span>
                </td>
                <td style="text-align:center;">
                    ${acaoHtml}
                </td>
            </tr>
        `;
    });
}

// ============================================================
// 5. RECOMENDAÇÃO POR GÊNERO
// ============================================================
async function buscarPorGenero(generoNome) {
    if (!generoNome) return;
    const grid = document.getElementById('grid-genero');
    if (!grid) return;

    grid.innerHTML = '<p class="msg-ajuda">🔍 Buscando as melhores leituras...</p>';

    // Filtra por gênero
    let livros = todosOsLivros.filter(l =>
        String(l.generol || "").toLowerCase() === generoNome.toLowerCase()
    );

    // Embaralha aleatoriamente e pega no máximo 10
    livros = livros
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    grid.innerHTML = '';

    if (livros.length === 0) {
        grid.innerHTML = '<p class="msg-ajuda">Nenhum livro deste gênero no acervo no momento.</p>';
        return;
    }

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    livros.forEach(livro => {
        const { acaoHtml } = montarBotoes(livro, sessao, true);
        grid.innerHTML += `
            <div class="card-livro-rec">
                <img src="${livro.capa || ''}" class="capa-rec" 
                     onerror="this.src='https://via.placeholder.com/150x220?text=Sem+Capa'">
                <div class="info-rec">
                    <h3 title="${livro.titulo}">${livro.titulo}</h3>
                    <p style="color:#aaa; font-size:13px; margin:0;">${livro.autor}</p>
                </div>
                ${acaoHtml}
            </div>
        `;
    });
}
// ============================================================
// 6. HELPER — MONTA BOTÕES (evita repetição de código)
// ============================================================
function montarBotoes(livro, sessao, modoCard) {
    const listaIds = String(livro.usuario_id || "")
        .split(',')
        .map(id => id.split('.')[0].trim())
        .filter(id => id && id !== "None" && id !== "null");

    const qtdTotal = parseInt(livro.quantidade) || 0;
    const disponivel = qtdTotal - listaIds.length;

    let acaoHtml = "";

    if (sessao) {
        const meuId = String(sessao.id);

        if (listaIds.includes(meuId)) {
            acaoHtml = modoCard
                ? `<button class="btn-login" style="background:#ff4757;color:white;padding:8px 14px;border:none;border-radius:6px;cursor:pointer;" onclick="devolverLivro(${livro.id})">Devolver</button>`
                : `<button class="btn-acao btn-devolver" onclick="devolverLivro(${livro.id})">Devolver</button>`;
        } else if (disponivel > 0) {
            acaoHtml = modoCard
                ? `<button class="btn-login" style="background:#00c853;color:black;padding:8px 14px;border:none;border-radius:6px;cursor:pointer;" onclick="pegarLivro(${livro.id})">Pegar (${disponivel})</button>`
                : `<button class="btn-acao btn-pegar" onclick="pegarLivro(${livro.id})">Pegar (${disponivel})</button>`;
        } else {
            acaoHtml = `<span class="txt-esgotado" style="color:#ff4757;font-weight:bold;">Esgotado</span>`;
        }

        if (sessao.tipo === 'admin') {
            acaoHtml += `<button class="btn-acao btn-excluir" title="Excluir livro" onclick="excluirLivro(${livro.id})">🗑️</button>`;
        }
    } else {
        acaoHtml = `<span style="color:#aaa;font-size:12px;">Faça login para reservar</span>`;
    }

    return { acaoHtml, disponivel };
}

// ============================================================
// 7. AÇÕES DE EMPRÉSTIMO
// ============================================================
function pegarLivro(idLivro) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!sessao) return alert("Faça login para pegar livros.");

    fetch(`${API_URL}/emprestar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro, usuario_id: sessao.id })
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.success) {
            alert("📚 Livro reservado com sucesso!");
            listarLivros();
        } else {
            alert(dados.message || "Não foi possível reservar.");
        }
    })
    .catch(() => alert("Erro de conexão ao reservar."));
}

function devolverLivro(idLivro) {
    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!sessao) return alert("Faça login para devolver.");

    fetch(`${API_URL}/devolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro, usuario_id: sessao.id })
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.success) {
            alert("✅ Livro devolvido com sucesso!");
            listarLivros();
        } else {
            alert(dados.message || "Erro ao devolver.");
        }
    })
    .catch(() => alert("Erro de conexão ao devolver."));
}

function excluirLivro(idLivro) {
    if (!confirm("Tem certeza que deseja excluir este livro do acervo?")) return;

    fetch(`${API_URL}/excluir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livro_id: idLivro })
    })
    .then(res => res.json())
    .then(dados => {
        if (dados.success) {
            alert("🗑️ Livro removido do acervo!");
            listarLivros();
        } else {
            alert(dados.message || "Erro ao excluir.");
        }
    })
    .catch(() => alert("Erro de conexão ao excluir."));
}

// ============================================================
// 8. INICIALIZAÇÃO
// ============================================================
window.onload = () => {
    atualizarDashboard();
    listarLivros();

    // Pesquisa enquanto digita
    const inputPesquisa = document.getElementById('pesquisar-input');
    if (inputPesquisa) {
        inputPesquisa.addEventListener('keyup', filtrarLivros);
    }

    // Botão lupa (caso exista)
    const botaoLupa = document.getElementById('search-button');
    if (botaoLupa) {
        botaoLupa.addEventListener('click', filtrarLivros);
    }
};
