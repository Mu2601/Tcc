// Substitua pela sua URL atual do Google Apps Script
const urlGoogle = 'https://script.google.com/macros/s/AKfycbxzsW1BIV_VjjOWl_6QVlSyw9MHXTp-TfELJXE2eGi3AV6mDWsKjiReRjA4fB6EH98/exec';
const planilhalivros = 'https://corsproxy.io/?url=' + encodeURIComponent(urlGoogle);

// FUNÇÃO PARA CARREGAR E EXIBIR OS LIVROS
async function Livros() {
    const lista = document.getElementById('book-list');
    if (!lista) return;

    try {
        lista.innerHTML = '<p style="color: white;">Carregando biblioteca...</p>';
        const resposta = await fetch(planilhalivros);
        const biblioteca = await resposta.json();

        lista.innerHTML = ''; 

        biblioteca.forEach(livro => {
            const item = document.createElement('li');
            item.className = 'book-item';
            
            // Mapeamento exato baseado na sua planilha
            let titulo = livro.titulo || "Sem título";
            let autor = livro.autor || "Autor desconhecido";
            let capa = livro.capa || "https://via.placeholder.com/100x150?text=Sem+Capa";
            let desc = livro.descricao || "Sem descrição disponível.";

            item.innerHTML = `
                <div class="card-livro" style="display: flex; gap: 20px; padding: 15px; border-bottom: 1px solid #333; background: #111; margin-bottom: 10px; border-radius: 8px;">
                    <img src="${capa}" style="width: 100px; height: 140px; object-fit: cover; border-radius: 4px;">
                    <div class="info" style="flex: 1;">
                        <strong style="color: #00ff9d; font-size: 1.2em; display: block;">${titulo}</strong>
                        <em style="color: #aaa; display: block; margin-bottom: 5px;">${autor}</em>
                        <p style="color: white; font-size: 0.9em; line-height: 1.4;">${desc}</p>
                        <button style="margin-top: 10px; background: #00ff9d; color: black; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Pegar</button>
                    </div>
                </div>
            `;
            lista.appendChild(item);
        });
    } catch (e) {
        console.error("Erro ao carregar:", e);
        lista.innerHTML = '<p style="color: #ff4d4d;">Erro ao carregar livros.</p>';
    }
}

// FUNÇÃO PARA CADASTRAR NOVO LIVRO (CORRIGIDA)
async function cadastrarLivro() {
    const t = document.getElementById('titulo').value;
    const a = document.getElementById('autor').value;
    const c = document.getElementById('capa').value;
    const g = document.getElementById('generol').value;
    const d = document.getElementById('descricao').value;
    const h = document.getElementById('quantidade').value;

    // Validação corrigida: agora usando as letras certas
    if (!t || !a || !g) {
        alert("Preencha o título, autor e gênero!");
        return;
    }

    const novoLivro = {
        id: Date.now().toString(),
        titulo: t,
        autor: a,
        capa: c,
        generol: g,
        descricao: d,
        quantidade: h,
        status: 'disponível',
        prazo: ''
    };

    try {
        await fetch(urlGoogle, { // Envia direto para o Google (POST não usa proxy)
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(novoLivro)
        });

        alert("Livro salvo com sucesso!");
        location.reload();
    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
        alert("Erro ao conectar com a planilha.");
    }
}

// Inicialização correta para evitar SyntaxError
document.addEventListener('DOMContentLoaded', () => {
    Livros();
});
