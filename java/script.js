const API_URL = "https://muri26.pythonanywhere.com"; // minúsculo evita erros
let todosOsLivros = [];
let generoAtual = ""; // NOVO: gênero selecionado na página de recomendações

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
        // Atualiza grid de gênero se estiver visível (botões .btn-genero ou select da página de recomendações)
        const generoAtivo = document.querySelector('.btn-genero.ativo');
        const generoParaAtualizar = generoAtivo ? generoAtivo.dataset.genero : generoAtual;
        if (generoParaAtualizar) buscarPorGenero(generoParaAtualizar);
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
                    <img src="${livro.capa || ''}" class="mini-capa" data-descricao="${escapeHtml(textoDescricao(livro))}"
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

    generoAtual = generoNome;

    // NOVO: busca no servidor os livros do gênero, já ordenados do mais pego para o menos pego
    let livros = [];
    try {
        const resp = await fetch(`${API_URL}/recomendar?genero=${encodeURIComponent(generoNome)}&limite=5`);
        if (!resp.ok) throw new Error("Erro HTTP: " + resp.status);
        livros = (await resp.json()).filter(l => l && l.titulo);
    } catch (err) {
        console.error("Erro ao buscar recomendações:", err);
        grid.innerHTML = '<p class="msg-ajuda">❌ Erro ao carregar as recomendações.</p>';
        return;
    }

    // Se o usuário trocou de gênero enquanto carregava, ignora esta resposta
    if (generoAtual !== generoNome) return;

    grid.innerHTML = '';

    if (livros.length === 0) {
        grid.innerHTML = '<p class="msg-ajuda">Ainda não há recomendações para este gênero: nenhum livro dele foi pego até agora.</p>';
        return;
    }

    const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));

    livros.forEach(livro => {
        const { acaoHtml } = montarBotoes(livro, sessao, true);
        grid.innerHTML += `
            <div class="card-livro-rec">
                <img src="${livro.capa || ''}" class="capa-rec" data-descricao="${escapeHtml(textoDescricao(livro))}"
                     onerror="this.src='https://via.placeholder.com/150x220?text=Sem+Capa'">
                <div class="info-rec">
                    <h3 title="${livro.titulo}">${livro.titulo}</h3>
                    <p style="color:#aaa; font-size:13px; margin:0;">${livro.autor}</p>
                    <p style="color:#ff3769; font-size:12px; margin:4px 0 0;">📖 Pego ${livro.vezes_pego || 0} ${(livro.vezes_pego || 0) === 1 ? 'vez' : 'vezes'}</p>
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
// 8. DESCRIÇÃO DO LIVRO AO PASSAR O MOUSE NA CAPA
// Funciona em qualquer <img> com a classe .mini-capa (página inicial)
// ou .capa-rec (página de recomendações) que tenha data-descricao.
// ============================================================
function escapeHtml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function textoDescricao(livro) {
    const d = String(livro.descricao || '').trim();
    return d && d !== 'None' && d !== 'null' ? d : 'Este livro ainda não tem descrição.';
}

function iniciarTooltipDescricao() {
    // Estilo do balão injetado aqui para não precisar mexer nos arquivos .css
    const estilo = document.createElement('style');
    estilo.textContent = `
        .mini-capa[data-descricao], .capa-rec[data-descricao] { cursor: help; }
        #tooltip-descricao {
            position: fixed; z-index: 9999; display: none;
            max-width: 280px; padding: 10px 12px;
            background: #1e1e1e; color: #eee;
            border: 1px solid #ff3769; border-radius: 8px;
            font: 13px/1.4 'Varela Round', sans-serif;
            box-shadow: 0 4px 14px rgba(0,0,0,.5);
            pointer-events: none; white-space: pre-line;
        }
    `;
    document.head.appendChild(estilo);

    const balao = document.createElement('div');
    balao.id = 'tooltip-descricao';
    document.body.appendChild(balao);

    const capaDe = (alvo) =>
        alvo && alvo.closest ? alvo.closest('.mini-capa[data-descricao], .capa-rec[data-descricao]') : null;

    function posicionar(evento) {
        const margem = 14;
        let x = evento.clientX + margem;
        let y = evento.clientY + margem;
        // Não deixa o balão sair da tela
        if (x + balao.offsetWidth > window.innerWidth - 8) x = evento.clientX - balao.offsetWidth - margem;
        if (y + balao.offsetHeight > window.innerHeight - 8) y = evento.clientY - balao.offsetHeight - margem;
        balao.style.left = Math.max(8, x) + 'px';
        balao.style.top = Math.max(8, y) + 'px';
    }

    // Celular/tablet: telas sem "passar o mouse" usam toque
    const semHover = () =>
        !!(window.matchMedia && window.matchMedia('(hover: none)').matches);

    // Delegação de eventos: continua funcionando mesmo quando a lista é redesenhada
    document.addEventListener('mouseover', (e) => {
        if (semHover()) return;   // no celular o toque já dispara um mouseover falso
        const capa = capaDe(e.target);
        if (!capa) return;
        balao.textContent = capa.dataset.descricao;   // textContent: nunca interpreta HTML
        balao.style.display = 'block';
        posicionar(e);
    });
    document.addEventListener('mousemove', (e) => {
        if (!semHover() && balao.style.display === 'block') posicionar(e);
    });
    document.addEventListener('mouseout', (e) => {
        if (!semHover() && capaDe(e.target)) balao.style.display = 'none';
    });

    // Toque: tocar na capa abre a descrição (de novo na mesma capa fecha);
    // tocar em qualquer outro lugar fecha.
    let capaAberta = null;
    document.addEventListener('click', (e) => {
        if (!semHover()) return;
        const capa = capaDe(e.target);

        if (!capa || capa === capaAberta) {
            balao.style.display = 'none';
            capaAberta = null;
            return;
        }

        capaAberta = capa;
        balao.textContent = capa.dataset.descricao;
        balao.style.display = 'block';

        // Posiciona logo abaixo da capa (ou acima, se não couber), dentro da tela
        const r = capa.getBoundingClientRect();
        let x = r.left + r.width / 2 - balao.offsetWidth / 2;
        let y = r.bottom + 8;
        if (y + balao.offsetHeight > window.innerHeight - 8) y = r.top - balao.offsetHeight - 8;
        x = Math.min(Math.max(8, x), window.innerWidth - balao.offsetWidth - 8);
        balao.style.left = x + 'px';
        balao.style.top = Math.max(8, y) + 'px';
    });
}

// ============================================================
// 9. INICIALIZAÇÃO
// ============================================================
window.onload = () => {
    atualizarDashboard();
    listarLivros();
    iniciarTooltipDescricao();

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
